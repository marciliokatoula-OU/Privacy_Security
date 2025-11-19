// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabs = document.querySelectorAll('.tab');
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.remove('active'));
    tabs.forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`#tab-${target}`).classList.add('active');
    if (target === 'vault') loadVault();
  });
});

// Generator
const generateBtn = document.getElementById('generate');
const lengthInput = document.getElementById('length');
const output = document.getElementById('generated');
const copyBtn = document.getElementById('copy');

if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    const len = parseInt(lengthInput.value || '12', 10);
    try {
      const res = await fetch(`/api/generate?length=${encodeURIComponent(len)}`);
      const data = await res.json();
      if (data.password) output.value = data.password;
    } catch (e) {
      console.error(e);
    }
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value || '');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
    } catch {}
  });
}

// Vault: list, add, delete
const listEl = document.getElementById('vault-list');
async function loadVault() {
  try {
    const res = await fetch('/api/passwords');
    const data = await res.json();
    listEl.innerHTML = '';
    if (!Array.isArray(data) || data.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = 'No passwords yet';
      listEl.appendChild(empty);
      return;
    }
    data.forEach((row) => addItem(row));
  } catch (e) {
    console.error(e);
  }
}

function addItem(row) {
  const el = document.createElement('div');
  el.className = 'item';
  el.innerHTML = `
    <div><strong>${escapeHtml(row.site)}</strong><div class="item-meta">${new Date(row.created_at).toLocaleString()}</div></div>
    <div>${escapeHtml(row.login || '')}</div>
    <input type="text" readonly value="${escapeAttr(row.password)}" />
    <button class="btn" data-id="${row.id}">Delete</button>
  `;
  const btn = el.querySelector('button');
  btn.addEventListener('click', async () => {
    const id = btn.getAttribute('data-id');
    if (!confirm('Delete this password?')) return;
    const res = await fetch(`/api/passwords/${id}`, { method: 'DELETE' });
    if (res.ok) el.remove();
  });
  listEl.appendChild(el);
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"]+/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function escapeAttr(s) {
  return (s || '').replace(/["\\]/g, (c) => ({ '"': '&quot;', '\\': '&#92;' }[c]));
}

const form = document.getElementById('add-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const body = {
      site: formData.get('site'),
      username: formData.get('username'),
      password: formData.get('password'),
    };
    const res = await fetch('/api/passwords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      form.reset();
      loadVault();
    }
  });
}
