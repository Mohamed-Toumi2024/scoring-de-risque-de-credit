from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
import numpy as np
from sklearn.preprocessing import LabelEncoder
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Liste complète des secteurs utilisés lors de l'entraînement
ALL_SECTORS = [
    'AUTRES SERVICES (HORS COMMERCE ET SANTÉ)',
    'COMMERCE',
    'TOURISME',
    'BTP',
    'AUTRES INDUSTRIES',
    'SANTÉ',
    'HUILERIES',
    'AGRICULTURE',
    'INDUSTRIES AGROALIMENTAIRES',
    'INDUSTRIES MÉCANIQUES ET ÉLECTRIQUES',
    'PROMOTION IMMOBILIERE',
    'TÉLÉCOM ET TIC',
    'INDUSTRIES PHARMACEUTIQUES'
]

# Initialisation de l'encodeur de secteurs
sector_encoder = LabelEncoder()
sector_encoder.fit(ALL_SECTORS)

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
    secteur: str  # Champ secteur comme string
    groupe: int

    @validator('secteur')
    def validate_sector(cls, v):
        v = v.strip().upper()
        # Gestion des variantes de dénomination
        if v == "SANTE":
            v = "SANTÉ"
        elif v == "IMMOBILIER":
            v = "PROMOTION IMMOBILIERE"
        
        if v not in ALL_SECTORS:
            raise ValueError(f"Secteur invalide. Secteurs valides : {', '.join(ALL_SECTORS)}")
        return v
    @validator("groupe")
    def check_groupe(cls, v):
        if v not in [0, 1]:
            raise ValueError("Le groupe doit être 0 ou 1 (valeurs utilisées pour l'entraînement)")
        return v

# Chargement du modèle
model = None
try:
    model = joblib.load("model (1).pkl")
    logger.info("Modèle chargé avec succès")
    
    # Test du modèle avec des données factices
    test_data = pd.DataFrame({
        'efficacite_exploitation': [0.07],
        'rentabilite_nette': [0],
        'endettement_total': [0.72],
        'charges_personnel_ratio': [0.12],
        'levier_bancaire': [0],
        'capacite_remboursement': [0.8],
        'autonomie_financiere': [1.12],
        'poids_impayes': [0.25],
        'fonds_de_roulement_net': [0.23],
        'liquidite_generale': [1.14],
        'variation_impayes': [-0.2],
        'effort_investissement': [0.9],
        'SECTEUR': [0],  # Premier secteur encodé
        'Groupe': [0]
    })
    model.predict(test_data)
    logger.info("Test du modèle réussi")
except Exception as e:
    logger.error(f"Erreur lors du chargement du modèle : {str(e)}")
    model = None

@app.post("/form")
async def make_prediction(input_data: PredictionInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Modèle non chargé")
    
    try:
        # Conversion des données d'entrée
        input_dict = input_data.dict()
        logger.info(f"Données reçues : {input_dict}")
        
        # Création du DataFrame avec les noms de colonnes attendus par le modèle
        df = pd.DataFrame([{
            'efficacite_exploitation': input_dict['efficacite_exploitation'],
            'rentabilite_nette': input_dict['rentabilite_nette'],
            'endettement_total': input_dict['endettement_total'],
            'charges_personnel_ratio': input_dict['charges_personnel_ratio'],
            'levier_bancaire': input_dict['levier_bancaire'],
            'capacite_remboursement': input_dict['capacite_remboursement'],
            'autonomie_financiere': input_dict['autonomie_financiere'],
            'poids_impayes': input_dict['poids_impayes'],
            'fonds_de_roulement_net': input_dict['fonds_de_roulement_net'],
            'liquidite_generale': input_dict['liquidite_generale'],
            'variation_impayes': input_dict['variation_impayes'],
            'effort_investissement': input_dict['effort_investissement'],
            'SECTEUR': input_dict['secteur'],
            'Groupe': input_dict['groupe']
        }])
        
        # Encodage du secteur
        df['SECTEUR'] = sector_encoder.transform(df['SECTEUR'])
        
        # Vérification des types de données
        if not all(pd.api.types.is_numeric_dtype(df[col]) for col in df.columns):
            raise ValueError("Certaines colonnes ne sont pas numériques après conversion")
        
        # Réorganisation des colonnes selon l'ordre attendu par le modèle
        expected_columns = [
            'efficacite_exploitation', 'rentabilite_nette', 'endettement_total',
            'charges_personnel_ratio', 'levier_bancaire', 'capacite_remboursement',
            'autonomie_financiere', 'poids_impayes', 'fonds_de_roulement_net',
            'liquidite_generale', 'variation_impayes', 'effort_investissement',
            'SECTEUR', 'Groupe'
        ]
        df = df[expected_columns]
        
        # Prédiction
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]
        
        # Détermination du niveau de risque
        if probability < 0.3:
            risk_level = "FAIBLE"
        elif probability < 0.6:
            risk_level = "MODÉRÉ"
        elif probability < 0.8:
            risk_level = "ÉLEVÉ"
        else:
            risk_level = "CRITIQUE"
        
        return {
            "prediction": int(prediction),
            "probability": float(probability),
            "risk_level": risk_level,
            "secteur_original": input_data.secteur,
            "secteur_encoded": int(df['SECTEUR'][0])
        }
        
    except ValueError as e:
        if "Secteur invalide" in str(e):
            raise HTTPException(
                status_code=400,
                detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur de prédiction : {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/predict")
def get_dashboard_data():
    try:
        df = pd.read_excel("entreprises.xlsx")
        df.drop(columns=["Unnamed: 0"], inplace=True, errors='ignore')

        # Renommage des colonnes pour le frontend
        df = df.rename(columns={
            "ID": "id",
            "Vecteur_du_défaut_prédit": "prediction",
            "SECTEUR": "secteur",
            "Groupe": "groupe",
            "Engagement_BNA_2023": "engagement",
            "Resultat_net_de_l'exercice": "resultat_net"
        })

        # Filtrage des entreprises à risque
        risky = df[df["prediction"] == 1]

        # Calcul des statistiques
        stats = {
            "totalEnterprises": len(df),
            "riskyEnterprises": len(risky),
            "riskRate": round(len(risky) / len(df) * 100, 2) if len(df) > 0 else 0,
            "sectorsAtRisk": risky["secteur"].nunique()
        }

        return JSONResponse(content={
            "enterprises": df.to_dict(orient="records"),
            "stats": stats
        })
    except Exception as e:
        logger.error(f"Erreur dans /predict : {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)