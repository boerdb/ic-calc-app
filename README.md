# ICU Support - Decision Support Dashboard

**ICU Support** is een moderne Angular/Ionic applicatie ontworpen voor zorgprofessionals op de Intensive Care. De app biedt een reeks intelligente calculators om klinische besluitvorming te ondersteunen.

## 🚀 Kenmerken

* **Modern Dashboard**: Een intuïtief 2x3 grid systeem voor snelle toegang tot alle calculators zonder te hoeven scrollen.
* **Patiëntgecentreerd**: Directe weergave van de actieve patiënt en bednummer in de hero-sectie.
* **Glassmorphism Design**: Een strakke, medische interface met transparante overlays en een professioneel donker thema.
* **Schaalbaar**: Eenvoudig uit te breiden met nieuwe modules dankzij het modulaire grid-systeem.

## 🛠️ Technische Hoogtepunten

* **Angular Standalone Components**: Gebruik van de nieuwste Angular architectuur.
* **Modern Dependency Injection**: Volledige overstap van constructor-injectie naar de modernere `inject()` functie voor betere testbaarheid en leesbaarheid [cite: 2026-01-08].
* **Centralized Icon Management**: Alle Ionicon-registraties zijn gecentraliseerd in een gedeelde utility om onnodige overhead te voorkomen en de prestaties te verbeteren [cite: 2026-01-09].
* **PWA Ready**: Geoptimaliseerd voor installatie op mobiele apparaten met een aangepast manifest en thema-kleuren.

## 📂 Projectstructuur

* `src/app/pages/home`: Het centrale dashboard met de nieuwe 6-tile layout.
* `src/app/services`: Bevat de core logica voor patiëntbeheer en calculators.
* `src/assets/images`: Bevat de ICU-specifieke visuele assets.

## ⚙️ Installatie

1. Kloon de repository:
   ```bash
   git clone [https://github.com/jouw-gebruikersnaam/icu-support.git](https://github.com/jouw-gebruikersnaam/icu-support.git)
