import React, { useState, useEffect } from 'react'
import { User, Settings, LogOut, ChevronRight, Award, Shield, Book, History, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
        setUser(data)
      }
    } catch (error) {
      console.error(error)
      // Mock user
      setUser({
        full_name: 'Nguyễn Văn A',
        trust_score: 95,
        rating: 4.9,
        books_shared: 12,
        books_borrowed: 4,
        avatar_url: null
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary-600 pt-16 pb-24 px-6 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-2xl relative">
            <div className="w-full h-full bg-slate-100 rounded-[1.25rem] flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-300" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary-500 rounded-2xl flex items-center justify-center border-4 border-primary-600 text-white">
              <Award size={20} />
            </div>
          </div>
          
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-1">{user?.full_name || 'Chào bạn!'}</h1>
            <p className="text-primary-100 text-sm">Thành viên từ T4/2026</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 grid grid-cols-3 gap-4 mb-8">
          <ProfileStat label="Chia sẻ" value={user?.books_shared || 0} icon={<Book className="text-primary-500" size={16} />} />
          <ProfileStat label="Đang mượn" value={user?.books_borrowed || 0} icon={<History className="text-secondary-500" size={16} />} />
          <ProfileStat label="Uy tín" value={`${user?.trust_score || 0}%`} icon={<Shield className="text-blue-500" size={16} />} />
        </div>

        {/* Menu Sections */}
        <div className="space-y-4 mb-10">
          <SectionTitle title="Hoạt động" />
          <MenuLink icon={<Book />} title="Sách tôi đã đăng" subtitle="Quản lý và cập nhật kho sách" />
          <MenuLink icon={<History />} title="Lịch sử mượn trả" subtitle="Xem các sách đã từng mượn" />
          <MenuLink icon={<Shield />} title="Chứng chỉ uy tín" subtitle="Xem huy hiệu cộng đồng" highlight />
          
          <SectionTitle title="Tài khoản" />
          <MenuLink icon={<Settings />} title="Cài đặt thông tin" subtitle="SĐT, địa chỉ, bảo mật" />
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-red-50 text-red-500 hover:bg-red-50 transition-all font-bold"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <LogOut size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold">Đăng xuất</p>
                <p className="text-xs text-red-400 font-medium tracking-wide">Hẹn gặp lại bạn sớm!</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

const ProfileStat = ({ label, value, icon }) => (
  <div className="flex flex-col items-center">
    <div className="mb-2 p-2 bg-slate-50 rounded-xl">
      {icon}
    </div>
    <span className="text-xl font-black text-slate-800 leading-none mb-1">{value}</span>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
  </div>
)

const SectionTitle = ({ title }) => (
  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-4 mb-2">{title}</h3>
)

const MenuLink = ({ icon, title, subtitle, highlight }) => (
  <button className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border group ${highlight ? 'bg-primary-50 border-primary-100' : 'bg-white border-slate-100 hover:border-primary-200'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${highlight ? 'bg-primary-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="text-left">
        <p className={`font-bold ${highlight ? 'text-primary-900' : 'text-slate-800'}`}>{title}</p>
        <p className="text-xs text-slate-400 font-medium tracking-wide">{subtitle}</p>
      </div>
    </div>
    <ChevronRight className={highlight ? 'text-primary-400' : 'text-slate-300'} />
  </button>
)

export default Profile
