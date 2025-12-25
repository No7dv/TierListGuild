//=========================================================
// ================= PARTIE TIER LIST =====================
//=========================================================

//=====================================================
// CHARGEMENT DU LOCALSTORAGE A L OUVERTURE DE LA PAGE
//=====================================================

window.addEventListener('DOMContentLoaded', () => {
    loadTierList();
});

//=================================
// SAUVEGARDE DANS LE LOCALSTORAGE
//=================================

function saveTierList() {
    let tierState = {}; // objet pour stocker l'état

    dropZones.forEach((zone) => {
        // clé = le data-tier ou 'start' si c'est la start-zone
        let key = zone.classList.contains('start-zone') ? 'start' : zone.dataset.tier;

        // on récupère  tous les noms dans cette zone
        let names = Array.from(zone.querySelectorAll('.name')).map(name => name.textContent);

        tierState[key] = names; // ajoute au objet
    });

    // stocke dans LocalStorage
    localStorage.setItem('tierList', JSON.stringify(tierState));
}

//============================
// CHARGEMENT DU LOCALSTORAGE
//============================

function loadTierList() {
    let saved = localStorage.getItem('tierList');
    if (!saved) return; // rien à changer

    let tierState = JSON.parse(saved);

    // pour chaque tier dans l'objet
    for (let key in tierState) {
        let zone;
        if(key === 'start') {
            zone = startZone;
        } else {
            zone = document.querySelector(`.tier[data-tier="${key}"] .tier-content`);
        }

        tierState[key].forEach(nameText => {
            // cherche le div correspondant
            let nameDiv = Array.from(divName).find(d => d.textContent === nameText);
            if(nameDiv) zone.appendChild(nameDiv);
        });
    };
};


// Récupération des éléments avec la classe "name"
let divName = document.querySelectorAll('.name');

let draggedName;

divName.forEach((element) => {
    element.addEventListener('dragstart', () => {
        draggedName = element;
        element.classList.add('dragging')
        console.log(draggedName.textContent)
    });

    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
        saveTierList();
    });
});

// Récupération du container avec la classe "tier-list"
let containerTier = document.querySelector('.tier-list');

// Récupération des éléments avec la classe "tier" et "start-zone"
let dropZones = document.querySelectorAll('.tier-content, .start-zone');

// Variable pour éviter les calculs trop fréquents (throttle)
let lastUpdate = 0;

dropZones.forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
    e.preventDefault();

    const afterElement = getDragAfterElement(zone, e.clientX, e.clientY);

    // PROTECTION ANTI-SACCADE : 
    // Si l'élément après lequel on veut insérer est déjà celui juste avant 
    // ou juste après le draggedName, on ne fait rien.
    if (afterElement === draggedName || 
        (afterElement && draggedName.nextSibling === afterElement && e.clientX < afterElement.getBoundingClientRect().left + 10)) {
        return;
    }

    if (afterElement == null) {
        zone.appendChild(draggedName);
    } else {
        const box = afterElement.getBoundingClientRect();
        // Si on est à droite du milieu du nom cible, on insère après
        if (e.clientX > box.left + box.width / 2) {
            zone.insertBefore(draggedName, afterElement.nextSibling);
        } else {
            zone.insertBefore(draggedName, afterElement);
        }
    }
});
});

// Bouton pour reset la tier list
let btnReset = document.getElementById('btnReset');
let startZone = document.querySelector('.start-zone');

btnReset.addEventListener('click', () => {
    divName.forEach((element) => {
        startZone.appendChild(element)
    })
    saveTierList();
});

function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.name:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        
        // On vérifie d'abord si on est sur la même ligne verticale (Y)
        const isWithinY = y >= box.top && y <= box.bottom;
        
        // Calcul de la distance au centre pour la précision
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        if (distance < closest.offset) {
            return { offset: distance, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.POSITIVE_INFINITY }).element;
}
