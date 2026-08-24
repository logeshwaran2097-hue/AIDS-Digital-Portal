'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title)

const colorPalette = [
  '#071A3D', // Navy
  '#1455D9', // Royal
  '#2878E8', // Bright
  '#F4C430', // Gold
  '#22C7E8', // Cyan
  '#0D40A8', // Royal Dark
  '#1AA8C4', // Cyan Dark
  '#D4A828', // Gold Dark
]

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12, family: 'Inter' },
        color: '#071A3D',
      },
    },
    tooltip: {
      backgroundColor: '#071A3D',
      titleFont: { size: 13, family: 'Inter', weight: 'bold' as const },
      bodyFont: { size: 12, family: 'Inter' },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
    },
  },
}

interface BaseChartProps {
  data: number[]
  labels: string[]
  title?: string
  className?: string
}

export function DoughnutChart({ data, labels, title }: BaseChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-navy mb-4 text-center">{title}</h3>}
      <div className="h-64 md:h-80">
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data,
                backgroundColor: colorPalette,
                borderWidth: 0,
                hoverOffset: 8,
              },
            ],
          }}
          options={{
            ...chartOptions,
            cutout: '60%',
          }}
        />
      </div>
    </div>
  )
}

export function BarChart({ data, labels, title }: BaseChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-navy mb-4 text-center">{title}</h3>}
      <div className="h-64 md:h-80">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: title || 'Count',
                data,
                backgroundColor: colorPalette[1],
                borderRadius: 8,
                maxBarThickness: 40,
              },
            ],
          }}
          options={{
            ...chartOptions,
            indexAxis: 'y' as const,
            scales: {
              x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
              y: { grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  )
}

export function LineChart({ data, labels, title }: BaseChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-navy mb-4 text-center">{title}</h3>}
      <div className="h-64 md:h-80">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: title || 'Value',
                data,
                borderColor: colorPalette[1],
                backgroundColor: 'rgba(20, 85, 217, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: colorPalette[1],
              },
            ],
          }}
          options={{
            ...chartOptions,
            scales: {
              y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
              x: { grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  )
}

export function MultiBarChart({ datasets, labels, title }: { datasets: { label: string; data: number[]; color?: string }[]; labels: string[]; title?: string }) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-navy mb-4 text-center">{title}</h3>}
      <div className="h-64 md:h-80">
        <Bar
          data={{
            labels,
            datasets: datasets.map((ds, i) => ({
              label: ds.label,
              data: ds.data,
              backgroundColor: ds.color || colorPalette[i % colorPalette.length],
              borderRadius: 8,
              maxBarThickness: 30,
            })),
          }}
          options={{
            ...chartOptions,
            indexAxis: 'y' as const,
            scales: {
              x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
              y: { grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  )
}