# Finova — Track. Plan. Invest. Grow.

Finova is an AI-powered personal finance and investment planning platform built with
Streamlit, MongoDB, and scikit-learn. It combines expense tracking (evolved from the
original UniSpend concept) with goal planning, risk assessment, an explainable AI
investment planner, an investment simulator, and what-if scenario analysis.

## 1. Requirements

- Python 3.10+
- A MongoDB instance (local, Docker, or MongoDB Atlas free tier)

## 2. Setup

```bash
cd finova
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment template and fill in your own MongoDB connection string:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=finova_db
```

Never commit your real `.env` file — it's already excluded via `.gitignore`.

## 3. (Optional) Train the demonstration ML model

The AI Investment Planner uses a small RandomForest classifier trained on a
**clearly labeled synthetic dataset** (`data/training_data.csv`, generated for
demonstration purposes only — it is not real financial data).

```bash
python training/generate_synthetic_data.py
python training/train_model.py
```

This produces `models/recommendation_model.pkl` and `models/model_metrics.json`
(accuracy/precision/recall/confusion matrix). If you skip this step, the app
still runs fine — the recommendation engine falls back to a simpler rule-based
estimate instead of the ML classifier.

## 4. Run the app

```bash
streamlit run app.py
```

Visit `http://localhost:8501`. Register a new account, log in, and you'll land
on the Dashboard.

## 5. Project structure

```
finova/
├── app.py                     # Entry point: landing page, auth, custom sidebar router
├── requirements.txt
├── .env.example
├── pages/                     # One module per screen (prefixed with _ so Streamlit's
│                               #   built-in multipage auto-nav doesn't duplicate our
│                               #   custom sidebar — each still exposes a render() function)
├── database/                  # MongoDB connection + user-scoped CRUD operations
├── models/                    # Runtime wrapper around the trained ML classifier
├── training/                  # Synthetic data generator + model training script
├── services/                  # Business logic (finance, goals, risk, recommendations, projections)
├── utils/                     # Auth, validators, calculations, shared UI components
├── assets/styles.css          # Custom fintech styling
└── data/training_data.csv     # Generated synthetic training data (after running the script)
```

## 6. Notes

- All passwords are hashed with bcrypt before storage — plain-text passwords are
  never written to the database.
- Every financial-data query is scoped to the logged-in user's ID.
- The app degrades gracefully if MongoDB is unreachable (shows an offline banner
  and empty states instead of crashing).
- The ML component is intentionally simple and explainable, appropriate for a
  college project demo — it is not a production-grade financial model, and the
  app never claims to give regulated financial advice.
