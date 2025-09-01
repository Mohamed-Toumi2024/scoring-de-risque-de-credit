from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import GridSearchCV

# Répertoire backend/ (on part du fichier actuel backend/ml_pipeline/model_pipeline.py)
BACKEND_DIR = Path(__file__).resolve().parent.parent  # => .../backend

DATA_PATH     = BACKEND_DIR / "dataset" / "df_final_with_sector_and_group.xlsx"
MODEL_PATH    = BACKEND_DIR / "models"  / "model.pkl"
ENCODER_PATH  = BACKEND_DIR / "models"  / "sector_encoder.pkl"

# Liste des secteurs autorisés
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

def load_and_prepare_data():
    # petit log utile en CI
    print(f"Lecture dataset depuis: {DATA_PATH}")
    df = pd.read_excel(str(DATA_PATH))

    target_col = "Vecteur_du_defaut"
    if target_col not in df.columns:
        raise ValueError(f"La colonne {target_col} n’existe pas dans {DATA_PATH}")

    # Features & Target
    X = df.drop(columns=[target_col, "ID"], errors="ignore")
    y = df[target_col]

    # Encodage du secteur
    if "SECTEUR" in X.columns:
        encoder = LabelEncoder()
        encoder.fit(ALL_SECTORS)
        X["SECTEUR"] = encoder.transform(X["SECTEUR"])
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)  # s'assure que models/ existe
        joblib.dump(encoder, str(ENCODER_PATH))

    return train_test_split(X, y, test_size=0.2, random_state=42)

def train_model():
    X_train, X_test, y_train, y_test = load_and_prepare_data()

    param_xgb = {
        "n_estimators": [100],
        "max_depth": [3, 6],
        "learning_rate": [0.1]
    }
    model = GridSearchCV(XGBClassifier(eval_metric='logloss'), param_xgb, cv=5)
    model.fit(X_train, y_train)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, str(MODEL_PATH))

    print(f"✅ Modèle sauvegardé : {MODEL_PATH}")
    return model, X_test, y_test

def evaluate_model(model=None):
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError("⚠️ Aucun modèle trouvé. Exécute train_model() d’abord.")
        model = joblib.load(str(MODEL_PATH))

    _, X_test, _, y_test = load_and_prepare_data()
    y_pred = model.predict(X_test)

    print(f"\n🎯 Accuracy : {accuracy_score(y_test, y_pred):.2f}")
    print("\n📊 Rapport de classification :")
    print(classification_report(y_test, y_pred))

if __name__ == "__main__":
    model, X_test, y_test = train_model()
    evaluate_model(model)
