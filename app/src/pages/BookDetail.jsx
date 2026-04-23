import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Share2, MapPin, Star, User, BookOpen, AlertCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

const BookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:owner_id (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setBook(data)
    } catch (error) {
      console.error('Lỗi khi tải chi tiết:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="text-primary-800 font-medium">Đang tải thông tin sách...</p>
      </div>
    </div>
  )
  
  if (!book) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy sách</h3>
      <p className="text-slate-500 mb-6">Cuốn sách này có thể đã bị gỡ hoặc không tồn tại.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary px-8">Quay lại trang chủ</button>
    </div>
  )

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Image */}
      <div className="relative h-96 md:h-[500px]">
        <img 
          src={book.image_url} 
          alt={book.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        
        {/* Navigation Buttons */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white">
            <ChevronLeft size={24} />
          </button>
          <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white">
            <Share2 size={24} />
          </button>
        </div>

        {/* Floating Info */}
        <div className="absolute bottom-10 left-6 right-6">
          <span className="inline-block px-3 py-1 bg-primary-500 text-white text-[10px] font-bold rounded-lg mb-3 tracking-widest uppercase">
            {book.category}
          </span>
          <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
          <p className="text-white/80 font-medium">{book.author}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="card shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                <User className="text-primary-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{book.profiles.full_name}</h4>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-secondary-500 text-secondary-500" />
                  <span className="text-xs font-bold text-slate-600">{book.profiles.rating} ({book.profiles.rating_count})</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-tighter">TRUST SCORE</span>
              <span className="text-xl font-black text-primary-600">{book.profiles.trust_score}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <InfoItem label="Tình trạng" value={book.condition === 'good' ? 'Rất tốt' : book.condition} />
            <InfoItem label="Vị trí" value={book.location_district} />
            <InfoItem label="Sách đã chia sẻ" value={`${book.profiles.books_shared} cuốn`} />
            <InfoItem label="Đặt cọc" value={book.deposit_required ? `${book.deposit_amount.toLocaleString()}đ` : 'Miễn phí'} />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Giới thiệu sách</h3>
          <p className="text-slate-600 leading-relaxed bg-white p-6 rounded-3xl border border-slate-100">
            {book.description}
          </p>
        </div>

        {/* Security Alert */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 mb-10">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-700">
            <strong>Lưu ý bảo mật:</strong> Để đảm bảo an toàn, địa chỉ chi tiết và số điện thoại chỉ được hiển thị sau khi chủ sách chấp nhận yêu cầu mượn của bạn.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white border-t border-slate-100 p-6 sticky bottom-0 z-20 flex gap-4 shadow-2xl">
        {book.status === 'borrowed' ? (
          <button
            disabled
            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-3xl text-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <AlertCircle size={20} /> Sách đang được mượn
          </button>
        ) : (
          <button
            onClick={() => navigate(`/borrow/${book.id}`)}
            className="flex-1 btn btn-primary py-4 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 active:scale-[0.98] transition-all"
          >
            <Send size={20} /> Gửi yêu cầu mượn
          </button>
        )}
      </div>
    </div>
  )
}

const InfoItem = ({ label, value }) => (
  <div>
    <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    <p className="text-slate-800 font-bold">{value}</p>
  </div>
)

export default BookDetail
