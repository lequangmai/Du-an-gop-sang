import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MapPin, Star, Bookmark, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

const DEMO_BOOKS = [
  {
    id: '1',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    image_url: 'https://cdn0.fahasa.com/media/catalog/product/n/h/nhagiakim.jpg',
    location_district: 'Quận 1',
    profiles: { full_name: 'Minh Tuấn', rating: 4.8 }
  },
  {
    id: '2',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    image_url: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg',
    location_district: 'Bình Thạnh',
    profiles: { full_name: 'Thanh Hà', rating: 4.9 }
  },
  {
    id: '3',
    title: 'Súng, Vi Trùng và Thép',
    author: 'Jared Diamond',
    image_url: 'https://cdn0.fahasa.com/media/catalog/product/s/u/sung-vi-trung-va-thep.jpg',
    location_district: 'Quận 7',
    profiles: { full_name: 'Hoàng Long', rating: 4.7 }
  },
  {
    id: '4',
    title: 'Lược Sử Loài Người',
    author: 'Yuval Noah Harari',
    image_url: 'https://cdn0.fahasa.com/media/catalog/product/l/u/luoc-su-loai-nguoi.jpg',
    location_district: 'Bình Tân',
    profiles: { full_name: 'Ngọc Mai', rating: 5.0 }
  },
  {
    id: '5',
    title: 'Tư Duy Nhanh Và Chậm',
    author: 'Daniel Kahneman',
    image_url: 'https://cdn0.fahasa.com/media/catalog/product/t/u/tu-duy-nhanh-va-cham.jpg',
    location_district: 'Gò Vấp',
    profiles: { full_name: 'Quang Minh', rating: 4.6 }
  },
  {
    id: '6',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    image_url: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935086843869.jpg',
    location_district: 'Thủ Đức',
    profiles: { full_name: 'Thu Hương', rating: 4.9 }
  }
]

const DISTRICTS = ['Quận 1', 'Quận 7', 'Bình Thạnh', 'Thủ Đức', 'Gò Vấp']

const Home = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDistrict, setActiveDistrict] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles:owner_id (full_name, rating)')
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data)
    } catch {
      setBooks(DEMO_BOOKS)
    } finally {
      setLoading(false)
    }
  }

  const filtered = books.filter(b => {
    const matchSearch = !searchTerm ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDistrict = !activeDistrict || b.location_district === activeDistrict
    return matchSearch && matchDistrict
  })

  return (
    <div className="px-6 py-8">
      {/* Search Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Bạn muốn mượn sách gì?</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tên sách, tác giả, thể loại..."
              className="input-field pl-12 h-14 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={24} />
          </button>
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-8 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="text-primary-500" size={20} /> Sách gần bạn
          </h3>
          {activeDistrict && (
            <button onClick={() => setActiveDistrict(null)} className="text-sm text-slate-400 font-medium">Xoá lọc</button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {DISTRICTS.map(loc => (
            <button
              key={loc}
              onClick={() => setActiveDistrict(activeDistrict === loc ? null : loc)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-all ${
                activeDistrict === loc
                  ? 'bg-primary-500 text-white shadow-primary-500/30'
                  : 'bg-white border border-slate-100 text-slate-700 hover:border-primary-200 hover:bg-primary-50'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-700">
          {searchTerm || activeDistrict ? `${filtered.length} kết quả` : 'Sách mới nhất'}
        </h3>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-slate-200 rounded-3xl mb-3" />
              <div className="h-4 bg-slate-200 rounded-full mb-2 w-4/5" />
              <div className="h-3 bg-slate-100 rounded-full w-3/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={36} className="text-slate-300" />
          </div>
          <p className="font-bold text-slate-400 mb-2">Không tìm thấy sách phù hợp</p>
          <p className="text-sm text-slate-300">Thử tìm với từ khóa khác nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}

const BookCard = ({ book }) => {
  return (
    <Link to={`/book/${book.id}`} className="group relative flex flex-col">
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-4 shadow-md bg-slate-200 block">
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/200x280/3e8e41/ffffff?text=${encodeURIComponent(book.title.slice(0, 10))}`
          }}
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={e => e.preventDefault()}
            className="w-8 h-8 glass flex items-center justify-center rounded-full text-slate-600 hover:text-primary-600 transition-colors"
          >
            <Bookmark size={16} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-primary-500/80 px-2 py-0.5 rounded">
            CÓ SẴN
          </span>
        </div>
      </div>

      <h4 className="font-bold text-slate-800 line-clamp-1 leading-tight mb-1">{book.title}</h4>
      <p className="text-xs text-slate-500 mb-2">{book.author}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-slate-400" />
          <span className="text-[11px] font-medium text-slate-500">{book.location_district}</span>
        </div>
        <div className="flex items-center gap-1 bg-secondary-50 px-1.5 py-0.5 rounded-lg border border-secondary-100">
          <Star size={10} className="fill-secondary-500 text-secondary-500" />
          <span className="text-[10px] font-bold text-secondary-700">{book.profiles?.rating || 'Mới'}</span>
        </div>
      </div>
    </Link>
  )
}

export default Home
