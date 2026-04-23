import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Clock, XCircle, ChevronRight, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Notifications = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch borrow requests where user is either the borrower OR the owner of the book
      // Note: In a real Supabase setup, you might need two separate queries or a complex filter if owner_id is in the books table.
      // For now, let's fetch and filter in JS to ensure it works for both Mock and Real.
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*, books(*), profiles:borrower_id(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Map requests to notification format based on user's role in the request
      const formatted = data.map(req => {
        const isBorrower = req.borrower_id === user.id
        const isOwner = req.books?.owner_id === user.id || (!req.books?.owner_id && user.id === 'demo-user')
        
        let title, message, type
        
        if (isOwner) {
          // Notifications for the owner
          if (req.status === 'pending_owner') {
            title = 'Yêu cầu mượn mới!'
            message = `${req.profiles?.full_name || 'Người dùng'} muốn mượn cuốn "${req.books?.title || 'Sách'}". Admin đã duyệt qua.`
            type = 'request'
          } else if (req.status === 'pending_admin') {
            title = 'Yêu cầu đang chờ Admin'
            message = `Có yêu cầu mượn cuốn "${req.books?.title}". Đang chờ Admin kiểm tra thông tin người mượn.`
            type = 'reminder'
          } else if (req.status === 'approved') {
            title = 'Bắt đầu cho mượn'
            message = `Bạn đã đồng ý cho mượn cuốn "${req.books?.title}". Hãy nhắn tin để hẹn ngày gặp.`
            type = 'success'
          } else {
            title = 'Cập nhật yêu cầu'
            message = `Yêu cầu cho cuốn "${req.books?.title}" có trạng thái mới: ${req.status}`
            type = 'info'
          }
        } else if (isBorrower) {
          // Notifications for the borrower
          if (req.status === 'pending_admin') {
            title = 'Gửi yêu cầu thành công'
            message = `Yêu cầu mượn cuốn "${req.books?.title}" đang được Admin kiểm tra.`
            type = 'request'
          } else if (req.status === 'pending_owner') {
            title = 'Admin đã duyệt!'
            message = `Admin đã duyệt yêu cầu của bạn. Đang chờ chủ sách phản hồi.`
            type = 'success'
          } else if (req.status === 'approved') {
            title = 'Chủ sách đã đồng ý!'
            message = `Tuyệt vời! Chủ sách đã đồng ý cho bạn mượn cuốn "${req.books?.title}".`
            type = 'success'
          } else if (req.status === 'rejected') {
            title = 'Yêu cầu bị từ chối'
            message = `Rất tiếc, yêu cầu mượn cuốn "${req.books?.title}" không được chấp nhận.`
            type = 'error'
          } else {
            title = 'Cập nhật yêu cầu'
            message = `Trạng thái yêu cầu mượn cuốn "${req.books?.title}": ${req.status}`
            type = 'info'
          }
        }

        return {
          id: req.id,
          title,
          message,
          type,
          created_at: req.created_at,
          is_read: req.status === 'completed',
          status: req.status,
          book_id: req.book_id,
          isOwner,
          isBorrower
        }
      }).filter(n => n.title) // Filter out any empty ones

      setNotifications(formatted)
    } catch (error) {
      console.error('Lỗi tải thông báo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, bookId, status, currentStatus) => {
    try {
      let nextStatus = status === 'approve' ? 'approved' : 'rejected'
      
      // If it's an admin action
      if (currentStatus === 'pending_admin') {
        nextStatus = status === 'approve' ? 'pending_owner' : 'rejected'
      }

      const { error } = await supabase
        .from('borrow_requests')
        .update({ status: nextStatus })
        .eq('id', id)
      
      if (!error) {
        if (nextStatus === 'approved') {
          await supabase.from('books').update({ status: 'borrowed' }).eq('id', bookId)
          alert('Đã chấp nhận yêu cầu mượn!')
        } else if (nextStatus === 'pending_owner') {
          alert('Đã duyệt yêu cầu (Admin)! Chờ chủ sách phê duyệt.')
        } else {
          alert('Đã từ chối yêu cầu.')
        }
      }

      fetchNotifications() // Refresh list
    } catch (err) {
      alert('Không thể thực hiện yêu cầu. Vui lòng thử lại.')
    }
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="bg-slate-50 min-h-screen px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Thông báo</h1>
          <p className="text-slate-500 font-medium">Bạn có {notifications.filter(n => !n.is_read).length} thông báo mới</p>
        </div>
        <button onClick={markAllRead} className="text-primary-600 font-bold text-sm bg-primary-50 px-4 py-2 rounded-xl">
          Đọc tất cả
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(noti => (
          <div 
            key={noti.id} 
            className={`card p-5 flex gap-4 transition-all ${noti.is_read ? 'opacity-80' : 'border-primary-100 bg-white ring-1 ring-primary-50 shadow-md'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              noti.type === 'request' ? 'bg-primary-100 text-primary-600' :
              noti.type === 'success' ? 'bg-green-100 text-green-600' :
              noti.type === 'reminder' ? 'bg-amber-100 text-amber-600' :
              'bg-slate-100 text-slate-400'
            }`}>
              {noti.type === 'request' ? <MessageSquare size={24} /> :
               noti.type === 'success' ? <CheckCircle2 size={24} /> :
               noti.type === 'reminder' ? <Clock size={24} /> :
               <Bell size={24} />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-800">{noti.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vừa xong</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{noti.message}</p>
              <div className="flex gap-2">
                {(noti.status === 'pending_owner' || noti.status === 'pending_admin') && noti.isOwner && (
                  <>
                    <button 
                      onClick={() => handleAction(noti.id, noti.book_id, 'approve', noti.status)}
                      className="btn btn-primary text-xs px-4 py-2"
                    >
                      {noti.status === 'pending_admin' ? 'Duyệt (Admin)' : 'Xác nhận'}
                    </button>
                    <button 
                      onClick={() => handleAction(noti.id, noti.book_id, 'reject', noti.status)}
                      className="btn bg-slate-100 text-slate-600 text-xs px-4 py-2 hover:bg-red-50 hover:text-red-500"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {noti.status === 'approved' && (
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs font-bold ${noti.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                      {noti.status === 'approved' ? 'Đã chấp nhận' : 'Đã từ chối'}
                    </span>
                    {noti.status === 'approved' && (
                      <button 
                        onClick={() => navigate(`/chat/${noti.id}`)}
                        className="flex items-center gap-2 text-primary-600 font-bold text-xs bg-primary-50 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors"
                      >
                        <MessageSquare size={14} />
                        Nhắn tin trao đổi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <Bell size={64} className="mb-4" />
          <p className="font-bold text-slate-400">Chưa có thông báo nào</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
