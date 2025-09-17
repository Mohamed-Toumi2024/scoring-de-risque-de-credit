"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Building2, Users, Calculator } from "lucide-react"
import { PredictionsTable } from "@/components/predictions-table"
import { SectorRiskChart } from "@/components/sector-risk-chart"
import { EngagementRiskChart } from "@/components/engagement-risk-chart"
import { GroupRiskChart } from "@/components/group-risk-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Enterprise {
  id: string
  secteur: string
  groupe: number
  engagement: number
  resultat_net: number
  prediction: number
}

interface DashboardStats {
  totalEnterprises: number
  riskyEnterprises: number
  riskRate: number
  sectorsAtRisk: number
}

export default function Dashboard() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalEnterprises: 0,
    riskyEnterprises: 0,
    riskRate: 0,
    sectorsAtRisk: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

const fetchData = async () => {
  try {
    const response = await fetch("http://localhost:8000/predict")
    const data = await response.json()
    setEnterprises(data.enterprises ?? [])
    if (data.stats) {
      setStats(data.stats)
    } else {
      console.warn("⚠️ Pas de stats dans la réponse:", data)
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error)
  } finally {
    setLoading(false)
  }
}


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-bg">
      <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-sm">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header avec effet glass */}
          <div className="glass rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard Prédictions
                </h1>
                <p className="text-gray-600 text-lg">Analyse intelligente des risques de défaut des entreprises</p>
              </div>
             <div className="flex items-center space-x-4">
  <Button asChild>
    <Link
      href="/form"
      passHref
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <div className="flex items-center">
        <Calculator className="h-4 w-4 mr-2" />
        Nouvelle Prédiction
      </div>
    </Link>
  </Button>
  
  <Badge variant="outline" className="text-sm bg-white/50 border-white/30 backdrop-blur-sm">
    Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
  </Badge>
</div>
            </div>
          </div>

          {/* Stats Cards avec gradients */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover glass border-white/20 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-700">Total Entreprises</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-blue-700 pulse-slow">{stats.totalEnterprises}</div>
                <p className="text-xs text-blue-600 mt-1">Entreprises analysées</p>
              </CardContent>
            </Card>

            <Card className="card-hover glass border-white/20 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-700">Entreprises à Risque</CardTitle>
                <div className="p-2 bg-red-500/20 rounded-lg glow-red">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-red-700 pulse-slow">{stats.riskyEnterprises}</div>
                <p className="text-xs text-red-600 mt-1">Prédictions de défaut</p>
              </CardContent>
            </Card>

            <Card className="card-hover glass border-white/20 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-700">Taux de Risque</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg glow-yellow">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-amber-700 pulse-slow">{stats.riskRate.toFixed(1)}%</div>
                <p className="text-xs text-amber-600 mt-1">Pourcentage global</p>
              </CardContent>
            </Card>

            <Card className="card-hover glass border-white/20 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-700">Secteurs Touchés</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg glow-green">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-green-700 pulse-slow">{stats.sectorsAtRisk}</div>
                <p className="text-xs text-green-600 mt-1">Secteurs impactés</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content avec style amélioré */}
          <div className="glass rounded-2xl p-6 border border-white/20 shadow-xl">
            <Tabs defaultValue="table" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm border border-white/30 shadow-lg">
                <TabsTrigger
                  value="table"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Tableau Détaillé
                </TabsTrigger>
                <TabsTrigger
                  value="sectors"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Risque par Secteur
                </TabsTrigger>
                <TabsTrigger
                  value="engagement"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Risque par Engagement
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Risque par Groupe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="space-y-4">
                <Card className="glass border-white/20 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                    <CardTitle className="text-xl font-bold text-gray-800">Entreprises Prédites à Risque</CardTitle>
                    <CardDescription className="text-gray-600">
                      Liste des entreprises avec prédiction de défaut (prediction = 1)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <PredictionsTable data={enterprises} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sectors" className="space-y-4">
                <Card className="glass border-white/20 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Nombre d'Entreprises en Défaut par Secteur
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Visualisation des secteurs les plus touchés par le risque de défaut
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <SectorRiskChart data={enterprises} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4">
                <Card className="glass border-white/20 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Évolution du Risque par Engagement
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Proportion de prédictions à risque selon le niveau d'engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <EngagementRiskChart data={enterprises} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="groups" className="space-y-4">
                <Card className="glass border-white/20 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Nombre d'Entreprises en Défaut par Groupe
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Visualisation des groupes les plus touchés par le risque de défaut
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <GroupRiskChart data={enterprises} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
