# 🌾 PlantDoc — Plant Disease Detection with Medicine Recommendation

A bilingual (English / Nepali) mobile application that detects diseases in **wheat
and maize leaves** from a photo and recommends appropriate treatments. Built with a
React Native (Expo) frontend, a FastAPI backend, and a deep-learning model
(MobileNetV2) for disease classification.

---

## 📋 Overview

A farmer photographs a wheat or maize leaf in the app. The image is sent to the
backend, where a trained deep-learning model classifies it into one of 9 categories.
The app then displays the disease, confidence score, symptoms, prevention advice,
and recommended medicine — in English or Nepali.

**9 classes:**
- **Wheat:** Healthy, Brown Rust, Yellow Rust
- **Maize:** Healthy, Blight, Common Rust, Gray Leaf Spot
- **Reject classes:** Background (no leaf), Not_Maize_Or_Wheat (invalid image)

---

## 🏗️ Project Structure

```
Projects/
├── doc_app/                       # Frontend — React Native (Expo) mobile app
└── fastapi_backend/               # Backend — FastAPI server
    ├── app/
    │   ├── main.py                # API endpoints
    │   ├── predictor.py           # Loads model, runs predictions
    │   ├── auth.py                # User authentication
    │   └── ...
    ├── model/                     # Trained model + AI/ML notebook
    │   ├── mobilenet_9way.keras   # Final trained model
    │   ├── class_names.json       # Class labels
    │   └── plant_disease_detection(final).ipynb   # AI/ML training notebook
    └── seed_data.py               # Seeds disease & medicine database
```

---

## 🤖 AI / Machine Learning

### Models

Two models were built and compared on the same data, split, and settings:

| Model | Test Accuracy | Macro F1 | Parameters |
|-------|--------------|----------|------------|
| Baseline CNN (built from scratch) | 92.45% | 0.923 | ~20M |
| **MobileNetV2 (transfer learning)** | **95.63%** | **~0.956** | 2.3M |

The final model, **MobileNetV2**, uses transfer learning — pretrained on ImageNet
and fine-tuned for leaf disease classification. It outperforms the from-scratch
baseline with far fewer parameters.

### Dataset

- **17,519 images** across 9 classes
- Split **80% train / 10% validation / 10% test** (stratified)
- Cleaned with **MD5 hashing** (exact-duplicate removal)
- Preprocessed with **NLM denoising** + **CLAHE** contrast enhancement
- Resized to **299×299**, RGB

### Training Approach

1. **Preprocessing** — denoise + CLAHE + resize
2. **Class weighting** — handles class imbalance without deleting data
3. **Data augmentation** — flips, rotation, zoom, brightness, contrast (training only)
4. **Two-stage transfer learning:**
   - Stage 1 — frozen MobileNetV2 base, train classification head
   - Stage 2 — fine-tune top 30 layers at a low learning rate (1e-5)
5. **Evaluation** — accuracy, per-class precision/recall/F1, confusion matrix

### Technologies

- **TensorFlow / Keras** — model building & training
- **OpenCV** — image preprocessing (denoising, CLAHE)
- **scikit-learn** — class weights & evaluation metrics
- **Google Colab** — GPU training environment

---

## 💊 Medicine Recommendation

Once a disease is detected, the app looks up the matching treatment from a curated
knowledge base stored in the database (disease → medicine, dosage, application,
frequency, precautions). This is a lookup, not a prediction — treatment advice is
sourced rather than generated, so it stays consistent and authoritative.

---

## 🖥️ Backend (FastAPI)

Serves the trained model and app data via a REST API.

- **`/api/predict`** — accepts a leaf image, returns disease + confidence + treatment
- **`/api/auth/*`** — registration, login, profile management
- **`/api/scans`** — save & retrieve scan history
- **`/api/diseases`, `/api/medicines`** — disease & medicine data

`predictor.py` applies the **same preprocessing as training** (denoise → CLAHE →
resize) and uses a **confidence threshold** to reject uncertain predictions.

**Tech:** FastAPI, TensorFlow, OpenCV, Pillow, SQLAlchemy

---

## 📱 Frontend (React Native / Expo)

The mobile app farmers interact with.

**Features:**
- Camera & gallery image capture
- Real-time disease detection
- Bilingual support (English / Nepali)
- User accounts & scan history
- Medicine recommendations per disease

**Tech:** React Native (Expo), Expo ImagePicker

---

## 🚀 Setup

### Backend
```bash
cd fastapi_backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Ensure `mobilenet_9way.keras` and `class_names.json` are in the `model/` folder.

### Frontend
```bash
cd doc_app
npm install
npx expo start
```
Set `API_URL` in `services/api.js` to your backend's IP (e.g. `http://192.168.1.67:8000`).

---

## 📊 Results

- **95.63% test accuracy** on 1,761 unseen images
- No wheat/maize cross-crop confusion — the crops are cleanly separated
- Reliable rejection of invalid images on the test set
- Residual confusion only in look-alike disease pairs (Brown/Yellow rust,
  Blight/Gray Leaf Spot) — genuinely difficult even for experts

---

## 📄 License

*Academic project — [course / institution here]*
