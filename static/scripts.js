

const dropdown = document.getElementById('dropdown');
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
window.addEventListener('DOMContentLoaded', () => {
  fetch('/get-layers')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {

      // Clear the dropdown and populate it with the fetched layer names
      const dropdown = document.getElementById('dropdown');
      dropdown.innerHTML = '<option value="">-- Select a layer --</option>'; // Add a placeholder option

      // Use Object.keys to get layer names
      data.forEach(layerName => {
        const option = document.createElement('option');
        option.value = layerName; // Set the value attribute of the option
        option.textContent = layerName; // Set the text displayed in the dropdown
        dropdown.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching layers:', error);
      alert(`Error fetching layers: ${error.message}`);
    });
});

// Add an event listener for the "click" event
generateMap.addEventListener('click', () => {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }
  const selectedOption = dropdown.options[dropdown.selectedIndex];

  // Get the text of the selected option
  const selectedLayer = selectedOption.textContent;


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
