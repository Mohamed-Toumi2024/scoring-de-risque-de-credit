import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import GridSearchCV

# Paths
DATA_PATH = "../dataset/df_final_with_sector_and_group (1).xlsx"
MODEL_PATH = "../backend/models/model (1).pkl"
ENCODER_PATH = "../backend/models/sector_encoder.pkl"

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
    df = pd.read_excel(DATA_PATH)

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
        joblib.dump(encoder, ENCODER_PATH)

    return train_test_split(X, y, test_size=0.2, random_state=42)


def train_model():
    X_train, X_test, y_train, y_test = load_and_prepare_data()

    param_xgb = {
    "n_estimators": [100],
    "max_depth": [3, 6],
    "learning_rate": [0.1]
}
    model = GridSearchCV(XGBClassifier(use_label_encoder=False, eval_metric='logloss'), param_xgb, cv=5)
    model.fit(X_train, y_train)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"✅ Modèle sauvegardé : {MODEL_PATH}")
    return model, X_test, y_test


def evaluate_model(model=None):
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("⚠️ Aucun modèle trouvé. Exécute train_model() d’abord.")
        model = joblib.load(MODEL_PATH)

    _, X_test, _, y_test = load_and_prepare_data()
    y_pred = model.predict(X_test)

    print(f"\n🎯 Accuracy : {accuracy_score(y_test, y_pred):.2f}")
    print("\n📊 Rapport de classification :")
    print(classification_report(y_test, y_pred))


if __name__ == "__main__":
    model, X_test, y_test = train_model()
    evaluate_model(model)
