/**
 * Codebase Security Audit Script for AZZAB MOTO
 *
 * Verifies acceptance criteria:
 * - No dangerouslySetInnerHTML
 * - No eval / new Function / inline innerHTML
 * - All target="_blank" links include rel="noopener noreferrer"
 * - No direct JSON imports inside src/features/ or src/app/
 * - No unvalidated localStorage access outside src/shared/lib/storage.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const srcDir = path.join(rootDir, 'src')

function walkDir(dir) {
  let files = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath))
    } else if (/\.(tsx?|jsx?|html)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

const allFiles = walkDir(srcDir)
const issues = []

for (const file of allFiles) {
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/')
  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    const lineNum = idx + 1

    // 1. dangerouslySetInnerHTML
    if (line.includes('dangerouslySetInnerHTML')) {
      issues.push({
        file: relPath,
        line: lineNum,
        rule: 'no-dangerouslySetInnerHTML',
        text: line.trim(),
      })
    }

    // 2. eval — skip string literals like 'eval(...)' or "eval(...)" used in test data
    // We only flag actual eval() calls: not inside single/double-quoted strings
    if (/(?<!['"`)\/])\beval\(/.test(line) && !/['"]eval\(/.test(line)) {
      issues.push({ file: relPath, line: lineNum, rule: 'no-eval', text: line.trim() })
    }

    // 3. new Function
    if (/new\s+Function\(/.test(line)) {
      issues.push({ file: relPath, line: lineNum, rule: 'no-new-Function', text: line.trim() })
    }

    // 4. innerHTML
    if (/\.innerHTML\b/.test(line)) {
      issues.push({ file: relPath, line: lineNum, rule: 'no-innerHTML', text: line.trim() })
    }

    // 5. target="_blank" without rel="noopener noreferrer"
    if (line.includes('target="_blank"') && !line.includes('rel="noopener noreferrer"')) {
      // Check multi-line link or context
      const fullContext = lines
        .slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 4))
        .join(' ')
      if (
        !fullContext.includes('rel="noopener noreferrer"') &&
        !fullContext.includes("rel='noopener noreferrer'")
      ) {
        issues.push({
          file: relPath,
          line: lineNum,
          rule: 'target-blank-safe-rel',
          text: line.trim(),
        })
      }
    }

    // 6. Direct JSON import in UI (src/features or src/app)
    if (
      (relPath.startsWith('src/features/') || relPath.startsWith('src/app/')) &&
      /from\s+['"].*\.json['"]/.test(line)
    ) {
      issues.push({ file: relPath, line: lineNum, rule: 'no-direct-json-in-ui', text: line.trim() })
    }

    // 7. localStorage usage outside storage wrapper or tests
    if (!relPath.includes('src/shared/lib/storage.ts') && !relPath.startsWith('src/test/')) {
      if (/\blocalStorage\b/.test(line)) {
        issues.push({
          file: relPath,
          line: lineNum,
          rule: 'use-storage-wrapper-only',
          text: line.trim(),
        })
      }
    }
  })
}

console.log('🔒 Security Codebase Audit Results:')
if (issues.length === 0) {
  console.log('✅ ALL CHECKS PASSED: 0 violations found across all source files.')
  process.exit(0)
} else {
  console.error(`❌ Found ${issues.length} potential security violations:`)
  issues.forEach((i) => console.error(`  - [${i.rule}] ${i.file}:${i.line} -> ${i.text}`))
  process.exit(1)
}
