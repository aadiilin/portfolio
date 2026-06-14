(function(){
  'use strict';

  var photos = [], categories = [], settings = {}, testimonials = [], services = [], pages = [];
  var currentCat = 'all', visibleCount = 9, loadingData = true;

  window.addEventListener('load', function(){
    setTimeout(function(){
      document.getElementById('loader').classList.add('hide');
      document.body.classList.add('loaded');
    }, 1200);
    initSite();
  });

  async function initSite(){
    try {
      await DB.initDefaults();
      categories = await DB.getAll('categories');
      photos = await DB.getAll('photos');
      settings = await DB.getSettings();
      testimonials = await DB.getAll('testimonials');
      services = await DB.getAll('services');
      pages = await DB.getAll('pages');
      loadingData = false;
    } catch(e) { console.warn('DB load error:', e); loadingData = false; }

    renderNav();
    renderCategoryFilters();
    renderGallery();
    renderTestimonials();
    renderServices();
    applySettings();
    renderPages();
    buildFooter();
  }

  // Petals
  var petalContainer = document.getElementById('petals');
  if(petalContainer){
    ['🌸','🌹','🌸','🌺','🌸','🌹'].forEach(function(c){
      var p = document.createElement('div');
      p.className = 'petal';
      p.textContent = c;
      p.style.left = Math.random() * 100 + '%';
      p.style.fontSize = (Math.random() * 12 + 14) + 'px';
      p.style.animationDuration = (Math.random() * 10 + 12) + 's';
      p.style.animationDelay = (Math.random() * 15) + 's';
      petalContainer.appendChild(p);
    });
  }

  // Parallax
  var heroBg = document.getElementById('hero-bg');
  if(heroBg){
    window.addEventListener('scroll', function(){
      heroBg.style.transform = 'translateY(' + (window.pageYOffset * 0.4) + 'px)';
    });
  }

  // Sticky nav
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function(){
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mobile nav
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var overlay = document.getElementById('mobileOverlay');
  function closeNav(){
    hamburger.classList.remove('active');
    navLinks.classList.remove('mobile-open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openNav(){
    hamburger.classList.add('active');
    navLinks.classList.add('mobile-open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  if(hamburger){
    hamburger.addEventListener('click', function(){
      navLinks.classList.contains('mobile-open') ? closeNav() : openNav();
    });
  }
  if(overlay) overlay.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-links a').forEach(function(l){ l.addEventListener('click', closeNav); });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ observer.observe(el); });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = this.getAttribute('href');
      if(id === '#') return;
      var t = document.querySelector(id);
      if(t){
        e.preventDefault();
        var top = t.getBoundingClientRect().top + window.pageYOffset - (navbar ? navbar.offsetHeight : 0);
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // Counters
  var counters = document.querySelectorAll('.counter');
  if(counters.length){
    var co = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var el = e.target;
          var target = parseInt(el.getAttribute('data-target'));
          if(!target) return;
          var cur = 0, inc = Math.ceil(target / 40);
          var timer = setInterval(function(){
            cur += inc;
            if(cur >= target){ el.textContent = target + '+'; clearInterval(timer); }
            else el.textContent = cur;
          }, 30);
          co.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function(el){ co.observe(el); });
  }

  // Admin shortcut
  document.addEventListener('keydown', function(e){
    if(e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) window.location.href = '/admin.html';
  });

  // ===== DYNAMIC RENDERERS =====
  function renderNav(){
    var list = document.querySelector('.nav-links');
    if(!list) return;
    var custom = pages.filter(function(p){ return p.showInNav && p.slug !== 'hero' && p.slug !== 'booking' && p.slug !== 'gallery' && p.slug !== 'services' && p.slug !== 'about' && p.slug !== 'testimonials'; });
    custom.forEach(function(p){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#page-' + p.slug;
      a.textContent = p.icon + ' ' + p.name;
      li.appendChild(a);
      list.insertBefore(li, list.querySelector('.nav-cta') ? list.querySelector('.nav-cta').parentNode : null);
    });
  }

  function renderCategoryFilters(){
    var container = document.getElementById('catFilters');
    if(!container || categories.length === 0) return;
    var html = '<span class="cf-tab active" onclick="window._filterGallery(\'all\')">All</span>';
    categories.forEach(function(c){
      html += '<span class="cf-tab" onclick="window._filterGallery(\'' + c.id + '\')" style="--cat-color:' + c.color + '">' + c.emoji + ' ' + c.name + '</span>';
    });
    container.innerHTML = html;
  }

  window._filterGallery = function(id){
    currentCat = id;
    visibleCount = 9;
    document.querySelectorAll('.cf-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.cf-tab').forEach(function(t){
      if((id === 'all' && t.textContent.trim() === 'All') || t.textContent.includes(id)) t.classList.add('active');
    });
    renderGallery();
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function renderGallery(){
    var grid = document.getElementById('galleryGrid');
    var loadMore = document.getElementById('loadMore');
    if(!grid) return;
    var filtered = currentCat === 'all' ? photos : photos.filter(function(p){ return p.categoryId === currentCat; });
    var show = filtered.slice(0, visibleCount);

    if (filtered.length === 0) {
      grid.innerHTML = '';
      for(var i=0;i<6;i++){
        grid.innerHTML += '<div class="gitem coming-soon" style="aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,rgba(201,162,39,0.05),rgba(192,23,122,0.05));display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.03)"><span style="color:rgba(255,255,255,0.15);font-size:0.8rem">Coming Soon</span></div>';
      }
      if(loadMore) loadMore.style.display = 'none';
      return;
    }

    grid.innerHTML = show.map(function(p){
      var cat = categories.find(function(c){ return c.id === p.categoryId; });
      return '<div class="gitem reveal" onclick="window._openLightbox(\'' + p.id + '\')">'
        + '<img src="' + p.url + '" alt="' + (p.caption || 'Event photo') + '" width="800" height="800" loading="lazy" />'
        + '<div class="gi-hover"><span>' + (p.caption || 'View') + '</span></div>'
        + (cat ? '<span class="gi-badge" style="background:' + cat.color + '">' + cat.emoji + '</span>' : '')
        + '</div>';
    }).join('');

    if(loadMore) loadMore.style.display = visibleCount >= filtered.length ? 'none' : 'block';
  }

  window._loadMore = function(){
    visibleCount += 9;
    renderGallery();
  };

  window._openLightbox = function(id){
    var all = currentCat === 'all' ? photos : photos.filter(function(p){ return p.categoryId === currentCat; });
    var idx = all.findIndex(function(p){ return p.id === id; });
    if(idx === -1) return;
    window._lbAll = all;
    window._lbIdx = idx;
    showLightbox();
  };

  function showLightbox(){
    var all = window._lbAll, idx = window._lbIdx;
    if(!all || idx < 0 || idx >= all.length) return;
    var p = all[idx];
    var cat = categories.find(function(c){ return c.id === p.categoryId; });
    var el = document.getElementById('lbOverlay');
    el.innerHTML = '<span class="lb-close" onclick="window._closeLightbox()">✕</span>'
      + '<div class="lb-content"><img src="' + p.url + '" alt="' + (p.caption || 'Photo') + '" class="lb-img"/>'
      + '<div class="lb-meta"><div class="lb-cap">' + (p.caption || '') + '</div>'
      + (cat ? '<span class="lb-cat" style="background:' + cat.color + '">' + cat.emoji + ' ' + cat.name + '</span>' : '') + '</div></div>'
      + '<div class="lb-arrows">'
      + '<button class="lb-arr" onclick="window._lbNav(-1)">‹</button>'
      + '<button class="lb-arr" onclick="window._lbNav(1)">›</button></div>';
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window._lbNav = function(dir){
    window._lbIdx = (window._lbIdx + dir + window._lbAll.length) % window._lbAll.length;
    showLightbox();
  };

  window._closeLightbox = function(){
    document.getElementById('lbOverlay').classList.remove('open');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') window._closeLightbox();
    if(e.key === 'ArrowLeft') window._lbNav(-1);
    if(e.key === 'ArrowRight') window._lbNav(1);
  });

  function renderTestimonials(){
    var tGrid = document.getElementById('testimonials-grid');
    if(!tGrid) return;
    if(testimonials.length === 0) return;
    tGrid.innerHTML = testimonials.map(function(t){
      var stars = ''; for(var s=0;s<(t.rating||5);s++) stars += '★';
      return '<div class="tcard reveal"><div class="tmark">"</div><p class="tcard-text">' + t.quote + '</p><div class="tcard-name">' + t.author + '</div><div class="tcard-event">' + (t.eventType||'') + (t.eventType&&t.location?', ':'') + (t.location||'') + '</div></div>';
    }).join('');
  }

  function renderServices(){
    var sGrid = document.querySelector('.services-grid');
    if(!sGrid) return;
    if(services.length === 0) return;
    sGrid.innerHTML = services.filter(function(s){ return s.active !== false; }).map(function(s){
      return '<div class="service-card reveal"><span class="service-icon">' + (s.emoji||'💒') + '</span><h3 class="service-name">' + s.name + '</h3><p class="service-desc">' + (s.description||'') + '</p><div class="service-hover"><a href="#booking">Explore →</a></div></div>';
    }).join('');
  }

  function applySettings(){
    // Hero background
    if(settings.hero_url){
      var hb = document.getElementById('hero-bg');
      if(hb) hb.style.background = 'url("' + settings.hero_url + '") center center / cover fixed no-repeat';
    }
    // Data-field binding
    Object.keys(settings).forEach(function(key){
      if(key === 'hero_url') return;
      var val = settings[key];
      if(!val) return;
      document.querySelectorAll('[data-field="' + key + '"]').forEach(function(el){
        var tag = el.tagName;
        if(tag === 'A' || tag === 'a') el.href = val;
        else el.textContent = val;
      });
    });
  }

  function renderPages(){
    var container = document.getElementById('customPages');
    if(!container) return;
    var custom = pages.filter(function(p){ return p.visible !== false && p.slug !== 'hero' && p.slug !== 'services' && p.slug !== 'gallery' && p.slug !== 'about' && p.slug !== 'testimonials' && p.slug !== 'booking'; });
    custom.forEach(function(p){
      var section = document.createElement('section');
      section.id = 'page-' + p.slug;
      section.className = 'custom-page';
      section.innerHTML = '<div class="container"><div class="section-header reveal"><span class="eyebrow">' + p.icon + '</span><h2 class="section-title">' + p.name + '</h2></div><div class="page-content reveal">' + p.content + '</div></div>';
      container.appendChild(section);
    });
  }

  function buildFooter(){
    // Footer already has static structure; settings override text
  }
})();
