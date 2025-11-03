import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LoginPage from './pages/Login'
import UserHome from './pages/UserHome'
import VotePage from './pages/VotePage'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  const location = useLocation()
  const hideChrome = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {!hideChrome && <Header />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route index element={<UserHome />} />
              <Route path="/vote/:electionId" element={<VotePage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideChrome && <Footer />}

      <ToastContainer position="top-right" theme="dark" closeOnClick newestOnTop pauseOnHover={false} />
    </div>
  )
}

export default App
