import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import VotingCard from '../components/user/VotingCard'
import StatsDisplay from '../components/user/StatsDisplay'
import HistoryList from '../components/user/HistoryList'
import api, { endpoints } from '../services/api'

const UserHome = () => {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchElections = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(endpoints.elections.active)
      setElections(data.elections || [])
    } catch (error) {
      toast.error('Unable to load elections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchElections()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-semibold text-slate-100">Student voting portal</h1>
          <p className="text-sm text-slate-400">
            Participate in active elections and keep tabs on live stats secured by our blockchain ledger.
          </p>
        </motion.header>

        <StatsDisplay />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Active elections</h2>
            <button
              type="button"
              onClick={fetchElections}
              className="rounded-xl border border-kabarak-light/50 px-4 py-2 text-xs font-semibold text-kabarak-light"
            >
              Refresh list
            </button>
          </div>

          {loading && <p className="text-xs text-slate-500">Loading elections?</p>}

          <div className="grid gap-6">
            {elections.map((election) => (
              <VotingCard key={election.id} election={election} onVoteCast={fetchElections} />
            ))}
            {!loading && elections.length === 0 && (
              <div className="glass-card p-6 text-sm text-slate-400">
                No active elections at the moment. Check back later.
              </div>
            )}
          </div>
        </section>

        <HistoryList />
      </div>
    </div>
  )
}

export default UserHome
