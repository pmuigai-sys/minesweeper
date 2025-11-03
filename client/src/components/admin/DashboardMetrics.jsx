const accentClasses = {
  primary: 'bg-kabarak-blue/20 text-kabarak-light',
  accent: 'bg-kabarak-accent/20 text-kabarak-accent',
  highlight: 'bg-kabarak-light/20 text-kabarak-light',
  success: 'bg-emerald-500/20 text-emerald-300',
}

const MetricCard = ({ title, value, trend, accent = 'primary' }) => (
  <div className="glass-card p-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-100">{value}</p>
      </div>
      <div className={`rounded-xl px-3 py-1 text-xs font-medium ${accentClasses[accent]}`}>{trend}</div>
    </div>
  </div>
)

const DashboardMetrics = ({ stats }) => {
  const summary = stats.summary || {}

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Registered voters"
        value={summary.totalVoters ?? 0}
        trend="Total"
        accent="primary"
      />
      <MetricCard
        title="Active elections"
        value={summary.activeElections ?? 0}
        trend="Live"
        accent="accent"
      />
      <MetricCard
        title="Votes cast"
        value={summary.totalVotes ?? 0}
        trend="Submitted"
        accent="highlight"
      />
      <MetricCard
        title="Blockchain health"
        value={summary.blockchainStatus || 'Healthy'}
        trend="Status"
        accent="success"
      />
    </div>
  )
}

export default DashboardMetrics
