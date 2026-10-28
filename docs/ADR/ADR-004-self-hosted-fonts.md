# ADR-004: Self-Hosted Fonts via @fontsource

**Date:** 2026-10-28  
**Status:** Accepted

## Context

The design requires Arabic fonts: Tajawal (headings) and IBM Plex Sans Arabic (body). These could be loaded from Google Fonts CDN or self-hosted.

## Decision

Self-host via **@fontsource** npm packages.

## Reasons

1. **Privacy.** Google Fonts CDN logs visitor IPs. GDPR/Egyptian privacy regulations require disclosure. Self-hosting eliminates this data flow entirely.
2. **CSP simplicity.** No external `font-src` domain needed; `font-src 'self'` is sufficient.
3. **Performance.** No DNS lookup, no cross-origin request, no FOUT from CDN latency. Fonts are bundled and served from the same origin.
4. **Offline/PWA.** Fonts are cached by the service worker with the rest of the app assets.
5. **No API key.** Google Fonts CDN may require API key for high traffic. @fontsource has no such limit.

## Consequences

- Fonts add ~100–200 KB to the bundle (subset to Arabic + Latin glyphs). Acceptable for a PWA.
- Font updates require a manual `npm update @fontsource/...`. Low risk for production stability.
