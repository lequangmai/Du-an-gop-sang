import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Image as ImageIcon, Smile, MoreVertical, Phone, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const Chat = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchInitialData()
    // Polling for new messages every 3 seconds in demo mode
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [requestId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchInitialData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      const { data: reqData } = await supabase
        .from('borrow_requests')
        .select('*, books(*), profiles:borrower_id(*)')
        .eq('id', requestId)
        .single()
      
      setRequest(reqData)
      await fetchMessages()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
    
    if (data) setMessages(data)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageText = newMessage
    setNewMessage('')

    try {
      await supabase.from('messages').insert({
        request_id: requestId,
        sender_id: user.id,
        text: messageText
      })
      await fetchMessages()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  )

  const otherPerson = user?.id === request?.borrower_id 
    ? request?.books?.profiles?.full_name || 'Chủ sách'
    : request?.profiles?.full_name || 'Người mượn'

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 md:h-[80vh] md:rounded-3xl md:overflow-hidden md:shadow-2xl md:border md:border-slate-100">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-primary-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 font-bold shrink-0">
            {otherPerson.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-800 leading-tight truncate">{otherPerson}</h3>
            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider">Đang trực tuyến</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
            <Phone size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Book Context Tooltip */}
      <div className="bg-primary-50/50 px-4 py-2 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Info size={14} className="text-primary-500 shrink-0" />
          <p className="text-[11px] text-primary-700 truncate">
            Trao đổi về sách: <span className="font-bold">{request?.books?.title}</span>
          </p>
        </div>
        <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
          {request?.status === 'approved' ? 'Đã chấp nhận' : 'Đang xử lý'}
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 px-10 text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Smile size={32} />
            </div>
            <p className="text-sm font-bold">Hãy bắt đầu cuộc trò chuyện để thống nhất thời gian lấy sách nhé!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm ${
                  isMe 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                    {format(new Date(msg.created_at), 'HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-100 sticky bottom-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" className="p-2 text-slate-400 hover:text-primary-500">
            <Smile size={24} />
          </button>
          <button type="button" className="p-2 text-slate-400 hover:text-primary-500 hidden sm:block">
            <ImageIcon size={24} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              newMessage.trim() 
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
