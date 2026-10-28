import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  FolderTree,
  Users,
  LogOut,
  KeyRound,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react'

export default function AdminLayout() {
  const { user, loading, logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin/login', { replace: true, state: { from: location.pathname } })
      } else if (user.mustChangePassword && location.pathname !== '/admin/change-password') {
        navigate('/admin/change-password', { replace: true })
      }
    }
  }, [user, loading, location.pathname, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center text-text-primary" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ECE6DD] border-t-accent rounded-full animate-spin" />
          <p className="text-sm font-medium text-text-secondary">جارٍ التحقق من الجلسة...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: 'لوحة المؤشرات',
      icon: LayoutDashboard,
      roles: ['admin', 'orders_manager'],
    },
    {
      to: '/admin/orders',
      label: 'الطلبات والمبيعات',
      icon: ShoppingBag,
      roles: ['admin', 'orders_manager'],
    },
    {
      to: '/admin/products',
      label: 'قطع الغيار والمخزون',
      icon: Boxes,
      roles: ['admin', 'orders_manager'],
    },
    {
      to: '/admin/categories',
      label: 'التصنيفات',
      icon: FolderTree,
      roles: ['admin', 'orders_manager'],
    },
    {
      to: '/admin/users',
      label: 'إدارة الطاقم',
      icon: Users,
      roles: ['admin'],
    },
  ]

  const isDemo = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true'

  const handleResetDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('am_demo_orders_v1')
      localStorage.removeItem('am_demo_products_v1')
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-text-primary flex flex-col md:flex-row" dir="rtl">
      <Helmet>
        <title>لوحة الإدارة — عزاب موتو</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-[#ECE6DD] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[#ECE6DD] hover:bg-[#F6F1EA] text-text-primary"
            aria-label="القائمة الجانبية"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-base font-tajawal text-accent">عزاب موتو الإدارية</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F6F1EA] text-text-secondary border border-[#ECE6DD]">
            {isAdmin ? 'مدير النظام' : 'مسؤول طلبات'}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 text-text-secondary hover:text-red-600 rounded-md"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-white border-l border-[#ECE6DD] flex flex-col z-40 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#ECE6DD] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg font-tajawal text-accent">عزاب موتو</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                لوحة التحكم
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">قطع غيار دراجات TVS</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-4 mx-3 my-3 bg-[#F6F1EA] rounded-[10px] border border-[#ECE6DD] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-[#ECE6DD] flex items-center justify-center text-accent">
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-text-primary">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[11px] font-medium px-2 py-0.2 rounded-full ${
                  isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                }`}
              >
                {isAdmin ? 'مدير النظام' : 'مسؤول الطلبات'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white shadow-xs font-semibold'
                        : 'text-text-secondary hover:bg-[#F6F1EA] hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#ECE6DD] space-y-2">
          <NavLink
            to="/admin/change-password"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-medium ${
                isActive ? 'text-accent font-bold' : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            <KeyRound className="w-4 h-4" />
            <span>تغيير كلمة المرور</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Demo Mode Notice Banner */}
        {isDemo && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-900">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>نسخة تجريبية: البيانات محفوظة في هذا المتصفح فقط (localStorage).</span>
            </div>
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين البيانات التجريبية</span>
            </button>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

