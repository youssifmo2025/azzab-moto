import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log in development or telemetry
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const whatsappSupportUrl = buildWhatsAppUrl(
        'السلام عليكم، واجهت مشكلة تقنية أثناء تصفح متجر عزاب موتو.',
      )

      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-promo text-accent">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-heading">
            عذراً، حدث خطأ غير متوقع
          </h1>
          <p className="mt-2 max-w-md text-body">
            حدث خطأ تقني في عرض هذه الصفحة. يرجى إعادة تحميل الصفحة أو التواصل معنا عبر واتساب
            للمساعدة.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>إعادة التحميل</span>
            </button>
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-5 py-2.5 font-medium text-heading transition hover:bg-alt"
            >
              <MessageCircle className="h-4 w-4 text-success" aria-hidden="true" />
              <span>تواصل مع الدعم عبر واتساب</span>
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
