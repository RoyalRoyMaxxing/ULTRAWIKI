// Render all enemies
function normalizeAssetPath(assetPath) {
    if (!assetPath) return '';
    const normalized = assetPath.replace(/\\/g, '/').trim();
    if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('//')) {
        return normalized;
    }
    const isHtmlSubpage = window.location.pathname.includes('/access/html/');
    if (isHtmlSubpage) {
        if (normalized.startsWith('access/')) {
            return `../${normalized.slice('access/'.length)}`;
        }
        if (normalized.startsWith('./') || normalized.startsWith('../')) {
            return normalized;
        }
        return `../${normalized}`;
    }
    if (normalized.startsWith('../img/') || normalized.startsWith('./img/')) {
        return `access/${normalized.replace(/^(\.\.\/|\.\/)+/, '')}`;
    }
    if (normalized.startsWith('img/')) {
        return `access/${normalized}`;
    }
    return normalized;
}

async function renderEnemies() {
    const container = document.getElementById('enemies-list');
    if (!container) return;

    try {
        const response = await fetch('../json/enemy.json');
        const enemies = await response.json();

        container.innerHTML = '';

        Object.entries(enemies).forEach(([name, data]) => {
            const card = document.createElement('div');
            card.className = 'enemy-card';
            card.onclick = () => window.location.href = `detail.html?enemy=${encodeURIComponent(name)}`;

            const icon = normalizeAssetPath(data.General.Icon || '../img/Poster.jpg');
            card.innerHTML = `
                <img src="${icon}" alt="${name} icon">
                <h3>${name}</h3>
                <p>${data.General.Class}</p>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error("Lỗi khi tải dữ liệu enemy:", e);
    }
}

// Render all weapons
async function renderWeapons() {
    const container = document.getElementById('weapons-list');
    if (!container) return;

    try {
        const response = await fetch('../json/weapon.json');
        const weapons = await response.json();

        container.innerHTML = '';

        weapons.forEach(weapon => {
            const card = document.createElement('div');
            card.className = 'weapon-card';
            card.onclick = () => window.location.href = `detail.html?weapon=${encodeURIComponent(weapon.name)}`;

            const imageUrl = normalizeAssetPath(weapon.img || weapon.icon || '../img/Poster.jpg');

            card.innerHTML = `
                <img src="${imageUrl}" alt="${weapon.name} icon">
                <h3>${weapon.name}</h3>
                <p>${weapon.weapon_type}</p>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error("Lỗi khi tải dữ liệu weapon:", e);
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('enemies-list')) {
        renderEnemies();
    }
    if (document.getElementById('weapons-list')) {
        renderWeapons();
    }
});