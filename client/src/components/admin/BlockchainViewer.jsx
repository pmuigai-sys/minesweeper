import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Modal from '../shared/Modal'
import { useBlockchain } from '../../context/BlockchainContext'

const BlockCard = ({ block, onInspect }) => (
  <button
    type="button"
    onClick={() => onInspect(block)}
    className="w-full text-left transition hover:-translate-y-1 hover:shadow-xl"
  >
    <div className="glass-card space-y-3 p-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Index #{block.index}</span>
        <span>{new Date(block.timestamp).toLocaleString()}</span>
      </div>
      <p className="text-sm font-semibold text-kabarak-light">Hash</p>
      <p className="break-all text-xs text-slate-300">{block.hash}</p>
      <p className="text-xs text-slate-500">Previous: {block.previousHash}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">Nonce {block.nonce}</span>
        <span className="rounded-full bg-kabarak-blue/20 px-3 py-1 text-kabarak-light">{block.vote?.electionTitle}</span>
      </div>
    </div>
  </button>
)

const BlockchainViewer = () => {
  const { blocks, verifyBlockchain } = useBlockchain()
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [verifying, setVerifying] = useState(false)

  const orderedBlocks = useMemo(() => [...blocks].sort((a, b) => b.index - a.index), [blocks])

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const { status } = await verifyBlockchain()
      if (status === 'ok') {
        toast.success('Blockchain integrity verified')
      } else {
        toast.error('Blockchain integrity check failed')
      }
    } catch (error) {
      toast.error('Unable to verify blockchain')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Blockchain audit trail</h3>
          <p className="text-sm text-slate-400">Inspect mined blocks and verify the ledger integrity.</p>
        </div>
        <button
          type="button"
          disabled={verifying}
          onClick={handleVerify}
          className="rounded-xl border border-kabarak-light/50 px-5 py-3 text-sm font-semibold text-kabarak-light transition hover:bg-kabarak-light/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying ? 'Verifying?' : 'Verify blockchain'}
        </button>
      </div>

      <motion.div
        layout
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {orderedBlocks.map((block) => (
          <BlockCard key={block.hash} block={block} onInspect={setSelectedBlock} />
        ))}
      </motion.div>

      <Modal
        open={Boolean(selectedBlock)}
        onClose={() => setSelectedBlock(null)}
        title={`Block #${selectedBlock?.index}`}
        actions={(
          <button
            type="button"
            onClick={() => setSelectedBlock(null)}
            className="rounded-xl bg-kabarak-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
        )}
      >
        {selectedBlock && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Hash</dt>
              <dd className="break-all text-slate-100">{selectedBlock.hash}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Previous hash</dt>
              <dd className="break-all text-slate-400">{selectedBlock.previousHash}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-slate-400">Vote payload</dt>
              <dd className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4 text-xs text-slate-300">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(selectedBlock.vote, null, 2)}</pre>
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </section>
  )
}

export default BlockchainViewer
