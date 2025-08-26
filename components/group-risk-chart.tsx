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

interface GroupRiskChartProps {
  data: Enterprise[]
}

export function GroupRiskChart({ data }: GroupRiskChartProps) {
  // Calculer le nombre d'entreprises en défaut par groupe
  const groupRiskData = data
    .filter((enterprise) => enterprise.prediction === 1)
    .reduce(
      (acc, enterprise) => {
        const group = enterprise.groupe
        acc[group] = (acc[group] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

  // Convertir en format pour le graphique et trier
  const chartData = Object.entries(groupRiskData)
    .map(([groupe, count]) => ({
      groupe: `Groupe ${groupe}`,
      groupeNum: Number.parseInt(groupe),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.groupe}</p>
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
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="groupe" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
