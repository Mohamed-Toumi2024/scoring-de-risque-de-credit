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
  "Technologie",
  "Finance",
  "Santé",
  "Industrie",
  "Commerce",
  "Immobilier",
  "Transport",
  "Énergie",
  "Télécommunications",
  "Agriculture",
]

export function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [formData, setFormData] = useState<PredictionData>({
    variation_impayes: 0,
    capacite_remboursement: 0,
    effort_investissement: 0,
    rentabilite_nette: 0,
    endettement_total: 0,
    levier_bancaire: 0,
    efficacite_exploitation: 0,
    charges_personnel_ratio: 0,
    fonds_de_roulement_net: 0,
    autonomie_financiere: 0,
    poids_impayes: 0,
    liquidite_generale: 0,
    secteur: "",
    groupe: 1,
  })

  const handleInputChange = (field: keyof PredictionData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" && field !== "secteur" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.secteur) {
      alert("Veuillez sélectionner un secteur")
      return
    }
    onSubmit(formData)
  }

  const fillExampleData = () => {
    setFormData({
      variation_impayes: 15.2,
      capacite_remboursement: 0.85,
      effort_investissement: 12.5,
      rentabilite_nette: 3.2,
      endettement_total: 65.8,
      levier_bancaire: 2.1,
      efficacite_exploitation: 78.5,
      charges_personnel_ratio: 45.2,
      fonds_de_roulement_net: 125000,
      autonomie_financiere: 35.6,
      poids_impayes: 8.9,
      liquidite_generale: 1.2,
      secteur: "Commerce",
      groupe: 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bouton exemple */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fillExampleData}
          className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100 text-green-700 hover:text-green-800 transition-all duration-300"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Données d'exemple
        </Button>
      </div>

      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Informations Générales</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="secteur">Secteur *</Label>
            <Select value={formData.secteur} onValueChange={(value) => handleInputChange("secteur", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un secteur" />
              </SelectTrigger>
              <SelectContent>
                {secteurs.map((secteur) => (
                  <SelectItem key={secteur} value={secteur}>
                    {secteur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupe">Groupe</Label>
            <Select
              value={formData.groupe.toString()}
              onValueChange={(value) => handleInputChange("groupe", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1].map((groupe) => (
                  <SelectItem key={groupe} value={groupe.toString()}>
                    Groupe {groupe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Indicateurs de risque */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Indicateurs de Risque</h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="variation_impayes">Variation Impayés (%)</Label>
            <Input
              id="variation_impayes"
              type="number"
              step="0.01"
              value={formData.variation_impayes}
              onChange={(e) => handleInputChange("variation_impayes", e.target.value)}
              placeholder="Ex: 15.2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poids_impayes">Poids Impayés (%)</Label>
            <Input
              id="poids_impayes"
              type="number"
              step="0.01"
              value={formData.poids_impayes}
              onChange={(e) => handleInputChange("poids_impayes", e.target.value)}
              placeholder="Ex: 8.9"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Indicateurs financiers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Indicateurs Financiers</h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacite_remboursement">Capacité Remboursement</Label>
            <Input
              id="capacite_remboursement"
              type="number"
              step="0.01"
              value={formData.capacite_remboursement}
              onChange={(e) => handleInputChange("capacite_remboursement", e.target.value)}
              placeholder="Ex: 0.85"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentabilite_nette">Rentabilité Nette (%)</Label>
            <Input
              id="rentabilite_nette"
              type="number"
              step="0.01"
              value={formData.rentabilite_nette}
              onChange={(e) => handleInputChange("rentabilite_nette", e.target.value)}
              placeholder="Ex: 3.2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endettement_total">Endettement Total (%)</Label>
            <Input
              id="endettement_total"
              type="number"
              step="0.01"
              value={formData.endettement_total}
              onChange={(e) => handleInputChange("endettement_total", e.target.value)}
              placeholder="Ex: 65.8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autonomie_financiere">Autonomie Financière (%)</Label>
            <Input
              id="autonomie_financiere"
              type="number"
              step="0.01"
              value={formData.autonomie_financiere}
              onChange={(e) => handleInputChange("autonomie_financiere", e.target.value)}
              placeholder="Ex: 35.6"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Indicateurs d'exploitation */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Indicateurs d'Exploitation
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="effort_investissement">Effort Investissement (%)</Label>
            <Input
              id="effort_investissement"
              type="number"
              step="0.01"
              value={formData.effort_investissement}
              onChange={(e) => handleInputChange("effort_investissement", e.target.value)}
              placeholder="Ex: 12.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="efficacite_exploitation">Efficacité Exploitation (%)</Label>
            <Input
              id="efficacite_exploitation"
              type="number"
              step="0.01"
              value={formData.efficacite_exploitation}
              onChange={(e) => handleInputChange("efficacite_exploitation", e.target.value)}
              placeholder="Ex: 78.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="charges_personnel_ratio">Charges Personnel Ratio (%)</Label>
            <Input
              id="charges_personnel_ratio"
              type="number"
              step="0.01"
              value={formData.charges_personnel_ratio}
              onChange={(e) => handleInputChange("charges_personnel_ratio", e.target.value)}
              placeholder="Ex: 45.2"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Indicateurs de liquidité */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Indicateurs de Liquidité
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="levier_bancaire">Levier Bancaire</Label>
            <Input
              id="levier_bancaire"
              type="number"
              step="0.01"
              value={formData.levier_bancaire}
              onChange={(e) => handleInputChange("levier_bancaire", e.target.value)}
              placeholder="Ex: 2.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fonds_de_roulement_net">Fonds de Roulement Net (€)</Label>
            <Input
              id="fonds_de_roulement_net"
              type="number"
              step="1"
              value={formData.fonds_de_roulement_net}
              onChange={(e) => handleInputChange("fonds_de_roulement_net", e.target.value)}
              placeholder="Ex: 125000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liquidite_generale">Liquidité Générale</Label>
            <Input
              id="liquidite_generale"
              type="number"
              step="0.01"
              value={formData.liquidite_generale}
              onChange={(e) => handleInputChange("liquidite_generale", e.target.value)}
              placeholder="Ex: 1.2"
            />
          </div>
        </div>
      </div>

      {/* Bouton de soumission avec style amélioré */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 glow"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            <span className="animate-pulse">Analyse en cours...</span>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Analyser le Risque
            </div>
          </>
        )}
      </Button>
    </form>
  )
}
