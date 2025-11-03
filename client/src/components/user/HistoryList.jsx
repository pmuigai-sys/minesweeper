import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import api, { endpoints } from '../../services/api'

const HistoryList = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(endpoints.votes.history)
        setHistory(data.history || [])
      } catch (error) {
        toast.error('Unable to load voting history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <motion.section
      layout
      className="glass-card p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-100">Your voting record</h3>
        <p className="text-sm text-slate-400">Private ledger of elections you have participated in.</p>
      </header>

      <ul className="mt-6 space-y-4 text-sm text-slate-300">
        {loading && <p className="text-xs text-slate-500">Loading history?</p>}
        {!loading &&
          history.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(item.votedAt).toLocaleString()}</span>
                <span className="rounded-full bg-kabarak-blue/20 px-3 py-1 text-kabarak-light">Tx: {item.blockIndex}</span>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-100">{item.electionTitle}</p>
              <p className="text-xs text-slate-500">
                Vote recorded on block <span className="text-kabarak-light">#{item.blockIndex}</span>
              </p>
            </li>
          ))}
        {!loading && history.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-8 text-center text-xs text-slate-500">
            You have not participated in any elections yet.
          </li>
        )}
      </ul>
    </motion.section>
  )
}

export default HistoryList
