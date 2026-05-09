async function fetchEnemyData() {
    try {
        const response = await fetch('../json/enemy.json');
        if (!response.ok) {
            throw new Error(`Failed to load enemy data: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function fetchWeaponData() {
    try {
        const response = await fetch('../json/weapon.json');
        if (!response.ok) {
            throw new Error(`Failed to load weapon data: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

function getQueryEnemy() {
    return new URLSearchParams(window.location.search).get('enemy')?.trim() || '';
}

function getQueryWeapon() {
    return new URLSearchParams(window.location.search).get('weapon')?.trim() || '';
}

// Functions for user management
function getUsers() {
  const raw = localStorage.getItem('favgames_users');
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem('favgames_users', JSON.stringify(users));
}

function getCurrentUserEmail() {
  return localStorage.getItem('favgames_current_user');
}

function createMetaPill(label, value) {
    const pill = document.createElement('span');
    pill.className = 'meta-pill';
    pill.textContent = `${label}: ${value}`;
    return pill;
}

function renderList(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = '<div class="detail-list-item">No data available.</div>';
        return;
    }

    Object.entries(data).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'detail-list-item';

        const label = document.createElement('span');
        label.textContent = key;

        const valueNode = document.createElement('span');
        if (Array.isArray(value)) {
            valueNode.textContent = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            valueNode.textContent = JSON.stringify(value);
        } else {
            valueNode.textContent = String(value);
        }

        item.appendChild(label);
        item.appendChild(valueNode);
        container.appendChild(item);
    });
}

function renderArray(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!value) {
        container.innerHTML = '<span class="detail-array-item">None</span>';
        return;
    }

    const values = Array.isArray(value) ? value : [value];
    values.forEach(itemValue => {
        const pill = document.createElement('span');
        pill.className = 'detail-array-item';
        pill.textContent = Array.isArray(itemValue) ? itemValue.join(', ') : String(itemValue);
        container.appendChild(pill);
    });
}

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
        return `access/${normalized.replace(/^([\.\/]+|\.\.)+/, '')}`;
    }
    if (normalized.startsWith('img/')) {
        return `access/${normalized}`;
    }
    return normalized;
}

function createAssetCandidates(assetPath) {
    if (!assetPath) return [];
    const cleaned = assetPath.replace(/\\/g, '/').trim();
    const candidates = [];

    const add = (path) => {
        if (!path) return;
        const normalized = normalizeAssetPath(path);
        if (normalized && !candidates.includes(normalized)) {
            candidates.push(normalized);
        }
    };

    add(cleaned);
    add(cleaned.replace(/^access\//, ''));
    add(cleaned.replace(/^\.{1,2}\//, ''));

    const basename = cleaned.split('/').pop();
    if (basename) {
        add(`../img/${basename}`);
        add(`img/${basename}`);
        add(`access/img/${basename}`);
    }

    return candidates;
}

function setImageWithFallback(imgEl, assetPath, fallback) {
    if (!imgEl) return;
    const paths = createAssetCandidates(assetPath);
    if (fallback) {
        paths.push(fallback);
    }
    let index = 0;
    const tryNext = () => {
        if (index >= paths.length) {
            return;
        }
        imgEl.src = paths[index++] || '';
    };
    imgEl.onerror = () => {
        if (index < paths.length) {
            tryNext();
        }
    };
    tryNext();
}

function renderEnemyDetail(enemyName, enemyData) {
    const titleEl = document.getElementById('detail-title');
    const posterEl = document.getElementById('detail-poster');
    const genresEl = document.getElementById('detail-genres');
    const releaseEl = document.getElementById('detail-release');
    const gametagEl = document.getElementById('detail-gametag');
    const platformEl = document.getElementById('detail-platform');
    const descEl = document.getElementById('detail-description');
    const trailerContainer = document.getElementById('detail-trailer-container');
    
    // Update section titles for enemy view
    document.getElementById('section-title-1').textContent = 'General Stats';
    document.getElementById('section-title-2').textContent = 'Appearance';
    document.getElementById('section-title-3').textContent = 'Conditional Modifiers';
    document.getElementById('section-title-4').textContent = 'Damage Modifiers';
    document.getElementById('section-title-5').textContent = 'Radiance Multipliers';

    const general = enemyData?.General || {};
    const icon = normalizeAssetPath(general.Icon || '');
    const image = normalizeAssetPath(general.Img || icon || '../img/Poster.jpg');

    titleEl.textContent = enemyData ? enemyName : 'Enemy not found';
    genresEl.textContent = general.Class || (enemyData ? 'Unknown Type' : 'Unknown Enemy');
    releaseEl.textContent = `Health: ${general['Máu'] ?? '--'}`;
    gametagEl.textContent = `Weight: ${general['Trọng lượng'] ?? '--'}`;
    platformEl.textContent = `Rank: ${general['Hạng'] ?? '--'}`;
    descEl.textContent = general['Mô tả'] || (enemyData ? 'No description provided for this enemy.' : 'No enemy data is available for this selection.');
    posterEl.alt = `${enemyName} image`;
    setImageWithFallback(posterEl, general.Img || icon || '../img/Poster.jpg', icon || '../img/Poster.jpg');

    if (trailerContainer) {
        trailerContainer.innerHTML = '';
        const detailImage = document.createElement('img');
        detailImage.alt = `${enemyName} detail image`;
        detailImage.style.width = '100%';
        detailImage.style.borderRadius = '18px';
        setImageWithFallback(detailImage, general.Img || icon || '../img/Poster.jpg', icon || '../img/Poster.jpg');
        trailerContainer.appendChild(detailImage);
    }

    if (!enemyData) {
        renderList('detail-stats', null);
        renderArray('detail-appearance', null);
        renderList('detail-primary-fire', null);
        renderList('detail-alternate-fire', null);
        renderList('detail-damage-modifiers', null);
        return;
    }

    const stats = { ...general };
    delete stats['Mô tả'];
    delete stats['Class'];
    delete stats['Icon'];
    delete stats['Img'];

    renderList('detail-stats', stats);
    renderArray('detail-appearance', enemyData['Xuất hiện']);
    renderList('detail-primary-fire', enemyData['Bộ sửa đổi có điều kiện'] || {});
    renderList('detail-alternate-fire', enemyData['Bộ sửa đổi loại tổn thương'] || {});
    renderList('detail-damage-modifiers', enemyData['Bộ nhân Radiance'] || {});
}

function renderWeaponDetail(weaponName, weaponData) {
    const titleEl = document.getElementById('detail-title');
    const posterEl = document.getElementById('detail-poster');
    const genresEl = document.getElementById('detail-genres');
    const releaseEl = document.getElementById('detail-release');
    const gametagEl = document.getElementById('detail-gametag');
    const platformEl = document.getElementById('detail-platform');
    const descEl = document.getElementById('detail-description');
    const trailerContainer = document.getElementById('detail-trailer-container');
    
    // Update section titles for weapon view
    document.getElementById('section-title-1').textContent = 'Loại vũ khí';
    document.getElementById('section-title-2').textContent = 'Cách sở hữu';
    document.getElementById('section-title-3').textContent = 'Primary Fire';
    document.getElementById('section-title-4').textContent = 'Alternate Fire';
    document.getElementById('section-title-5').textContent = 'Damage Modifier';

    if (!weaponData) {
        titleEl.textContent = 'Weapon not found';
        genresEl.textContent = 'Unknown Type';
        releaseEl.textContent = 'N/A';
        gametagEl.textContent = 'N/A';
        platformEl.textContent = 'N/A';
        descEl.textContent = 'No weapon data is available for this selection.';
        posterEl.src = '../img/Poster.jpg';
        posterEl.alt = 'Unknown weapon image';
        renderList('detail-stats', null);
        renderArray('detail-appearance', null);
        renderList('detail-primary-fire', null);
        renderList('detail-alternate-fire', null);
        renderList('detail-damage-modifiers', null);
        return;
    }

    const icon = normalizeAssetPath(weaponData.icon || '');
    const image = normalizeAssetPath(weaponData.img || icon || '../img/Poster.jpg');

    titleEl.textContent = weaponName;
    genresEl.textContent = weaponData.weapon_type || 'Unknown Type';
    releaseEl.textContent = `Weapon: ${weaponData.weapon_type || 'Unknown'}`;
    gametagEl.textContent = `Obtained: ${weaponData.obtained_in || 'Unknown'}`;
    platformEl.textContent = weaponData.weapon_type || 'N/A';
    descEl.textContent = weaponData.terminal_info || 'No description available.';
    posterEl.alt = `${weaponName} image`;
    setImageWithFallback(posterEl, weaponData.img || icon || '../img/Poster.jpg', icon || '../img/Poster.jpg');

    if (trailerContainer) {
        trailerContainer.innerHTML = '';
        const detailImage = document.createElement('img');
        detailImage.alt = `${weaponName} detail image`;
        detailImage.style.width = '100%';
        detailImage.style.borderRadius = '18px';
        setImageWithFallback(detailImage, weaponData.img || icon || '../img/Poster.jpg', icon || '../img/Poster.jpg');
        trailerContainer.appendChild(detailImage);
    }

    const stats = {
        'Loại': weaponData.weapon_type || 'Unknown'
    };

    const obtained = [
        weaponData.obtained_in || 'Unknown'
    ];

    renderList('detail-stats', stats);
    renderArray('detail-appearance', obtained);
    renderList('detail-primary-fire', weaponData.primary_fire || {});
    renderList('detail-alternate-fire', weaponData.alternate_fire || {});
    renderList('detail-damage-modifiers', weaponData.damage_modifiers || {});
}

async function initDetailPage() {
    const enemyName = getQueryEnemy();
    const weaponName = getQueryWeapon();

    if (enemyName) {
        const allEnemies = await fetchEnemyData();
        const enemy = allEnemies?.[enemyName] ?? null;
        renderEnemyDetail(enemyName, enemy);
        return;
    }

    if (weaponName) {
        const allWeapons = await fetchWeaponData();
        const weapon = allWeapons?.find(w => w.name.toLowerCase() === weaponName.toLowerCase()) ?? null;
        renderWeaponDetail(weaponName, weapon);
        setupWeaponActions(weaponName);
        return;
    }

    const titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = 'No selection made';
}

function setupWeaponActions(weaponName) {
    const goodBtn = document.getElementById('add-good-btn');
    const badBtn = document.getElementById('add-bad-btn');
    const currentEmail = localStorage.getItem('favgames_current_user');

    if (!goodBtn || !badBtn || !currentEmail) return;

    goodBtn.onclick = null;
    badBtn.onclick = null;

    const handleUpdate = (category) => {
        const users = JSON.parse(localStorage.getItem('favgames_users') || '[]');
        const userIndex = users.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());

        if (userIndex === -1) return;

        if (!users[userIndex].favouriteWeapons) users[userIndex].favouriteWeapons = [];
        if (!users[userIndex].awfulAtWeapons) users[userIndex].awfulAtWeapons = [];

        const targetList = category === 'good' ? users[userIndex].favouriteWeapons : users[userIndex].awfulAtWeapons;
        const otherList = category === 'good' ? users[userIndex].awfulAtWeapons : users[userIndex].favouriteWeapons;

        const otherIdx = otherList.indexOf(weaponName);
        if (otherIdx > -1) otherList.splice(otherIdx, 1);

        if (!targetList.includes(weaponName)) {
            targetList.push(weaponName);
            localStorage.setItem('favgames_users', JSON.stringify(users));
            alert(`Đã thêm ${weaponName} vào danh sách!`);
        } else {
            alert("Vũ khí này đã có trong danh sách rồi.");
        }
    };

    goodBtn.onclick = () => handleUpdate('good');
    badBtn.onclick = () => handleUpdate('bad');
}

initDetailPage();
