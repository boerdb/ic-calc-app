# ICCalc - Intensive Care Calculator 🏥

**ICCalc** is a Progressive Web Application (PWA) designed for Intensive Care Unit (ICU) professionals. It provides essential clinical calculators, gas exchange analysis, and protocol wizards (e.g., for Hamilton ventilators) directly at the bedside.

Built with **Ionic** and **Angular**, focusing on speed, dark-mode usability, and strict clinical relevance.

> **Note:** The application interface is in **Dutch** (Nederlands).

---

## ✨ Key Features

### 🫁 Respiratory & Gas Exchange (New!)
* **Oxygenation Analysis:** Calculates P/F Ratio (Horowitz), A-a Gradient, and estimated Shunt.
* **CO₂ & Ventilation:** Calculates the **PaCO₂ - EtCO₂ Gap** and estimates **Dead Space Fraction (Vd/Vt)**.
* **ROX Index:** Predictor for High Flow Nasal Oxygen (HFNO) therapy failure/success.
* **Smart Inputs:** Values like FiO₂ and SpO₂ are synchronized across different calculation tools to minimize typing.

### 🌬️ Ventilator Protocols
* **Hamilton PV Tool Wizard:** A step-by-step visual guide/wizard for performing Recruitment Maneuvers on Hamilton C6 ventilators.
* **Safety Checks:** Integrated checklists for sedation, NMB, and hemodynamic stability before starting maneuvers.

### 💊 Clinical Tools
* **Patient Context:** Stores session-based patient data (Hb, Age, etc.) for personalized calculations.
* **Interactive UI:** Dark mode optimized for low-light ICU environments.

---

## 🛠️ Tech Stack

* **Framework:** [Ionic 7+](https://ionicframework.com/) (Angular Standalone Components)
* **Language:** TypeScript
* **Styling:** SCSS (Custom dark theme)
* **Build Tool:** Angular CLI / Ionic CLI
* **Deployment:** Docker / Nginx

---

## 🚀 Getting Started

### Prerequisites
* Node.js (LTS version recommended)
* Ionic CLI: `npm install -g @ionic/cli`

### Installation
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/iccalc.git](https://github.com/yourusername/iccalc.git)
    cd iccalc
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run locally:**
    ```bash
    ionic serve
    ```
    The app will open at `http://localhost:8100`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
ionic build --prod
