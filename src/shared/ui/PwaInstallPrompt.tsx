import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Download, X, Share2, Smartphone } from 'lucide-react'
import { storage } from '@/shared/lib/storage'
import { siteConfig } from '@/app/config/site'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

function checkEligibility(): boolean {
  if (typeof window === 'undefined') return false

  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // @ts-expect-error - Safari iOS specific property
    Boolean(window.navigator.standalone)

  if (isStandalone) return false
  if (storage.pwaDismissed.get()) return false

  return storage.pageVisits.get() >= 3
}

export function PwaInstallPrompt() {
  const { pathname } = useLocation()
  const [isVisible, setIsVisible] = useState(() => checkEligibility())
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosInstructions, setShowIosInstructions] = useState(false)

  // Derived client detection (pure render computation, no set-state in effect)
  const isIos =
    typeof window !== 'undefined' &&
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())

  // 1. Increment page visits on navigation and check visibility condition
  useEffect(() => {
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // @ts-expect-error - Safari iOS specific property
      Boolean(window.navigator.standalone)

    if (isStandalone || storage.pwaDismissed.get()) {
      return
    }

    // Increment visit count
    const visits = storage.pageVisits.increment()

    // Soft prompt shows only after 3+ viewed pages
    if (visits >= 3) {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    }
  }, [pathname])

  // 2. Capture Chromium beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Dismiss permanently
  const handleDismiss = () => {
    storage.pwaDismissed.set(true)
    setIsVisible(false)
    setShowIosInstructions(false)
  }

  // Trigger installation
  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true)
      return
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        storage.pwaDismissed.set(true)
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      handleDismiss()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <aside
      role="dialog"
      aria-labelledby="pwa-prompt-title"
      aria-describedby="pwa-prompt-desc"
      className="fixed bottom-4 start-4 end-4 z-50 mx-auto max-w-lg rounded-[12px] border border-border bg-surface p-4 shadow-xl transition-all duration-300 ease-out sm:bottom-6 sm:start-auto sm:end-6 sm:w-96"
    >
      <div className="flex items-start gap-3.5">
        {/* App Logo Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-heading p-1.5 shadow-xs">
          <img
            src="/logo.png"
            alt={siteConfig.name}
            className="h-full w-full object-contain"
            width={48}
            height={48}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h2 id="pwa-prompt-title" className="font-heading text-sm font-bold text-heading">
              تثبيت تطبيق {siteConfig.name}
            </h2>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="إغلاق التنبيه"
              className="text-secondary/70 transition hover:text-heading"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p id="pwa-prompt-desc" className="mt-1 text-xs leading-relaxed text-body">
            تصفح أسرع، وصول مباشر لقطع غيار TVS بدون كتابة الرابط، وتصفح سلس أوفلاين.
          </p>

          {showIosInstructions ? (
            <div className="mt-3 rounded-[8px] bg-alt p-2.5 text-xs text-heading space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-accent">
                <Share2 className="h-3.5 w-3.5 shrink-0" />
                <span>خطوات التثبيت على أجهزة iPhone / iPad:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-body ps-1">
                <li>
                  اضغط على زر المشاركة <strong>(Share)</strong> في شريط Safari.
                </li>
                <li>
                  مرر لأسفل واختر{' '}
                  <strong>&quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</strong>.
                </li>
              </ol>
            </div>
          ) : (
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-[8px] bg-accent px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-hover"
              >
                {isIos ? (
                  <>
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>طريقة التثبيت</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>تثبيت الآن</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-[8px] border border-border px-3 py-1.5 text-xs font-medium text-body transition hover:bg-alt hover:text-heading"
              >
                لاحقاً
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
