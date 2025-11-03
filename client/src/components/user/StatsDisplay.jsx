import { motion } from 'framer-motion'
import { useBlockchain } from '../../context/BlockchainContext'

const StatsDisplay = () => {
  const { stats, connected } = useBlockchain()
  const { summary = {}, voteCounts = [] } = stats

  return (
    <motion.section
      layout
      className="glass-card p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Live election stats</h3>
          <p className="text-sm text-slate-400">Updated instantly as votes are mined on the blockchain.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connected ? 'bg-emerald-500/10 text-emerald-300 animate-pulse' : 'bg-red-500/10 text-red-300'}`}>
          {connected ? 'Live connection' : 'Offline'}
        </span>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total votes</p>
          <p className="mt-3 text-2xl font-semibold text-kabarak-light">{summary.totalVotes ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Registered voters</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">{summary.totalVoters ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Turnout</p>
          <p className="mt-3 text-2xl font-semibold text-kabarak-light">{summary.turnout?.toFixed?.(1) ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active elections</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">{summary.activeElections ?? 0}</p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-slate-200">Candidate standings</h4>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {voteCounts.map((candidate) => (
            <li key={candidate.candidateId} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3">
              <span>{candidate.candidateName}</span>
              <span className="font-semibold text-kabarak-light">{candidate.totalVotes} votes</span>
            </li>
          ))}
          {voteCounts.length === 0 && <p className="text-xs text-slate-500">No votes recorded yet. Be the first!</p>}
        </ul>
      </div>
    </motion.section>
  )
}

export default StatsDisplay
