"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { PredictionForm } from "@/components/prediction-form"
import { PredictionResult } from "@/components/prediction-result"

export interface PredictionData {
  variation_impayes: number
  capacite_remboursement: number
  effort_investissement: number
  rentabilite_nette: number
  endettement_total: number
  levier_bancaire: number
  efficacite_exploitation: number
  charges_personnel_ratio: number
  fonds_de_roulement_net: number
  autonomie_financiere: number
  poids_impayes: number
  liquidite_generale: number
  secteur: string
  groupe: number
}

export interface PredictionResponse {
  prediction: number
  probability: number
  risk_level: "FAIBLE" | "MODÉRÉ" | "ÉLEVÉ" | "CRITIQUE"
  factors: {
    name: string
    impact: "positive" | "negative" | "neutral"
    value: number
    description: string
  }[]
  recommendations: string[]
}

export default function PredictPage() {
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async (data: PredictionData) => {
    setLoading(true)
    try {
      const response = await fetch("/api/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la prédiction")
      }

      const result = await response.json()
      setPredictionResult(result)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la prédiction. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const resetPrediction = () => {
    setPredictionResult(null)
  }

  return (
    <div className="min-h-screen animated-bg">
      <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/90 to-indigo-50/90 backdrop-blur-sm">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header avec effet glass */}
          <div className="glass rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 border-white/30 hover:bg-white/70 transition-all duration-300 backdrop-blur-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour au Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Prédiction de Défaillance
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Analysez le risque de défaillance avec l'intelligence artificielle
                  </p>
                </div>
              </div>
           
            </div>
          </div>

          {/* Content avec grille améliorée */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Formulaire avec style amélioré */}
            <Card className="lg:sticky lg:top-6 glass border-white/20 shadow-2xl card-hover">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-gray-800">Données Financières</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Saisissez les indicateurs financiers de l'entreprise pour obtenir une prédiction de risque précise
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 custom-scrollbar max-h-[80vh] overflow-y-auto">
                <PredictionForm onSubmit={handlePredict} loading={loading} />
              </CardContent>
            </Card>

            {/* Résultats avec style amélioré */}
            <div className="space-y-6">
              {predictionResult ? (
                <PredictionResult result={predictionResult} onReset={resetPrediction} />
              ) : (
                <Card className="h-[600px] flex items-center justify-center glass border-white/20 shadow-xl float">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                      <AlertTriangle className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-800">En attente de prédiction</h3>
                      <p className="text-gray-600 max-w-md">
                        Remplissez le formulaire avec les données financières pour obtenir une analyse de risque
                        détaillée
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
