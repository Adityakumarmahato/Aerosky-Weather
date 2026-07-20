# 🌤️ AeroSky // Premium Live Weather Analytics

**AeroSky** is a high-performance, real-time environmental intelligence and climate dashboard. It translates raw meteorological payloads into clean, actionable, and visually striking insights. Built with a modern, glassmorphic dark-theme UI, it offers users a comprehensive breakdown of localized weather patterns, atmospheric safety margins, and regional climate telemetry.

---

### 🚀 Core Features

*   **Hyper-Local Analytics:** Fetches real-time temperature, "feels-like" thermal sensations, humidity, barometric pressure, and visibility metrics via global coordinates or city searches.
*   **Atmospheric Warning System:** Automatically triggers distinct visual warnings for extreme weather events, such as high-velocity squalls or dangerous heat thresholds.
*   **Advanced Environmental Tracking:** Integrates live Air Quality Index (AQI) breakdowns (tracking PM2.5 and NO2) alongside real-time UV Radiation scores complete with adaptive medical/skin-safety advice.
*   **Dynamic Curve Visualization:** Utilizes Chart.js to map and contrast the baseline temperature against the actual perceived "feels-like" thermal curve across a rolling 24-hour cycle.
*   **Smart UX Systems:** 
    *   *Satellite Sync:* One-click GPS location detection.
    *   *Search Autocomplete:* Real-time city query filtering.
    *   *Chrono-Distribution:* A compressed 5-day macro-timeline interval forecast.
    *   *Adaptive Theming:* The entire interface dynamically shifts its background gradient and ambient glow colors depending on the active weather profile (Clear, Cloudy, Rainy, etc.).
*   **Developer Sandbox:** Features a toggleable telemetry console allowing developers to inspect, deconstruct, and copy the raw nested JSON payload powering the front end.

---

### 🛠️ Tech Stack & Architecture

*   **Frontend Framework:** AngularJS (v1.8.2) — handling data-binding, structural formatting, asynchronous API pooling, and thermodynamic algorithms.
*   **Styling Engine:** Tailwind CSS v4 — delivering utility-first layout structures, advanced responsive viewports, and modern performance utilities.
*   **Data Visualization:** Chart.js — rendering the fluid dynamic temperature analysis curves.
*   **Data Provisioning:** OpenWeatherMap API — serving core weather data, 5-day forecasts, air pollution metrics, and UV indexes.
