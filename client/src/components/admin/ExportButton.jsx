import { useState } from 'react'
import { toast } from 'react-toastify'
import api, { endpoints } from '../../services/api'

const ExportButton = () => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await api.get(endpoints.reports.export, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `kabarak-votes-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Vote data exported')
    } catch (error) {
      toast.error('Failed to export votes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="rounded-xl border border-kabarak-light/50 bg-kabarak-light/10 px-5 py-3 text-sm font-semibold text-kabarak-light transition hover:bg-kabarak-light/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Exporting?' : 'Export votes as CSV'}
    </button>
  )
}

export default ExportButton
