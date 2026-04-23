import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

// Components
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'

// Pages
import Home from './pages/Home'
import BookDetail from './pages/BookDetail'
import Profile from './pages/Profile'
import Landing from './pages/Landing'
import Notifications from './pages/Notifications'
import BorrowFlow from './pages/BorrowFlow'
import AddBook from './pages/AddBook'
import Chat from './pages/Chat'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const openAuth = (mode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-primary-800 font-medium animate-pulse">Góp Sáng đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-outfit">
      <Navbar session={session} onAuthOpen={openAuth} />
      <main className="max-w-md mx-auto pb-24 md:max-w-6xl md:px-4">
        <Routes>
          <Route path="/" element={session ? <Home /> : <Landing onAuthOpen={openAuth} />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/add-book" element={session ? <AddBook /> : <Navigate to="/" />} />
          <Route path="/profile" element={session ? <Profile /> : <Navigate to="/" />} />
          <Route path="/notifications" element={session ? <Notifications /> : <Navigate to="/" />} />
          <Route path="/borrow/:id" element={session ? <BorrowFlow /> : <Navigate to="/" />} />
          <Route path="/chat/:requestId" element={session ? <Chat /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </div>
  )
}

export default App
