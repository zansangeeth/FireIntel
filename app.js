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

// Configuration injected by GitHub Actions
// const CONFIG = {
//     API_KEY: "{{API_KEY}}",
//     SERVICE_URL: "{{SERVICE_URL}}",
//     ITEM_ID: "{{ITEM_ID}}"
// };

// // Better debug logging
// console.log("=== DEBUG CONFIG ===");
// console.log("Raw API_KEY value:", CONFIG.API_KEY);
// console.log("Raw SERVICE_URL value:", CONFIG.SERVICE_URL);
// console.log("Raw ITEM_ID value:", CONFIG.ITEM_ID);
// console.log("API Key starts with 'AAK':", CONFIG.API_KEY.startsWith("AAK"));
// console.log("Service URL contains 'arcgis':", CONFIG.SERVICE_URL.includes("arcgis"));
// console.log("=== END DEBUG ===");

// require([
//     "esri/config",
//     "esri/Map",
//     "esri/views/MapView",
//     "esri/layers/FeatureLayer",
//     "esri/layers/MapImageLayer",
//     "esri/widgets/LayerList",
//     "esri/widgets/Legend"
// ], function(
//     esriConfig, Map, MapView, FeatureLayer, MapImageLayer,
//     LayerList, Legend
// ) {
    
//     // FIXED: Better detection of injected values
//     const isApiKeyInjected = CONFIG.API_KEY && 
//                             CONFIG.API_KEY !== "{{API_KEY}}" && 
//                             CONFIG.API_KEY.length > 20;
    
//     const isServiceUrlInjected = CONFIG.SERVICE_URL && 
//                                 CONFIG.SERVICE_URL !== "{{SERVICE_URL}}" && 
//                                 CONFIG.SERVICE_URL.includes("arcgis");
    
//     const isItemIdInjected = CONFIG.ITEM_ID && 
//                             CONFIG.ITEM_ID !== "{{ITEM_ID}}" && 
//                             CONFIG.ITEM_ID.length > 5;
    
//     console.log("=== INJECTION CHECK ===");
//     console.log("isApiKeyInjected:", isApiKeyInjected, "length:", CONFIG.API_KEY.length);
//     console.log("isServiceUrlInjected:", isServiceUrlInjected);
//     console.log("isItemIdInjected:", isItemIdInjected);
    
//     // Check if configuration was properly injected
//     if (!isApiKeyInjected) {
//         console.error("API Key injection check failed!");
//         console.error("API Key value:", CONFIG.API_KEY);
//         document.getElementById("service-info").innerHTML = 
//             "<strong>ERROR: API Key was not configured properly.</strong><br>" +
//             "Please check GitHub Secrets. Value length: " + CONFIG.API_KEY.length;
//         document.getElementById("service-info").style.color = "red";
//         return;
//     }
    
//     // Set API key
//     esriConfig.apiKey = CONFIG.API_KEY;
//     console.log("✓ API Key configured successfully");
    
//     // Initialize map
//     const map = new Map({
//         basemap: "topo-vector"
//     });
    
//     const view = new MapView({
//         container: "viewDiv",
//         map: map,
//         center: [-98.5795, 39.8283],
//         zoom: 4
//     });
    
//     // Load service based on configuration
//     async function loadService() {
//         const infoEl = document.getElementById("service-info");
        
//         try {
//             let layer = null;
            
//             if (isServiceUrlInjected) {
//                 console.log("Loading from Service URL:", CONFIG.SERVICE_URL);
//                 infoEl.innerHTML = "Loading service from URL...";
                
//                 // Determine service type
//                 if (CONFIG.SERVICE_URL.includes("FeatureServer")) {
//                     console.log("Detected Feature Service");
//                     layer = new FeatureLayer({
//                         url: CONFIG.SERVICE_URL,
//                         title: "Feature Service",
//                         outFields: ["*"],
//                         popupTemplate: {
//                             title: "{Name}",
//                             content: "Loading attributes..."
//                         }
//                     });
//                 } else if (CONFIG.SERVICE_URL.includes("MapServer")) {
//                     console.log("Detected Map Service");
//                     layer = new MapImageLayer({
//                         url: CONFIG.SERVICE_URL,
//                         title: "Map Service"
//                     });
//                 } else {
//                     console.log("Unknown service type, trying FeatureLayer");
//                     layer = new FeatureLayer({
//                         url: CONFIG.SERVICE_URL,
//                         title: "Service"
//                     });
//                 }
//             } 
//             else if (isItemIdInjected) {
//                 console.log("Loading from Item ID:", CONFIG.ITEM_ID);
//                 infoEl.innerHTML = "Loading from Item ID...";
//                 // Add Item ID logic here if needed
//                 infoEl.innerHTML = "Item ID loading not implemented. Using Service URL instead.";
//                 return;
//             }
//             else {
//                 console.log("No service URL or Item ID provided");
//                 infoEl.innerHTML = 
//                     "<span style='color: orange;'>" +
//                     "Note: Only API key is configured.<br>" +
//                     "Add SERVICE_URL or ITEM_ID in GitHub Secrets to load a specific service." +
//                     "</span>";
//                 return;
//             }
            
//             if (layer) {
//                 console.log("Adding layer to map...");
//                 map.add(layer);
                
//                 // Wait for layer to load
//                 await layer.load();
//                 console.log("Layer loaded successfully:", layer.title);
                
//                 // Update UI
//                 infoEl.innerHTML = 
//                     "<span style='color: green;'>✓</span> " +
//                     "Successfully loaded: <strong>" + layer.title + "</strong>";
                
//                 // Setup widgets
//                 const layerList = new LayerList({
//                     view: view,
//                     container: document.getElementById("layer-list")
//                 });
                
//                 const legend = new Legend({
//                     view: view,
//                     container: document.getElementById("legend")
//                 });
                
//                 // Try to zoom to layer extent
//                 if (layer.fullExtent) {
//                     view.goTo(layer.fullExtent).then(() => {
//                         console.log("Zoomed to layer extent");
//                     }).catch(err => {
//                         console.log("Using default view, could not zoom:", err);
//                     });
//                 }
                
//                 // Show layer count if available
//                 if (layer.totalFeatures) {
//                     document.getElementById("layer-info").textContent = 
//                         "Features: " + layer.totalFeatures.toLocaleString();
//                 }
                
//             }
            
//         } catch (error) {
//             console.error("Error loading service:", error);
//             infoEl.innerHTML = 
//                 "<span style='color: red;'>✗ Error loading service:</span><br>" +
//                 "<code>" + error.message + "</code>";
//         }
//     }
    
//     // Start loading when view is ready
//     view.when(() => {
//         console.log("Map view is ready, loading service...");
//         loadService();
//     }).catch(error => {
//         console.error("Map view error:", error);
//         document.getElementById("service-info").innerHTML = 
//             "<span style='color: red;'>Map Error:</span> " + error.message;
//     });
    
//     // Handle window resize
//     window.addEventListener("resize", () => {
//         view.resize();
//     });
// });

// Configuration - values injected by GitHub Actions
// const CONFIG = {
//     API_KEY: "{{API_KEY}}",
//     SERVICE_URL: "{{SERVICE_URL}}",
//     ITEM_ID: "{{ITEM_ID}}"
// };

// // Just log what we have
// console.log("API Key injected:", CONFIG.API_KEY.substring(0, 10) + "...");
// console.log("API Key length:", CONFIG.API_KEY.length);
// console.log("Service URL:", CONFIG.SERVICE_URL);

// require([
//     "esri/config",
//     "esri/Map",
//     "esri/views/MapView",
//     "esri/layers/FeatureLayer",
//     "esri/layers/MapImageLayer",
//     "esri/widgets/LayerList",
//     "esri/widgets/Legend"
// ], function(
//     esriConfig, Map, MapView, FeatureLayer, MapImageLayer,
//     LayerList, Legend
// ) {
    
//     // 1. REMOVE ALL INJECTION CHECKS - JUST USE THE VALUES
//     // 2. Your API key IS being injected (we can see it in the logs)
    
//     // Set the API key - NO CHECKS
//     esriConfig.apiKey = CONFIG.API_KEY;
//     console.log("✓ API Key set successfully");
    
//     // Update UI immediately
//     document.getElementById("service-info").innerHTML = 
//         '<div style="background: #d4edda; padding: 10px; border-radius: 5px;">' +
//         '<strong style="color: #155724;">✓ Configuration Loaded</strong><br>' +
//         'API Key: ' + CONFIG.API_KEY.substring(0, 6) + '...' + CONFIG.API_KEY.slice(-4) + '<br>' +
//         'Length: ' + CONFIG.API_KEY.length + ' characters' +
//         '</div>';
    
//     // Initialize map
//     const map = new Map({
//         basemap: "topo-vector"
//     });
    
//     const view = new MapView({
//         container: "viewDiv",
//         map: map,
//         center: [-98.5795, 39.8283],
//         zoom: 4
//     });
    
//     // Load service
//     async function loadService() {
//         const infoEl = document.getElementById("service-info");
        
//         // Check service URL (simple check, no complex logic)
//         if (CONFIG.SERVICE_URL && CONFIG.SERVICE_URL.startsWith("http")) {
//             console.log("Loading service:", CONFIG.SERVICE_URL);
            
//             try {
//                 let layer;
                
//                 // Simple URL check
//                 if (CONFIG.SERVICE_URL.includes("FeatureServer")) {
//                     layer = new FeatureLayer({
//                         url: CONFIG.SERVICE_URL,
//                         title: "Feature Service"
//                     });
//                 } else if (CONFIG.SERVICE_URL.includes("MapServer")) {
//                     layer = new MapImageLayer({
//                         url: CONFIG.SERVICE_URL,
//                         title: "Map Service"
//                     });
//                 } else {
//                     // Try as feature layer
//                     layer = new FeatureLayer({
//                         url: CONFIG.SERVICE_URL,
//                         title: "ArcGIS Service"
//                     });
//                 }
                
//                 map.add(layer);
//                 await layer.load();
                
//                 // Success
//                 infoEl.innerHTML = 
//                     '<div style="background: #d4edda; padding: 15px; border-radius: 5px;">' +
//                     '<strong style="color: #155724; font-size: 1.2em;">✓ SUCCESS!</strong><br><br>' +
//                     '<strong>Service:</strong> ' + layer.title + '<br>' +
//                     '<strong>Type:</strong> ' + (layer.type || 'Feature Service') + '<br>' +
//                     '<strong>Features:</strong> ' + (layer.totalFeatures || 'Unknown') +
//                     '</div>';
                
//                 // Add widgets
//                 new LayerList({ view: view, container: document.getElementById("layer-list") });
//                 new Legend({ view: view, container: document.getElementById("legend") });
                
//                 // Zoom to extent
//                 if (layer.fullExtent) {
//                     view.goTo(layer.fullExtent);
//                 }
                
//             } catch (error) {
//                 console.error("Error:", error);
//                 infoEl.innerHTML += 
//                     '<div style="background: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 10px;">' +
//                     '<strong>Service Error:</strong> ' + error.message +
//                     '</div>';
//             }
//         } else {
//             // No service URL
//             infoEl.innerHTML += 
//                 '<div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 10px;">' +
//                 '<strong>Note:</strong> No service URL configured. Map is loaded with API key only.' +
//                 '</div>';
//         }
//     }
    
//     // Start when map is ready
//     view.when(() => {
//         loadService();
//     });
// });

// Configuration - values will be injected as Base64
const CONFIG = {
    API_KEY: atob("{{API_KEY_B64}}"),
    SERVICE_URL: atob("{{SERVICE_URL_B64}}"),
    ITEM_ID: atob("{{ITEM_ID_B64}}")
};

console.log("Config loaded successfully");

require([
    "esri/config",
    "esri/Map", 
    "esri/views/MapView",
    "esri/layers/FeatureLayer"
], function(esriConfig, Map, MapView, FeatureLayer) {
    
    // Set API key
    esriConfig.apiKey = CONFIG.API_KEY;
    console.log("API Key set, length:", CONFIG.API_KEY.length);
    
    // Initialize map
    const map = new Map({ basemap: "topo-vector" });
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-98.5795, 39.8283],
        zoom: 4
    });
    
    // Load service if URL exists
    if (CONFIG.SERVICE_URL && CONFIG.SERVICE_URL.startsWith("http")) {
        const layer = new FeatureLayer({ url: CONFIG.SERVICE_URL });
        map.add(layer);
        
        layer.when(() => {
            document.getElementById("service-info").innerHTML = 
                "✓ Service loaded: " + layer.title;
        }).catch(error => {
            document.getElementById("service-info").innerHTML = 
                "Error: " + error.message;
        });
    }
});