const USERS_KEY = 'favgames_users';
const SESSION_KEY = 'favgames_current_user';

// --- HÀM TRUY XUẤT DỮ LIỆU ---
function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserEmail() {
  return localStorage.getItem(SESSION_KEY);
}

function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

function findUserByEmail(email) {
  return getUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
}

function buildHandle(name) {
  return `@${name.trim().toLowerCase().replace(/\s+/g, '')}`;
}

// --- HÀM CẬP NHẬT GIAO DIỆN ---
function renderProfile(user) {
  const nameEl = document.getElementById('profile-name');
  const handleEl = document.getElementById('profile-handle');
  const descriptionEl = document.getElementById('profile-description');
  const joinedEl = document.getElementById('profile-joined');
  const emailEl = document.getElementById('profile-email');
  const avatarEl = document.getElementById('profile-avatar');

  // Cập nhật thông tin cơ bản
  if (nameEl) nameEl.textContent = user.name;
  if (handleEl) handleEl.textContent = user.handle || buildHandle(user.name);
  if (descriptionEl) descriptionEl.textContent = user.description || 'A passionate player exploring a dynamic library of games.';
  if (joinedEl) joinedEl.textContent = user.joinedAt || 'Unknown';
  if (emailEl) emailEl.textContent = user.email;
  
  // Cập nhật Avatar từ biến avatar trong localStorage
  if (avatarEl) {
    avatarEl.src = user.avatar || '../img/ryou yamada avatar.jpg';
    avatarEl.alt = `${user.name} avatar`;
  }
}

// --- LOGIC XỬ LÝ DỮ LIỆU ---
function updateUserInfo(email, newData) {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (index !== -1) {
    // Lấy dữ liệu cũ làm gốc, sau đó ghi đè newData lên
    const updatedUser = { ...users[index], ...newData };
    
    // Nếu newData không có password (người dùng để trống ô nhập), giữ lại pass cũ
    if (!newData.password) {
      updatedUser.password = users[index].password;
    }
    
    // Cập nhật lại handle dựa trên tên mới
    updatedUser.handle = buildHandle(newData.name);
    
    // Lưu vào mảng
    users[index] = updatedUser;
    saveUsers(users);
    return true;
  }
  return false;
}

function handleProfilePage() {
  const currentEmail = getCurrentUserEmail();
  if (!currentEmail) {
    window.location.href = 'login.html';
    return;
  }

  const user = findUserByEmail(currentEmail);
  if (!user) {
    clearCurrentUser();
    window.location.href = 'login.html';
    return;
  }

  // Hiển thị dữ liệu ban đầu
  renderProfile(user);
  renderWeaponCards('favourite-weapons-grid', user.favouriteWeapons || []);
  renderWeaponCards('awful-at-weapons-grid', user.awfulAtWeapons || []);

  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-profile-form');
  const editBtn = document.getElementById('edit-profile-button');
  const closeModalBtn = document.getElementById('close-modal');

  // 1. Mở Modal và đổ dữ liệu cũ vào form
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('edit-name').value = user.name;
      document.getElementById('edit-description').value = user.description || '';
      document.getElementById('edit-avatar').value = user.avatar || '';
      document.getElementById('edit-password').value = ''; // Để trống ô pass
      editModal.style.display = 'flex';
    });
  }

  // 2. Đóng Modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      editModal.style.display = 'none';
    });
  }

  // 3. Xử lý khi nhấn "Save Changes"
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newPassword = document.getElementById('edit-password').value;
      const newData = {
        name: document.getElementById('edit-name').value.trim(),
        description: document.getElementById('edit-description').value.trim(),
        avatar: document.getElementById('edit-avatar').value.trim()
      };

      if (newPassword) {
        newData.password = newPassword;
      }

      if (updateUserInfo(user.email, newData)) {
        alert("Thông tin đã được cập nhật!");
        location.reload(); // Reload để thấy avatar và tên mới
      }
    });
  }

  // 4. Logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = 'login.html';
    });
  }

  // 5. Delete Account
  const deleteButton = document.getElementById('delete-account-button');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (confirm("Bạn có chắc chắn muốn xóa tài khoản? Mọi dữ liệu sẽ mất hết.")) {
        const users = getUsers().filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
        saveUsers(users);
        clearCurrentUser();
        window.location.href = 'signin.html';
      }
    });
  }
}

// Khởi chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
  // Điều hướng logo
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  handleProfilePage();
});

function normalizeWeaponAssetPath(assetPath) {
    if (!assetPath) return '';
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://') || assetPath.startsWith('/')) {
        return assetPath;
    }
    if (assetPath.startsWith('../') || assetPath.startsWith('./')) {
        return assetPath;
    }
    if (assetPath.startsWith('access/')) {
        return `../${assetPath.slice('access/'.length)}`;
    }
    return assetPath;
}

async function renderWeaponCards(containerId, weaponNames) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!weaponNames || weaponNames.length === 0) {
        container.innerHTML = `<div class="empty-message" style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-color-light);">Chưa có vũ khí nào được thêm vào danh sách này.</div>`;
        return;
    }

    try {
        const response = await fetch('../json/weapon.json');
        const allWeapons = await response.json();

        weaponNames.forEach(name => {
            const weapon = allWeapons.find(w => w.name === name);
            if (weapon) {
                const iconPath = normalizeWeaponAssetPath(weapon.img || weapon.img);
                const card = document.createElement('div');
                card.className = 'game-card';
                card.style.backgroundImage = `url('${iconPath}')`;
                card.innerHTML = `
                    <div class="game-card-info">
                        <h3>${weapon.name}</h3>
                        <p>${weapon.weapon_type}</p>
                    </div>
                `;
                card.onclick = () => window.location.href = `detail.html?weapon=${encodeURIComponent(weapon.name)}`;
                container.appendChild(card);
            }
        });
    } catch (e) {
        console.error("Lỗi khi tải dữ liệu vũ khí:", e);
    }
}

