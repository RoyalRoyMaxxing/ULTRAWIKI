async function GetData(enemyName) {
    const response = await fetch('access/json/enemy.json');
    if (!response.ok) {
        throw new Error(`Failed to load enemy data: ${response.status}`);
    }

    const enemyData = await response.json();
    if (!enemyName) {
        // Trả về mảng theo đúng thứ tự trong file JSON
        return Object.entries(enemyData).map(([name, data]) => ({ name, ...data }));
    }

    const key = enemyName.toString().trim();
    return enemyData[key] ?? null;
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
        return `access/${normalized.replace(/^(\.\.\/|\.\/)+/, '')}`;
    }
    if (normalized.startsWith('img/') || normalized.startsWith('access/img/')) {
        return normalized.startsWith('img/') ? `access/${normalized}` : normalized;
    }
    return normalized;
}

function createEnemyCard(enemy) {
    const cardLink = document.createElement('a');
    cardLink.className = 'game-card-link';
    cardLink.href = `access/html/detail.html?enemy=${encodeURIComponent(enemy.name)}`;

    const card = document.createElement('div');
    card.className = 'game-card';
    const imageUrl = normalizeAssetPath(enemy.General?.Icon || '');
    card.style.backgroundImage = imageUrl ? `url('${imageUrl}')` : 'none';

    const info = document.createElement('div');
    info.className = 'game-card-info';

    const title = document.createElement('h3');
    title.textContent = enemy.name;

    const subtitle = document.createElement('p');
    subtitle.textContent = enemy.General?.Class || 'Enemy';

    info.appendChild(title);
    info.appendChild(subtitle);
    card.appendChild(info);
    cardLink.appendChild(card);

    return cardLink;
}

function renderEnemyCards(containerSelector, enemies) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '';
    enemies.forEach(enemy => {
        container.appendChild(createEnemyCard(enemy));
    });
}

GetData().then(enemies => {
    renderEnemyCards('.husk', enemies.filter(enemy => enemy.General?.Class === 'Lesser Husk' || enemy.General?.Class === 'Greater Husk' || enemy.General?.Class === 'Supreme Husk'));
    renderEnemyCards('.demons', enemies.filter(enemy => enemy.General?.Class === 'Lesser Demon' || enemy.General?.Class === 'Greater Demon' || enemy.General?.Class === 'Supreme Demon'));
    renderEnemyCards('.machines', enemies.filter(enemy => enemy.General?.Class === 'Lesser Machine' || enemy.General?.Class === 'Greater Machine' || enemy.General?.Class === 'Supreme Machine'));
    renderEnemyCards('.angels', enemies.filter(enemy => enemy.General?.Class === 'Lesser Angel' || enemy.General?.Class === 'Greater Angel' || enemy.General?.Class === 'Supreme Angel'));
    renderEnemyCards('.prime-soul', enemies.filter(enemy => enemy.General?.Class === 'Prime Soul'));
    renderEnemyCards('.hot-search', enemies.filter(enemy => enemy.name === 'Filth' || enemy.name === 'Demon Lord' || enemy.name === 'Prime Soul'));
}).catch(error => {
    console.error('Failed to render enemy cards:', error);
});
// Example usage:
GetData('Filth').then(data => console.log(data));
GetData().then(list => console.log(list));

// Weapon functions
async function GetWeaponData(weaponName) {
    const response = await fetch('access/json/weapon.json');
    if (!response.ok) {
        throw new Error(`Failed to load weapon data: ${response.status}`);
    }

    const weaponData = await response.json();
    if (!weaponName) {
        return weaponData;
    }

    const key = weaponName.toString().trim().toLowerCase();
    return weaponData.find(weapon => weapon.name.toLowerCase() === key) ?? null;
}

function createWeaponCard(weapon) {
    const cardLink = document.createElement('a');
    cardLink.className = 'game-card-link';
    cardLink.href = `access/html/detail.html?weapon=${encodeURIComponent(weapon.name)}`;

    const card = document.createElement('div');
    card.className = 'game-card';
    const imageUrl = normalizeAssetPath(weapon.img || weapon.icon || 'access/img/default_weapon.webp');
    card.style.backgroundImage = imageUrl ? `url('${imageUrl}')` : 'none';

    const info = document.createElement('div');
    info.className = 'game-card-info';

    const title = document.createElement('h3');
    title.textContent = weapon.name;

    const subtitle = document.createElement('p');
    subtitle.textContent = weapon.weapon_type || 'Vũ khí'; // Assuming a type field, or default

    info.appendChild(title);
    info.appendChild(subtitle);
    card.appendChild(info);
    cardLink.appendChild(card);

    return cardLink;
}

function renderWeaponCards(containerSelector, weapons) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '';
    weapons.forEach(weapon => {
        container.appendChild(createWeaponCard(weapon));
    });
}

function AddEnemyFiller() {
    const container = document.getElementById('enemy-form-container');
    if (!container) return;

    if (container.innerHTML.trim()) {
        container.innerHTML = '';
        return;
    }

    const classes = [
        'Lesser Husk', 'Greater Husk', 'Supreme Husk',
        'Lesser Demon', 'Greater Demon', 'Supreme Demon',
        'Lesser Angel', 'Greater Angel', 'Supreme Angel',
        'Prime Soul'
    ];

    function formatOptions(options) {
        return options.map(option => `<option value="${option}">${option}</option>`).join('');
    }

    function parseKeyValueList(value) {
        return value
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }

    const form = document.createElement('form');
    form.className = 'enemy-form';
    form.innerHTML = `
        <table class="enemy-form-table">
            <tr>
                <td>
                    <label for="enemy-name">Tên kẻ địch</label>
                    <input id="enemy-name" name="enemyName" type="text" placeholder="Nhập tên kẻ địch" required>
                </td>
                <td>
                    <label for="enemy-class">Class</label>
                    <select id="enemy-class" name="enemyClass" required>${formatOptions(classes)}</select>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <label for="enemy-description">Mô tả</label>
                    <textarea id="enemy-description" name="enemyDescription" rows="3" placeholder="Nhập mô tả"></textarea>
                </td>
            </tr>
            <tr>
                <td>
                    <label for="enemy-icon">Icon</label>
                    <input id="enemy-icon" name="enemyIcon" type="text" placeholder="URL icon">
                </td>
                <td>
                    <label for="enemy-image">Image</label>
                    <input id="enemy-image" name="enemyImage" type="text" placeholder="URL ảnh">
                </td>
            </tr>
            <tr>
                <td>
                    <label for="enemy-hp">Máu</label>
                    <input id="enemy-hp" name="enemyHp" type="number" min="0" placeholder="Giá trị máu">
                </td>
                <td>
                    <label for="enemy-damage">Sát thương</label>
                    <input id="enemy-damage" name="enemyDamage" type="number" min="0" placeholder="Giá trị sát thương">
                </td>
            </tr>
            <tr>
                <td>
                    <label for="enemy-weight">Trọng lượng</label>
                    <input id="enemy-weight" name="enemyWeight" type="number" min="0" placeholder="Trọng lượng">
                </td>
                <td>
                    <label for="enemy-rank">Hạng</label>
                    <input id="enemy-rank" name="enemyRank" type="text" placeholder="Nhập hạng">
                </td>
            </tr>
            <tr>
                <td>
                    <label for="enemy-conditional-modifiers">Bộ sửa đổi có điều kiện</label>
                    <textarea id="enemy-conditional-modifiers" name="enemyConditionalModifiers" rows="2" placeholder="Ví dụ: Đêm: +10%, Giáp: -5%"></textarea>
                </td>
                <td>
                    <label for="enemy-radiance-multipliers">Bộ nhân Radiance</label>
                    <textarea id="enemy-radiance-multipliers" name="enemyRadianceMultipliers" rows="2" placeholder="Ví dụ: Ánh sáng: x1.5, Bóng tối: x0.9"></textarea>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <label for="enemy-appearance">Xuất hiện</label>
                    <textarea id="enemy-appearance" name="enemyAppearance" rows="2" placeholder="Nhập nơi xuất hiện, cách xuất hiện"></textarea>
                </td>
            </tr>
        </table>
        <div class="enemy-form-actions">
            <button type="submit" class="btn btn-primary">Thêm kẻ địch</button>
            <button type="button" class="btn btn-secondary" id="enemy-form-cancel">Hủy</button>
        </div>
    `;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const enemy = {
            name: form.enemyName.value.trim(),
            General: {
                Class: form.enemyClass.value,
                'Mô tả': form.enemyDescription.value.trim(),
                Icon: form.enemyIcon.value.trim(),
                Image: form.enemyImage.value.trim(),
                'Máu': Number(form.enemyHp.value) || 0,
                'Sát thương': Number(form.enemyDamage.value) || 0,
                'Trọng-lượng': Number(form.enemyWeight.value) || 0,
                'Hạng': form.enemyRank.value.trim(),
            },
            'Bộ sửa đổi có điều kiện': parseKeyValueList(form.enemyConditionalModifiers.value),
            'Bộ nhân Radiance': parseKeyValueList(form.enemyRadianceMultipliers.value),
            'Xuất hiện': parseKeyValueList(form.enemyAppearance.value)
        };

        // Gửi dữ liệu đến server
        fetch('/add-enemy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enemy)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Đã thêm kẻ địch thành công!');
                container.innerHTML = '';
                // Reload page để cập nhật danh sách kẻ địch
                location.reload();
            } else {
                alert('Lỗi: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('Lỗi khi thêm kẻ địch. Kiểm tra console.');
        });
    });

    form.querySelector('#enemy-form-cancel').addEventListener('click', () => {
        container.innerHTML = '';
    });

    container.appendChild(form);
}


const addEnemyButton = document.getElementById('addEnemy');
if (addEnemyButton) {
    addEnemyButton.addEventListener('click', AddEnemyFiller);
}

// Example usage for weapons:
GetWeaponData().then(weapons => {
    renderWeaponCards('.weapons', weapons);
}).catch(error => {
    console.error('Failed to render weapon cards:', error);
});
GetWeaponData('piercer revolver').then(data => console.log(data));

const fs = require('fs');
const path = require('path');

// Đường dẫn đến file enemy.json
const enemyFilePath = path.join(__dirname, 'access', 'json', 'enemy.json');

// Dữ liệu kẻ địch mới (thay thế bằng dữ liệu từ form)
const newEnemy = {
    name: 'New Enemy From Form',
    General: {
        Class: 'Lesser Husk',
        'Mô tả': 'Mô tả từ form',
        Icon: 'access/img/icon.webp',
        Image: 'access/img/image.webp',
        'Máu': 100,
        'Sát thương': 20,
        'Trọng lượng': 50,
        'Hạng': 'A'
    },
    'Bộ sửa đổi có điều kiện': ['Điều kiện 1', 'Điều kiện 2'],
    'Bộ nhân Radiance': ['Radiance 1', 'Radiance 2'],
    'Xuất hiện': ['Vị trí 1', 'Vị trí 2']
};

// Đọc file JSON hiện tại
fs.readFile(enemyFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Lỗi đọc file:', err);
        return;
    }

    let enemies;
    try {
        enemies = JSON.parse(data);
    } catch (parseErr) {
        console.error('Lỗi parse JSON:', parseErr);
        return;
    }

    // Thêm kẻ địch mới
    enemies[newEnemy.name] = {
        General: newEnemy.General,
        'Bộ sửa đổi có điều kiện': newEnemy['Bộ sửa đổi có điều kiện'],
        'Bộ nhân Radiance': newEnemy['Bộ nhân Radiance'],
        'Xuất hiện': newEnemy['Xuất hiện']
    };

    // Ghi lại file
    fs.writeFile(enemyFilePath, JSON.stringify(enemies, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
            console.error('Lỗi ghi file:', writeErr);
            return;
        }
        console.log('Đã thêm kẻ địch mới vào enemy.json');
    });
});