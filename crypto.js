// ============================================================
// 加密模块 — SHA-256 + 密钥管理
// ============================================================

const CRYPTO_KEY = 'life_model_admin_v2';

// 密钥SHA-256哈希
async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 检查是否已登录
function isLoggedIn() {
  return sessionStorage.getItem('life_admin_auth') === '1';
}

// 获取保存的密钥hash
function getSavedKeyHash() {
  return localStorage.getItem('life_model_key_hash') || '';
}

// 检查是否首次使用（尚未设置管理员密钥）
function needsInitialSetup() {
  return !localStorage.getItem('life_model_key_hash');
}

// 验证密钥
async function verifyKey(inputKey) {
  const hash = await sha256(inputKey + CRYPTO_KEY);
  const savedHash = getSavedKeyHash();
  if (!savedHash) return false;
  return hash === savedHash;
}

// 设置密钥
async function setKey(newKey) {
  const hash = await sha256(newKey + CRYPTO_KEY);
  localStorage.setItem('life_model_key_hash', hash);
}

// 首次设置管理员密钥
async function setupInitialKey(newKey) {
  if (newKey.length < 6) {
    return { success: false, error: '密钥长度至少6位' };
  }
  await setKey(newKey);
  sessionStorage.setItem('life_admin_auth', '1');
  sessionStorage.setItem('life_admin_login_time', new Date().toLocaleString('zh-CN'));
  return { success: true };
}

// 显示修改密钥弹窗
function showChangeKey() {
  const newKey = prompt('请输入新密钥（6位以上）：');
  if (!newKey || newKey.length < 6) {
    showToast('密钥长度至少6位');
    return;
  }
  setKey(newKey).then(() => {
    showToast('密钥已修改，请记住新密钥！');
  });
}

// 首次设置密钥表单提交
async function doSetupKey() {
  const keyEl = document.getElementById('setup-key');
  const confirmEl = document.getElementById('setup-key-confirm');
  const errorEl = document.getElementById('setup-error');
  const key = keyEl.value.trim();
  const confirm = confirmEl.value.trim();

  if (!key || key.length < 6) {
    errorEl.textContent = '密钥长度至少6位';
    errorEl.classList.add('show');
    return;
  }
  if (key !== confirm) {
    errorEl.textContent = '两次输入的密钥不一致';
    errorEl.classList.add('show');
    return;
  }

  const result = await setupInitialKey(key);
  if (result.success) {
    showToast('密钥已设置！请牢记您的密钥');
    renderAdmin();
    showPage('page-admin');
  } else {
    errorEl.textContent = result.error;
    errorEl.classList.add('show');
  }
}

// 登录
async function doLogin() {
  const keyInput = document.getElementById('login-key');
  const errorEl = document.getElementById('login-error');
  const key = keyInput.value.trim();

  if (!key) {
    errorEl.textContent = '请输入密钥';
    errorEl.classList.add('show');
    return;
  }

  const valid = await verifyKey(key);
  if (valid) {
    sessionStorage.setItem('life_admin_auth', '1');
    sessionStorage.setItem('life_admin_login_time', new Date().toLocaleString('zh-CN'));
    showToast('登录成功！');
    renderAdmin();
    showPage('page-admin');
  } else {
    errorEl.textContent = '密钥错误，请重试';
    errorEl.classList.add('show');
    keyInput.value = '';
    keyInput.focus();
  }
}

// 登出
function doLogout() {
  sessionStorage.removeItem('life_admin_auth');
  sessionStorage.removeItem('life_admin_login_time');
  showToast('已退出登录');
  goHome();
}

// 尝试进入后台
function goLogin() {
  if (isLoggedIn()) {
    renderAdmin();
    showPage('page-admin');
  } else if (needsInitialSetup()) {
    showPage('page-setup');
    document.getElementById('setup-key').value = '';
    document.getElementById('setup-key-confirm').value = '';
    document.getElementById('setup-error').classList.remove('show');
    setTimeout(() => document.getElementById('setup-key').focus(), 100);
  } else {
    showPage('page-login');
    document.getElementById('login-key').value = '';
    document.getElementById('login-error').classList.remove('show');
    setTimeout(() => document.getElementById('login-key').focus(), 100);
  }
}

// 数据加密存储（可选增强版）
function encryptData(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return JSON.stringify(data);
  }
}

function decryptData(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch {
    return [];
  }
}
