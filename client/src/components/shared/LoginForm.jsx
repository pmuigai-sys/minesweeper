import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

const LoginForm = () => {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [user, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const authenticatedUser = await login(form)
      toast.success(`Welcome back, ${authenticatedUser.name}!`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      layout
      onSubmit={handleSubmit}
      className="glass-card w-full max-w-md space-y-6 p-8 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-slate-100">Kabarak Voting Portal</h2>
        <p className="text-sm text-slate-400">
          Enter your university email and password to access the blockchain-secured election portal.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          University Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@kabarak.ac.ke"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-slate-100 transition focus:border-kabarak-light focus:outline-none focus:ring-2 focus:ring-kabarak-blue/40"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="********"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-slate-100 transition focus:border-kabarak-light focus:outline-none focus:ring-2 focus:ring-kabarak-blue/40"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-kabarak-blue to-kabarak-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-kabarak-light hover:to-kabarak-emerald focus:outline-none focus:ring-2 focus:ring-kabarak-light focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Authenticating...' : 'Sign in'}
      </button>
    </motion.form>
  )
}

export default LoginForm
