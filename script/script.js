const names = document.querySelectorAll('.name');
const dropZones = document.querySelectorAll('.tier, .start-zone');

// --- CHARGEMENT DES DONNÉES ---
window.addEventListener('load', loadData);

names.forEach(name => {
    name.addEventListener('dragstart', () => {
        name.classList.add('dragging');
        window.dragged = name;
    });

    name.addEventListener('dragend', () => {
        name.classList.remove('dragging');
        saveData(); // Sauvegarder après le déplacement
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(zone, e.clientY);
        if (afterElement == null) {
            zone.appendChild(window.dragged);
        } else {
            zone.insertBefore(window.dragged, afterElement);
        }
    });

    zone.addEventListener('dragenter', () => zone.classList.add('drag-over'));
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        saveData(); // Sauvegarder lors du drop
    });
});

// --- FONCTIONS DE SAUVEGARDE ---

function saveData() {
    const data = {};
    
    // On enregistre le contenu de chaque Tier
    document.querySelectorAll('.tier').forEach(tier => {
        const tierName = tier.getAttribute('data-tier');
        const memberNames = [...tier.querySelectorAll('.name')].map(n => n.textContent);
        data[tierName] = memberNames;
    });

    // On enregistre aussi la zone de départ
    data['start'] = [...document.querySelector('.start-zone').querySelectorAll('.name')].map(n => n.textContent);

    localStorage.setItem('tierListData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('tierListData');
    if (!savedData) return;

    const data = JSON.parse(savedData);

    // On replace les éléments au bon endroit
    Object.keys(data).forEach(key => {
        const container = key === 'start' 
            ? document.querySelector('.start-zone') 
            : document.querySelector(`.tier[data-tier="${key}"]`);

        if (container) {
            data[key].forEach(nameText => {
                // On cherche l'élément qui a ce nom et on le déplace
                const element = [...document.querySelectorAll('.name')].find(n => n.textContent === nameText);
                if (element) container.appendChild(element);
            });
        }
    });
}

// --- RESTE DU CODE (getDragAfterElement et Reset) ---

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.name:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

const startZone = document.querySelector('.start-zone');
document.getElementById('reset').addEventListener('click', () => {
    document.querySelectorAll('.name').forEach(name => {
        startZone.appendChild(name);
    });
    localStorage.removeItem('tierListData'); // Vider la sauvegarde au reset
});