import React, { useState } from 'react'
import { X, BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'success'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })

  if (!isOpen) return null

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      onClose()
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName }
        }
      })
      if (error) throw error
      setMode('success')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl z-10 overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}>

        {/* Close Button */}
        <button onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all z-10">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-8 pt-10 pb-12 text-white relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {mode === 'login' ? 'Chào mừng trở lại!' : mode === 'signup' ? 'Gia nhập Góp Sáng' : 'Kiểm tra email!'}
            </h2>
            <p className="text-primary-100 text-sm">
              {mode === 'login' ? 'Đăng nhập để tiếp tục hành trình sách' :
               mode === 'signup' ? 'Cùng lan tỏa tri thức với cộng đồng' :
               'Chúng tôi đã gửi link xác nhận vào email của bạn'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-8 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl">

            {mode === 'success' ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Đăng ký thành công!</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Vui lòng kiểm tra email <strong className="text-slate-700">{form.email}</strong> và nhấp vào link xác nhận để hoàn tất đăng ký.
                </p>
                <button onClick={() => setMode('login')} className="btn btn-primary w-full py-3">
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Họ và tên</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={form.fullName}
                        onChange={e => set('fullName', e.target.value)}
                        required
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="ten@email.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Tối thiểu 6 ký tự"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      required
                      className="input-field pl-11 pr-11"
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : mode === 'login' ? (
                    <><span>Đăng nhập</span><ArrowRight size={18} /></>
                  ) : (
                    <><span>Tạo tài khoản</span><ArrowRight size={18} /></>
                  )}
                </button>

                <div className="text-center pt-2">
                  {mode === 'login' ? (
                    <p className="text-sm text-slate-500">
                      Chưa có tài khoản?{' '}
                      <button type="button" onClick={() => { setMode('signup'); setError('') }}
                        className="text-primary-600 font-bold hover:underline">
                        Đăng ký ngay
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Đã có tài khoản?{' '}
                      <button type="button" onClick={() => { setMode('login'); setError('') }}
                        className="text-primary-600 font-bold hover:underline">
                        Đăng nhập
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default AuthModal
