

const workspace_dropdown = document.getElementById('workspace-dropdown');
const layer_dropdown = document.getElementById('layer-dropdown');
const request_service_dropdown = document.getElementById('request-service-dropdown');
const request_workspace_dropdown = document.getElementById('request-workspace-dropdown');
const request_layer_dropdown = document.getElementById('request-layer-dropdown');
const generateMap = document.getElementById('generateMap');
const map = L.map('map', {
  center: [39.8283, -98.5795],
  zoom: 4,
  timeDimension: true,
  timeDimensionControl: true
});

console.log(L.timeDimension); // Should not be undefined

var wmsLayer

// Store the currently displayed WMS layer and its times
let currentLayer = null;


// Add a base layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);



// Automatically fetch and populate the dropdown when the page loads
window.addEventListener('DOMContentLoaded', async () => {
  try{
    const response = await fetch('/get-workspaces');
    if(!response.ok) throw new Error('Workspace HTTP error! Status: $(response.status)')
    const data = (await response.json()).sort((a,b)=> a.localeCompare(b));
    workspace_dropdown.innerHTML = '<option value="">-- Select a Workspace --</option>' + 
    data.map(workspaceName => `<option value="${workspaceName}">${workspaceName}</option>`).join('');

    request_workspace_dropdown.innerHTML = '<option value="">-- Select a Workspace --</option>' + 
    data.map(workspaceName => `<option value="${workspaceName}">${workspaceName}</option>`).join('');
} 
  catch (error) {
    console.error('Error fetching workspaces:', error);
  }
});



workspace_dropdown.addEventListener('change',  async () => {

  workspace = workspace_dropdown.options[workspace_dropdown.selectedIndex].text;
  service = 'wms'
  // Clear the layer dropdown before fetching new data

  const response = await fetch(`/get-layers?service=${service}&workspace=${workspace}`);
  if (!response.ok) throw new Error(`Layer HTTP error! Status: ${response.status}`);
  const data = (await response.json()).sort((a,b)=> a.localeCompare(b));
  layer_dropdown.innerHTML = '<option value="">-- Select a Layer --</option>' + 
  data.map(layerName => `<option value="${layerName}">${layerName}</option>`).join('');
  });


request_workspace_dropdown.addEventListener('change',  async () => {

  service = request_service_dropdown.options[request_service_dropdown.selectedIndex].text;
  workspace = request_workspace_dropdown.options[request_workspace_dropdown.selectedIndex].text;

  console.log(service)
  console.log(workspace)

  // Clear the layer dropdown before fetching new data

  const response = await fetch(`/get-layers?service=${service}&workspace=${workspace}`);
  if (!response.ok) throw new Error(`Request Layer HTTP error! Status: ${response.status}`);
  const data = (await response.json()).sort((a,b)=> a.localeCompare(b));
  request_layer_dropdown.innerHTML = '<option value="">-- Select a Layer --</option>' + 
  data.map(layerName => `<option value="${layerName}">${layerName}</option>`).join('');
  });


// Add an event listener for the "click" event
generateMap.addEventListener('click', () => {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }
  const workspace_text = workspace_dropdown.options[workspace_dropdown.selectedIndex].textContent;
  const layer_text = layer_dropdown.options[layer_dropdown.selectedIndex].textContent;
  // Get the text of the selected option
  const selectedLayer = `${workspace_text}:${layer_text}`;
  // Add the GeoServer WMS layer
  wmsLayer = L.tileLayer.wms('https://wfas.firenet.gov/geoserver/ows?', {
    layers: selectedLayer,        // Name of the layer
    format: 'image/png',              // WMS image format
    transparent: true,                // Overlay transparency
    styles: '',                       // Default styles
    version: '1.3.0',
    opacity: 0.6,                          // Coordinate reference system
    attribution: 'GeoServer WMS Layer'
  })
  currentLayer = L.timeDimension.layer.wms(wmsLayer, {
    updateTimeDimension: true,
    requestTimeFromCapabilities: true})
  currentLayer.addTo(map);
  }
);
