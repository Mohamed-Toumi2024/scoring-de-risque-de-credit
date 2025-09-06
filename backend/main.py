from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
import pandas as pd
import joblib
import logging

# 🔹 Import pour Prometheus
from prometheus_fastapi_instrumentator import Instrumentator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Dashboard & Scoring Entreprises")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_DIR   = Path(__file__).resolve().parent              # .../backend
MODEL_PATH    = BACKEND_DIR / "models"  / "model.pkl"
ENCODER_PATH  = BACKEND_DIR / "models"  / "sector_encoder.pkl"
EXCEL_PATH    = BACKEND_DIR / "dataset" / "entreprises.xlsx"  # adapte si besoin

# Charger modèle et encodeur
try:
    model = joblib.load(str(MODEL_PATH))
    sector_encoder = joblib.load(str(ENCODER_PATH))
    logger.info("✅ Modèle et encodeur chargés")
except Exception as e:
    logger.error(f"❌ Impossible de charger modèle/encodeur : {e}")
    model, sector_encoder = None, None

ALL_SECTORS = sector_encoder.classes_.tolist() if sector_encoder else []

class PredictionInput(BaseModel):
    rentabilite_nette: float
    rentabilite_capitaux: float
    autonomie_financiere: float
    capacite_remboursement: float
    poids_impayes: float
    endettement_total: float
    liquidite_generale: float
    charges_personnel_ratio: float
    efficacite_exploitation: float
    variation_impayes: float
    effort_investissement: float
    levier_bancaire: float
    fonds_de_roulement_net: float
    rotation_stock: float
    Groupe: int
    secteur: str

    @validator('secteur')
    def validate_sector(cls, v):
        v = v.strip().upper()
        if v == "SANTE": v = "SANTÉ"
        elif v == "IMMOBILIER": v = "PROMOTION IMMOBILIERE"
        if ALL_SECTORS and v not in ALL_SECTORS:
            raise ValueError(f"Secteur invalide. Secteurs valides : {', '.join(ALL_SECTORS)}")
        return v

@app.post("/form")
async def make_prediction(input_data: PredictionInput):
    if model is None or sector_encoder is None:
        raise HTTPException(status_code=500, detail="Modèle ou encodeur non chargé")
    try:
        df = pd.DataFrame([input_data.dict()])
        df['SECTEUR'] = sector_encoder.transform(df['secteur'])
        df.drop(columns=['secteur'], inplace=True)
        expected_columns = [
            'rentabilite_nette', 'rentabilite_capitaux', 'autonomie_financiere',
            'capacite_remboursement', 'poids_impayes', 'endettement_total',
            'liquidite_generale', 'charges_personnel_ratio', 'efficacite_exploitation',
            'variation_impayes', 'effort_investissement', 'levier_bancaire',
            'fonds_de_roulement_net', 'rotation_stock', 'Groupe', 'SECTEUR'
        ]
        df = df[expected_columns]
        prediction = int(model.predict(df)[0])
        probability = float(model.predict_proba(df)[0][1])
        risk_level = ("FAIBLE" if probability < 0.3 else
                      "MODÉRÉ" if probability < 0.6 else
                      "ÉLEVÉ"  if probability < 0.8 else
                      "CRITIQUE")
        return {
            "prediction": prediction,
            "probability": round(probability, 3),
            "risk_level": risk_level,
            "secteur": input_data.secteur
        }
    except Exception as e:
        logger.error(f"Erreur prédiction : {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict")
def get_dashboard_data():
    try:
        logger.info(f"Lecture dashboard depuis: {EXCEL_PATH}")
        df = pd.read_excel(str(EXCEL_PATH))
        df.drop(columns=["Unnamed: 0"], inplace=True, errors='ignore')
        df = df.rename(columns={
            "ID": "id",
            "Vecteur_du_défaut_prédit": "prediction",
            "SECTEUR": "secteur",
            "Groupe": "Groupe"
        })
        risky = df[df["prediction"] == 1]
        stats = {
            "totalEnterprises": len(df),
            "riskyEnterprises": len(risky),
            "riskRate": round(len(risky)/len(df)*100, 2) if len(df) > 0 else 0,
            "sectorsAtRisk": risky["secteur"].nunique()
        }
        return JSONResponse(content={"enterprises": df.to_dict(orient="records"), "stats": stats})
    except Exception as e:
        logger.error(f"Erreur dashboard : {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


# 🔹 Instrumentation Prometheus
instrumentator = Instrumentator().instrument(app)
instrumentator.expose(app)
