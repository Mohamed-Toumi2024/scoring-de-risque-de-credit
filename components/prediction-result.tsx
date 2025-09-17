"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Shield,
  AlertCircle,
  XCircle,
} from "lucide-react"
import type { PredictionResponse } from "@/app/form/page"

interface PredictionResultProps {
  result: PredictionResponse
  onReset: () => void
}

export function PredictionResult({ result, onReset }: PredictionResultProps) {
  const getRiskIcon = (level: string) => {
    switch (level) {
      case "FAIBLE": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "MODÉRÉ": return <Shield className="h-5 w-5 text-yellow-500" />
      case "ÉLEVÉ": return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "CRITIQUE": return <XCircle className="h-5 w-5 text-red-500" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getRiskVariant = (level: string) => {
    switch (level) {
      case "FAIBLE": return "secondary"
      case "MODÉRÉ": return "outline"
      case "ÉLEVÉ": return "default"
      case "CRITIQUE": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Résultat principal */}
      <Card className="glass border-white/20 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">{getRiskIcon(result.risk_level)}</div>
              <div>
                <CardTitle className="text-xl text-gray-800">Résultat de l'Analyse</CardTitle>
                <CardDescription className="text-gray-600">Prédiction basée sur votre modèle IA avancé</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="bg-white/50 border-white/30 hover:bg-white/70 transition-all duration-300 backdrop-blur-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Nouvelle Analyse
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 relative z-10">
          <div className="text-center space-y-6 p-6 bg-white/30 rounded-xl backdrop-blur-sm">
            <div className="space-y-3">
              <div className={`text-5xl font-bold animate-pulse ${result.prediction === 1 ? "text-red-600" : "text-green-600"}`}>
                {result.prediction === 1 ? "DÉFAILLANCE" : "SAINE"}
              </div>
              <Badge
                variant={getRiskVariant(result.risk_level)}
                className="text-lg px-6 py-2 shadow-lg"
              >
                Risque {result.risk_level}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">Probabilité de défaillance</span>
                <span className={`font-bold ${result.probability > 0.7 ? "text-red-600" : result.probability > 0.4 ? "text-orange-600" : "text-green-600"}`}>
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={result.probability * 100} className={`h-4 shadow-inner ${result.probability > 0.7 ? "glow-red" : result.probability > 0.4 ? "glow-yellow" : "glow-green"}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facteurs d'influence */}
      <Card className="glass border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">Facteurs d'Influence</CardTitle>
          <CardDescription className="text-gray-600">Indicateurs ayant le plus d'impact sur la prédiction</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.isArray(result.factors) && result.factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${factor.impact === "positive" ? "bg-green-100 text-green-600" : factor.impact === "negative" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                  {factor.impact === "positive" ? <TrendingUp className="h-5 w-5" /> : factor.impact === "negative" ? <TrendingDown className="h-5 w-5" /> : <div className="h-5 w-5 rounded-full bg-gray-400" />}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{factor.name}</div>
                  <div className="text-sm text-gray-600">{factor.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">{factor.value.toFixed(2)}</div>
                <div className={`text-xs font-medium ${factor.impact === "positive" ? "text-green-600" : factor.impact === "negative" ? "text-red-600" : "text-gray-500"}`}>
                  {factor.impact === "positive" ? "✓ Favorable" : factor.impact === "negative" ? "⚠ Défavorable" : "○ Neutre"}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="glass border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
          <CardTitle className="text-xl text-gray-800">Recommandations</CardTitle>
          <CardDescription className="text-gray-600">Actions suggérées pour améliorer la situation financière</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Array.isArray(result.recommendations) && result.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-green-50/50 backdrop-blur-sm border border-white/30 hover:from-blue-100/50 hover:to-green-100/50 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
