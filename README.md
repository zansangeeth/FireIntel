# Esri Service Visualization

A simple web application to visualize Esri services using ArcGIS JS SDK, automatically deployed to GitHub Pages.

## Features

- Visualize Esri Feature Services and Map Services
- Secure API key management via GitHub Secrets
- Responsive design for mobile and desktop
- Layer list and legend controls
- Basemap gallery and toggle
- Real-time map position and zoom display

## Setup

1. **Fork or clone this repository**

2. **Configure GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `ESRI_API_KEY`: Your ArcGIS API key
   - `ESRI_SERVICE_URL`: Your service URL (e.g., https://services.arcgis.com/.../FeatureServer/0)
   - `ESRI_ITEM_ID`: Your item ID (optional, if using Portal item)
   - `CUSTOM_DOMAIN`: Optional custom domain for GitHub Pages

3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (will be created automatically)
   - Folder: `/ (root)`

4. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main