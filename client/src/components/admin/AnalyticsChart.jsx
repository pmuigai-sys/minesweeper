import { useMemo } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip)

const AnalyticsChart = ({ stats }) => {
  const { voteCounts = [], turnout = 0 } = stats

  const barData = useMemo(
    () => ({
      labels: voteCounts.map((item) => item.candidateName),
      datasets: [
        {
          label: 'Votes',
          data: voteCounts.map((item) => item.totalVotes),
          backgroundColor: [
            'rgba(30, 64, 175, 0.6)',
            'rgba(124, 58, 237, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(59, 130, 246, 0.6)',
          ],
          borderRadius: 12,
        },
      ],
    }),
    [voteCounts],
  )

  const pieData = useMemo(
    () => ({
      labels: ['Voted', 'Not Voted'],
      datasets: [
        {
          data: [turnout, 100 - turnout],
          backgroundColor: ['rgba(59, 130, 246, 0.65)', 'rgba(100, 116, 139, 0.35)'],
          borderWidth: 0,
        },
      ],
    }),
    [turnout],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass-card col-span-2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Live Vote Distribution</h3>
          <span className="rounded-full bg-kabarak-blue/20 px-3 py-1 text-xs text-kabarak-light">
            Updated in real-time
          </span>
        </div>
        <Bar
          data={barData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#cbd5f5',
                  font: { family: 'Poppins' },
                },
              },
            },
            scales: {
              x: {
                ticks: { color: '#94a3b8' },
                grid: { display: false },
              },
              y: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.2)' },
              },
            },
          }}
          height={340}
        />
      </div>

      <div className="glass-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Turnout Rate</h3>
          <p className="text-xs text-slate-400">Percentage of registered voters who have cast a ballot.</p>
        </div>
        <div className="mx-auto h-64 max-w-xs">
          <Pie
            data={pieData}
            options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#94a3b8',
                    font: { family: 'Poppins' },
                  },
                },
              },
            }}
          />
        </div>
        <div className="mt-6 rounded-xl bg-slate-900/60 p-4 text-center">
          <p className="text-sm text-slate-400">Current turnout</p>
          <p className="text-3xl font-semibold text-kabarak-light">{turnout.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsChart
