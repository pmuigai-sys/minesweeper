import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import api, { endpoints } from '../../services/api'

const initialElection = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
}

const ElectionManager = () => {
  const [elections, setElections] = useState([])
  const [editingElection, setEditingElection] = useState(null)
  const [form, setForm] = useState(initialElection)
  const [loading, setLoading] = useState(false)
  const [candidateForm, setCandidateForm] = useState({ name: '', bio: '' })

  const fetchElections = useCallback(async () => {
    try {
      const { data } = await api.get(endpoints.elections.root)
      setElections(data.elections || [])
    } catch (error) {
      toast.error('Failed to load elections')
    }
  }, [])

  useEffect(() => {
    fetchElections()
  }, [fetchElections])

  const resetForm = () => {
    setForm(initialElection)
    setEditingElection(null)
  }

  const handleElectionSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      if (editingElection) {
        await api.patch(`${endpoints.elections.root}/${editingElection.id}`, form)
        toast.success('Election updated')
      } else {
        await api.post(endpoints.elections.root, form)
        toast.success('Election created')
      }
      resetForm()
      fetchElections()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save election')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election?')) return
    try {
      await api.delete(`${endpoints.elections.root}/${electionId}`)
      toast.success('Election deleted')
      fetchElections()
    } catch (error) {
      toast.error('Failed to delete election')
    }
  }

  const handleAddCandidate = async (electionId) => {
    if (!candidateForm.name.trim()) {
      toast.error('Candidate name is required')
      return
    }
    try {
      await api.post(`${endpoints.elections.root}/${electionId}/candidates`, candidateForm)
      toast.success('Candidate added')
      setCandidateForm({ name: '', bio: '' })
      fetchElections()
    } catch (error) {
      toast.error('Failed to add candidate')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <motion.form
        onSubmit={handleElectionSubmit}
        className="glass-card space-y-6 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            {editingElection ? 'Edit election' : 'Create new election'}
          </h3>
          <p className="text-sm text-slate-400">
            Configure election window and description. Candidates can be added afterwards.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="space-y-2 text-sm text-slate-300">
            <span>Title</span>
            <input
              required
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            <span>Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Start date</span>
              <input
                required
                type="datetime-local"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>End date</span>
              <input
                required
                type="datetime-local"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-kabarak-blue px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-kabarak-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingElection ? 'Update election' : 'Create election'}
          </button>
          {editingElection && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700/60 px-5 py-3 text-sm text-slate-300"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.form>

      <div className="space-y-6">
        {elections.map((election) => (
          <motion.div
            key={election.id}
            className="glass-card space-y-5 p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-semibold text-slate-100">{election.title}</h4>
                <p className="mt-2 text-sm text-slate-400">{election.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingElection(election)
                    setForm({
                      title: election.title,
                      description: election.description,
                      startDate: election.startDate?.slice(0, 16) || '',
                      endDate: election.endDate?.slice(0, 16) || '',
                    })
                  }}
                  className="rounded-xl border border-kabarak-light/50 px-3 py-1 text-xs text-kabarak-light"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteElection(election.id)}
                  className="rounded-xl border border-red-500/50 px-3 py-1 text-xs text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-2 rounded-xl bg-slate-900/60 p-4 text-xs text-slate-400">
              <p>
                <span className="text-slate-200">Starts:</span> {new Date(election.startDate).toLocaleString()}
              </p>
              <p>
                <span className="text-slate-200">Ends:</span> {new Date(election.endDate).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-slate-200">Candidates</h5>
                <span className="rounded-full bg-kabarak-blue/20 px-3 py-1 text-xs text-kabarak-light">
                  {election.candidates?.length || 0} registered
                </span>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                {(election.candidates || []).map((candidate) => (
                  <li key={candidate.id} className="rounded-xl border border-slate-800/70 px-4 py-3">
                    <p className="font-medium text-slate-100">{candidate.name}</p>
                    <p className="text-xs text-slate-400">{candidate.bio}</p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-kabarak-light/40 p-4">
                <h6 className="text-xs font-semibold uppercase tracking-wide text-kabarak-light/90">
                  Add new candidate
                </h6>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Candidate name"
                    value={candidateForm.name}
                    onChange={(event) => setCandidateForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Short bio"
                    value={candidateForm.bio}
                    onChange={(event) => setCandidateForm((prev) => ({ ...prev, bio: event.target.value }))}
                    className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddCandidate(election.id)}
                    className="rounded-xl bg-kabarak-light/20 px-4 py-2 text-xs font-semibold text-kabarak-light"
                  >
                    Add candidate
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ElectionManager
