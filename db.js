var DB = {};
(function(){
  var DB_NAME = 'ZakkEventsDB', VERSION = 1;

  function open() {
    return new Promise(function(resolve, reject){
      var req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = function(e){
        var db = e.target.result;
        ['photos','categories','settings','pages','testimonials','services'].forEach(function(s){
          if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
        });
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error); };
    });
  }

  function store(name, mode){ return open().then(function(db){ var tx = db.transaction(name, mode); return { tx: tx, store: tx.objectStore(name), db: db }; }); }

  DB.getAll = function(storeName){
    return store(storeName, 'readonly').then(function(s){
      return new Promise(function(resolve, reject){
        var req = s.store.getAll();
        req.onsuccess = function(){ s.db.close(); resolve(req.result || []); };
        req.onerror = function(){ s.db.close(); reject(req.error); };
      });
    });
  };

  DB.get = function(storeName, id){
    return store(storeName, 'readonly').then(function(s){
      return new Promise(function(resolve, reject){
        var req = s.store.get(id);
        req.onsuccess = function(){ s.db.close(); resolve(req.result); };
        req.onerror = function(){ s.db.close(); reject(req.error); };
      });
    });
  };

  DB.put = function(storeName, item){
    return store(storeName, 'readwrite').then(function(s){
      return new Promise(function(resolve, reject){
        var req = s.store.put(item);
        req.onsuccess = function(){ s.db.close(); resolve(); };
        req.onerror = function(){ s.db.close(); reject(req.error); };
      });
    });
  };

  DB.del = function(storeName, id){
    return store(storeName, 'readwrite').then(function(s){
      return new Promise(function(resolve, reject){
        var req = s.store.delete(id);
        req.onsuccess = function(){ s.db.close(); resolve(); };
        req.onerror = function(){ s.db.close(); reject(req.error); };
      });
    });
  };

  DB.getSettings = function(){
    return DB.getAll('settings').then(function(items){
      var o = {};
      items.forEach(function(i){ o[i.key] = i.value; });
      return o;
    });
  };

  DB.saveSetting = function(key, value){
    return DB.put('settings', { id: key, key: key, value: value });
  };

  DB.genId = function(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); };

  DB.compressImage = function(file, maxKB){
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){
        var canvas = document.createElement('canvas');
        var w = img.width, h = img.height, maxDim = 1200;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var quality = 0.85, result;
        do {
          result = canvas.toDataURL('image/jpeg', quality);
          quality -= 0.08;
        } while (result.length > maxKB * 1024 * 1.37 && quality > 0.08);
        resolve(result);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  DB.DEFAULT_CATEGORIES = [
    { id: 'cat_weddings', emoji: '💍', name: 'Weddings', color: '#c9a227', order: 0 },
    { id: 'cat_birthdays', emoji: '🎂', name: 'Birthdays', color: '#e91e63', order: 1 },
    { id: 'cat_bridal', emoji: '💄', name: 'Bridal', color: '#9c27b0', order: 2 },
    { id: 'cat_mehendi', emoji: '🌸', name: 'Mehendi', color: '#4caf50', order: 3 },
    { id: 'cat_engagement', emoji: '💒', name: 'Engagement', color: '#ff9800', order: 4 },
    { id: 'cat_balloons', emoji: '🎈', name: 'Balloons', color: '#2196f3', order: 5 },
    { id: 'cat_catering', emoji: '🍽️', name: 'Catering', color: '#795548', order: 6 },
    { id: 'cat_photography', emoji: '📸', name: 'Photography', color: '#607d8b', order: 7 }
  ];

  DB.DEFAULT_PAGES = [
    { id: 'page_home', name: 'Home', slug: 'hero', icon: '🏠', content: '', showInNav: false, order: 0, visible: true },
    { id: 'page_services', name: 'Services', slug: 'services', icon: '🛎️', content: '', showInNav: true, order: 1, visible: true },
    { id: 'page_gallery', name: 'Gallery', slug: 'gallery', icon: '📸', content: '', showInNav: true, order: 2, visible: true },
    { id: 'page_about', name: 'About', slug: 'about', icon: 'ℹ️', content: '', showInNav: true, order: 3, visible: true },
    { id: 'page_testimonials', name: 'Testimonials', slug: 'testimonials', icon: '💬', content: '', showInNav: true, order: 4, visible: true },
    { id: 'page_contact', name: 'Contact', slug: 'booking', icon: '📞', content: '', showInNav: true, order: 5, visible: true }
  ];

  DB.initDefaults = function(){
    return DB.getAll('categories').then(function(cats){
      if (!cats || cats.length === 0) {
        return Promise.all(DB.DEFAULT_CATEGORIES.map(function(c){ return DB.put('categories', c); }));
      }
    }).then(function(){
      return DB.getAll('pages');
    }).then(function(pages){
      if (!pages || pages.length === 0) {
        return Promise.all(DB.DEFAULT_PAGES.map(function(p){ return DB.put('pages', p); }));
      }
    });
  };
})();
