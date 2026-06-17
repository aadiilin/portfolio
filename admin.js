(function(){
  'use strict';

  var PASSWORD = 'zakk2025';
  var SESSION_KEY = 'zakk_admin_session';
  var INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  var inactivityTimer = null;

  // ===== TOAST =====
  function toast(msg, type){
    type = type || 'success';
    var c = document.getElementById('toastContainer');
    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(function(){ t.classList.add('toast-out'); setTimeout(function(){ t.remove() }, 300); }, 3000);
  }
  window.toast = toast;

  // ===== LOGIN =====
  var savedPw = null;
  DB.get('settings', 'adminPassword').then(function(s){ if(s && s.value) savedPw = s.value; });

  function checkSession(){
    if (sessionStorage.getItem(SESSION_KEY) === 'true') { showApp(); return true; }
    return false;
  }
  function showApp(){
    document.getElementById('loginScreen').classList.add('hide');
    document.getElementById('app').classList.add('active');
    resetInactivityTimer();
    initAdmin();
  }
  document.getElementById('loginBtn').addEventListener('click', function(){
    var pw = document.getElementById('loginPassword').value;
    var err = document.getElementById('loginError');
    var validPw = savedPw || PASSWORD;
    if (pw === validPw) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      showApp();
      document.getElementById('loginPassword').value = '';
    } else {
      err.textContent = 'Wrong password. Please try again.';
      err.classList.remove('shake'); void err.offsetWidth; err.classList.add('shake');
      document.getElementById('loginPassword').value = '';
    }
  });
  document.getElementById('loginPassword').addEventListener('keydown', function(e){
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
  });
  document.getElementById('logoutBtn').addEventListener('click', function(){
    if (confirm('Are you sure you want to logout?')) { sessionStorage.removeItem(SESSION_KEY); location.reload(); }
  });

  // ===== INACTIVITY TIMER =====
  function resetInactivityTimer(){
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function(){ sessionStorage.removeItem(SESSION_KEY); location.reload(); }, INACTIVITY_TIMEOUT);
  }
  document.addEventListener('mousemove', resetInactivityTimer);
  document.addEventListener('keydown', resetInactivityTimer);
  document.addEventListener('click', resetInactivityTimer);

  // ===== SIDEBAR NAV =====
  document.querySelectorAll('.sidebar-item').forEach(function(item){
    item.addEventListener('click', function(){
      if (this.classList.contains('active')) return;
      document.querySelectorAll('.sidebar-item').forEach(function(s){ s.classList.remove('active'); });
      this.classList.add('active');
      document.querySelectorAll('.section-panel').forEach(function(p){ p.classList.remove('active'); });
      var panel = document.getElementById('panel-' + this.dataset.section);
      if (panel) panel.classList.add('active');
    });
  });

  // ===== EMOJI PICKER =====
  var ALL_EMOJIS = ['💍','💒','👰','🤵','🎂','🎈','🎊','🎉','🌸','🌹','🌺','💐','🌷','🍰','🥂','🕯️','✨','🌟','⭐','💫','🎀','🎁','🎗️','🎭','🎪','🏆','🥇','📸','📷','🎬','🎵','🎶','🍽️','🥘','🍾','🥳','👗','💄','💅','💎','👑','🌙','🌈','🦋','🌿','🙏','🤲','🫶','❤️','💕','💖','💗','💓','💞','💝','🤍','💛','🧡','💜','🖤','💙','💚','🏠','🏡','⛪','🌳','🌴','🌻','🌾','🌊','🎯','🎨','🖼️','🎤','🎧','💡','🔔','🧧','🏮','🧸','🎠','🎡','🛋️','💈','🧵','📿','💈','🪷','🌼'];

  function showEmojiPicker(inputEl, callback){
    var existing = document.getElementById('emojiPicker');
    if (existing) existing.remove();
    var picker = document.createElement('div');
    picker.id = 'emojiPicker';
    picker.style.cssText = 'position:fixed;z-index:10000;background:#1e1e1e;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1rem;width:360px;max-height:400px;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5);';
    var rect = inputEl.getBoundingClientRect();
    picker.style.top = (rect.bottom + 8) + 'px';
    picker.style.left = Math.min(rect.left, window.innerWidth - 380) + 'px';

    var search = document.createElement('input');
    search.placeholder = '🔍 Search emoji...';
    search.style.cssText = 'width:100%;padding:.6rem;background:#0f0f0f;border:1px solid rgba(255,255,255,.06);border-radius:8px;color:#f5f5f5;font-size:.8rem;margin-bottom:.8rem;box-sizing:border-box;outline:none';
    picker.appendChild(search);

    var kbBtn = document.createElement('button');
    kbBtn.textContent = '⌨️ Type emoji from keyboard';
    kbBtn.style.cssText = 'width:100%;padding:.5rem;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.1);border-radius:8px;color:#888;font-size:.75rem;cursor:pointer;margin-bottom:.8rem;transition:all .2s';
    kbBtn.onmouseover = function(){ this.style.borderColor = '#c9a227'; this.style.color = '#c9a227'; };
    kbBtn.onmouseout = function(){ this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#888'; };
    kbBtn.onclick = function(){
      picker.innerHTML = '';
      picker.style.width = '300px';
      picker.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem;"><span style="color:#f5f5f5;font-size:.85rem;font-weight:600;">Type any emoji</span><button onclick="document.getElementById(\'emojiPicker\').remove()" style="background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer">✕</button></div><input id="emojiManualInput" placeholder="Paste emoji from keyboard..." style="width:100%;padding:.8rem;background:#0f0f0f;border:1px solid rgba(255,255,255,.06);border-radius:8px;color:#f5f5f5;font-size:1.2rem;text-align:center;box-sizing:border-box;outline:none"/><button onclick="var v=document.getElementById(\'emojiManualInput\').value;if(v){document.getElementById(\'emojiPicker\').remove();window._emojiCallback&&window._emojiCallback(v)}" style="width:100%;margin-top:.6rem;padding:.7rem;background:#c9a227;color:#080808;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.8rem">Apply</button>';
      document.getElementById('emojiManualInput').focus();
    };
    picker.appendChild(kbBtn);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(8,1fr);gap:4px;';
    ALL_EMOJIS.forEach(function(e){
      var el = document.createElement('span');
      el.textContent = e;
      el.style.cssText = 'text-align:center;padding:6px 2px;font-size:1.4rem;cursor:pointer;border-radius:8px;transition:background .15s';
      el.onmouseover = function(){ this.style.background = 'rgba(255,255,255,.06)'; };
      el.onmouseout = function(){ this.style.background = ''; };
      el.onclick = function(){ picker.remove(); callback(e); };
      grid.appendChild(el);
    });
    picker.appendChild(grid);

    search.addEventListener('input', function(){
      var q = this.value.toLowerCase();
      grid.querySelectorAll('span').forEach(function(el){
        el.style.display = el.textContent.toLowerCase().includes(q) ? 'block' : 'none';
      });
    });

    document.body.appendChild(picker);
    window._emojiCallback = callback;
    setTimeout(function(){
      document.addEventListener('click', function closePicker(e){
        if (!document.getElementById('emojiPicker')) { document.removeEventListener('click', closePicker); return; }
        if (!document.getElementById('emojiPicker').contains(e.target) && e.target !== inputEl) {
          document.getElementById('emojiPicker').remove();
          document.removeEventListener('click', closePicker);
        }
      });
    }, 50);
  }

  // ===== INIT ADMIN =====
  var currentCategory = 'all';
  var _categories = [];
  var _photos = [];

  async function initAdmin(){
    await DB.initDefaults();
    await loadAll();
  }

  async function loadAll(){
    _categories = await DB.getAll('categories');
    _photos = await DB.getAll('photos');
    renderGallery();
    renderCategoryTabs();
    loadHeroPreview();
    loadBusinessInfo();
    renderTestimonials();
    renderServices();
    renderPages();
    updateStats();
  }

  // ===== GALLERY & CATEGORIES =====
  function renderCategoryTabs(){
    var container = document.getElementById('catTabs');
    var html = '<span class="cat-tab' + (currentCategory === 'all' ? ' active' : '') + '" onclick="switchCategory(\'all\')">All <span class="cat-badge">' + _photos.length + '</span></span>';
    _categories.forEach(function(c){
      var count = _photos.filter(function(p){ return p.categoryId === c.id; }).length;
      html += '<span class="cat-tab' + (currentCategory === c.id ? ' active' : '') + '" onclick="switchCategory(\'' + c.id + '\')" style="--cat-color:' + c.color + '">' + c.emoji + ' ' + c.name + ' <span class="cat-badge">' + count + '</span></span>';
    });
    container.innerHTML = html;
  }

  window.switchCategory = function(id){
    currentCategory = id;
    document.querySelectorAll('.cat-tab').forEach(function(t){
      t.classList.toggle('active', t.textContent.trim().includes(id === 'all' ? 'All' : id));
    });
    renderGallery();
  };

  // Category management
  window.openCategoryModal = function(editId){
    var isEdit = !!editId;
    var data = isEdit ? _categories.find(function(c){ return c.id === editId; }) : { emoji: '📁', name: '', color: '#c9a227' };
    var m = document.getElementById('modalContent');
    m.innerHTML = '<button class="modal-close" onclick="closeModal()">✕</button><div class="modal-title">' + (isEdit ? 'Edit Category' : 'New Category') + '</div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Emoji</label><div id="catEmojiDisplay" style="font-size:2.5rem;text-align:center;padding:.5rem;cursor:pointer;border:1px solid rgba(255,255,255,.06);border-radius:8px;background:#0f0f0f;margin-bottom:.5rem">' + data.emoji + '</div></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Category Name</label><input class="form-input" id="catName" value="' + data.name + '" /></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Accent Color</label><input type="color" id="catColor" value="' + data.color + '" style="width:100%;height:40px;border:none;border-radius:8px;background:transparent;cursor:pointer" /></div>';
    m.innerHTML += '<button class="btn-gold" onclick="saveCategory(\'' + (editId || '') + '\')">' + (isEdit ? 'Save Changes' : 'Create Category') + '</button>';
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('catEmojiDisplay').onclick = function(){
      showEmojiPicker(this, function(e){ document.getElementById('catEmojiDisplay').textContent = e; });
    };
  };

  window.saveCategory = async function(editId){
    var emoji = document.getElementById('catEmojiDisplay').textContent;
    var name = document.getElementById('catName').value.trim();
    var color = document.getElementById('catColor').value;
    if (!name) { toast('❌ Please enter a category name.', 'error'); return; }
    if (editId) {
      var cat = _categories.find(function(c){ return c.id === editId; });
      cat.emoji = emoji; cat.name = name; cat.color = color;
      await DB.put('categories', cat);
      toast('✅ Category updated!', 'success');
    } else {
      var maxOrder = _categories.reduce(function(m, c){ return Math.max(m, c.order || 0); }, -1);
      await DB.put('categories', { id: DB.genId(), emoji: emoji, name: name, color: color, order: maxOrder + 1 });
      toast('✅ Category created!', 'success');
    }
    closeModal();
    _categories = await DB.getAll('categories');
    renderCategoryTabs();
  };

  window.deleteCategory = async function(id){
    if (!confirm('Delete this category? Photos will move to Uncategorized.')) return;
    _photos.forEach(function(p){
      if (p.categoryId === id) { p.categoryId = ''; DB.put('photos', p); }
    });
    await DB.del('categories', id);
    _categories = await DB.getAll('categories');
    _photos = await DB.getAll('photos');
    if (currentCategory === id) currentCategory = 'all';
    renderCategoryTabs();
    renderGallery();
  };

  async function renderGallery(){
    var grid = document.getElementById('galleryGrid');
    var filtered = currentCategory === 'all' ? _photos : _photos.filter(function(p){ return p.categoryId === currentCategory; });
    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color:#888;font-size:.8rem;grid-column:1/-1;text-align:center;padding:2rem;">' + (currentCategory === 'all' ? 'No photos yet. Upload above!' : 'No photos in this category.') + '</p>';
      return;
    }
    grid.innerHTML = filtered.map(function(p, i){
      return '<div class="gallery-card">'
        + '<div class="gc-img" onclick="openPhotoLightbox(\'' + p.id + '\')"><img src="' + p.url + '" alt="' + (p.caption || 'Photo') + '" /></div>'
        + '<div class="gc-info">'
        + '<span class="gc-caption">' + (p.caption || 'No caption') + '</span>'
        + '<div class="gc-actions">'
        + '<button class="btn-small btn-edit" onclick="editPhotoCaption(\'' + p.id + '\')" title="Edit caption">✏️</button>'
        + '<button class="btn-small btn-edit" onclick="movePhoto(\'' + p.id + '\')" title="Move category">📁</button>'
        + '<button class="btn-small btn-del" onclick="deletePhoto(\'' + p.id + '\')" title="Delete">🗑️</button>'
        + '</div></div></div>';
    }).join('');
  }

  window.editPhotoCaption = async function(id){
    var photo = _photos.find(function(p){ return p.id === id; });
    if (!photo) return;
    var newCap = prompt('Edit caption:', photo.caption || '');
    if (newCap !== null) { photo.caption = newCap; await DB.put('photos', photo); renderGallery(); toast('✅ Caption updated!', 'success'); }
  };

  window.movePhoto = async function(id){
    var photo = _photos.find(function(p){ return p.id === id; });
    if (!photo) return;
    var opts = _categories.map(function(c){ return c.emoji + ' ' + c.name; }).join('\n');
    var choice = prompt('Move to which category?\n\n' + opts + '\n\nEnter category name:', _categories.find(function(c){ return c.id === photo.categoryId; }) ? _categories.find(function(c){ return c.id === photo.categoryId; }).name : '');
    if (choice) {
      var cat = _categories.find(function(c){ return c.name.toLowerCase() === choice.trim().toLowerCase(); });
      if (cat) { photo.categoryId = cat.id; await DB.put('photos', photo); _photos = await DB.getAll('photos'); renderGallery(); renderCategoryTabs(); toast('✅ Moved to ' + cat.name + '!', 'success'); }
      else toast('❌ Category not found.', 'error');
    }
  };

  window.deletePhoto = async function(id){
    if (!confirm('Delete this photo?')) return;
    await DB.del('photos', id);
    _photos = await DB.getAll('photos');
    renderGallery();
    renderCategoryTabs();
    updateStats();
    toast('🗑️ Deleted.', 'info');
  };

  window.openPhotoLightbox = function(id){
    var photo = _photos.find(function(p){ return p.id === id; });
    if (!photo) return;
    var cat = _categories.find(function(c){ return c.id === photo.categoryId; });
    var el = document.getElementById('lightbox');
    el.innerHTML = '<span class="lb-close" onclick="closeLightbox()">✕</span>'
      + '<div class="lb-content"><img src="' + photo.url + '" alt="' + (photo.caption || 'Photo') + '" class="lb-img"/>'
      + '<div class="lb-info"><div class="lb-caption">' + (photo.caption || 'No caption') + '</div>'
      + '<div class="lb-category">' + (cat ? cat.emoji + ' ' + cat.name : '') + '</div></div></div>'
      + '<div class="lb-nav">'
      + '<button class="lb-arr" onclick="navLightbox(-1)">‹</button>'
      + '<button class="lb-arr" onclick="navLightbox(1)">›</button></div>';
    el.classList.add('open');
    window._lbPhotos = _photos;
    window._lbIdx = _photos.indexOf(photo);
  };

  window.navLightbox = function(dir){
    if (!window._lbPhotos || window._lbPhotos.length === 0) return;
    window._lbIdx = (window._lbIdx + dir + window._lbPhotos.length) % window._lbPhotos.length;
    var photo = window._lbPhotos[window._lbIdx];
    var cat = _categories.find(function(c){ return c.id === photo.categoryId; });
    var el = document.getElementById('lightbox');
    el.querySelector('.lb-img').src = photo.url;
    el.querySelector('.lb-caption').textContent = photo.caption || 'No caption';
    el.querySelector('.lb-category').textContent = cat ? cat.emoji + ' ' + cat.name : '';
  };

  window.closeLightbox = function(){ document.getElementById('lightbox').classList.remove('open'); window._lbPhotos = null; };

  // Upload
  var dz = document.getElementById('dropzone');
  dz.addEventListener('click', function(){ document.getElementById('fileInput').click(); });
  dz.addEventListener('dragover', function(e){ e.preventDefault(); this.classList.add('dragover'); });
  dz.addEventListener('dragleave', function(){ this.classList.remove('dragover'); });
  dz.addEventListener('drop', function(e){ e.preventDefault(); this.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
  document.getElementById('fileInput').addEventListener('change', function(){ handleFiles(this.files); this.value = ''; });

  async function handleFiles(files){
    if (!files.length) return;
    var bar = document.getElementById('progressBar');
    var fill = document.getElementById('progressFill');
    bar.style.display = 'block';
    var total = files.length;
    for (var i = 0; i < total; i++) {
      fill.style.width = Math.round((i / total) * 100) + '%';
      try {
        var dataUrl = await DB.compressImage(files[i], 200);
        var photo = { id: DB.genId(), url: dataUrl, caption: files[i].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), categoryId: _categories.length > 0 ? _categories[0].id : '', order: Date.now(), createdAt: new Date().toISOString() };
        await DB.put('photos', photo);
      } catch(e) { toast('❌ ' + files[i].name + ': ' + e.message, 'error'); }
    }
    fill.style.width = '100%';
    _photos = await DB.getAll('photos');
    renderGallery();
    renderCategoryTabs();
    updateStats();
    setTimeout(function(){
      bar.style.display = 'none';
      toast('✅ ' + total + ' photos uploaded with compression!', 'success');
    }, 300);
  }

  // ===== HERO =====
  function loadHeroPreview(){
    var el = document.getElementById('heroPreview');
    DB.getSettings().then(function(s){
      if (s.hero_url) el.innerHTML = '<img src="' + s.hero_url + '" alt="Hero" style="width:100%;height:100%;object-fit:cover" />';
      else el.innerHTML = '<span class="hero-preview-placeholder">No custom hero photo set. Default gradient is used.</span>';
    });
  }

  document.getElementById('heroInput').addEventListener('change', async function(){
    var file = this.files[0]; if (!file) return;
    try {
      var url = await DB.compressImage(file, 300);
      await DB.saveSetting('hero_url', url);
      loadHeroPreview();
      toast('✅ Hero photo updated!', 'success');
    } catch(e) { toast('❌ ' + e.message, 'error'); }
    this.value = '';
  });

  window.resetHero = async function(){
    if (confirm('Reset hero to default gradient?')) {
      await DB.saveSetting('hero_url', '');
      loadHeroPreview();
      toast('ℹ️ Hero photo reset.', 'info');
    }
  };

  // ===== BUSINESS INFO =====
  function loadBusinessInfo(){
    DB.getSettings().then(function(s){
      document.getElementById('f_bizName').value = s.business_name || '';
      document.getElementById('f_phone').value = s.phone || '';
      document.getElementById('f_whatsapp').value = s.whatsapp || '';
      document.getElementById('f_email').value = s.email || '';
      document.getElementById('f_location').value = s.location || '';
      document.getElementById('f_instagram').value = s.instagram || '';
      document.getElementById('f_tagline').value = s.tagline_en || '';
      document.getElementById('f_taglineMl').value = s.tagline_ml || '';
      document.getElementById('f_about').value = s.about_text || '';
    });
  }

  window.saveBusinessInfo = async function(){
    var fields = { business_name: 'f_bizName', phone: 'f_phone', whatsapp: 'f_whatsapp', email: 'f_email', location: 'f_location', instagram: 'f_instagram', tagline_en: 'f_tagline', tagline_ml: 'f_taglineMl', about_text: 'f_about' };
    for (var key in fields) await DB.saveSetting(key, document.getElementById(fields[key]).value.trim());
    var phone = document.getElementById('f_phone').value.trim();
    var wa = document.getElementById('f_whatsapp').value.trim();
    var ig = document.getElementById('f_instagram').value.trim();
    await DB.saveSetting('phone_url', phone ? 'tel:+91' + phone.replace(/[^0-9]/g, '') : '');
    await DB.saveSetting('whatsapp_url', wa ? 'https://wa.me/' + wa.replace(/[^0-9]/g, '') : '');
    await DB.saveSetting('instagram_url', ig ? 'https://www.instagram.com/' + ig.replace(/^@/, '') + '/' : '');
    toast('✅ Business info saved!', 'success');
  };

  // ===== TESTIMONIALS =====
  var _testimonials = [];
  async function renderTestimonials(){
    _testimonials = await DB.getAll('testimonials');
    var list = document.getElementById('testimonialList');
    if (_testimonials.length === 0) { list.innerHTML = '<p style="color:#888;font-size:.8rem;text-align:center;padding:1rem;">No reviews yet.</p>'; return; }
    list.innerHTML = _testimonials.map(function(t, i){
      var stars = ''; for (var s = 0; s < (t.rating || 5); s++) stars += '★';
      return '<div class="testimonial-item"><div class="testimonial-text"><div class="testimonial-quote">"' + t.quote + '"</div><div class="testimonial-meta">— ' + t.author + ' • ' + (t.eventType || '') + (t.location ? ', ' + t.location : '') + ' ' + stars + '</div></div><div style="display:flex;gap:.3rem;flex-shrink:0;"><button class="btn-small btn-edit" onclick="editTestimonial(' + i + ')">✏️</button><button class="btn-small btn-del" onclick="deleteTestimonial(' + i + ')">🗑️</button></div></div>';
    }).join('');
  }

  window.deleteTestimonial = async function(i){
    if (!confirm('Delete?')) return;
    await DB.del('testimonials', _testimonials[i].id);
    renderTestimonials();
    updateStats();
  };

  window.openTestimonialModal = function(idx){
    idx = (idx !== undefined && idx !== null) ? idx : -1;
    var data = idx >= 0 ? _testimonials[idx] : { quote: '', author: '', eventType: 'Wedding', location: '', rating: 5 };
    var m = document.getElementById('modalContent');
    m.innerHTML = '<button class="modal-close" onclick="closeModal()">✕</button><div class="modal-title">' + (idx >= 0 ? 'Edit Review' : 'New Review') + '</div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Customer Name</label><input class="form-input" id="m_author" value="' + (data.author || '') + '" /></div>';
    var types = ['Wedding','Birthday','Engagement','Bridal','Corporate','Other'];
    m.innerHTML += '<div class="form-group"><label class="form-label">Event Type</label><select class="form-input" id="m_type">' + types.map(function(t){ return '<option value="' + t + '"' + (t === (data.eventType || '') ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Location</label><input class="form-input" id="m_loc" value="' + (data.location || '') + '" /></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Review</label><textarea class="form-textarea" id="m_quote" rows="3">' + (data.quote || '') + '</textarea></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Rating</label><div class="star-rating" id="m_rating">';
    for (var s = 1; s <= 5; s++) m.innerHTML += '<span data-star="' + s + '" class="' + (s <= (data.rating || 5) ? 'active' : '') + '">★</span>';
    m.innerHTML += '</div></div><button class="btn-gold" onclick="saveTestimonial(' + idx + ')">Save</button>';
    document.getElementById('modalOverlay').classList.add('open');
    setTimeout(function(){
      document.querySelectorAll('#m_rating span').forEach(function(s){
        s.addEventListener('click', function(){
          var v = parseInt(this.dataset.star);
          document.querySelectorAll('#m_rating span').forEach(function(sp, i){ sp.classList.toggle('active', i < v); });
        });
      });
    }, 50);
  };

  window.saveTestimonial = async function(idx){
    var quote = document.getElementById('m_quote').value.trim();
    var author = document.getElementById('m_author').value.trim();
    if (!quote || !author) { toast('❌ Fill in name and review.', 'error'); return; }
    var data = { quote: quote, author: author, eventType: document.getElementById('m_type').value, location: document.getElementById('m_loc').value.trim(), rating: document.querySelectorAll('#m_rating span.active').length };
    if (idx >= 0) { data.id = _testimonials[idx].id; await DB.put('testimonials', data); toast('✅ Updated!', 'success'); }
    else { data.id = DB.genId(); await DB.put('testimonials', data); toast('✅ Added!', 'success'); }
    closeModal();
    renderTestimonials();
    updateStats();
  };
  window.editTestimonial = function(i){ window.openTestimonialModal(i); };

  // ===== SERVICES =====
  var _services = [];
  async function renderServices(){
    _services = await DB.getAll('services');
    var list = document.getElementById('serviceList');
    if (_services.length === 0) { list.innerHTML = '<p style="color:#888;font-size:.8rem;text-align:center;padding:1rem;">No services yet.</p>'; return; }
    list.innerHTML = _services.map(function(s, i){
      return '<div class="service-row"><span class="service-row-icon">' + (s.emoji || '💒') + '</span><div class="service-row-info"><div class="service-row-name">' + s.name + '</div><div class="service-row-desc">' + (s.description || '') + '</div></div><label class="toggle"><input type="checkbox" ' + (s.active !== false ? 'checked' : '') + ' onchange="toggleService(\'' + s.id + '\',this.checked)" /><span class="toggle-slider"></span></label><button class="btn-small btn-edit" onclick="editService(' + i + ')">✏️</button></div>';
    }).join('');
  }

  window.toggleService = async function(id, v){
    var s = _services.find(function(x){ return x.id === id; });
    if (s) { s.active = v; await DB.put('services', s); updateStats(); }
  };

  window.editService = function(i){
    var data = _services[i];
    var m = document.getElementById('modalContent');
    var emojis = ['💒','💍','👗','💄','🌿','🎂','🔊','🎁','🍽️','📸','🎈','🌸','🎉','🕯️','🎊','💐','🌟','✨','🎵','🍾'];
    m.innerHTML = '<button class="modal-close" onclick="closeModal()">✕</button><div class="modal-title">Edit Service</div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Emoji</label><div id="svcEmojiDisplay" style="font-size:2.5rem;text-align:center;padding:.5rem;cursor:pointer;border:1px solid rgba(255,255,255,.06);border-radius:8px;background:#0f0f0f;margin-bottom:.5rem">' + data.emoji + '</div></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="m_svcName" value="' + (data.name || '') + '" /></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="m_svcDesc" rows="2">' + (data.description || '') + '</textarea></div>';
    m.innerHTML += '<button class="btn-gold" onclick="saveService(' + i + ')">Save</button>';
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('svcEmojiDisplay').onclick = function(){
      showEmojiPicker(this, function(e){ document.getElementById('svcEmojiDisplay').textContent = e; });
    };
  };

  window.saveService = async function(i){
    var emoji = document.getElementById('svcEmojiDisplay').textContent;
    var name = document.getElementById('m_svcName').value.trim();
    var desc = document.getElementById('m_svcDesc').value.trim();
    if (!name) { toast('❌ Enter a service name.', 'error'); return; }
    if (i >= 0) {
      _services[i].emoji = emoji; _services[i].name = name; _services[i].description = desc;
      await DB.put('services', _services[i]);
      toast('✅ Updated!', 'success');
    } else {
      await DB.put('services', { id: DB.genId(), emoji: emoji, name: name, description: desc, active: true, order: Date.now() });
      toast('✅ Added!', 'success');
    }
    closeModal();
    renderServices();
    updateStats();
  };

  window.openServiceModal = function(){
    var m = document.getElementById('modalContent');
    var emojis = ['💒','💍','👗','💄','🌿','🎂','🔊','🎁','🍽️','📸','🎈','🌸','🎉','🕯️','🎊','💐','🌟','✨','🎵','🍾'];
    m.innerHTML = '<button class="modal-close" onclick="closeModal()">✕</button><div class="modal-title">New Service</div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Emoji</label><div id="svcEmojiDisplay" style="font-size:2.5rem;text-align:center;padding:.5rem;cursor:pointer;border:1px solid rgba(255,255,255,.06);border-radius:8px;background:#0f0f0f;margin-bottom:.5rem">💒</div></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="m_svcName" /></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="m_svcDesc" rows="2"></textarea></div>';
    m.innerHTML += '<button class="btn-gold" onclick="saveService(-1)">Add Service</button>';
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('svcEmojiDisplay').onclick = function(){
      showEmojiPicker(this, function(e){ document.getElementById('svcEmojiDisplay').textContent = e; });
    };
  };

  // ===== PAGES =====
  var _pages = [];
  async function renderPages(){
    _pages = await DB.getAll('pages');
    var list = document.getElementById('pagesList');
    list.innerHTML = _pages.map(function(p){
      return '<div class="service-row"><span class="service-row-icon">' + (p.icon || '📄') + '</span><div class="service-row-info"><div class="service-row-name">' + p.name + '</div><div class="service-row-desc">/#' + p.slug + ' · ' + (p.showInNav ? 'In nav' : 'Hidden') + '</div></div><button class="btn-small btn-edit" onclick="editPage(\'' + p.id + '\')">✏️</button></div>';
    }).join('');
  }

  window.openPageModal = function(editId){
    var isEdit = !!editId;
    var data = isEdit ? _pages.find(function(p){ return p.id === editId; }) : { name: '', slug: '', icon: '📄', content: '', showInNav: true };
    var m = document.getElementById('modalContent');
    m.innerHTML = '<button class="modal-close" onclick="closeModal()">✕</button><div class="modal-title">' + (isEdit ? 'Edit Page' : 'New Page') + '</div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Icon</label><div id="pageIconDisplay" style="font-size:2.5rem;text-align:center;padding:.5rem;cursor:pointer;border:1px solid rgba(255,255,255,.06);border-radius:8px;background:#0f0f0f;margin-bottom:.5rem">' + data.icon + '</div></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Page Name</label><input class="form-input" id="p_name" value="' + (data.name || '') + '" /></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Slug</label><input class="form-input" id="p_slug" value="' + (data.slug || '') + '" placeholder="e.g. my-custom-page" /></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label">Content (HTML)</label><textarea class="form-textarea" id="p_content" rows="4">' + (data.content || '') + '</textarea></div>';
    m.innerHTML += '<div class="form-group"><label class="form-label toggle-label"><input type="checkbox" id="p_showNav" ' + (data.showInNav ? 'checked' : '') + ' /> <span style="margin-left:.5rem;">Show in navigation</span></label></div>';
    m.innerHTML += '<button class="btn-gold" onclick="savePage(\'' + (editId || '') + '\')">' + (isEdit ? 'Save Changes' : 'Create Page') + '</button>';
    if (isEdit) m.innerHTML += '<button class="btn-outline" onclick="deletePage(\'' + editId + '\')" style="margin-top:.5rem;color:#ef4444;border-color:#ef444440;">🗑️ Delete Page</button>';
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('pageIconDisplay').onclick = function(){
      showEmojiPicker(this, function(e){ document.getElementById('pageIconDisplay').textContent = e; });
    };
    document.getElementById('p_name').addEventListener('input', function(){
      if (!isEdit) document.getElementById('p_slug').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    });
  };

  window.savePage = async function(editId){
    var name = document.getElementById('p_name').value.trim();
    var slug = document.getElementById('p_slug').value.trim();
    if (!name || !slug) { toast('❌ Fill in name and slug.', 'error'); return; }
    var data = { icon: document.getElementById('pageIconDisplay').textContent, name: name, slug: slug, content: document.getElementById('p_content').value, showInNav: document.getElementById('p_showNav').checked };
    if (editId) { data.id = editId; var old = _pages.find(function(p){ return p.id === editId; }); data.order = old.order; data.visible = old.visible !== false; await DB.put('pages', data); toast('✅ Page updated!', 'success'); }
    else { data.id = DB.genId(); data.order = Date.now(); data.visible = true; await DB.put('pages', data); toast('✅ Page created!', 'success'); }
    closeModal();
    renderPages();
  };

  window.deletePage = async function(id){
    if (!confirm('Delete this page? This cannot be undone.')) return;
    await DB.del('pages', id);
    closeModal();
    renderPages();
    toast('🗑️ Page deleted.', 'info');
  };

  window.editPage = function(id){ window.openPageModal(id); };

  // ===== SECURITY =====
  window.changePassword = async function(){
    var current = document.getElementById('sec_current').value;
    var newPw = document.getElementById('sec_new').value;
    var confirmPw = document.getElementById('sec_confirm').value;
    var validPw = savedPw || PASSWORD;
    if (current !== validPw) { toast('❌ Current password is wrong.', 'error'); return; }
    if (newPw.length < 4) { toast('❌ New password must be at least 4 characters.', 'error'); return; }
    if (newPw !== confirmPw) { toast('❌ Passwords do not match.', 'error'); return; }
    savedPw = newPw;
    PASSWORD = newPw;
    await DB.saveSetting('adminPassword', newPw);
    document.getElementById('sec_current').value = '';
    document.getElementById('sec_new').value = '';
    document.getElementById('sec_confirm').value = '';
    toast('✅ Password updated!', 'success');
  };

  // ===== STATS =====
  function updateStats(){
    document.getElementById('statPhotos').textContent = (_photos || []).length;
    var ps = 0; (_services || []).forEach(function(s){ if (s.active !== false) ps++; });
    document.getElementById('statServices').textContent = ps;
    document.getElementById('statTestimonials').textContent = (_testimonials || []).length;
    document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date().toLocaleString();
  }

  // ===== MODAL =====
  window.closeModal = function(){
    document.getElementById('modalOverlay').classList.remove('open');
    document.getElementById('modalContent').innerHTML = '';
  };
  document.getElementById('modalOverlay').addEventListener('click', function(e){
    if (e.target === this) closeModal();
  });

  // Lightbox keyboard
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  // ===== HELP =====
  window.showHelp = function(section){
    var texts = { gallery: 'Upload photos with captions, organize into categories. Photos stored in Firestore (compressed base64).', hero: 'The gradient background of your site. Upload a photo to replace it.', info: 'Your business details — updates instantly on the main site.', testimonials: 'Customer reviews shown on your website.', services: 'Toggle on/off, edit, or add services.', pages: 'Create custom pages that appear in the navigation.', security: 'Change your admin password.' };
    toast('ℹ️ ' + (texts[section] || 'No help.'), 'info');
  };

  // ===== INIT =====
  if (!checkSession()) {
    document.getElementById('loginScreen').style.display = 'flex';
  }
})();
