// ============================================================
//  NEKO GALLERY — Supabase App Logic (Cat Theme Edition)
// ============================================================

const SUPABASE_URL      = 'https://keywzgycwejmmivggaio.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qbfilopd9AvK60NIWE8M_w_3V00_8Nr';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Cat Loader Dismiss ─────────────────────────────────────
function dismissLoader() {
  const loader = document.getElementById('cat-loader');
  if (!loader) return;
  loader.classList.add('fade-out');
  setTimeout(() => loader.remove(), 520);
}

// ─── Floating Paws Animation ────────────────────────────────
function initFloatingHearts() {
  const container = document.querySelector('.floating-hearts');
  if (!container) return;

  const pawEmojis = ['🐾', '🐱', '😸', '🐾', '🐾', '😺', '🐾', '✨', '🌸'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.classList.add('heart-particle');
    el.textContent = pawEmojis[Math.floor(Math.random() * pawEmojis.length)];
    el.style.left            = Math.random() * 100 + 'vw';
    el.style.fontSize        = (0.65 + Math.random() * 1.1) + 'rem';
    el.style.animationDuration = (11 + Math.random() * 18) + 's';
    el.style.animationDelay  = (Math.random() * 14) + 's';
    container.appendChild(el);
  }
}

// ─── Toast Notifications ────────────────────────────────────
function showToast(msg, type = 'default') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('toast-container');
    document.body.appendChild(container);
  }
  const icons = { success: '😸', error: '😿', default: '🐾' };
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.innerHTML = `<span>${icons[type] || icons.default}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 320);
  }, 3500);
}

// ─── Stagger Card Animations ────────────────────────────────
function staggerCards(cards) {
  cards.forEach((card, i) => {
    card.style.animationDelay = (i * 0.07) + 's';
  });
}

// ─── Format Date ────────────────────────────────────────────
function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

// ============================================================
//  PUBLIC GALLERY  (index.html)
// ============================================================
async function initGallery() {
  initFloatingHearts();

  // Dismiss cat loader after a short delay so it plays
  setTimeout(dismissLoader, 800);

  const grid       = document.getElementById('gallery-grid');
  const countBadge = document.getElementById('photo-count');
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lb-img');
  const lbCaption  = document.getElementById('lb-caption');
  const lbClose    = document.getElementById('lb-close');

  if (!grid) return;

  grid.innerHTML = `
    <div class="loading-state">
      <span class="spinner">🐱</span>
      <p>Loading memories…</p>
    </div>`;

  const { data: photos, error } = await db
    .from('photo')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">😿</span>
        <h3>Couldn't load photos</h3>
        <p>${error.message}</p>
      </div>`;
    return;
  }

  if (countBadge) countBadge.textContent = photos.length + ' memories';

  if (!photos.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🐱</span>
        <h3>No photos yet</h3>
        <p>The gallery is waiting for purr-fect memories…</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  photos.forEach(photo => {
    const card = document.createElement('div');
    card.classList.add('photo-card');
    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${photo.image_url}" alt="${photo.title}" loading="lazy" />
        <div class="card-overlay">
          <span class="overlay-icon">🐾</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-title">${photo.title}</div>
        <div class="card-meta">🐾 ${formatDate(photo.created_at)}</div>
      </div>`;

    card.querySelector('.card-image-wrap').addEventListener('click', () => {
      lbImg.src            = photo.image_url;
      lbCaption.textContent = photo.title;
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    grid.appendChild(card);
  });

  staggerCards(grid.querySelectorAll('.photo-card'));

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  if (lbClose)  lbClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// ============================================================
//  ADMIN LOGIN  (admin.html)
// ============================================================
async function initAdminLogin() {
  initFloatingHearts();

  const { data: { session } } = await db.auth.getSession();
  if (session) { window.location.href = 'dashboard.html'; return; }

  const form    = document.getElementById('login-form');
  const alertEl = document.getElementById('login-alert');
  const btn     = document.getElementById('login-btn');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    alertEl.classList.add('hidden');
    btn.textContent = '🐾 Signing in…';
    btn.disabled = true;

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      alertEl.textContent = '😿 ' + error.message;
      alertEl.classList.remove('hidden');
      btn.textContent = '🐾 Sign In';
      btn.disabled    = false;
    } else {
      showToast('Welcome back, Admin! 😸', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 600);
    }
  });
}

// ============================================================
//  ADMIN DASHBOARD  (dashboard.html)
// ============================================================
async function initDashboard() {
  initFloatingHearts();

  const { data: { session } } = await db.auth.getSession();
  if (!session) { window.location.href = 'admin.html'; return; }

  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl) userEmailEl.textContent = session.user.email;

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await db.auth.signOut();
      window.location.href = 'admin.html';
    });
  }

  // Sidebar toggle
  const hamburger      = document.getElementById('hamburger');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('visible');
    });
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('visible');
    });
  }

  // Tab switching
  const navBtns = document.querySelectorAll('.sidebar-link[data-tab]');
  const tabs    = document.querySelectorAll('.tab-content');

  function switchTab(id) {
    tabs.forEach(t   => t.classList.toggle('hidden', t.id !== id));
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  }

  navBtns.forEach(btn => btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
  }));

  // ─ Load photos ─
  let allPhotos = [];

  async function loadPhotos() {
    const { data, error } = await db
      .from('photo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { showToast('Failed to load photos 😿', 'error'); return; }
    allPhotos = data || [];
    renderAdminGrid();
    updateStats();
  }

  function updateStats() {
    const el = document.getElementById('total-photos');
    if (el) el.textContent = allPhotos.length;
  }

  function escAttr(s) { return s.replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

  function renderAdminGrid() {
    const grid = document.getElementById('admin-photo-grid');
    if (!grid) return;

    if (!allPhotos.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light);font-weight:700">
          <div style="font-size:2.5rem;margin-bottom:0.7rem;animation:catBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) infinite alternate">🐱</div>
          <p>No photos yet. Upload your first memory!</p>
        </div>`;
      return;
    }

    grid.innerHTML = '';
    allPhotos.forEach(photo => {
      const card = document.createElement('div');
      card.classList.add('admin-photo-card');
      card.dataset.id = photo.id;
      card.innerHTML = `
        <img class="admin-card-img" src="${photo.image_url}" alt="${photo.title}" loading="lazy" />
        <div class="admin-card-body">
          <div class="admin-card-title">${photo.title}</div>
          <div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);margin-bottom:0.6rem">
            🐾 ${formatDate(photo.created_at)}
          </div>
          <button class="btn btn-danger btn-sm"
            onclick="confirmDelete('${photo.id}','${escAttr(photo.title)}','${escAttr(photo.image_url)}')">
            😿 Delete
          </button>
        </div>`;
      grid.appendChild(card);
    });

    staggerCards(grid.querySelectorAll('.admin-photo-card'));
  }

  // ─ Upload logic ─
  const dropzone     = document.getElementById('dropzone');
  const fileInput    = document.getElementById('file-input');
  const previewWrap  = document.getElementById('preview-wrap');
  const previewImg   = document.getElementById('preview-img');
  const titleInput   = document.getElementById('photo-title');
  const uploadBtn    = document.getElementById('upload-btn');
  const cancelBtn    = document.getElementById('cancel-btn');
  const progressWrap = document.getElementById('progress-wrap');
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');

  let selectedFile = null;

  function showPreview(file) {
    selectedFile = file;
    previewImg.src = URL.createObjectURL(file);
    previewWrap.classList.add('visible');
    if (!titleInput.value) {
      titleInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    }
  }

  function clearUpload() {
    selectedFile    = null;
    fileInput.value = '';
    previewImg.src  = '';
    previewWrap.classList.remove('visible');
    progressWrap.classList.remove('visible');
    titleInput.value = '';
  }

  ['dragenter','dragover'].forEach(ev => {
    dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(ev => {
    dropzone.addEventListener(ev, e => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (ev === 'drop' && e.dataTransfer.files[0]) showPreview(e.dataTransfer.files[0]);
    });
  });

  fileInput.addEventListener('change', e => { if (e.target.files[0]) showPreview(e.target.files[0]); });
  if (cancelBtn) cancelBtn.addEventListener('click', clearUpload);

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      if (!selectedFile)           { showToast('Please select a photo first 🐱', 'error'); return; }
      if (!titleInput.value.trim()) { showToast('Please add a title 🐾', 'error'); return; }

      const title = titleInput.value.trim();
      uploadBtn.disabled  = true;
      uploadBtn.textContent = '🐾 Uploading…';
      progressWrap.classList.add('visible');
      progressFill.style.width = '20%';
      progressLabel.textContent = 'Uploading to storage…';

      const ext      = selectedFile.name.split('.').pop();
      const filename = `photo_${Date.now()}.${ext}`;

      const { error: storageErr } = await db.storage
        .from('photos')
        .upload(filename, selectedFile, { upsert: false });

      if (storageErr) {
        showToast('Upload failed: ' + storageErr.message, 'error');
        uploadBtn.disabled    = false;
        uploadBtn.textContent = '🐾 Upload Photo';
        progressWrap.classList.remove('visible');
        return;
      }

      progressFill.style.width  = '70%';
      progressLabel.textContent = 'Saving to database…';

      const { data: { publicUrl } } = db.storage.from('photos').getPublicUrl(filename);

      const { error: dbErr } = await db
        .from('photo')
        .insert([{ title, image_url: publicUrl }]);

      if (dbErr) {
        showToast('DB error: ' + dbErr.message, 'error');
        uploadBtn.disabled    = false;
        uploadBtn.textContent = '🐾 Upload Photo';
        progressFill.style.width = '0%';
        return;
      }

      progressFill.style.width  = '100%';
      progressLabel.textContent = 'Purr-fect! 😸';
      showToast('Photo uploaded! 😸', 'success');

      setTimeout(() => {
        clearUpload();
        uploadBtn.disabled    = false;
        uploadBtn.textContent = '🐾 Upload Photo';
        loadPhotos();
        switchTab('tab-manage');
      }, 900);
    });
  }

  // ─ Delete logic ─
  const deleteModal   = document.getElementById('delete-modal');
  const deleteTitle   = document.getElementById('delete-photo-title');
  const confirmDelBtn = document.getElementById('confirm-delete');
  const cancelDelBtn  = document.getElementById('cancel-delete');
  let pendingDelete   = null;

  window.confirmDelete = function(id, title, imageUrl) {
    pendingDelete = { id, imageUrl };
    if (deleteTitle) deleteTitle.textContent = title;
    if (deleteModal) deleteModal.classList.remove('hidden');
  };

  if (cancelDelBtn) cancelDelBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    pendingDelete = null;
  });

  if (confirmDelBtn) {
    confirmDelBtn.addEventListener('click', async () => {
      if (!pendingDelete) return;
      deleteModal.classList.add('hidden');
      confirmDelBtn.disabled = true;

      const urlParts = pendingDelete.imageUrl.split('/photos/');
      const filename = urlParts[1];
      if (filename) await db.storage.from('photos').remove([filename]);

      const { error } = await db.from('photo').delete().eq('id', pendingDelete.id);

      if (error) {
        showToast('Delete failed: ' + error.message, 'error');
      } else {
        showToast('Photo removed 🐾', 'success');
        loadPhotos();
      }

      pendingDelete         = null;
      confirmDelBtn.disabled = false;
    });
  }

  await loadPhotos();
}

// ─── Route Detection ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('dashboard')) {
    initDashboard();
  } else if (path.includes('admin')) {
    initAdminLogin();
  } else {
    initGallery();
  }
});
