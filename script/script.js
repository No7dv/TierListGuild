const mainTitle = document.getElementById('main-title');
const names = document.querySelectorAll('.name');
const dropZones = document.querySelectorAll('.tier, .start-zone');

// --- CHARGEMENT (Au démarrage) ---
window.addEventListener('load', () => {
    const saved = JSON.parse(localStorage.getItem('tierListData'));
    if (saved) {
        if (saved.title) mainTitle.textContent = saved.title;
        Object.keys(saved.tiers || {}).forEach(tierKey => {
            const zone = tierKey === 'start' ? document.querySelector('.start-zone') : document.querySelector(`.tier[data-tier="${tierKey}"]`);
            saved.tiers[tierKey].forEach(nameTxt => {
                const el = [...document.querySelectorAll('.name')].find(n => n.textContent === nameTxt);
                if (el && zone) zone.appendChild(el);
            });
        });
    }
});

// --- SAUVEGARDE ---
function saveData() {
    const data = { title: mainTitle.textContent, tiers: {} };
    dropZones.forEach(zone => {
        const key = zone.classList.contains('start-zone') ? 'start' : zone.getAttribute('data-tier');
        data.tiers[key] = [...zone.querySelectorAll('.name')].map(n => n.textContent);
    });
    localStorage.setItem('tierListData', JSON.stringify(data));
}

// --- ÉVÉNEMENTS ---
mainTitle.addEventListener('input', saveData); // Sauvegarde quand le titre change

names.forEach(name => {
    name.addEventListener('dragstart', () => {
        name.classList.add('dragging');
        window.dragged = name;
    });
    name.addEventListener('dragend', () => {
        name.classList.remove('dragging');
        saveData();
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(zone, e.clientY);
        if (afterElement == null) zone.appendChild(window.dragged);
        else zone.insertBefore(window.dragged, afterElement);
    });
    zone.addEventListener('drop', () => {
        zone.classList.remove('drag-over');
        saveData();
    });
    zone.addEventListener('dragenter', () => zone.classList.add('drag-over'));
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.name:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        else return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.getElementById('reset').addEventListener('click', () => {
    const startZone = document.querySelector('.start-zone');
    document.querySelectorAll('.name').forEach(name => startZone.appendChild(name));
    mainTitle.textContent = "Tier List Guilde";
    localStorage.removeItem('tierListData');
});

mainTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Empêche de passer à la ligne
        mainTitle.blur();   // Enlève le focus du titre
    }
});

