import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, BookOpen, MapPin, Tag, DollarSign, CheckCircle2, AlertCircle, Plus, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Văn học', 'Kinh tế', 'Kỹ năng sống', 'Lịch sử', 'Khoa học', 'Thiếu nhi', 'Ngoại ngữ', 'Khác']
const CONDITIONS = [
  { value: 'like_new', label: 'Như mới', desc: 'Sách chưa dùng hoặc gần như mới tinh' },
  { value: 'good', label: 'Tốt', desc: 'Sách còn đẹp, ít dùng' },
  { value: 'fair', label: 'Bình thường', desc: 'Có dấu vết sử dụng nhưng vẫn đọc được' },
]
const DISTRICTS = ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Tân', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'TP Thủ Đức', 'Bình Chánh', 'Cần Giờ', 'Củ Chi', 'Hóc Môn', 'Nhà Bè', 'Khác']

const AddBook = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    condition: 'good',
    location_district: '',
    image_url: '',
    deposit_required: false,
    deposit_amount: 50000,
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Vui lòng chọn ảnh nhỏ hơn 5MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        set('image_url', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Vui lòng nhập tên sách'
    if (!form.author.trim()) e.author = 'Vui lòng nhập tên tác giả'
    if (!form.category) e.category = 'Chọn thể loại sách'
    if (!form.location_district) e.location_district = 'Chọn quận/huyện'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!\n\nBạn cần nhập/chọn đủ:\n- Tên sách\n- Tác giả\n- Thể loại\n- Vị trí (Quận/Huyện)')
      return
    }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Chưa đăng nhập')

      const payload = {
        ...form,
        owner_id: user.id,
        status: 'pending',
        deposit_amount: form.deposit_required ? Number(form.deposit_amount) : null,
        image_url: form.image_url || `https://covers.openlibrary.org/b/title/${encodeURIComponent(form.title)}-L.jpg`,
      }

      const { error } = await supabase.from('books').insert(payload)
      if (error) throw error

      setSuccess(true)
    } catch (err) {
      console.error(err)
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-28 h-28 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={56} className="text-amber-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Đã gửi yêu cầu! 📝</h2>
        <p className="text-slate-500 mb-4 max-w-xs leading-relaxed">
          Sách <strong className="text-slate-700">"{form.title}"</strong> đã được gửi lên hệ thống và đang chờ Admin duyệt.
        </p>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-10 text-sm text-amber-700">
          Thông báo sẽ được gửi cho bạn khi sách sẵn sàng chia sẻ.
        </div>
        <button onClick={() => navigate('/')} className="btn btn-primary px-10 py-4 text-base mb-3 shadow-lg shadow-primary-500/30">
          Về trang chủ
        </button>
        <button onClick={() => { setSuccess(false); setForm({ title: '', author: '', description: '', category: '', condition: 'good', location_district: '', image_url: '', deposit_required: false, deposit_amount: 50000 }) }}
          className="text-primary-600 font-bold text-sm">
          Đăng thêm sách khác
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Đăng sách chia sẻ</h2>
          <p className="text-xs text-slate-400">Chia sẻ tri thức với cộng đồng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

        {/* Image Upload Placeholder */}
        <div className="card p-0 overflow-hidden relative">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 border-2 border-dashed border-slate-200 m-4 rounded-3xl transition-all relative overflow-hidden group">
            
            {form.image_url ? (
              <>
                <img src={form.image_url} alt="Bìa sách" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                   <ImageIcon size={28} />
                   <span className="font-bold text-sm">Đổi ảnh khác</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-primary-500 group-hover:scale-110 transition-transform">
                  <Camera size={26} strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700 text-sm">Tải ảnh bìa lên</p>
                  <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG (Max 5MB)</p>
                </div>
              </>
            )}
          </div>
          
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="h-[1px] flex-1 bg-slate-100"></div>
               <span className="text-xs font-bold text-slate-300 uppercase">Hoặc</span>
               <div className="h-[1px] flex-1 bg-slate-100"></div>
            </div>
            <input
              type="url"
              placeholder="https://... (Dán đường link ảnh nếu có)"
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              className="input-field text-sm bg-slate-50 border-transparent focus:bg-white"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-primary-500" />
            <h3 className="font-bold text-slate-800">Thông tin sách</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tên sách <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nhà Giả Kim"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tác giả <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Paulo Coelho"
              value={form.author}
              onChange={e => set('author', e.target.value)}
              className={`input-field ${errors.author ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.author && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.author}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mô tả ngắn</label>
            <textarea
              placeholder="Giới thiệu ngắn về nội dung sách..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Category */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-secondary-500" />
            <h3 className="font-bold text-slate-800">Thể loại <span className="text-red-400">*</span></h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button type="button" key={cat} onClick={() => set('category', cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  form.category === cat
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-slate-600 border-slate-100 hover:border-primary-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.category}</p>}
        </div>

        {/* Condition */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-800 mb-4">Tình trạng sách</h3>
          <div className="space-y-3">
            {CONDITIONS.map(c => (
              <button type="button" key={c.value} onClick={() => set('condition', c.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  form.condition === c.value
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  form.condition === c.value ? 'border-primary-500' : 'border-slate-300'
                }`}>
                  {form.condition === c.value && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                </div>
                <div>
                  <p className={`font-bold text-sm ${form.condition === c.value ? 'text-primary-800' : 'text-slate-700'}`}>{c.label}</p>
                  <p className="text-xs text-slate-400">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-blue-500" />
            <h3 className="font-bold text-slate-800">Vị trí <span className="text-red-400">*</span></h3>
          </div>
          <select
            value={form.location_district}
            onChange={e => set('location_district', e.target.value)}
            className={`input-field ${errors.location_district ? 'border-red-400 bg-red-50' : ''}`}>
            <option value="">Chọn quận/huyện...</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.location_district && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.location_district}</p>}
        </div>

        {/* Deposit */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-green-500" />
            <h3 className="font-bold text-slate-800">Đặt cọc</h3>
          </div>

          <button type="button" onClick={() => set('deposit_required', !form.deposit_required)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all mb-4 ${
              form.deposit_required ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50'
            }`}>
            <div>
              <p className="font-bold text-slate-800 text-sm">Yêu cầu đặt cọc</p>
              <p className="text-xs text-slate-400">Tăng độ an toàn cho sách của bạn</p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all relative ${form.deposit_required ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.deposit_required ? 'left-7' : 'left-1'}`} />
            </div>
          </button>

          {form.deposit_required && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Số tiền cọc (đ)</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.deposit_amount}
                  onChange={e => set('deposit_amount', e.target.value)}
                  min={10000}
                  step={10000}
                  className="input-field pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">đ</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[20000, 50000, 100000, 200000].map(amt => (
                  <button type="button" key={amt} onClick={() => set('deposit_amount', amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      Number(form.deposit_amount) === amt
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}>
                    {(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <><Plus size={20} /> Đăng sách ngay</>
          )}
        </button>
      </form>
    </div>
  )
}

export default AddBook
