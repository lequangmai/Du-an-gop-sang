import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, MapPin, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, Phone, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

const STEPS = [
  { id: 1, label: 'Xác nhận', icon: BookOpen },
  { id: 2, label: 'Đặt cọc', icon: CreditCard },
  { id: 3, label: 'Gửi yêu cầu', icon: CheckCircle2 },
]

const BorrowFlow = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState('')
  const [borrowDays, setBorrowDays] = useState(14)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles:owner_id (*)')
        .eq('id', id)
        .single()

      if (error) throw error
      setBook(data)
    } catch {
      // Demo data
      setBook({
        id,
        title: 'Nhà Giả Kim',
        author: 'Paulo Coelho',
        image_url: 'https://cdn0.fahasa.com/media/catalog/product/n/h/nhagiakim.jpg',
        condition: 'good',
        deposit_required: true,
        deposit_amount: 50000,
        location_district: 'Quận 1',
        profiles: {
          full_name: 'Trần Minh Tuấn',
          rating: 4.8,
          trust_score: 98,
          phone: '09x.xxx.xxxx'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const returnDate = new Date()
        returnDate.setDate(returnDate.getDate() + borrowDays)

        await supabase.from('borrow_requests').insert({
          book_id: id,
          borrower_id: user.id,
          note,
          borrow_days: borrowDays,
          expected_return_date: returnDate.toISOString(),
          status: 'pending_admin'
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  if (submitted) return <SuccessScreen book={book} navigate={navigate} />

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-slate-800">Gửi yêu cầu mượn</h2>
          <p className="text-xs text-slate-400">Bước {step}/3</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isDone ? 'bg-primary-500 text-white' :
                    isActive ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-300' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step > s.id ? 'bg-primary-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step Content */}
        {step === 1 && <StepConfirm book={book} note={note} setNote={setNote} borrowDays={borrowDays} setBorrowDays={setBorrowDays} />}
        {step === 2 && <StepDeposit book={book} />}
        {step === 3 && <StepReview book={book} note={note} borrowDays={borrowDays} />}
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 max-w-md mx-auto md:max-w-6xl">
        <button
          onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
          disabled={submitting}
          className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : step < 3 ? (
            <><span>Tiếp tục</span><ChevronRight size={20} /></>
          ) : (
            <><CheckCircle2 size={20} /><span>Xác nhận gửi yêu cầu</span></>
          )}
        </button>
      </div>
    </div>
  )
}

/* ─── Step 1: Confirm Book ─── */
const StepConfirm = ({ book, note, setNote, borrowDays, setBorrowDays }) => (
  <div className="space-y-6">
    <div className="card p-0 overflow-hidden">
      <div className="flex gap-4 p-5">
        <img src={book?.image_url} alt={book?.title}
          className="w-20 h-28 object-cover rounded-2xl shrink-0" />
        <div className="flex-1 pt-1">
          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{book?.title}</h3>
          <p className="text-slate-500 text-sm mb-3">{book?.author}</p>
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">{book?.location_district}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chủ sách</p>
        <p className="font-bold text-slate-700">{book?.profiles?.full_name}</p>
      </div>
    </div>

    {/* Borrow duration */}
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-primary-500" />
        <h4 className="font-bold text-slate-800">Thời gian mượn</h4>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[7, 14, 30].map(d => (
          <button key={d} onClick={() => setBorrowDays(d)}
            className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
              borrowDays === d
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-100 bg-white text-slate-500 hover:border-primary-200'
            }`}>
            {d} ngày
          </button>
        ))}
      </div>
    </div>

    {/* Note */}
    <div className="card p-5">
      <h4 className="font-bold text-slate-800 mb-3">Ghi chú cho chủ sách (tuỳ chọn)</h4>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Xin chào, tôi muốn mượn sách để..."
        rows={3}
        className="input-field resize-none"
      />
    </div>

    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
      <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
      <p className="text-sm text-amber-700">
        Sau khi gửi yêu cầu, thông tin liên hệ sẽ được chia sẻ khi chủ sách chấp nhận.
      </p>
    </div>
  </div>
)

/* ─── Step 2: Deposit Info ─── */
const StepDeposit = ({ book }) => (
  <div className="space-y-6">
    {book?.deposit_required ? (
      <>
        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="text-secondary-600" size={36} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            {book.deposit_amount?.toLocaleString('vi-VN')}đ
          </h3>
          <p className="text-slate-500 text-sm">Số tiền đặt cọc thoả thuận với chủ sách</p>
        </div>

        <div className="space-y-3">
          <InfoRow icon={<ShieldCheck size={18} className="text-green-500" />}
            title="An toàn 100%"
            desc="Tiền cọc hoàn trả đầy đủ sau khi bạn trả sách đúng hạn." />
          <InfoRow icon={<Phone size={18} className="text-primary-500" />}
            title="Thanh toán trực tiếp"
            desc="Hai bên tự thoả thuận khi gặp nhau. Góp Sáng không giữ tiền cọc." />
          <InfoRow icon={<Clock size={18} className="text-secondary-500" />}
            title="Minh bạch"
            desc="Mọi giao dịch được ghi lại trong hệ thống để bảo vệ cả hai bên." />
        </div>
      </>
    ) : (
      <div className="card p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="text-green-600" size={36} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Không cần đặt cọc</h3>
        <p className="text-slate-500">Chủ sách tin tưởng cộng đồng và không yêu cầu tiền cọc.</p>
      </div>
    )}
  </div>
)

/* ─── Step 3: Review & Submit ─── */
const StepReview = ({ book, note, borrowDays }) => (
  <div className="space-y-4">
    <div className="card p-5">
      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <CheckCircle2 size={18} className="text-primary-500" /> Xác nhận thông tin
      </h4>
      <div className="space-y-3">
        <ReviewRow label="Sách" value={book?.title} />
        <ReviewRow label="Chủ sách" value={book?.profiles?.full_name} />
        <ReviewRow label="Thời gian mượn" value={`${borrowDays} ngày`} />
        <ReviewRow label="Đặt cọc" value={
          book?.deposit_required
            ? `${book.deposit_amount?.toLocaleString('vi-VN')}đ`
            : 'Không cần'
        } />
        {note && <ReviewRow label="Ghi chú" value={note} />}
      </div>
    </div>

    <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
      <p className="text-sm text-primary-800 leading-relaxed">
        🎉 <strong>Gần xong rồi!</strong> Sau khi bạn gửi yêu cầu, chủ sách sẽ nhận được thông báo và phản hồi trong vòng 24 giờ.
      </p>
    </div>
  </div>
)

/* ─── Success Screen ─── */
const SuccessScreen = ({ book, navigate }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
    <div className="w-28 h-28 bg-primary-100 rounded-full flex items-center justify-center mb-6 relative">
      <CheckCircle2 size={56} className="text-primary-500" />
      <div className="absolute -top-1 -right-1 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center animate-bounce">
        <span className="text-white text-sm">🎉</span>
      </div>
    </div>
    <h2 className="text-3xl font-bold text-slate-800 mb-3">Gửi thành công!</h2>
    <p className="text-slate-500 mb-2 max-w-xs leading-relaxed">
      Yêu cầu mượn <strong className="text-slate-700">{book?.title}</strong> đã được gửi đến chủ sách.
    </p>
    <p className="text-sm text-slate-400 mb-10">Bạn sẽ nhận thông báo khi chủ sách phản hồi.</p>
    <button onClick={() => navigate('/')} className="btn btn-primary px-10 py-4 text-base">
      Về trang chủ
    </button>
    <button onClick={() => navigate('/notifications')} className="mt-3 text-primary-600 font-bold text-sm">
      Xem thông báo
    </button>
  </div>
)

/* ─── Helpers ─── */
const InfoRow = ({ icon, title, desc }) => (
  <div className="card p-4 flex gap-4">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="font-bold text-slate-800 text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
)

const ReviewRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-400 font-medium shrink-0">{label}</span>
    <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
  </div>
)

export default BorrowFlow
