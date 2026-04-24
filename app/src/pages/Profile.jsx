import React, { useState, useEffect } from 'react'
import { User, Settings, LogOut, ChevronRight, Award, Shield, Book, History, LogIn, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingBooks, setPendingBooks] = useState([])
  const [borrowRequests, setBorrowRequests] = useState([]) // For Owners (pending_owner)
  const [mySentRequests, setMySentRequests] = useState([]) // For Borrowers
  const [adminBorrowRequests, setAdminBorrowRequests] = useState([]) // For Admins (pending_admin)
  const [historyRequests, setHistoryRequests] = useState([]) // Completed ones
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (error) throw error
        setUser(data)
        
        // Fetch specific tasks
        fetchBorrowRequests(authUser.id)
        
        if (data.role === 'admin') {
          setIsAdmin(true)
          fetchPendingBooks()
        }
      }
    } catch (error) {
      console.error(error)
      // Mock user
      const mock = {
        full_name: 'Nguyễn Văn A',
        role: 'admin', 
        trust_score: 95,
        rating: 4.9,
        books_shared: 12,
        books_borrowed: 4,
        avatar_url: null
      }
      setUser(mock)
      setIsAdmin(true)
      fetchPendingBooks()
      fetchBorrowRequests('demo-user')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'pending')
    
    if (!error) setPendingBooks(data || [])
  }

  const fetchBorrowRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*, books(*), profiles:borrower_id(*)')
      
      if (!error && data) {
        // 1. My requests to borrow (I am the borrower)
        const sent = data.filter(r => r.borrower_id === userId)
        setMySentRequests(sent)
        
        // 2. Requests for my books (I am the owner)
        const received = data.filter(r => 
          (r.books?.owner_id === userId || (!r.books?.owner_id && userId === 'demo-user')) &&
          r.status === 'pending_owner'
        )
        setBorrowRequests(received)

        // 3. Admin requests (All pending_admin)
        if (isAdmin || userId === 'demo-user') {
          const adminReqs = data.filter(r => r.status === 'pending_admin')
          setAdminBorrowRequests(adminReqs)
        }

        // 4. Completed/History (Lending or Borrowing)
        const history = data.filter(r => 
          (r.status === 'completed' || r.status === 'rejected') &&
          (r.borrower_id === userId || r.books?.owner_id === userId || (!r.books?.owner_id && userId === 'demo-user'))
        )
        setHistoryRequests(history)
      }
    } catch (err) {
      console.error('Error fetching borrow requests:', err)
    }
  }

  const handleApproveBook = async (bookId) => {
    const { error } = await supabase
      .from('books')
      .update({ status: 'available' })
      .eq('id', bookId)
    
    if (!error) {
      setPendingBooks(prev => prev.filter(b => b.id !== bookId))
      alert('Đã duyệt sách thành công!')
    }
  }

  const handleAdminBorrowAction = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: status === 'approve' ? 'pending_owner' : 'rejected' })
        .eq('id', requestId)
      
      if (!error) {
        alert(status === 'approve' ? 'Đã duyệt yêu cầu! Bây giờ chủ sách có thể phê duyệt.' : 'Đã từ chối yêu cầu.')
        fetchProfile()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBorrowAction = async (requestId, bookId, status) => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: status === 'approve' ? 'approved' : 'rejected' })
        .eq('id', requestId)
      
      if (!error && status === 'approve') {
        // Also update the book status to 'borrowed'
        await supabase
          .from('books')
          .update({ status: 'borrowed' })
          .eq('id', bookId)
        
        alert('Đã chấp nhận yêu cầu mượn. Hãy nhắn tin để trao đổi thêm nhé!')
      } else if (!error && status === 'reject') {
        alert('Đã từ chối yêu cầu.')
      }

      fetchProfile() // Refresh everything
    } catch (err) {
      console.error(err)
    }
  }

  const handleReturnBook = async (requestId, bookId) => {
    try {
      // 1. Mark request as completed
      await supabase
        .from('borrow_requests')
        .update({ status: 'completed' })
        .eq('id', requestId)
      
      // 2. Mark book as available again
      await supabase
        .from('books')
        .update({ status: 'available' })
        .eq('id', bookId)
      
      alert('Tuyệt vời! Sách đã được trả lại và sẽ hiện lên trang chủ để mọi người có thể mượn.')
      fetchProfile()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="text-primary-800 font-medium">Đang tải hồ sơ...</p>
      </div>
    </div>
  )

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
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold">{user?.full_name || 'Chào bạn!'}</h1>
              {isAdmin && <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider border border-white/30">ADMIN</span>}
            </div>
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

        {/* Approval Center */}
        {(isAdmin || borrowRequests.length > 0 || adminBorrowRequests.length > 0) && (
          <div className="mb-10">
            <SectionTitle title="Trung tâm Phê duyệt" />
            
            {/* Admin Borrow Approval (New) */}
            {isAdmin && adminBorrowRequests.length > 0 && (
              <div className="card p-6 bg-amber-50 border-amber-200 shadow-xl shadow-amber-500/10 mb-4">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-lg text-amber-800">Duyệt Yêu cầu Mượn (Admin)</h4>
                      <p className="text-xs text-amber-600">Kiểm tra thông tin người mượn</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                 </div>

                 <div className="space-y-4">
                   {adminBorrowRequests.map(req => (
                     <div key={req.id} className="bg-white p-4 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-14 bg-slate-200 rounded-lg shrink-0 overflow-hidden">
                              <img src={req.books?.image_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-slate-800 text-sm truncate">{req.books?.title}</p>
                              <p className="text-xs text-slate-500">Mượn bởi: <strong>{req.profiles?.full_name}</strong></p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleAdminBorrowAction(req.id, 'approve')} className="flex-1 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform">Duyệt ngay</button>
                           <button onClick={() => handleAdminBorrowAction(req.id, 'reject')} className="flex-1 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl active:scale-95 transition-transform">Từ chối</button>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Borrow Requests (For Owners) */}
            {borrowRequests.length > 0 && (
              <div className="card p-6 bg-white border-primary-100 shadow-xl shadow-primary-500/10 mb-4">
                 <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">Yêu cầu mượn sách của bạn</h4>
                      <p className="text-xs text-slate-500">Bạn có {borrowRequests.length} người đang chờ bạn đồng ý</p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                      <Book size={20} />
                    </div>
                 </div>

                 <div className="space-y-4">
                   {borrowRequests.map(req => (
                     <div key={req.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-14 bg-slate-200 rounded-lg shrink-0 overflow-hidden">
                              <img src={req.books?.image_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="font-bold text-slate-800 text-sm truncate">{req.books?.title}</p>
                              <p className="text-xs text-slate-500">Người mượn: <strong>{req.profiles?.full_name}</strong></p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleBorrowAction(req.id, req.book_id, 'approve')} className="flex-1 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform">Xác nhận</button>
                           <button onClick={() => handleBorrowAction(req.id, req.book_id, 'reject')} className="flex-1 py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl active:scale-95 transition-transform">Từ chối</button>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Admin Book Approvals */}
            {isAdmin && pendingBooks.length > 0 && (
              <div className="card p-6 bg-slate-900 border-none shadow-2xl shadow-slate-900/20">
                 <div className="flex items-center justify-between mb-6 text-white">
                    <div>
                      <h4 className="font-bold text-lg">Duyệt sách mới đăng</h4>
                      <p className="text-xs text-slate-400">Có {pendingBooks.length} sách hệ thống đang chờ duyệt</p>
                    </div>
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                 </div>

                 <div className="space-y-3">
                   {pendingBooks.map(book => (
                     <div key={book.id} className="bg-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="w-12 h-16 bg-slate-700 rounded-lg shrink-0 overflow-hidden">
                              <img src={book.image_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="overflow-hidden">
                              <p className="font-bold text-white text-sm truncate">{book.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">bởi {book.profiles?.full_name || 'Người dùng'}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleApproveBook(book.id)}
                          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                        >
                          Duyệt
                        </button>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Sections */}
        <div className="space-y-4 mb-10">
          <SectionTitle title="Hoạt động" />
          
          {/* Books I am borrowing */}
          {mySentRequests.length > 0 && (
            <div className="card p-6 bg-white border-slate-100 mb-4">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <History size={18} className="text-secondary-500" /> Sách đang mượn
              </h4>
              <div className="space-y-4">
                {mySentRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').map(req => (
                  <div key={req.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={req.books?.image_url} alt="" className="w-12 h-16 object-cover rounded-lg" />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-slate-800 text-sm truncate">{req.books?.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'approved' ? 'bg-green-100 text-green-600' :
                          req.status === 'pending_admin' ? 'bg-amber-100 text-amber-600' :
                          req.status === 'pending_owner' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {req.status === 'approved' ? 'Đã duyệt' : 
                           req.status === 'pending_admin' ? 'Chờ Admin' : 
                           req.status === 'pending_owner' ? 'Chờ chủ sách' : 'Khác'}
                        </span>
                        {req.status === 'approved' && (
                          <button 
                            onClick={() => navigate(`/chat/${req.id}`)}
                            className="text-primary-600 font-bold text-[10px] flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-primary-50"
                          >
                            <MessageSquare size={10} /> Nhắn tin
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Books I am lending (New) */}
          {
            (() => {
              const activeLending = historyRequests.filter(r => 
                r.status === 'approved' && 
                (r.books?.owner_id === user?.id || (!r.books?.owner_id && user?.id === 'demo-user'))
              );
              
              if (activeLending.length === 0) return null;

              return (
                <div className="card p-6 bg-white border-slate-100 mb-4 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Book size={18} className="text-primary-500" /> Sách bạn đang cho mượn
                  </h4>
                  <div className="space-y-4">
                    {activeLending.map(req => (
                      <div key={req.id} className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-14 bg-slate-200 rounded-lg shrink-0 overflow-hidden border border-green-200">
                              <img src={req.books?.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-800 text-sm truncate">{req.books?.title}</p>
                              <p className="text-[10px] text-green-600 font-bold uppercase">Đang cho {req.profiles?.full_name} mượn</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/chat/${req.id}`)}
                            className="w-10 h-10 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm border border-primary-100 hover:bg-primary-500 hover:text-white transition-all shrink-0"
                          >
                            <MessageSquare size={18} />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleReturnBook(req.id, req.book_id)}
                          className="w-full py-2.5 bg-white text-green-600 border border-green-200 text-xs font-bold rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-[0.98]"
                        >
                          Xác nhận đã nhận lại sách
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          }

          <MenuLink icon={<Book />} title="Sách tôi đã đăng" subtitle="Quản lý và cập nhật kho sách" />
          
          {/* History Section (Enhanced) */}
          <div className="card p-6 bg-slate-50 border-slate-200">
             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <History size={18} className="text-slate-400" /> Lịch sử mượn trả
             </h4>
             {historyRequests.filter(r => r.status === 'completed' || r.status === 'rejected').length === 0 ? (
               <p className="text-xs text-slate-400 text-center py-4 italic">Chưa có lịch sử giao dịch</p>
             ) : (
               <div className="space-y-3">
                 {historyRequests.filter(r => r.status === 'completed' || r.status === 'rejected').map(req => (
                   <div key={req.id} className="flex items-center gap-3 opacity-60">
                      <div className="w-8 h-10 bg-slate-200 rounded shrink-0 overflow-hidden">
                        <img src={req.books?.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-700 truncate">{req.books?.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {req.status === 'completed' ? 'Đã trả xong' : 'Đã từ chối'} • {new Date(req.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
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
