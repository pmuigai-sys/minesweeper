import { motion } from 'framer-motion'
import LoginForm from '../components/shared/LoginForm'

const LoginPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16 lg:flex-row">
      <motion.div
        className="max-w-xl space-y-6 text-center lg:text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-kabarak-light/40 bg-kabarak-light/10 px-4 py-2 text-xs font-semibold text-kabarak-light">
          Secure ? Transparent ? Auditable
        </span>
        <h1 className="text-4xl font-semibold text-slate-100 md:text-5xl">
          Empowering Kabarak University elections with blockchain trust.
        </h1>
        <p className="text-base text-slate-400">
          The Kabarak Blockchain Voting System delivers tamper-evident ballots, real-time analytics, and end-to-end
          transparency for campus democracy.
        </p>
      </motion.div>

      <LoginForm />
    </div>
  </div>
)

export default LoginPage
