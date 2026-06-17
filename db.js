firebase.initializeApp(firebaseConfig);
var firestore = firebase.firestore();
var storage = firebase.storage();
var storageRef = storage.ref();

var DB = {};

DB.getAll = function(col){
  return firestore.collection(col).get().then(function(snap){
    var arr = [];
    snap.forEach(function(d){ arr.push(d.data()); });
    return arr;
  });
};

DB.get = function(col, id){
  return firestore.collection(col).doc(id).get().then(function(d){
    return d.exists ? d.data() : null;
  });
};

DB.put = function(col, item){
  return firestore.collection(col).doc(item.id).set(item, { merge: true });
};

DB.del = function(col, id){
  return firestore.collection(col).doc(id).delete();
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

DB.genId = function(){
  return firestore.collection('_').doc().id;
};

DB.uploadImage = function(file, maxKB){
  return new Promise(function(resolve, reject){
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
      var quality = 0.85, dataUrl;
      do {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        quality -= 0.08;
      } while (dataUrl.length > maxKB * 1024 * 1.37 && quality > 0.08);
      var blob = dataURLToBlob(dataUrl);
      var path = 'photos/' + DB.genId() + '.jpg';
      storageRef.child(path).put(blob).then(function(snap){
        return snap.ref.getDownloadURL();
      }).then(function(url){
        resolve(url);
      }).catch(reject);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

function dataURLToBlob(dataUrl){
  var parts = dataUrl.split(',');
  var mime = parts[0].match(/:(.*?);/)[1];
  var bytes = atob(parts[1]);
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

DB.deleteImage = function(url){
  try {
    var ref = storage.refFromURL(url);
    return ref.delete().catch(function(){});
  } catch(e) { return Promise.resolve(); }
};

DB.onSnapshot = function(col, callback){
  return firestore.collection(col).orderBy('order').onSnapshot(function(snap){
    var arr = [];
    snap.forEach(function(d){ arr.push(d.data()); });
    callback(arr);
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
  { id: 'page_booking', name: 'Contact', slug: 'booking', icon: '📞', content: '', showInNav: true, order: 5, visible: true }
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
