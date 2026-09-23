// Login + Register form validation (client-side)

function showError(field, msg) {
  const el = document.querySelector(`.error-msg[data-for="${field}"]`);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ---------- LOGIN ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // Password visibility toggle
  const togglePwd = document.getElementById('togglePwd');
  const pwdInput = document.getElementById('password');
  togglePwd?.addEventListener('click', () => {
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    togglePwd.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
    togglePwd.textContent = isPwd ? '🙈' : '👁️';
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    let ok = true;

    if (!email)         { showError('email', 'Email is required'); ok = false; }
    else if (!isEmail(email)) { showError('email', 'Enter a valid email'); ok = false; }

    if (!password)      { showError('password', 'Password is required'); ok = false; }
    else if (password.length < 6) { showError('password', 'Password must be 6+ chars'); ok = false; }

    if (!ok) return;

    // TODO: Phase 4 — replace with real API call
    const success = document.getElementById('formSuccess');
    success.textContent = '✅ Login successful! Redirecting...';
    success.classList.remove('hidden');
    showToast('Logged in successfully', 'success');

    setTimeout(() => (window.location.href = 'dashboard.html'), 1000);
  });
}

// ---------- REGISTER ----------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirm = registerForm.confirmPassword.value;
    const terms = document.getElementById('terms').checked;
    let ok = true;

    if (!name) { showError('name', 'Name is required'); ok = false; }
    else if (name.length < 2) { showError('name', 'Name too short'); ok = false; }

    if (!email) { showError('email', 'Email is required'); ok = false; }
    else if (!isEmail(email)) { showError('email', 'Enter a valid email'); ok = false; }

    if (!password) { showError('password', 'Password is required'); ok = false; }
    else if (password.length < 6) { showError('password', 'Password must be 6+ chars'); ok = false; }

    if (password !== confirm) { showError('confirmPassword', 'Passwords do not match'); ok = false; }
    if (!terms) { showError('terms', 'Please accept terms'); ok = false; }

    if (!ok) return;

    const success = document.getElementById('formSuccess');
    success.textContent = '✅ Account created! Redirecting to login...';
    success.classList.remove('hidden');
    showToast('Account created', 'success');

    setTimeout(() => (window.location.href = 'login.html'), 1200);
  });
}