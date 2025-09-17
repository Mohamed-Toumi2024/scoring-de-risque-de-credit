"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calculator } from "lucide-react"
import type { PredictionData } from "@/app/form/page"

interface PredictionFormProps {
  onSubmit: (data: PredictionData) => void
  loading: boolean
}

const secteurs = [
  "Technologie", "Finance", "Santé", "Industrie", "Commerce",
  "Immobilier", "Transport", "Énergie", "Télécommunications", "Agriculture"
]

export function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionData>({
    variation_impayes: 0,
    capacite_remboursement: 0,
    effort_investissement: 0,
    rentabilite_nette: 0,
    rentabilite_capitaux: 0,
    endettement_total: 0,
    levier_bancaire: 0,
    efficacite_exploitation: 0,
    charges_personnel_ratio: 0,
    fonds_de_roulement_net: 0,
    autonomie_financiere: 0,
    poids_impayes: 0,
    liquidite_generale: 0,
    rotation_stock: 0,
    secteur: "",
    Groupe: 1,
  })

  const handleInputChange = (field: keyof PredictionData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" && field !== "secteur" ? Number(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.secteur) return alert("Veuillez sélectionner un secteur")
    onSubmit(formData)
  }

  const fillExampleData = () => {
    setFormData({
      variation_impayes: 15.2,
      capacite_remboursement: 0.85,
      effort_investissement: 12.5,
      rentabilite_nette: 3.2,
      rentabilite_capitaux: 7.1,
      endettement_total: 65.8,
      levier_bancaire: 2.1,
      efficacite_exploitation: 78.5,
      charges_personnel_ratio: 45.2,
      fonds_de_roulement_net: 125000,
      autonomie_financiere: 35.6,
      poids_impayes: 8.9,
      liquidite_generale: 1.2,
      rotation_stock: 20,
      secteur: "Commerce",
      Groupe: 1,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={fillExampleData}>
          <Calculator className="h-4 w-4 mr-2" />
          Données d'exemple
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Secteur *</Label>
          <Select value={formData.secteur} onValueChange={(value) => handleInputChange("secteur", value)}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un secteur" /></SelectTrigger>
            <SelectContent>
              {secteurs.map((secteur) => <SelectItem key={secteur} value={secteur}>{secteur}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Groupe</Label>
          <Select value={formData.Groupe.toString()} onValueChange={(value) => handleInputChange("Groupe", Number(value))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[0, 1].map((groupe) => <SelectItem key={groupe} value={groupe.toString()}>Groupe {groupe}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
        {[
          { label: "Variation Impayés (%)", field: "variation_impayes" },
          { label: "Poids Impayés (%)", field: "poids_impayes" },
          { label: "Capacité Remboursement", field: "capacite_remboursement" },
          { label: "Rentabilité Nette (%)", field: "rentabilite_nette" },
          { label: "Rentabilité Capitaux (%)", field: "rentabilite_capitaux" },
          { label: "Endettement Total (%)", field: "endettement_total" },
          { label: "Levier Bancaire", field: "levier_bancaire" },
          { label: "Efficacité Exploitation (%)", field: "efficacite_exploitation" },
          { label: "Charges Personnel Ratio (%)", field: "charges_personnel_ratio" },
          { label: "Fonds de Roulement Net (€)", field: "fonds_de_roulement_net" },
          { label: "Autonomie Financière (%)", field: "autonomie_financiere" },
          { label: "Liquidité Générale", field: "liquidite_generale" },
          { label: "Rotation Stock", field: "rotation_stock" },
          { label: "Effort Investissement (%)", field: "effort_investissement" },
        ].map(({ label, field }) => (
          <div className="space-y-2" key={field}>
            <Label htmlFor={field}>{label}</Label>
            <Input
              id={field}
              type="number"
              step="any"
              value={formData[field as keyof PredictionData] as number}
              onChange={(e) => handleInputChange(field as keyof PredictionData, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={loading}
        >
          {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Analyse en cours...</> : "Analyser le Risque"}
        </Button>
      </div>
    </form>
  )
}
