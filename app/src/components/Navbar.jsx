import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Bell, User, Search, PlusCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Navbar = ({ session, onAuthOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const handleAddBook = () => {
    if (session) {
      navigate('/add-book')
    } else {
      onAuthOpen()
    }
  }

  useEffect(() => {
    if (session) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 5000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*, books(*)')
      
      if (error) {
        console.error("Error fetching unread count:", error)
        return
      }
      
      if (data) {
        const count = data.filter(req => {
          const isOwner = req.books?.owner_id === session?.user?.id
          const isBorrower = req.borrower_id === session?.user?.id
          
          if (isOwner && (req.status === 'pending_owner' || req.status === 'pending_admin')) return true
          if (isBorrower && (req.status === 'approved' || req.status === 'rejected')) return true
          return false
        }).length
        setUnreadCount(count)
      }
    } catch (e) {
      console.error("Unread count fetch error:", e)
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 glass border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              Góp <span className="text-primary-500">Sáng</span>
            </span>
          </Link>

          <nav className="flex items-center gap-8">
            <Link to="/" className={`font-medium ${isActive('/') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-500'}`}>Trang chủ</Link>
            <Link to="/notifications" className={`font-medium relative ${isActive('/notifications') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-500'}`}>
              Thông báo
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            {session ? (
              <>
                <button
                  onClick={handleAddBook}
                  className="btn btn-secondary text-sm px-5 flex items-center gap-1.5"
                >
                  <PlusCircle size={16} /> Đăng sách
                </button>
                <Link to="/profile" className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-all">
                  <User size={18} />
                  <span className="font-semibold">Cá nhân</span>
                </Link>
              </>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => onAuthOpen('login')} className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 transition-colors">Đăng nhập</button>
                <button onClick={() => onAuthOpen('signup')} className="btn btn-primary text-sm px-6 shadow-md shadow-primary-500/30">Đăng ký</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-100 px-6 py-3 flex items-center justify-between rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <NavLink to="/" icon={<Home />} label="Chủ" active={isActive('/')} />
        <Link to="/notifications" className={`flex flex-col items-center gap-1 relative ${isActive('/notifications') ? 'text-primary-600' : 'text-slate-400'}`}>
          <div className="relative">
            <Bell size={24} strokeWidth={isActive('/notifications') ? 2.5 : 2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Thông báo</span>
        </Link>

        {/* Central Action Button */}
        <div className="-translate-y-6">
          <button
            onClick={handleAddBook}
            className="w-14 h-14 bg-secondary-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-secondary-500/40 border-4 border-white active:scale-90 transition-all"
          >
            <PlusCircle size={32} />
          </button>
        </div>

        {session ? (
          <NavLink to="/notifications" icon={<Bell />} label="Báo" active={isActive('/notifications')} />
        ) : (
          <button onClick={onAuthOpen} className="flex flex-col items-center gap-1 text-slate-400">
            <Search size={24} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Tìm</span>
          </button>
        )}
        <NavLink to="/profile" icon={<User />} label="Tôi" active={isActive('/profile')} />
      </nav>
    </>
  )
}

const NavLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary-600' : 'text-slate-400'}`}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </Link>
)

export default Navbar
