import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, Phone, MapPin, ShieldCheck, Truck, CreditCard, Shield } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { siteConfig } from '@/app/config/site'
import { buildWhatsAppUrl } from '@/shared/lib/whatsapp'

/** Current year computed once at module load — static for the lifetime of the page */
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  const navigate = useNavigate()
  const whatsappUrl = buildWhatsAppUrl('السلام عليكم، أود التواصل مع إدارة متجر عزاب موتو.')

  return (
    <footer className="border-t border-border bg-alt text-body" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        تذييل الصفحة ومعلومات التواصل
      </h2>

      {/* Top Highlights Strip in Footer */}
      <div className="border-b border-border/60 bg-base/50 py-6">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 sm:grid-cols-3 text-center sm:text-start">
          <div className="group flex items-center justify-center sm:justify-start gap-3 transition-transform duration-200 hover:-translate-y-0.5">
            <CreditCard className="h-6 w-6 text-accent shrink-0" aria-hidden="true" />
            <div>
              <p className="font-heading text-sm font-bold text-heading">الدفع عند الاستلام</p>
              <p className="text-xs text-body">عاين طلبيتك واستلمها بثقة تامة</p>
            </div>
          </div>
          <div className="group flex items-center justify-center sm:justify-start gap-3 transition-transform duration-200 hover:-translate-y-0.5">
            <Truck className="h-6 w-6 text-accent shrink-0" aria-hidden="true" />
            <div>
              <p className="font-heading text-sm font-bold text-heading">شحن لكل المحافظات</p>
              <p className="text-xs text-body">توصيل سريع وآمن لجميع مدن مصر</p>
            </div>
          </div>
          <div className="group flex items-center justify-center sm:justify-start gap-3 transition-transform duration-200 hover:-translate-y-0.5">
            <ShieldCheck className="h-6 w-6 text-accent shrink-0" aria-hidden="true" />
            <div>
              <p className="font-heading text-sm font-bold text-heading">قطع غيار أصلية TVS</p>
              <p className="text-xs text-body">أعلى معايير الجودة والمطابقة الميكانيكية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand Info & WhatsApp */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-black p-1 shadow-xs">
                <img src={logoImg} alt={siteConfig.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-heading">
                  {siteConfig.name}
                </span>
                {siteConfig.isAuthorizedDealer && (
                  <span className="block text-[11px] font-semibold text-accent">
                    وكيل معتمد TVS
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-body">{siteConfig.description}</p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-hover"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>واتساب: {siteConfig.phone}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="font-heading text-sm font-bold text-heading">تصفح المتجر</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/" className="text-btn text-btn-muted text-xs">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-btn text-btn-muted text-xs">
                  كتالوج قطع الغيار
                </Link>
              </li>
              <li>
                <Link to="/catalog/category/brakes" className="text-btn text-btn-muted text-xs">
                  فرامل
                </Link>
              </li>
              <li>
                <Link to="/catalog/category/filters" className="text-btn text-btn-muted text-xs">
                  فلاتر
                </Link>
              </li>
              <li>
                <Link to="/catalog/category/oils" className="text-btn text-btn-muted text-xs">
                  زيوت TRU4
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h3 className="font-heading text-sm font-bold text-heading">خدمة العملاء</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link to="/track" className="text-btn text-btn-accent text-xs font-semibold">
                  تتبع حالة الطلب
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-btn text-btn-muted text-xs">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-btn text-btn-muted text-xs">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-btn text-btn-muted text-xs">
                  سياسة الاستبدال والاسترجاع
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-btn text-btn-muted text-xs">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Coordinates */}
          <div>
            <h3 className="font-heading text-sm font-bold text-heading">معلومات الاتصال</h3>
            <ul className="mt-4 space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="font-numeric tabular transition hover:text-accent"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-numeric tabular transition hover:text-accent"
                >
                  {siteConfig.phone} (واتساب)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary shrink-0" aria-hidden="true" />
                <span>{siteConfig.address} — شحن لجميع المحافظات</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-body/80">
          <p>
            جميع الحقوق محفوظة &copy; {CURRENT_YEAR} {siteConfig.nameEn} ({siteConfig.name}).
          </p>
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="inline-flex items-center gap-1.5 text-body/50 hover:text-accent transition-colors duration-150 cursor-pointer opacity-70 hover:opacity-100"
            aria-label="بوابة الإدارة"
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            <span>بوابة الإدارة</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
