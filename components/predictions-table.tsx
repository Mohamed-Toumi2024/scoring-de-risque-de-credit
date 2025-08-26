"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Enterprise {
  id: string
  secteur: string
  groupe: number
  engagement: number
  resultat_net: number
  prediction: number
}

interface PredictionsTableProps {
  data: Enterprise[]
}

export function PredictionsTable({ data }: PredictionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [showOnlyRisky, setShowOnlyRisky] = useState(true)

  // Filtrer les données
 const filteredData = data.filter((enterprise) => {
  const matchesSearch =
    enterprise.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.secteur.toLowerCase().includes(searchTerm.toLowerCase())

  const matchesSector = sectorFilter === "all" || enterprise.secteur === sectorFilter
  const matchesRisk = !showOnlyRisky || enterprise.prediction === 1

  return matchesSearch && matchesSector && matchesRisk
})


  // Obtenir la liste unique des secteurs
  const sectors = Array.from(new Set(data.map((e) => e.secteur))).sort()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      {/* Filtres avec style amélioré */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl backdrop-blur-sm border border-white/30">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
          <Input
            placeholder="Rechercher par ID ou secteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 border-white/50 focus:bg-white focus:border-blue-300 transition-all duration-300"
          />
        </div>

        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white/70 border-white/50 focus:bg-white focus:border-blue-300">
            <Filter className="h-4 w-4 mr-2 text-blue-500" />
            <SelectValue placeholder="Filtrer par secteur" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm">
            <SelectItem value="all">Tous les secteurs</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector}>
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showOnlyRisky ? "default" : "outline"}
          onClick={() => setShowOnlyRisky(!showOnlyRisky)}
          className={`w-full sm:w-auto transition-all duration-300 ${
            showOnlyRisky
              ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
              : "bg-white/70 border-white/50 hover:bg-white text-gray-700"
          }`}
        >
          {showOnlyRisky ? "Afficher tout" : "Seulement à risque"}
        </Button>
      </div>

      {/* Tableau avec style amélioré */}
      <div className="rounded-xl border border-white/30 overflow-hidden shadow-lg bg-white/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100">
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Secteur</TableHead>
              <TableHead className="font-semibold text-gray-700">Groupe</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Engagement</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Résultat Net</TableHead>
              <TableHead className="text-center font-semibold text-gray-700">Prédiction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-4xl">🔍</div>
                    <div>Aucune donnée trouvée</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((enterprise) => (
                <TableRow key={enterprise.id} className="hover:bg-white/70 transition-all duration-200">
                  <TableCell className="font-medium text-blue-700">{enterprise.id}</TableCell>
                  <TableCell className="text-gray-700">{enterprise.secteur}</TableCell>
                  <TableCell className="text-gray-700">{enterprise.groupe}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(enterprise.engagement)}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={`px-2 py-1 rounded-lg text-sm ${
                        enterprise.resultat_net >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {formatCurrency(enterprise.resultat_net)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={enterprise.prediction === 1 ? "destructive" : "secondary"}
                      className={`shadow-sm ${
                        enterprise.prediction === 1
                          ? "bg-gradient-to-r from-red-500 to-pink-600 text-white glow-red"
                          : "bg-gradient-to-r from-green-400 to-blue-500 text-white glow-green"
                      }`}
                    >
                      {enterprise.prediction === 1 ? "⚠ Défaut" : "✓ Sain"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600 bg-white/30 rounded-lg p-3 backdrop-blur-sm">
        📊 Affichage de <span className="font-semibold text-blue-600">{filteredData.length}</span> entreprise(s) sur{" "}
        <span className="font-semibold text-blue-600">{data.length}</span> au total
      </div>
    </div>
  )
}
