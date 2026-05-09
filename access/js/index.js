document.querySelectorAll('.game-carousel').forEach(carousel => {
  const track = carousel.querySelector('.game-grid');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');

  if (!track || !prevBtn || !nextBtn) return;

  const scrollStep = () => Math.round(track.clientWidth * 0.8);

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  });

  track.addEventListener('wheel', (event) => {
    if (event.deltaY === 0) return;
    event.preventDefault();
    track.scrollBy({ left: event.deltaY, behavior: 'smooth' });
  }, { passive: false });

  const updateButtons = () => {
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };

  track.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();
});

// Add event listeners for logo and account
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  const account = document.querySelector('.account');

  const isHtmlSubpage = window.location.pathname.includes('/access/html/');
  const navLinks = document.querySelectorAll('.navbar .nav__link');

  navLinks.forEach(link => {
    const text = link.textContent.trim();
    if (text === 'Trang chủ') {
      link.href = isHtmlSubpage ? '../../index.html' : 'index.html';
    }
    if (text === 'Kẻ địch') {
      link.href = isHtmlSubpage ? 'enemy.html' : 'access/html/enemy.html';
    }
    if (text === 'Vũ khí') {
      link.href = isHtmlSubpage ? 'weapon.html' : 'access/html/weapon.html';
    }
  });

  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = isHtmlSubpage ? '../../index.html' : 'index.html';
      });
  }

  if (account) {
    account.addEventListener('click', () => {
      const profileHref = isHtmlSubpage ? 'profile.html' : 'access/html/profile.html';
      window.location.href = profileHref;
    });
  }
});

// index.js - Dùng chung cho tất cả các trang
document.addEventListener('DOMContentLoaded', () => {
    const USERS_KEY = 'favgames_users';
    const SESSION_KEY = 'favgames_current_user';

    // 1. Lấy email người dùng từ session
    const currentEmail = localStorage.getItem(SESSION_KEY);

    // 2. Lấy data người dùng từ danh sách users
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = currentEmail ? users.find(u => u.email.toLowerCase() === currentEmail.toLowerCase()) : null;

    if (user) {
        // Cập nhật Username ở Header (ID: Username)
        const headerName = document.getElementById('Username');
        if (headerName) {
            headerName.textContent = user.name;
        }

        // Cập nhật Avatar ở Header (Class: account__avatar)
        const headerAvatar = document.querySelector('.account__avatar');
        if (headerAvatar) {
            headerAvatar.src = user.avatar || '../img/ryou yamada avatar.jpg';
            
            // Xử lý nếu link ảnh từ Wiki bị lỗi
            headerAvatar.onerror = function() {
                this.src = '../img/ryou yamada avatar.jpg'; // Ảnh dự phòng
                console.warn("Link ảnh lỗi, đã chuyển về ảnh mặc định.");
            };
        }
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');

    function getUsers() {
        const raw = localStorage.getItem('favgames_users');
        return raw ? JSON.parse(raw) : [];
    }

    function saveUsers(users) {
        localStorage.setItem('favgames_users', JSON.stringify(users));
    }

    function showMessage(element, text, isError = true) {
        if (!element) return;
        element.textContent = text;
        element.style.color = isError ? '#d43131' : '#1b8f4e';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const users = getUsers();
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                showMessage(loginMessage, 'Email không tồn tại. Vui lòng đăng ký trước.', true);
                return;
            }

            if (user.password !== password) {
                showMessage(loginMessage, 'Sai mật khẩu. Vui lòng thử lại.', true);
                return;
            }

            localStorage.setItem('favgames_current_user', user.email);
            showMessage(loginMessage, 'Đăng nhập thành công!', false);

            const redirect = window.location.pathname.includes('/access/html/') ? '../../index.html' : 'index.html';
            window.location.href = redirect;
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const users = getUsers();

            if (password !== confirmPassword) {
                showMessage(signupMessage, 'Mật khẩu xác nhận không khớp.', true);
                return;
            }

            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                showMessage(signupMessage, 'Email này đã được sử dụng.', true);
                return;
            }

            users.push({
                name,
                email,
                password,
                joinedAt: new Date().toLocaleDateString(),
                avatar: '../img/ryou yamada avatar.jpg',
            });
            saveUsers(users);
            showMessage(signupMessage, 'Đăng ký thành công! Chuyển sang trang đăng nhập...', false);

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        });
    }
});
