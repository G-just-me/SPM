let map;
let markers = [];
let pins = [];
let currentPin = null;

// เริ่มใช้งาน
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadPins();
    setupEventListeners();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('pinForm').addEventListener('submit', handlePinSubmit);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Delete pin
    document.getElementById('deletePin').addEventListener('click', deleteCurrentPin);
}

function showPinForm(latlng) {
    // บันทึกพิกัดชั่วคราว
    currentPin = {
        lat: latlng.lat,
        lng: latlng.lng
    };
    
    document.querySelector('.pin-form').scrollIntoView({ behavior: 'smooth' });
}

function handlePinSubmit(e) {
    e.preventDefault();
    
    if (!currentPin) return;
    
    const pinData = {
        id: Date.now(),
        name: document.getElementById('pinName').value,
        title: document.getElementById('pinTitle').value,
        description: document.getElementById('pinDescription').value,
        lat: currentPin.lat,
        lng: currentPin.lng,
        timestamp: new Date().toISOString()
    };
    
    addPin(pinData);
    savePin(pinData);
    resetForm();
    currentPin = null;
}

function addPin(pinData) {
    // Create custom icon
    const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #667eea; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${pins.length + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    // Create marker
    const marker = L.marker([pinData.lat, pinData.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
            <div>
                <h3>${pinData.title}</h3>
                <p><strong>By:</strong> ${pinData.name}</p>
                <p>${pinData.description}</p>
                <button onclick="openPinModal(${pinData.id})" style="background: #667eea; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">View Details</button>
            </div>
        `);
    
    marker.pinId = pinData.id;
    markers.push(marker);
    pins.push(pinData);
    
    updatePinsList();
}

function openPinModal(pinId) {
    const pin = pins.find(p => p.id === pinId);
    if (!pin) return;
    
    document.getElementById('modalTitle').textContent = pin.title;
    document.getElementById('modalAuthor').textContent = pin.name;
    document.getElementById('modalDescription').textContent = pin.description || 'No description provided';
    
    document.getElementById('deletePin').dataset.pinId = pinId;
    
    document.getElementById('pinModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('pinModal').style.display = 'none';
}

function deleteCurrentPin() {
    const pinId = parseInt(document.getElementById('deletePin').dataset.pinId);
    deletePin(pinId);
    closeModal();
}

function deletePin(pinId) {
    pins = pins.filter(pin => pin.id !== pinId);
    
 const markerIndex = markers.findIndex(m => m.pinId === pinId);
    if (markerIndex !== -1) {
        map.removeLayer(markers[markerIndex]);
        markers.splice(markerIndex, 1);
    }
    
    // Update storage
    savePins();
    updatePinsList();
}

function updatePinsList() {
    const pinsList = document.getElementById('pinsList');
    pinsList.innerHTML = '';
    
    if (pins.length === 0) {
        pinsList.innerHTML = '<p>No pins added yet. Click on the map to add your first pin!</p>';
        return;
    }
    
    pins.forEach(pin => {
        const pinItem = document.createElement('div');
        pinItem.className = 'pin-item';
        pinItem.innerHTML = `
            <h4>${pin.title}</h4>
            <p><strong>By:</strong> ${pin.name}</p>
            <p>${pin.description ? pin.description.substring(0, 50) + '...' : 'No description'}</p>
            <small>Added: ${new Date(pin.timestamp).toLocaleDateString()}</small>
            <button onclick="openPinModal(${pin.id})" style="margin-top: 5px; background: #667eea; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">View</button>
        `;
        pinsList.appendChild(pinItem);
    });
}

function resetForm() {
    document.getElementById('pinForm').reset();
}

function savePin(pinData) {
    pins.push(pinData);
    savePins();
}

function savePins() {
    localStorage.setItem('mapPins', JSON.stringify(pins));
}

function loadPins() {
    const savedPins = localStorage.getItem('mapPins');
    if (savedPins) {
        pins = JSON.parse(savedPins);
        pins.forEach(pin => addPin(pin));
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.setView([position.coords.latitude, position.coords.longitude], 15);
        });
    }
}

// Add shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
    .custom-pin {
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 8px;
    }
`;
document.head.appendChild(style);

// Initialize with user's location if available
setTimeout(getCurrentLocation, 1000);

