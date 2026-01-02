// // Configuration - These will be replaced by GitHub Actions
// const CONFIG = {
//     // API_KEY: "{{API_KEY}}",
//     // SERVICE_URL: "{{SERVICE_URL}}",
//     // ITEM_ID: "{{ITEM_ID}}"

//     API_KEY: "AAPTxy8BH1VEsoebNVZXo8HurPr1KZomlESVAH1Cdh2gtvxrdM3f55UEnIsJuP6SiL9D75VkAWGO3R_z_K1Nikb0ztdAjTiTOJXOJ26BWerqP_ee1RJjy2N-Zs7_SVmt73l6AI6wcqU7W2L0ewIJVmtM4ZNBxU1su12leCRsjvKm33-roz7neSYtsSUc7UiHppBIwE-r1SaI0BXoGJyQcETD43q6aEXx2881aT0le_nzca0.AT1_Hj2I69UM",
//     SERVICE_URL: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0",
//     ITEM_ID: "{{ITEM_ID}}"
// };

// require([
//     "esri/config",
//     "esri/Map",
//     "esri/views/MapView",
//     "esri/layers/FeatureLayer",
//     "esri/layers/MapImageLayer",
//     "esri/widgets/LayerList",
//     "esri/widgets/Legend",
//     "esri/widgets/Expand",
//     "esri/widgets/BasemapToggle",
//     "esri/widgets/BasemapGallery",
//     "esri/WebMap",
//     "esri/portal/Portal",
//     "esri/portal/PortalItem"
// ], function(
//     esriConfig, Map, MapView, FeatureLayer, MapImageLayer,
//     LayerList, Legend, Expand, BasemapToggle, BasemapGallery,
//     WebMap, Portal
//     , PortalItem
// ) {
    
//     // Configure API key
//     esriConfig.apiKey = CONFIG.API_KEY;
    
//     // Initialize map
//     const map = new Map({
//         basemap: "topo-vector"
//     });
    
//     // Create map view
//     const view = new MapView({
//         container: "viewDiv",
//         map: map,
//         center: [-98.5795, 39.8283], // Center of US
//         zoom: 4,
//         ui: {
//             components: ["zoom", "compass", "attribution"]
//         }
//     });
    
//     // Show loading indicator
//     const loadingEl = document.getElementById("loading");
    
//     // Update map info in footer
//     view.watch("center", (center) => {
//         document.getElementById("map-center").textContent = 
//             `Center: ${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)}`;
//     });
    
//     view.watch("zoom", (zoom) => {
//         document.getElementById("zoom-level").textContent = zoom.toFixed(2);
//     });
    
//     // Load service function
//     async function loadService() {
//         try {
//             let layer = null;
//             let serviceUrl = CONFIG.SERVICE_URL;
//             let serviceType = "";
            
//             // Check which configuration is provided
//             if (CONFIG.SERVICE_URL && CONFIG.SERVICE_URL !== "{{SERVICE_URL}}") {
//                 serviceUrl = CONFIG.SERVICE_URL;
                
//                 if (serviceUrl.includes("FeatureServer")) {
//                     // If a FeatureService root URL was provided, target the first layer
//                     if (!/\/\d+$/.test(serviceUrl)) {
//                         serviceUrl = serviceUrl.replace(/\/+$|\s+$/g, "") + "/0";
//                     }
//                     serviceType = "Feature Service";
//                     layer = new FeatureLayer({
//                         url: serviceUrl,
//                         title: "Service Layer",
//                         popupEnabled: true,
//                         outFields: ["*"]
//                     });
//                 } else if (serviceUrl.includes("MapServer")) {
//                     serviceType = "Map Service";
//                     layer = new MapImageLayer({
//                         url: serviceUrl,
//                         title: "Service Layer"
//                     });
//                 }
//             } else if (CONFIG.ITEM_ID && CONFIG.ITEM_ID !== "{{ITEM_ID}}") {
//                 // Load by item ID using PortalItem
//                 const portalItem = new PortalItem({
//                     id: CONFIG.ITEM_ID
//                 });

//                 await portalItem.load();

//                 serviceUrl = portalItem.url;
//                 serviceType = portalItem.type;

//                 if (portalItem.type === "Feature Service" || portalItem.type === "Feature Layer") {
//                     let url = portalItem.url || "";
//                     if (url.includes("FeatureServer") && !/\/\d+$/.test(url)) {
//                         url = url.replace(/\/+$|\s+$/g, "") + "/0";
//                     }
//                     layer = new FeatureLayer({
//                         url: url,
//                         title: portalItem.title,
//                         popupEnabled: true,
//                         outFields: ["*"]
//                     });
//                 } else if (portalItem.type === "Map Service") {
//                     layer = new MapImageLayer({
//                         url: portalItem.url,
//                         title: portalItem.title
//                     });
//                 } else if (portalItem.type === "Web Map") {
//                     // Handle web maps
//                     const webmap = new WebMap({
//                         portalItem: {
//                             id: CONFIG.ITEM_ID
//                         }
//                     });
                    
//                     await webmap.load();
//                     map.addMany(webmap.layers.toArray());
                    
//                     document.getElementById("service-info").textContent = 
//                         `Web Map: ${item.title}`;
                    
//                     serviceType = "Web Map";
//                     serviceUrl = "Web Map Item";
//                 }
//             }
            
//             // Update UI with service info
//             document.getElementById("service-url").textContent = 
//                 serviceUrl ? serviceUrl.substring(0, 50) + "..." : "Not configured";
//             document.getElementById("service-type").textContent = serviceType || "Not configured";
            
//             if (layer) {
//                 map.add(layer);
                
//                 layer.when(() => {
//                     // Update info panel
//                     document.getElementById("service-info").textContent = 
//                         `Loaded: ${layer.title}`;
                    
//                     if (layer.loaded) {
//                         document.getElementById("layer-info").textContent = 
//                             `Features: ${layer.totalFeatures || 'N/A'}`;
//                     }
                    
//                     // Setup widgets
//                     setupWidgets();
                    
//                     // Hide loading
//                     loadingEl.style.display = "none";
                    
//                     // Zoom to layer extent if available
//                     if (layer.fullExtent) {
//                         view.goTo(layer.fullExtent).catch(() => {
//                             // Fallback to default view
//                             console.log("Using default view");
//                         });
//                     }
//                 }).catch(error => {
//                     console.error("Layer load error:", error);
//                     document.getElementById("service-info").textContent = 
//                         `Error: ${error.message}`;
//                     loadingEl.style.display = "none";
//                 });
//             } else {
//                 document.getElementById("service-info").textContent = 
//                     "Please configure SERVICE_URL or ITEM_ID in GitHub Secrets";
//                 loadingEl.style.display = "none";
//             }
            
//         } catch (error) {
//             console.error("Error:", error);
//             document.getElementById("service-info").textContent = 
//                 `Error: ${error.message}`;
//             loadingEl.style.display = "none";
//         }
//     }
    
//     // Setup widgets
//     function setupWidgets() {
//         // Layer List
//         const layerList = new LayerList({
//             view: view,
//             container: document.createElement("div")
//         });
        
//         const layerListExpand = new Expand({
//             view: view,
//             content: layerList,
//             expandIconClass: "esri-icon-layer-list",
//             expandTooltip: "Layers"
//         });
        
//         // Legend
//         const legend = new Legend({
//             view: view,
//             container: document.createElement("div")
//         });
        
//         const legendExpand = new Expand({
//             view: view,
//             content: legend,
//             expandIconClass: "esri-icon-legend",
//             expandTooltip: "Legend"
//         });
        
//         // Basemap Toggle
//         const basemapToggle = new BasemapToggle({
//             view: view,
//             nextBasemap: "satellite"
//         });
        
//         // Basemap Gallery
//         const basemapGallery = new BasemapGallery({
//             view: view,
//             container: document.createElement("div")
//         });
        
//         const basemapExpand = new Expand({
//             view: view,
//             content: basemapGallery,
//             expandIconClass: "esri-icon-basemap",
//             expandTooltip: "Basemaps"
//         });
        
//         // Add widgets to UI
//         view.ui.add(layerListExpand, "top-right");
//         view.ui.add(legendExpand, "top-right");
//         view.ui.add(basemapExpand, "top-right");
//         view.ui.add(basemapToggle, "bottom-left");
        
//         // Also add to sidebar
//         document.getElementById("layer-list").appendChild(layerList.container);
//         document.getElementById("legend").appendChild(legend.container);
//     }
    
//     // Initialize the application
//     view.when(() => {
//         loadService();
//     }).catch(error => {
//         console.error("Map view error:", error);
//         loadingEl.innerHTML = `<p>Error loading map: ${error.message}</p>`;
//     });
    
//     // Handle window resize
//     window.addEventListener("resize", () => {
//         view.resize();
//     });
// });

// Configuration will be injected by GitHub Actions
// DO NOT EDIT THESE VALUES MANUALLY
const CONFIG = {
    API_KEY: "{{API_KEY}}",
    SERVICE_URL: "{{SERVICE_URL}}",
    ITEM_ID: "{{ITEM_ID}}"
};

// Log configuration for debugging (will be removed in production)
console.log("Configuration loaded:", {
    hasApiKey: !!CONFIG.API_KEY && CONFIG.API_KEY !== "{{API_KEY}}",
    hasServiceUrl: !!CONFIG.SERVICE_URL && CONFIG.SERVICE_URL !== "{{SERVICE_URL}}",
    hasItemId: !!CONFIG.ITEM_ID && CONFIG.ITEM_ID !== "{{ITEM_ID}}",
    apiKeyLength: CONFIG.API_KEY ? CONFIG.API_KEY.length : 0,
    serviceUrl: CONFIG.SERVICE_URL ? CONFIG.SERVICE_URL.substring(0, 50) + "..." : "Not set"
});

require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/MapImageLayer"
], function(
    esriConfig, Map, MapView, FeatureLayer, MapImageLayer
) {
    
    // Check if configuration was properly injected
    if (CONFIG.API_KEY === "{{API_KEY}}" || CONFIG.API_KEY === "") {
        console.error("API Key was not injected properly!");
        document.getElementById("service-info").textContent = 
            "ERROR: API Key was not configured. Please check GitHub Secrets.";
        return;
    }
    
    // Set API key
    esriConfig.apiKey = CONFIG.API_KEY;
    console.log("API Key configured, length:", CONFIG.API_KEY.length);
    
    // Initialize map
    const map = new Map({
        basemap: "topo-vector"
    });
    
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-98.5795, 39.8283],
        zoom: 4
    });
    
    // Load service based on configuration
    async function loadService() {
        const infoEl = document.getElementById("service-info");
        
        // Debug info
        console.log("Service URL:", CONFIG.SERVICE_URL);
        console.log("Item ID:", CONFIG.ITEM_ID);
        
        if (CONFIG.SERVICE_URL && CONFIG.SERVICE_URL !== "{{SERVICE_URL}}") {
            console.log("Using Service URL:", CONFIG.SERVICE_URL);
            infoEl.textContent = "Loading service from URL...";
            
            try {
                let layer;
                if (CONFIG.SERVICE_URL.includes("FeatureServer")) {
                    layer = new FeatureLayer({
                        url: CONFIG.SERVICE_URL,
                        title: "Feature Service"
                    });
                } else if (CONFIG.SERVICE_URL.includes("MapServer")) {
                    layer = new MapImageLayer({
                        url: CONFIG.SERVICE_URL,
                        title: "Map Service"
                    });
                }
                
                if (layer) {
                    map.add(layer);
                    await layer.load();
                    infoEl.textContent = "✓ Service loaded: " + layer.title;
                    view.goTo(layer.fullExtent).catch(() => {
                        console.log("Could not zoom to layer extent");
                    });
                }
            } catch (error) {
                console.error("Error loading service:", error);
                infoEl.textContent = "Error: " + error.message;
            }
            
        } else if (CONFIG.ITEM_ID && CONFIG.ITEM_ID !== "{{ITEM_ID}}") {
            console.log("Using Item ID:", CONFIG.ITEM_ID);
            infoEl.textContent = "Loading service from Item ID...";
            // Add item ID loading logic here
            
        } else {
            console.log("No service URL or Item ID configured");
            infoEl.textContent = "Please configure SERVICE_URL or ITEM_ID in GitHub Secrets";
            infoEl.style.color = "red";
            infoEl.style.fontWeight = "bold";
        }
    }
    
    // Start loading when view is ready
    view.when(() => {
        loadService();
    }).catch(error => {
        console.error("Map view error:", error);
        document.getElementById("service-info").textContent = "Error: " + error.message;
    });
});