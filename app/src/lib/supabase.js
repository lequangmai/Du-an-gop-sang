import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isMock = !supabaseUrl || !supabaseAnonKey;

if (isMock) {
  console.warn('Thiếu cấu hình Supabase. Chạy ứng dụng trong chế độ Demo giả định.')
}

async function customFetch(url, options) {
  const baseDemoBooks = [
    { id: '1', status: 'available', title: 'Nhà Giả Kim', author: 'Paulo Coelho', image_url: 'https://cdn0.fahasa.com/media/catalog/product/n/h/nhagiakim.jpg', location_district: 'Quận 1', profiles: { full_name: 'Minh Tuấn', rating: 4.8 } },
    { id: '2', status: 'available', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', image_url: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg', location_district: 'Bình Thạnh', profiles: { full_name: 'Thanh Hà', rating: 4.9 } },
    { id: '3', status: 'available', title: 'Súng, Vi Trùng và Thép', author: 'Jared Diamond', image_url: 'https://cdn0.fahasa.com/media/catalog/product/s/u/sung-vi-trung-va-thep.jpg', location_district: 'Quận 7', profiles: { full_name: 'Hoàng Long', rating: 4.7 } },
    { id: '4', status: 'available', title: 'Lược Sử Loài Người', author: 'Yuval Noah Harari', image_url: 'https://cdn0.fahasa.com/media/catalog/product/l/u/luoc-su-loai-nguoi.jpg', location_district: 'Bình Tân', profiles: { full_name: 'Ngọc Mai', rating: 5.0 } },
    { id: '5', status: 'available', title: 'Tư Duy Nhanh Và Chậm', author: 'Daniel Kahneman', image_url: 'https://cdn0.fahasa.com/media/catalog/product/t/u/tu-duy-nhanh-va-cham.jpg', location_district: 'Gò Vấp', profiles: { full_name: 'Quang Minh', rating: 4.6 } },
    { id: '6', status: 'available', title: 'Sapiens', author: 'Yuval Noah Harari', image_url: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935086843869.jpg', location_district: 'TP Thủ Đức', profiles: { full_name: 'Thu Hương', rating: 4.9 } }
  ]

  function getDemoBooks() {
    try {
      const stored = localStorage.getItem('demo_books')
      if (stored) return JSON.parse(stored)
    } catch(e) {}
    localStorage.setItem('demo_books', JSON.stringify(baseDemoBooks))
    return baseDemoBooks
  }

  function getDemoMessages() {
    try {
      const stored = localStorage.getItem('demo_messages')
      if (stored) return JSON.parse(stored)
    } catch(e) {}
    return []
  }

  function getDemoRequests() {
    try {
      const stored = localStorage.getItem('demo_requests')
      if (stored) return JSON.parse(stored)
    } catch(e) {}
    // Initial demo request
    const initialRequests = [
      {
        id: 'req1',
        book_id: '1',
        borrower_id: 'other-user',
        status: 'pending_admin',
        created_at: new Date().toISOString(),
        books: baseDemoBooks[0],
        profiles: { id: 'other-user', full_name: 'Lê Văn Luyện', rating: 4.2 }
      }
    ]
    localStorage.setItem('demo_requests', JSON.stringify(initialRequests))
    return initialRequests
  }

  // Fake Signup
  if (url.includes('/signup')) {
    return new Response(JSON.stringify({ 
      id: 'demo-user', 
      email: options.body ? JSON.parse(options.body).email : 'demo@example.com',
      created_at: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' }})
  }
  
  // Fake Login
  if (url.includes('/token')) {
    const bodyObj = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    return new Response(JSON.stringify({
      access_token: 'demo-token-123',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh',
      user: {
        id: 'demo-user',
        email: bodyObj.email || 'demo@example.com',
        user_metadata: { full_name: 'Tài khoản Demo' }
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Fake user session
  if (url.includes('/user')) {
    return new Response(JSON.stringify({
      id: 'demo-user',
      email: 'demo@example.com'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Fake Database for Books
  if (url.includes('/rest/v1/books')) {
    let books = getDemoBooks()
    
    // Add Book
    if (options.method === 'POST') {
      const newBook = JSON.parse(options.body)
      newBook.id = Math.random().toString(36).substring(7)
      newBook.status = newBook.status || 'pending'
      newBook.profiles = { id: 'demo-user', full_name: 'Bạn (Người mới)', rating: 5.0, trust_score: 100 }
      books.unshift(newBook)
      localStorage.setItem('demo_books', JSON.stringify(books))
      return new Response(JSON.stringify(newBook), { status: 201, headers: { 'Content-Type': 'application/json' }})
    }

    // Update Book (Approval/Status)
    if (options.method === 'PATCH' || options.method === 'PUT') {
      const updates = JSON.parse(options.body)
      const idMatch = url.match(/id=eq\.([^&]+)/)
      if (idMatch) {
        const id = idMatch[1]
        books = books.map(b => b.id === id ? { ...b, ...updates } : b)
        localStorage.setItem('demo_books', JSON.stringify(books))
        return new Response(JSON.stringify(updates), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
    }
    
    // Get Books
    if (options.method === 'GET') {
      // Handle ID filter
      const idMatch = url.match(/id=eq\.([^&]+)/)
      if (idMatch) {
        const id = idMatch[1]
        const book = books.find(b => b.id === id)
        return new Response(JSON.stringify(book || null), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      // Handle status filter
      const statusMatch = url.match(/status=eq\.([^&]+)/)
      if (statusMatch) {
        const status = statusMatch[1]
        books = books.filter(b => b.status === status)
      }

      return new Response(JSON.stringify(books), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
  }

  // Fake Database for Borrow Requests
  if (url.includes('/rest/v1/borrow_requests')) {
    let requests = getDemoRequests()
    
    if (options.method === 'POST') {
      const newReq = JSON.parse(options.body)
      newReq.id = Math.random().toString(36).substring(7)
      newReq.created_at = new Date().toISOString()
      newReq.status = 'pending_admin' // New initial status
      
      // Fetch book info to include in request (mock join)
      const books = getDemoBooks()
      const book = books.find(b => b.id === newReq.book_id)
      newReq.books = book
      newReq.profiles = { id: 'other-user', full_name: 'Người mượn (Demo)', rating: 4.5 }

      requests.unshift(newReq)
      localStorage.setItem('demo_requests', JSON.stringify(requests))
      return new Response(JSON.stringify(newReq), { status: 201, headers: { 'Content-Type': 'application/json' }})
    }

    if (options.method === 'PATCH' || options.method === 'PUT') {
      const updates = JSON.parse(options.body)
      const idMatch = url.match(/id=eq\.([^&]+)/)
      if (idMatch) {
        const id = idMatch[1]
        requests = requests.map(r => r.id === id ? { ...r, ...updates } : r)
        localStorage.setItem('demo_requests', JSON.stringify(requests))
        return new Response(JSON.stringify(updates), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
    }

    if (options.method === 'GET') {
      // In mock mode, we'll return requests based on the filter if possible, 
      // otherwise return all filtered by relevance to 'demo-user'
      
      let filtered = [...requests]

      // Handle status filter
      const statusMatch = url.match(/status=eq\.([^&]+)/)
      if (statusMatch) {
        const status = statusMatch[1]
        filtered = filtered.filter(r => r.status === status)
      }

      // Handle ID filter
      const idMatch = url.match(/id=eq\.([^&]+)/)
      if (idMatch) {
        const id = idMatch[1]
        const req = filtered.find(r => r.id === id)
        return new Response(JSON.stringify(req || null), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      // Relevance filter for demo-user
      // Demo user is either:
      // 1. Borrower
      // 2. Owner
      // 3. Admin (sees everything for approval)
      const isForAdmin = statusMatch && statusMatch[1] === 'pending_admin'
      
      const result = filtered.filter(r => {
        // In mock mode, we want the demo-user to see:
        // 1. Their own requests (as borrower)
        // 2. Requests for their books (as owner)
        // 3. All requests waiting for admin approval (as admin)
        
        const isBorrower = r.borrower_id === 'demo-user'
        const isOwner = (r.books && r.books.owner_id === 'demo-user') || (r.books && !r.books.owner_id)
        const isPendingAdmin = r.status === 'pending_admin'
        
        return isBorrower || isOwner || isPendingAdmin
      })

      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
  }

  // Fake Database for Messages
  if (url.includes('/rest/v1/messages')) {
    let messages = getDemoMessages()
    
    if (options.method === 'POST') {
      const newMsg = JSON.parse(options.body)
      newMsg.id = Math.random().toString(36).substring(7)
      newMsg.created_at = new Date().toISOString()
      messages.push(newMsg)
      localStorage.setItem('demo_messages', JSON.stringify(messages))
      return new Response(JSON.stringify(newMsg), { status: 201, headers: { 'Content-Type': 'application/json' }})
    }

    if (options.method === 'GET') {
      const requestIdMatch = url.match(/request_id=eq\.([^&]+)/)
      if (requestIdMatch) {
        const requestId = requestIdMatch[1]
        messages = messages.filter(m => m.request_id === requestId)
      }
      return new Response(JSON.stringify(messages), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
  }

  // Fake profiles
  if (url.includes('/rest/v1/profiles')) {
    return new Response(JSON.stringify({
      id: 'demo-user',
      full_name: 'Tài khoản Demo',
      role: 'admin',
      trust_score: 95,
      rating: 4.9,
      books_shared: 12,
      books_borrowed: 4
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Fake general database requests (returns empty array for unknown tables)
  return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' }})
}

export const supabase = createClient(
  supabaseUrl || 'https://demo-project.supabase.co',
  supabaseAnonKey || 'demo-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
    },
    global: {
      fetch: isMock ? customFetch : (...args) => fetch(...args)
    }
  }
)
