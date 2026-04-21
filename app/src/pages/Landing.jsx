import React from 'react'
import { BookOpen, MapPin, ShieldCheck, ArrowRight, Heart, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const Landing = ({ onAuthOpen }) => {
  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-28 px-6">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-secondary-50 rounded-full blur-3xl opacity-60" />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-primary-600 uppercase bg-primary-50 rounded-full">
              🌿 Cộng đồng yêu sách Việt
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Chia sẻ sách{' '}
              <br className="hidden md:block" />
              <span className="text-primary-500">Lan tỏa tri thức</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
              Nền tảng giúp bạn kết nối với những người yêu sách xung quanh.
              Cho mượn những cuốn sách đã đọc và tìm kho tàng tri thức mới — <strong>hoàn toàn miễn phí</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onAuthOpen}
                className="btn btn-primary w-full sm:w-auto px-10 py-4 text-lg flex items-center justify-center gap-2 shadow-2xl shadow-primary-500/30"
              >
                Bắt đầu ngay <ArrowRight size={20} />
              </button>
              <button
                onClick={onAuthOpen}
                className="btn bg-slate-100 text-slate-800 hover:bg-slate-200 w-full sm:w-auto px-10 py-4 text-lg"
              >
                Tìm sách gần bạn
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <StatItem number="1,000+" label="Đầu sách" emoji="📚" />
            <StatItem number="500+" label="Người dùng" emoji="🧑‍🤝‍🧑" />
            <StatItem number="200+" label="Lượt mượn/tháng" emoji="🔄" />
            <StatItem number="50+" label="Điểm Góp Sáng" emoji="📍" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 px-6 rounded-t-[3rem] -mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Góp Sáng hoạt động như thế nào?</h2>
            <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="text-primary-500" />}
              title="1. Đăng sách dễ dàng"
              desc="Chụp ảnh, nhập thông tin và sẵn sàng cho cộng đồng mượn chỉ trong 1 phút."
              color="primary"
            />
            <FeatureCard
              icon={<MapPin className="text-secondary-500" />}
              title="2. Tìm kiếm gần bạn"
              desc="Lọc theo khu vực giúp bạn tìm người cho mượn sách ngay trong khu phố."
              color="secondary"
            />
            <FeatureCard
              icon={<ShieldCheck className="text-green-500" />}
              title="3. An tâm & Tin cậy"
              desc="Trust Score và đánh giá cộng đồng đảm bảo sách của bạn luôn được bảo vệ."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">3 bước để bắt đầu</h2>
            <p className="text-slate-500">Đơn giản — chỉ mất vài phút</p>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Tạo tài khoản miễn phí', desc: 'Đăng ký bằng email chỉ trong 30 giây.', icon: '✉️' },
              { step: '02', title: 'Đăng sách hoặc Tìm sách', desc: 'Upload ảnh và thông tin, hoặc browse sách gần nhà bạn.', icon: '📖' },
              { step: '03', title: 'Gặp nhau & Trao đổi', desc: 'Địa chỉ được tiết lộ sau khi hai bên xác nhận. An toàn và minh bạch.', icon: '🤝' },
            ].map(item => (
              <div key={item.step} className="flex gap-6 items-start card p-6">
                <div className="text-4xl shrink-0">{item.icon}</div>
                <div>
                  <span className="text-xs font-black text-primary-500 uppercase tracking-widest">Bước {item.step}</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-primary-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-500/40">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="10" cy="10" r="40" fill="white" />
              <circle cx="90" cy="90" r="30" fill="white" />
            </svg>
          </div>
          <Heart className="mx-auto mb-6 w-16 h-16 text-secondary-300" />
          <h2 className="text-4xl font-bold mb-6 italic">"Sách là ngọn đèn sáng dẫn lối tri thức"</h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Hãy cùng Góp Sáng xây dựng cộng đồng sẻ chia tri thức văn minh.
          </p>
          <button
            onClick={onAuthOpen}
            className="btn bg-white text-primary-600 px-12 py-4 text-xl font-bold rounded-2xl hover:bg-primary-50 transition-all"
          >
            Gia nhập ngay <Zap className="inline ml-2" size={20} />
          </button>
        </div>
      </section>
    </div>
  )
}

const StatItem = ({ number, label, emoji }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-2xl mb-1">{emoji}</span>
    <span className="text-3xl font-bold text-slate-900">{number}</span>
    <span className="text-slate-500 font-medium text-sm">{label}</span>
  </div>
)

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card p-10 hover:-translate-y-2 transition-all">
    <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-6 border border-slate-50">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
)

export default Landing
