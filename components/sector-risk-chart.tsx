"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Enterprise {
  id: string
  secteur: string
  groupe: number
  engagement: number
  resultat_net: number
  prediction: number
}

interface SectorRiskChartProps {
  data: Enterprise[]
}

export function SectorRiskChart({ data }: SectorRiskChartProps) {
  // Calculer le nombre d'entreprises en défaut par secteur
  const sectorRiskData = data
    .filter((enterprise) => enterprise.prediction === 1)
    .reduce(
      (acc, enterprise) => {
        const sector = enterprise.secteur
        acc[sector] = (acc[sector] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  // Convertir en format pour le graphique et trier
  const chartData = Object.entries(sectorRiskData)
    .map(([secteur, count]) => ({
      secteur,
      count,
      label: secteur.length > 15 ? secteur.substring(0, 15) + "..." : secteur,
    }))
    .sort((a, b) => b.count - a.count)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.secteur}</p>
          <p className="text-sm text-muted-foreground">
            Entreprises en défaut: <span className="font-medium text-destructive">{data.count}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} fontSize={12} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
