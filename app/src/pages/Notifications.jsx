import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Clock, XCircle, ChevronRight, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Mock data for demo
      setNotifications([
        {
          id: 1,
          title: 'Yêu cầu mượn mới!',
          message: 'Lê Hải đã gửi yêu cầu mượn cuốn "Nhà Giả Kim".',
          type: 'request',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          is_read: false
        },
        {
          id: 2,
          title: 'Sách sắp đến hạn trả',
          message: 'Cuốn "Đắc Nhân Tâm" sẽ hết hạn trong 2 ngày tới. Đừng quên trả sách nhé!',
          type: 'reminder',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          is_read: true
        },
        {
          id: 3,
          title: 'Yêu cầu đã được chấp nhận',
          message: 'Trần Minh đã chấp nhận cho bạn mượn cuốn "Lược Sử Loài Người".',
          type: 'success',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          is_read: true
        }
      ])
    } finally {
      setLoading(false)
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
                {noti.type === 'request' && (
                  <>
                    <button className="btn btn-primary text-xs px-4 py-2">Xác nhận</button>
                    <button className="btn bg-slate-100 text-slate-600 text-xs px-4 py-2 hover:bg-red-50 hover:text-red-500">Từ chối</button>
                  </>
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
