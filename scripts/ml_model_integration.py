import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn

# Modèle de données pour la prédiction
class PredictionInput(BaseModel):
    variation_impayes: float
    capacite_remboursement: float
    effort_investissement: float
    rentabilite_nette: float
    endettement_total: float
    levier_bancaire: float
    efficacite_exploitation: float
    charges_personnel_ratio: float
    fonds_de_roulement_net: float
    autonomie_financiere: float
    poids_impayes: float
    liquidite_generale: float
    secteur: str
    groupe: int

class PredictionOutput(BaseModel):
    prediction: int
    probability: float
    risk_level: str
    factors: List[Dict[str, Any]]
    recommendations: List[str]

app = FastAPI(title="ML Model Prediction API")

# Chargement du modèle (remplacez par le chemin vers votre modèle)
try:
    # model = joblib.load('path/to/your/saved_model.pkl')
    # scaler = joblib.load('path/to/your/scaler.pkl')  # Si vous utilisez un scaler
    print("⚠️  Modèle non chargé - utilisation du modèle simulé")
    model = None
    scaler = None
except Exception as e:
    print(f"Erreur lors du chargement du modèle: {e}")
    model = None
    scaler = None

def preprocess_data(data: PredictionInput) -> np.ndarray:
    """
    Préprocessing des données pour le modèle
    Adaptez cette fonction selon votre pipeline de preprocessing
    """
    # Conversion des données catégorielles
    secteur_mapping = {
        'Technologie': 0, 'Finance': 1, 'Santé': 2, 'Industrie': 3,
        'Commerce': 4, 'Immobilier': 5, 'Transport': 6, 'Énergie': 7,
        'Télécommunications': 8, 'Agriculture': 9
    }
    
    # Créer un DataFrame avec les features
    features = pd.DataFrame({
        'variation_impayes': [data.variation_impayes],
        'capacite_remboursement': [data.capacite_remboursement],
        'effort_investissement': [data.effort_investissement],
        'rentabilite_nette': [data.rentabilite_nette],
        'endettement_total': [data.endettement_total],
        'levier_bancaire': [data.levier_bancaire],
        'efficacite_exploitation': [data.efficacite_exploitation],
        'charges_personnel_ratio': [data.charges_personnel_ratio],
        'fonds_de_roulement_net': [data.fonds_de_roulement_net],
        'autonomie_financiere': [data.autonomie_financiere],
        'poids_impayes': [data.poids_impayes],
        'liquidite_generale': [data.liquidite_generale],
        'secteur_encoded': [secteur_mapping.get(data.secteur, 0)],
        'groupe': [data.groupe]
    })
    
    # Normalisation si nécessaire
    if scaler is not None:
        features_scaled = scaler.transform(features)
        return features_scaled
    
    return features.values

def get_feature_importance(data: PredictionInput, prediction_proba: float) -> List[Dict[str, Any]]:
    """
    Calcule l'importance des features pour expliquer la prédiction
    Adaptez cette fonction selon votre modèle
    """
    factors = []
    
    # Analyse des facteurs de risque
    if data.variation_impayes > 10:
        factors.append({
            "name": "Variation des Impayés",
            "impact": "negative",
            "value": data.variation_impayes,
            "description": f"Augmentation de {data.variation_impayes:.1f}% des impayés"
        })
    
    if data.poids_impayes > 5:
        factors.append({
            "name": "Poids des Impayés",
            "impact": "negative", 
            "value": data.poids_impayes,
            "description": f"Impayés représentent {data.poids_impayes:.1f}% du CA"
        })
    
    if data.rentabilite_nette < 2:
        factors.append({
            "name": "Rentabilité Nette",
            "impact": "negative",
            "value": data.rentabilite_nette,
            "description": f"Rentabilité faible de {data.rentabilite_nette:.1f}%"
        })
    
    if data.endettement_total > 70:
        factors.append({
            "name": "Endettement Total",
            "impact": "negative",
            "value": data.endettement_total,
            "description": f"Endettement élevé de {data.endettement_total:.1f}%"
        })
    
    if data.liquidite_generale < 1:
        factors.append({
            "name": "Liquidité Générale",
            "impact": "negative",
            "value": data.liquidite_generale,
            "description": f"Liquidité insuffisante ({data.liquidite_generale:.2f})"
        })
    
    # Facteurs positifs
    if data.efficacite_exploitation > 80:
        factors.append({
            "name": "Efficacité d'Exploitation",
            "impact": "positive",
            "value": data.efficacite_exploitation,
            "description": f"Bonne efficacité de {data.efficacite_exploitation:.1f}%"
        })
    
    if data.autonomie_financiere > 50:
        factors.append({
            "name": "Autonomie Financière",
            "impact": "positive",
            "value": data.autonomie_financiere,
            "description": f"Bonne autonomie de {data.autonomie_financiere:.1f}%"
        })
    
    # Trier par impact (valeur absolue)
    factors.sort(key=lambda x: abs(x["value"]), reverse=True)
    
    return factors[:5]  # Retourner les 5 facteurs les plus importants

def generate_recommendations(data: PredictionInput, risk_level: str) -> List[str]:
    """
    Génère des recommandations basées sur l'analyse
    """
    recommendations = []
    
    if data.variation_impayes > 10:
        recommendations.append(
            "Mettre en place un système de suivi des créances plus rigoureux et améliorer les processus de recouvrement"
        )
    
    if data.poids_impayes > 5:
        recommendations.append(
            "Réduire le poids des impayés en renforçant la sélection clientèle et les garanties"
        )
    
    if data.rentabilite_nette < 2:
        recommendations.append(
            "Améliorer la rentabilité en optimisant les coûts et en révisant la politique tarifaire"
        )
    
    if data.endettement_total > 70:
        recommendations.append(
            "Réduire l'endettement par remboursement anticipé ou augmentation des fonds propres"
        )
    
    if data.liquidite_generale < 1:
        recommendations.append(
            "Améliorer la liquidité en optimisant le BFR et en négociant de meilleures conditions de paiement"
        )
    
    if data.autonomie_financiere < 30:
        recommendations.append(
            "Renforcer les fonds propres par apport en capital ou mise en réserve des bénéfices"
        )
    
    if risk_level in ["ÉLEVÉ", "CRITIQUE"]:
        recommendations.append(
            "Consulter un expert-comptable pour établir un plan de redressement financier"
        )
    
    if len(recommendations) == 0:
        recommendations.append("Maintenir les bonnes pratiques de gestion financière")
        recommendations.append("Surveiller régulièrement les indicateurs de performance")
    
    return recommendations

@app.post("/predict", response_model=PredictionOutput)
async def predict_default(data: PredictionInput):
    """
    Endpoint pour prédire la défaillance d'une entreprise
    """
    try:
        # Préprocessing des données
        processed_data = preprocess_data(data)
        
        if model is not None:
            # Utilisation du vrai modèle
            prediction = model.predict(processed_data)[0]
            prediction_proba = model.predict_proba(processed_data)[0]
            
            # Probabilité de défaillance (classe 1)
            if len(prediction_proba) > 1:
                probability = prediction_proba[1]
            else:
                probability = prediction_proba[0] if prediction == 1 else 1 - prediction_proba[0]
        else:
            # Modèle simulé pour la démonstration
            print("🔄 Utilisation du modèle simulé")
            
            # Calcul d'un score de risque
            risk_score = 0
            
            # Facteurs de risque
            if data.variation_impayes > 10: risk_score += 0.2
            if data.poids_impayes > 5: risk_score += 0.15
            if data.endettement_total > 70: risk_score += 0.2
            if data.rentabilite_nette < 2: risk_score += 0.15
            if data.liquidite_generale < 1: risk_score += 0.1
            if data.autonomie_financiere < 30: risk_score += 0.1
            if data.capacite_remboursement < 1: risk_score += 0.15
            
            # Facteurs positifs
            if data.efficacite_exploitation > 80: risk_score -= 0.1
            if data.fonds_de_roulement_net > 100000: risk_score -= 0.05
            if data.rentabilite_nette > 5: risk_score -= 0.1
            
            # Secteurs à risque
            if data.secteur in ["Commerce", "Transport", "Agriculture"]: risk_score += 0.1
            if data.groupe in [4, 5]: risk_score += 0.05
            
            # Limiter entre 0 et 1
            probability = max(0, min(1, risk_score))
            prediction = 1 if probability > 0.5 else 0
        
        # Déterminer le niveau de risque
        if probability < 0.25:
            risk_level = "FAIBLE"
        elif probability < 0.5:
            risk_level = "MODÉRÉ"
        elif probability < 0.75:
            risk_level = "ÉLEVÉ"
        else:
            risk_level = "CRITIQUE"
        
        # Analyser les facteurs d'influence
        factors = get_feature_importance(data, probability)
        
        # Générer les recommandations
        recommendations = generate_recommendations(data, risk_level)
        
        return PredictionOutput(
            prediction=int(prediction),
            probability=float(probability),
            risk_level=risk_level,
            factors=factors,
            recommendations=recommendations
        )
        
    except Exception as e:
        print(f"Erreur lors de la prédiction: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "ML Model Prediction API",
        "model_loaded": model is not None,
        "endpoints": ["/predict"]
    }

if __name__ == "__main__":
    print("🤖 Démarrage de l'API de prédiction ML...")
    print("📊 API disponible sur: http://localhost:8001")
    print("📖 Documentation: http://localhost:8001/docs")
    
    # Instructions pour charger votre modèle
    print("\n" + "="*50)
    print("📋 INSTRUCTIONS POUR VOTRE MODÈLE:")
    print("="*50)
    print("1. Remplacez les chemins dans le code:")
    print("   model = joblib.load('path/to/your/saved_model.pkl')")
    print("   scaler = joblib.load('path/to/your/scaler.pkl')")
    print("\n2. Adaptez la fonction preprocess_data() selon votre pipeline")
    print("\n3. Modifiez get_feature_importance() selon votre modèle")
    print("="*50)
    
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
