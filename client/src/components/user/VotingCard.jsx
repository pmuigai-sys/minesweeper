import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Modal from '../shared/Modal'
import api, { endpoints } from '../../services/api'

const VotingCard = ({ election, onVoteCast }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const openConfirm = (candidateId) => {
    setSelectedCandidate(candidateId)
    setConfirmOpen(true)
  }

  const handleVote = async () => {
    if (!selectedCandidate) return
    setLoading(true)
    try {
      const { data } = await api.post(endpoints.votes.root, {
        electionId: election.id,
        candidateId: selectedCandidate,
      })
      toast.success('Your vote has been securely recorded')
      setReceipt(data)
      onVoteCast?.(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cast vote')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const candidates = election.candidates || []

  return (
    <motion.article
      layout
      className="glass-card flex flex-col gap-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-slate-100">{election.title}</h3>
        <p className="text-sm text-slate-400">{election.description}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map((candidate) => (
          <motion.button
            key={candidate.id}
            layout
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className={`rounded-2xl border px-5 py-4 text-left transition ${
              selectedCandidate === candidate.id
                ? 'border-kabarak-light bg-kabarak-blue/10'
                : 'border-slate-800/70 bg-slate-900/70 hover:border-kabarak-light/40'
            }`}
            onClick={() => openConfirm(candidate.id)}
          >
            <p className="text-lg font-semibold text-slate-100">{candidate.name}</p>
            <p className="mt-2 text-sm text-slate-400">{candidate.bio}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Votes are encrypted and recorded on the blockchain.</span>
        <span className="rounded-full bg-kabarak-light/20 px-3 py-1 text-center text-kabarak-light">Proof-of-work secured</span>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm your vote"
        actions={(
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-xl border border-slate-700/70 px-4 py-2 text-sm text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVote}
              disabled={loading}
              className="rounded-xl bg-kabarak-blue px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Recording...' : 'Cast vote'}
            </button>
          </>
        )}
      >
        <p className="text-sm text-slate-300">
          You are about to cast your vote. Once submitted, your vote will be mined into the blockchain ledger and cannot
          be altered. Continue?
        </p>
      </Modal>

      <Modal
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        title="Vote receipt"
        actions={(
          <button
            type="button"
            onClick={() => setReceipt(null)}
            className="rounded-xl bg-kabarak-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Close receipt
          </button>
        )}
      >
        {receipt && (
          <div className="space-y-3 text-sm text-slate-300">
            <p>Your vote reference hash:</p>
            <p className="break-all rounded-xl border border-slate-800/70 bg-slate-900/70 p-3 text-xs text-kabarak-light">
              {receipt.blockHash}
            </p>
            <p className="text-xs text-slate-500">Keep this hash for auditing purposes. It verifies your vote exists on the chain without revealing your choice.</p>
          </div>
        )}
      </Modal>
    </motion.article>
  )
}

export default VotingCard
