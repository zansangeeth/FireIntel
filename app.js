// Configuration - These will be replaced by GitHub Actions
const CONFIG = {
    API_KEY: "{{API_KEY}}",
    SERVICE_URL: "{{SERVICE_URL}}",
    ITEM_ID: "{{ITEM_ID}}"
};

require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/MapImageLayer",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/BasemapToggle",
    "esri/widgets/BasemapGallery",
    "esri/WebMap",
    "esri/portal/Portal",
    "esri/portal/PortalItem"
], function(
    esriConfig, Map, MapView, FeatureLayer, MapImageLayer,
    LayerList, Legend, Expand, BasemapToggle, BasemapGallery,
    WebMap, Portal
    , PortalItem
) {
    
    // Configure API key
    esriConfig.apiKey = CONFIG.API_KEY;
    
    // Initialize map
    const map = new Map({
        basemap: "topo-vector"
    });
    
    // Create map view
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-98.5795, 39.8283], // Center of US
        zoom: 4,
        ui: {
            components: ["zoom", "compass", "attribution"]
        }
    });
    
    // Show loading indicator
    const loadingEl = document.getElementById("loading");
    
    // Update map info in footer
    view.watch("center", (center) => {
        document.getElementById("map-center").textContent = 
            `Center: ${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)}`;
    });
    
    view.watch("zoom", (zoom) => {
        document.getElementById("zoom-level").textContent = zoom.toFixed(2);
    });
    
    // Load service function
    async function loadService() {
        try {
            let layer = null;
            let serviceUrl = CONFIG.SERVICE_URL;
            let serviceType = "";
            
            // Check which configuration is provided
            if (CONFIG.SERVICE_URL && CONFIG.SERVICE_URL !== "{{SERVICE_URL}}") {
                serviceUrl = CONFIG.SERVICE_URL;
                
                if (serviceUrl.includes("FeatureServer")) {
                    // If a FeatureService root URL was provided, target the first layer
                    if (!/\/\d+$/.test(serviceUrl)) {
                        serviceUrl = serviceUrl.replace(/\/+$|\s+$/g, "") + "/0";
                    }
                    serviceType = "Feature Service";
                    layer = new FeatureLayer({
                        url: serviceUrl,
                        title: "Service Layer",
                        popupEnabled: true,
                        outFields: ["*"]
                    });
                } else if (serviceUrl.includes("MapServer")) {
                    serviceType = "Map Service";
                    layer = new MapImageLayer({
                        url: serviceUrl,
                        title: "Service Layer"
                    });
                }
            } else if (CONFIG.ITEM_ID && CONFIG.ITEM_ID !== "{{ITEM_ID}}") {
                // Load by item ID using PortalItem
                const portalItem = new PortalItem({
                    id: CONFIG.ITEM_ID
                });

                await portalItem.load();

                serviceUrl = portalItem.url;
                serviceType = portalItem.type;

                if (portalItem.type === "Feature Service" || portalItem.type === "Feature Layer") {
                    let url = portalItem.url || "";
                    if (url.includes("FeatureServer") && !/\/\d+$/.test(url)) {
                        url = url.replace(/\/+$|\s+$/g, "") + "/0";
                    }
                    layer = new FeatureLayer({
                        url: url,
                        title: portalItem.title,
                        popupEnabled: true,
                        outFields: ["*"]
                    });
                } else if (portalItem.type === "Map Service") {
                    layer = new MapImageLayer({
                        url: portalItem.url,
                        title: portalItem.title
                    });
                } else if (portalItem.type === "Web Map") {
                    // Handle web maps
                    const webmap = new WebMap({
                        portalItem: {
                            id: CONFIG.ITEM_ID
                        }
                    });
                    
                    await webmap.load();
                    map.addMany(webmap.layers.toArray());
                    
                    document.getElementById("service-info").textContent = 
                        `Web Map: ${item.title}`;
                    
                    serviceType = "Web Map";
                    serviceUrl = "Web Map Item";
                }
            }
            
            // Update UI with service info
            document.getElementById("service-url").textContent = 
                serviceUrl ? serviceUrl.substring(0, 50) + "..." : "Not configured";
            document.getElementById("service-type").textContent = serviceType || "Not configured";
            
            if (layer) {
                map.add(layer);
                
                layer.when(() => {
                    // Update info panel
                    document.getElementById("service-info").textContent = 
                        `Loaded: ${layer.title}`;
                    
                    if (layer.loaded) {
                        document.getElementById("layer-info").textContent = 
                            `Features: ${layer.totalFeatures || 'N/A'}`;
                    }
                    
                    // Setup widgets
                    setupWidgets();
                    
                    // Hide loading
                    loadingEl.style.display = "none";
                    
                    // Zoom to layer extent if available
                    if (layer.fullExtent) {
                        view.goTo(layer.fullExtent).catch(() => {
                            // Fallback to default view
                            console.log("Using default view");
                        });
                    }
                }).catch(error => {
                    console.error("Layer load error:", error);
                    document.getElementById("service-info").textContent = 
                        `Error: ${error.message}`;
                    loadingEl.style.display = "none";
                });
            } else {
                document.getElementById("service-info").textContent = 
                    "Please configure SERVICE_URL or ITEM_ID in GitHub Secrets";
                loadingEl.style.display = "none";
            }
            
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("service-info").textContent = 
                `Error: ${error.message}`;
            loadingEl.style.display = "none";
        }
    }
    
    // Setup widgets
    function setupWidgets() {
        // Layer List
        const layerList = new LayerList({
            view: view,
            container: document.createElement("div")
        });
        
        const layerListExpand = new Expand({
            view: view,
            content: layerList,
            expandIconClass: "esri-icon-layer-list",
            expandTooltip: "Layers"
        });
        
        // Legend
        const legend = new Legend({
            view: view,
            container: document.createElement("div")
        });
        
        const legendExpand = new Expand({
            view: view,
            content: legend,
            expandIconClass: "esri-icon-legend",
            expandTooltip: "Legend"
        });
        
        // Basemap Toggle
        const basemapToggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite"
        });
        
        // Basemap Gallery
        const basemapGallery = new BasemapGallery({
            view: view,
            container: document.createElement("div")
        });
        
        const basemapExpand = new Expand({
            view: view,
            content: basemapGallery,
            expandIconClass: "esri-icon-basemap",
            expandTooltip: "Basemaps"
        });
        
        // Add widgets to UI
        view.ui.add(layerListExpand, "top-right");
        view.ui.add(legendExpand, "top-right");
        view.ui.add(basemapExpand, "top-right");
        view.ui.add(basemapToggle, "bottom-left");
        
        // Also add to sidebar
        document.getElementById("layer-list").appendChild(layerList.container);
        document.getElementById("legend").appendChild(legend.container);
    }
    
    // Initialize the application
    view.when(() => {
        loadService();
    }).catch(error => {
        console.error("Map view error:", error);
        loadingEl.innerHTML = `<p>Error loading map: ${error.message}</p>`;
    });
    
    // Handle window resize
    window.addEventListener("resize", () => {
        view.resize();
    });
});