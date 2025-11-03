import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import DashboardMetrics from '../components/admin/DashboardMetrics'
import AnalyticsChart from '../components/admin/AnalyticsChart'
import ElectionManager from '../components/admin/ElectionManager'
import BlockchainViewer from '../components/admin/BlockchainViewer'
import ExportButton from '../components/admin/ExportButton'
import { useBlockchain } from '../context/BlockchainContext'
import api, { endpoints } from '../services/api'

const AdminDashboard = () => {
  const { stats, refreshBlockchain } = useBlockchain()
  const [adminStats, setAdminStats] = useState(stats)

  const fetchStats = async () => {
    try {
      const { data } = await api.get(endpoints.votes.stats)
      setAdminStats(data)
    } catch (error) {
      toast.error('Unable to load statistics')
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    setAdminStats(stats)
  }, [stats])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">Admin control centre</h1>
            <p className="text-sm text-slate-400">
              Monitor election performance, manage candidates, and audit blockchain entries.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButton />
            <button
              type="button"
              onClick={() => {
                fetchStats()
                refreshBlockchain()
              }}
              className="rounded-xl border border-kabarak-light/40 px-5 py-3 text-sm font-semibold text-kabarak-light"
            >
              Refresh analytics
            </button>
          </div>
        </motion.header>

        <DashboardMetrics stats={adminStats} />
        <AnalyticsChart stats={adminStats} />
        <ElectionManager />
        <BlockchainViewer />
      </div>
    </div>
  )
}

export default AdminDashboard
