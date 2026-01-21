// ฟังชั่น ยรื
let pins = [];
let currentPin = null;
let isAddingPin = false;

// เริ่มใช้แอป
document.addEventListener('DOMContentLoaded', function() {
    setupImageMap();
    loadPins();
    setupEventListeners();
});

function setupImageMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.style.display = 'none';
    }
    
    // ทำให้คลิกบนแผนที่ได้
    const imageOverlay = document.getElementById('imageOverlay');
    if (imageOverlay) {
        imageOverlay.style.display = 'block';
        imageOverlay.style.position = 'relative';
        imageOverlay.style.width = '100%';
        imageOverlay.style.height = '600px';
        imageOverlay.style.cursor = 'crosshair';
        imageOverlay.style.border = '1px solid #ddd';
        imageOverlay.style.borderRadius = '10px';
        imageOverlay.style.overflow = 'hidden';
        imageOverlay.style.background = '#f5f5f5';
        
        // Setup รูป
        const baseImage = document.getElementById('baseImage');
        if (baseImage) {
            baseImage.style.width = '100%';
            baseImage.style.height = '100%';
            baseImage.style.objectFit = 'contain';
            baseImage.addEventListener('click', handleImageClick);
        }
        
        // เพิ่มข้อความ
        const instruction = document.createElement('div');
        instruction.textContent = 'Click on the image to add a pin';
        instruction.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 10;
        `;
        imageOverlay.appendChild(instruction);
    }
}

function handleImageClick(e) {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    currentPin = { x, y };
    showPinForm();
}

function showPinForm() {
    // แสดงแบบฟอร์มแบบไดนามิก
    const formContainer = document.querySelector('.pin-form');
    if (!formContainer) {
        // สร้าฟอร์มแบบไดนามิกถ้ายังไม่มี
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        const newForm = document.createElement('div');
        newForm.className = 'pin-form';
        newForm.innerHTML = `
            <h3>Add New Pin</h3>
            <form id="pinForm">
                <label for="pinName">Your Name:</label>
                <input type="text" id="pinName" required placeholder="Enter your name" />
                <label for="pinTitle">Pin Title:</label>
                <input type="text" id="pinTitle" required placeholder="Enter pin title" />
                <label for="pinDescription">Description:</label>
                <textarea id="pinDescription" rows="4" placeholder="Enter description or information"></textarea>
                <button type="submit">Add Pin</button>
            </form>
        `;
        sidebar.insertBefore(newForm, sidebar.firstChild);
        document.getElementById('pinForm').addEventListener('submit', handlePinSubmit);
        newForm.scrollIntoView({ behavior: 'smooth' });
    } else {
        formContainer.style.display = 'block';
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function setupEventListeners() {
    // ส่งฟอร์ม
    document.getElementById('pinForm').addEventListener('submit', handlePinSubmit);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // ลบ pin
    document.getElementById('deletePin').addEventListener('click', deleteCurrentPin);
}

function handlePinSubmit(e) {
    e.preventDefault();

    if (!currentPin) return;

    const pinData = {
        id: Date.now(),
        name: document.getElementById('pinName').value,
        title: document.getElementById('pinTitle').value,
        description: document.getElementById('pinDescription').value,
        x: currentPin.x,
        y: currentPin.y,
        timestamp: new Date().toISOString()
    };

    addPin(pinData);
    savePin(pinData);
    resetForm();
    currentPin = null;
}

function addPin(pinData) {
    // สร้าง pin
    const pinElement = document.createElement('div');
    pinElement.className = 'image-pin';
    pinElement.dataset.pinId = pinData.id;
    pinElement.style.cssText = `
        position: absolute;
        left: ${pinData.x}%;
        top: ${pinData.y}%;
        width: 20px;
        height: 20px;
        background: #667eea;
        border: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 5;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: transform 0.2s;
    `;
    
    pinElement.addEventListener('mouseenter', function() {
        this.style.transform = 'translate(-50%, -50%) scale(1.2)';
    });
    
    pinElement.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    pinElement.addEventListener('click', function() {
        openPinModal(pinData);
    });
    
    pinElement.title = `${pinData.title} by ${pinData.name}`;
    
    const imageOverlay = document.getElementById('imageOverlay');
    if (imageOverlay) {
        imageOverlay.appendChild(pinElement);
    }
    
    pins.push(pinData);
    updatePinsList();
}

function openPinModal(pinData) {
    const modal = document.getElementById('pinModal');
    if (modal) {
        document.getElementById('modalTitle').textContent = pinData.title;
        document.getElementById('modalAuthor').textContent = pinData.name;
        document.getElementById('modalDescription').textContent = pinData.description || 'No description provided';
        document.getElementById('deletePin').dataset.pinId = pinData.id;
        modal.style.display = 'block';

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };

        const deleteBtn = document.getElementById('deletePin');
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                deletePin(pinData.id);
                modal.style.display = 'none';
            };
        }
    }
}

function deletePinFromView(pinId) {
    deletePin(pinId);
    closeModal();
}

function closeModal() {
    const modal = document.getElementById('pinModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function deleteCurrentPin() {
    const pinId = parseInt(document.getElementById('deletePin').dataset.pinId);
    deletePin(pinId);
    closeModal();
}

function deletePin(pinId) {
    // ลบ pin
    const pinElement = document.querySelector(`[data-pin-id="${pinId}"]`);
    if (pinElement) {
        pinElement.remove();
    }
    
    pins = pins.filter(pin => pin.id !== pinId);
    
    // Update storage
    savePins();
    updatePinsList();

    // Also remove pin from localStorage to prevent reloading
    let savedPins = JSON.parse(localStorage.getItem('imagePins') || '[]');
    savedPins = savedPins.filter(pin => pin.id !== pinId);
    localStorage.setItem('imagePins', JSON.stringify(savedPins));
    
    //  ลบพินออกจาก DOM หากยังมีอยู่
    const pinElemInDOM = document.querySelector(`[data-pin-id="${pinId}"]`);
    if (pinElemInDOM) {
        pinElemInDOM.remove();
    }

    closeModal();

    setTimeout(() => {
        location.reload();
    }, 300);

    // ลบองค์ประกอบpinออก
    const pinsList = document.getElementById('pinsList');
    if (pinsList) {
        const pinItem = pinsList.querySelector(`[data-pin-id="${pinId}"]`);
        if (pinItem) {
            pinItem.remove();
        }
    }
}

function resetForm() {
    document.getElementById('pinForm').reset();
}

function savePin(pinData) {
    pins.push(pinData);
    savePins();
}

function savePins() {
    localStorage.setItem('imagePins', JSON.stringify(pins));
}

function loadPins() {
    const savedPins = localStorage.getItem('imagePins');
    if (savedPins) {
        pins = JSON.parse(savedPins);
        pins = pins.filter((pin, index, self) =>
            index === self.findIndex((p) => (
                p.id === pin.id
            ))
        );
        pins.forEach(pin => addPin(pin));
    }
}

function updatePinsList() {
    const pinsList = document.getElementById('pinsList');
    if (pinsList) {
        pinsList.innerHTML = '';

        if (pins.length === 0) {
            pinsList.innerHTML = '<p>No pins added yet. Click on the image to add your first pin!</p>';
            return;
        }

        // กรองPIN ที่ไม่ซ้ำกันเพื่อเลี่ยงการใช้ซ้ำ
        const uniquePins = pins.filter((pin, index, self) =>
            index === self.findIndex((p) => (
                p.id === pin.id
            ))
        );

        uniquePins.forEach(pin => {
            const pinItem = document.createElement('div');
            pinItem.className = 'pin-item';
            pinItem.innerHTML = `
                <h4>${pin.title}</h4>
                <p><strong>By:</strong> ${pin.name}</p>
                <p>${pin.description ? pin.description.substring(0, 50) + '...' : 'No description'}</p>
                <small>Position: ${Math.round(pin.x)}%, ${Math.round(pin.y)}%</small>
                <button onclick="openPinModal(${pin.id})" style="margin-top: 5px; background: #667eea; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">View</button>
                <button onclick="deletePinFromView(${pin.id})" style="margin-left: 5px; background: #ff4757; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;">Delete</button>
            `;
            pinsList.appendChild(pinItem);
        });
    }
}

// เพิ่มทางลัดของkeyboard
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

