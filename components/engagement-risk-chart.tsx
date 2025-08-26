"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Enterprise {
  id: string
  secteur: string
  groupe: number
  engagement: number
  resultat_net: number
  prediction: number
}

interface EngagementRiskChartProps {
  data: Enterprise[]
}

export function EngagementRiskChart({ data }: EngagementRiskChartProps) {
  // Créer des buckets d'engagement
  const createEngagementBuckets = (enterprises: Enterprise[]) => {
    const maxEngagement = Math.max(...enterprises.map((e) => e.engagement))
    const minEngagement = Math.min(...enterprises.map((e) => e.engagement))
    const bucketSize = (maxEngagement - minEngagement) / 10

    const buckets: Record<string, { total: number; risky: number }> = {}

    enterprises.forEach((enterprise) => {
      const bucketIndex = Math.floor((enterprise.engagement - minEngagement) / bucketSize)
      const bucketStart = minEngagement + bucketIndex * bucketSize
      const bucketEnd = bucketStart + bucketSize
      const bucketKey = `${Math.round(bucketStart / 1000)}K-${Math.round(bucketEnd / 1000)}K`

      if (!buckets[bucketKey]) {
        buckets[bucketKey] = { total: 0, risky: 0 }
      }

      buckets[bucketKey].total++
      if (enterprise.prediction === 1) {
        buckets[bucketKey].risky++
      }
    })

    return Object.entries(buckets)
      .map(([range, stats]) => ({
        range,
        proportion: stats.total > 0 ? (stats.risky / stats.total) * 100 : 0,
        total: stats.total,
        risky: stats.risky,
      }))
      .sort((a, b) => {
        const aStart = Number.parseInt(a.range.split("-")[0])
        const bStart = Number.parseInt(b.range.split("-")[0])
        return aStart - bStart
      })
  }

  const chartData = createEngagementBuckets(data)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">Engagement: {data.range}</p>
          <p className="text-sm text-muted-foreground">
            Proportion à risque: <span className="font-medium text-destructive">{data.proportion.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Entreprises à risque: {data.risky} / {data.total}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} fontSize={12} />
          <YAxis label={{ value: "Proportion (%)", angle: -90, position: "insideLeft" }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="proportion"
            stroke="hsl(var(--destructive))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
