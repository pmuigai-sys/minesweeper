import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import VotingCard from '../components/user/VotingCard'
import api, { endpoints } from '../services/api'

const VotePage = () => {
  const { electionId } = useParams()
  const [election, setElection] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchElection = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`${endpoints.elections.root}/${electionId}`)
        setElection(data.election)
      } catch (error) {
        toast.error('Unable to load election')
      } finally {
        setLoading(false)
      }
    }

    fetchElection()
  }, [electionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-semibold text-slate-100">Cast your vote</h1>
          <p className="text-sm text-slate-400">Review candidates and record your ballot below.</p>
        </motion.header>

        {loading && <p className="mt-8 text-sm text-slate-500">Loading election details?</p>}
        {election && <VotingCard election={election} />}
        {!loading && !election && (
          <div className="mt-8 glass-card p-6 text-sm text-red-400">Election not found or unavailable.</div>
        )}
      </div>
    </div>
  )
}

export default VotePage
