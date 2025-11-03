import { motion, AnimatePresence } from 'framer-motion'

const Modal = ({ open, onClose, title, children, actions }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          className="glass-card max-w-lg w-full mx-4 p-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-700/70 p-2 text-slate-400 transition hover:text-slate-100"
              aria-label="Close dialog"
            >
              ?
            </button>
          </div>
          <div className="space-y-4 text-sm text-slate-300">{children}</div>
          {actions && <div className="mt-8 flex items-center justify-end gap-3">{actions}</div>}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default Modal
