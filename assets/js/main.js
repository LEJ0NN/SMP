// Basit indirme başlatma ve sayaç güncelleme
(function(){
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const STORAGE_KEY = 'download-counts';
  const ICON_CACHE_KEY = 'mod-icon-cache-v1';
  /** @type {Record<string, number>} */
  const counts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  /** @type {Record<string,string>} */
  const iconCache = JSON.parse(localStorage.getItem(ICON_CACHE_KEY) || '{}');

  function persistIconCache(){
    try{ localStorage.setItem(ICON_CACHE_KEY, JSON.stringify(iconCache)); }
    catch(_e){ /* ignore quota errors */ }
  }

  // downloads/mods klasöründeki mevcut mod dosyaları (tekli indirilebilir)
  /** @type {string[]} */
  const MOD_FILES = [
    'appleskin-forge-mc1.20.1-2.5.1.jar',
    'architectury-9.2.14-forge.jar',
    'athena-forge-1.20.1-3.1.2.jar',
    'baguettelib-1.20.1-Forge-1.1.0.jar',
    'caelus-forge-3.2.0+1.20.1.jar',
    'camera-forge-1.20.1-1.0.20.jar',
    'chipped-forge-1.20.1-3.0.7.jar',
    'Clumps-forge-1.20.1-12.0.0.4.jar',
    'comforts-forge-6.4.0+1.20.1.jar',
    'Controlling-forge-1.20.1-12.0.2.jar',
    'copycats-3.0.2+mc.1.20.1-forge.jar',
    'corpse-forge-1.20.1-1.0.21.jar',
    'CraftTweaker-forge-1.20.1-14.0.59.jar',
    'create_central_kitchen-1.20.1-for-create-6.0.6-1.4.3b.jar',
    'create_connected-1.1.7-mc1.20.1-all.jar',
    'create_factory-0.4b-1.20.1.jar',
    'create_jetpack-forge-4.4.2.jar',
    'create-1.20.1-6.0.6.jar',
    'create-confectionery1.20.1_v1.1.0.jar',
    'create-stuff-additions1.20.1_v2.1.0.jar',
    'createdeco-2.0.3-1.20.1-forge.jar',
    'curios-forge-5.14.1+1.20.1.jar',
    'elytraslot-forge-6.4.4+1.20.1.jar',
    'ferritecore-6.0.1-forge.jar',
    'FramedBlocks-9.4.2.jar',
    'interiors-0.5.6+forge-mc1.20.1-local.jar',
    'Jade-1.20.1-Forge-11.13.2.jar',
    'jei-1.20.1-forge-15.20.0.112.jar',
    'kotlinforforge-4.11.0-all.jar',
    'kubejs-forge-2001.6.5-build.16.jar',
    'lightmanscurrency-1.20.1-2.2.6.4.jar',
    'mcw-furniture-3.3.0-mc1.20.1forge.jar',
    'mcw-windows-2.4.0-1.20.1forge.jar',
    'MouseTweaks-forge-mc1.20.1-2.25.1.jar',
    'OptiFine_1.20.1_HD_U_I6.jar',
    'polymorph-forge-0.49.10+1.20.1.jar',
    'ponderjs-1.20.1-2.0.6.jar',
    'resourcefullib-forge-1.20.1-2.1.29.jar',
    'rhino-forge-2001.2.3-build.10.jar',
    'Searchables-forge-1.20.1-1.0.3.jar',
    'Shrink-1.20.1-1.4.5.jar',
    'Steam_Rails-1.6.7+forge-mc1.20.1.jar',
    'StorageDrawers-forge-1.20.1-12.14.3.jar',
    'supermartijn642configlib-1.1.8-forge-mc1.20.jar',
    'supermartijn642corelib-1.1.18-forge-mc1.20.1.jar',
    'torchmaster-20.1.9.jar',
    'travelersbackpack-forge-1.20.1-9.1.41.jar',
    'voicechat-forge-1.20.1-2.5.35.jar'
  ];

  // Dosya adına göre daha düzgün görünen mod adı üretmek için kurallar
  /** @type {{match:string|RegExp, name:string}[]} */
  const FRIENDLY_NAME_RULES = [
    { match: 'appleskin', name: 'AppleSkin' },
    { match: 'architectury', name: 'Architectury API' },
    { match: 'athena', name: 'Athena' },
    { match: 'baguettelib', name: 'BaguetteLib' },
    { match: 'balm', name: 'Balm' },
    { match: 'caelus', name: 'Caelus API' },
    { match: 'camera', name: 'Camera Mod' },
    { match: 'chipped', name: 'Chipped' },
    { match: 'clumps', name: 'Clumps' },
    { match: 'comforts', name: 'Comforts' },
    { match: 'controlling', name: 'Controlling' },
    { match: 'copycats', name: 'Copycats' },
    { match: 'corpse', name: 'Corpse' },
    { match: 'crafttweaker', name: 'CraftTweaker' },
    { match: 'create_central_kitchen', name: 'Create: Central Kitchen' },
    { match: 'create_connected', name: 'Create: Connected' },
    { match: 'create_factory', name: 'Create: Factory' },
    { match: 'create_jetpack', name: 'Create: Jetpack' },
    { match: /^create[-_]/i, name: 'Create' },
    { match: 'create-confectionery', name: 'Create: Confectionery' },
    { match: 'create-stuff-additions', name: 'Create Stuff & Additions' },
    { match: 'createdeco', name: 'Create: Deco' },
    { match: 'curios', name: 'Curios API' },
    { match: 'elytraslot', name: 'Elytra Slot' },
    { match: 'ferritecore', name: 'FerriteCore' },
    { match: 'framedblocks', name: 'FramedBlocks' },
    { match: 'interiors', name: 'Interiors' },
    { match: /^jade/i, name: 'Jade' },
    { match: /^jei/i, name: 'Just Enough Items (JEI)' },
    { match: 'kotlinforforge', name: 'Kotlin for Forge' },
    { match: 'kubejs', name: 'KubeJS' },
    { match: 'lightmanscurrency', name: "Lightman's Currency" },
    { match: 'mcw-furniture', name: "Macaw's Furniture" },
    { match: 'mcw-windows', name: "Macaw's Windows" },
    { match: 'mousetweaks', name: 'Mouse Tweaks' },
    { match: /^optifine/i, name: 'OptiFine' },
    { match: 'polymorph', name: 'Polymorph' },
    { match: 'ponderjs', name: 'PonderJS' },
    { match: 'resourcefullib', name: 'Resourceful Lib' },
    { match: /^rhino/i, name: 'Rhino' },
    { match: 'searchables', name: 'Searchables' },
    { match: 'shrink', name: 'Shrink' },
    { match: 'steam_rails', name: "Create: Steam 'n Rails" },
    { match: 'storagedrawers', name: 'Storage Drawers' },
    { match: 'supermartijn642configlib', name: "SuperMartijn642's Config Lib" },
    { match: 'supermartijn642corelib', name: "SuperMartijn642's Core Lib" },
    { match: 'torchmaster', name: 'Torchmaster' },
    { match: 'travelersbackpack', name: "Traveler's Backpack" },
    { match: 'voicechat', name: 'Simple Voice Chat' }
  ];

  // Kategori kuralları (Modrinth benzeri etiketler)
  /** @type {{match:RegExp, add:string[]}[]} */
  const CATEGORY_RULES = [
    { match: /^(create([-_].*)?$|create\b)/i, add: ['Create Ekosistemi'] },
    { match: /(central[_-]?kitchen|connected|factory|jetpack|confectionery|stuff[-_ ]?additions|createdeco|steam[_-]?rails)/i, add: ['Create Ekosistemi'] },

    { match: /(architectury|balm|curios|resourcefullib|supermartijn642|kotlinforforge|kubejs|rhino|baguettelib|caelus)/i, add: ['Kütüphane/API'] },

    { match: /(ferritecore|clumps|optifine)/i, add: ['Performans'] },

    { match: /(jade|jei|mousetweaks|controlling|appleskin|searchables|voicechat)/i, add: ['İstemci/QoL'] },

    { match: /(chipped|framedblocks|mcw[-_]?furniture|mcw[-_]?windows|interiors|createdeco)/i, add: ['Yapı/Decor'] },

    { match: /(corpse|torchmaster|travelersbackpack|polymorph|comforts|elytraslot|storagedrawers|lightmanscurrency)/i, add: ['Oynanış/Araçlar'] },

    { match: /(crafttweaker|kubejs|ponderjs)/i, add: ['Scripting/Dev'] }
  ];

  function getCategoriesFor(fileName){
    var base = fileName.replace(/\.[^.]+$/,'');
    var cats = new Set();
    for (var i=0;i<CATEGORY_RULES.length;i++){
      if (CATEGORY_RULES[i].match.test(base)){
        CATEGORY_RULES[i].add.forEach(function(c){ cats.add(c); });
      }
    }
    if (cats.size === 0) cats.add('Diğer');
    return Array.from(cats);
  }

  function getAllCategories(files){
    var set = new Set(['all']);
    files.forEach(function(f){ getCategoriesFor(f).forEach(function(c){ set.add(c); }); });
    return Array.from(set);
  }

  function humanizeFileName(fileName){
    var base = fileName.replace(/\.[^.]+$/,'');
    var cleaned = base
      .replace(/[+_\-]+/g,' ')
      .replace(/\bmc?\d+(?:\.\d+)*(?:[a-z]*)\b/gi,' ')
      .replace(/\bv?\d+(?:\.\d+)*(?:[a-z]*)\b/gi,' ')
      .replace(/\bforge\b|\bfabric\b|\ball\b|\bbuild\b|\bminecraft\b/gi,' ')
      .replace(/\s+/g,' ')
      .trim();
    return cleaned.split(' ').map(function(w){
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  function prettyTitle(fileName){
    var base = fileName.replace(/\.[^.]+$/,'');
    var lower = base.toLowerCase();
    for (var i=0;i<FRIENDLY_NAME_RULES.length;i++){
      var rule = FRIENDLY_NAME_RULES[i];
      if (typeof rule.match === 'string'){
        if (lower.indexOf(rule.match) !== -1) return rule.name;
      } else if (rule.match.test(base)){
        return rule.name;
      }
    }
    return humanizeFileName(fileName);
  }

  function renderMods(){
    var grid = document.getElementById('mods-grid');
    if(!grid) return;
    var query = (document.getElementById('mod-search') || { value:'' }).value || '';
    // global-search kaldırıldı
    var category = (document.getElementById('mod-category') || { value:'all' }).value || 'all';
    var sort = (document.getElementById('mod-sort') || { value:'ad-asc' }).value || 'ad-asc';
    var files = MOD_FILES.slice()
      .sort(function(a,b){
        var A = prettyTitle(a);
        var B = prettyTitle(b);
        if (sort === 'ad-asc') return A.localeCompare(B);
        if (sort === 'ad-desc') return B.localeCompare(A);
        // İndirme sayısına göre sahte sıralama: localStorage sayaçları
        var aCount = counts['downloads/mods/' + a] || 0;
        var bCount = counts['downloads/mods/' + b] || 0;
        if (sort === 'count-desc') return bCount - aCount;
        if (sort === 'count-asc') return aCount - bCount;
        return A.localeCompare(B);
      })
      .filter(function(file){
        // Kategori filtresi
        if (category !== 'all'){
          var cats = getCategoriesFor(file);
          if (cats.indexOf(category) === -1) return false;
        }
        // Arama filtresi
        if(query){
          var t = prettyTitle(file).toLowerCase();
          if (t.indexOf(query.toLowerCase()) === -1) return false;
        }
        return true;
      });
    var html = files.map(function(file){
      var fullPath = 'downloads/mods/' + file;
      var title = prettyTitle(file);
      var tags = getCategoriesFor(file).map(function(tag){ return '<span class="tag">' + tag + '</span>'; }).join(' ');
      return (
        '<article class="card">\n'
        + '  <div class="card-body">\n'
        + '    <div class="mod-icon" data-name="' + title + '" aria-hidden="true"></div>\n'
        + '    <h2 class="card-title">' + title + '</h2>\n'
        + '    <p class="card-desc">Tek tıkla indir</p>\n'
        + '    <div class="tags">' + tags + '</div>\n'
        + '    <div class="card-actions">\n'
        + '      <button class="btn btn-primary" data-file="' + fullPath + '" aria-label="' + title + ' indir">İndir</button>\n'
        + '      <span class="muted">İndirme: <strong class="dl-count" data-count-for="' + fullPath + '">0</strong></span>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</article>'
      );
    }).join('');
    grid.innerHTML = html;
    loadModIcons();
    var countEl = document.getElementById('mod-count');
    if(countEl) countEl.textContent = String(files.length);
  }

  /**
   * Modrinth'ten ikon URL'si bulur
   * @param {string} queryName
   * @returns {Promise<string|null>}
   */
  function fetchIconFromModrinth(queryName){
    var facets = encodeURIComponent('[["project_type:mod"]]');
    var url = 'https://api.modrinth.com/v2/search?limit=5&facets=' + facets + '&query=' + encodeURIComponent(queryName);
    return fetch(url, { headers:{ 'Accept':'application/json' } })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(new Error('HTTP '+r.status)); })
      .then(function(data){
        if(!data || !Array.isArray(data.hits) || data.hits.length === 0) return null;
        // En iyi eşleşme: başlık tam veya kısmi eşleşme; yoksa ilk sonuç
        var lower = queryName.toLowerCase();
        var best = data.hits.find(function(h){ return String(h.title||'').toLowerCase() === lower; })
               || data.hits.find(function(h){ return String(h.title||'').toLowerCase().indexOf(lower) !== -1; })
               || data.hits[0];
        return best && best.icon_url ? best.icon_url : null;
      })
      .catch(function(){ return null; });
  }

  /**
   * Kartlardaki .mod-icon elemanlarına ikonları yerleştirir
   */
  function loadModIcons(){
    var nodes = document.querySelectorAll('#mods-grid .mod-icon[data-name]');
    nodes.forEach(function(node){
      if (node.getAttribute('data-loaded') === '1') return;
      var name = node.getAttribute('data-name') || '';
      if(!name) return;

      function place(src){
        if(!src){ node.setAttribute('data-loaded','1'); return; }
        node.innerHTML = '<img alt="' + name.replace(/"/g,'') + ' icon" loading="lazy" src="' + src + '">';
        node.setAttribute('data-loaded','1');
      }

      // Cache kontrolü
      if (iconCache[name]){ place(iconCache[name]); return; }

      fetchIconFromModrinth(name).then(function(url){
        if(url){ iconCache[name] = url; persistIconCache(); }
        place(url);
      });
    });
  }

  function setupAccordion(){
    var toggle = document.getElementById('toggle-mods');
    var panel = document.getElementById('mods-panel');
    if(!toggle || !panel) return;

    function setOpen(isOpen){
      toggle.setAttribute('aria-expanded', String(isOpen));
      if(isOpen){
        panel.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0px';
        panel.classList.remove('open');
      }
    }

    toggle.addEventListener('click', function(){
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!expanded);
    });

    window.addEventListener('resize', function(){
      if (toggle.getAttribute('aria-expanded') === 'true'){
        // İçerik yüksekliği değiştiyse güncelle
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Başlangıç durumu: localStorage'dan oku
    var saved = localStorage.getItem('mods-accordion-open');
    var initialOpen = saved === 'true';
    setOpen(initialOpen);

    // Durumu kaydet
    new MutationObserver(function(){
      localStorage.setItem('mods-accordion-open', toggle.getAttribute('aria-expanded'));
    }).observe(toggle, { attributes:true, attributeFilter:['aria-expanded']});
  }

  function updateCountLabels(){
    document.querySelectorAll('.dl-count').forEach(function(el){
      var file = el.getAttribute('data-count-for');
      if(!file) return;
      var value = counts[file] || 0;
      el.textContent = String(value);
    });

    // İstatistikler
    var total = 0;
    Object.keys(counts).forEach(function(k){ total += counts[k] || 0; });
    var totalEl = document.getElementById('stat-total-downloads');
    if (totalEl) totalEl.textContent = String(total);

    var modCountEl = document.getElementById('stat-mod-count');
    if (modCountEl) modCountEl.textContent = String((window.MODS_LEN_OVERRIDE) || (Array.isArray(MOD_FILES) ? MOD_FILES.length : 0));

    var catsEl = document.getElementById('stat-categories');
    if (catsEl) catsEl.textContent = String(getAllCategories(MOD_FILES).filter(function(c){return c!=='all'}).length);
  }

  function persist(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(counts)); }
    catch(_e){ /* ignore quota errors */ }
  }

  document.addEventListener('click', function(ev){
    var target = ev.target;
    if(!(target instanceof Element)) return;
    var button = target.closest('button[data-file]');
    if(!button) return;

    var file = button.getAttribute('data-file');
    if(!file) return;

    button.disabled = true;
    button.textContent = 'Hazırlanıyor...';

    // Yapay küçük gecikme (UI hissi için)
    setTimeout(function(){
      // Dış bağlantılar için yeni sekmede aç; yerel dosyalar için indirme başlat
      if (/^https?:\/\//i.test(file)){
        window.open(file, '_blank', 'noopener');
      } else {
        var a = document.createElement('a');
        a.href = file;
        a.setAttribute('download', '');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // Sayaç güncelle
      counts[file] = (counts[file] || 0) + 1;
      persist();
      updateCountLabels();

      button.textContent = '';
      button.disabled = false;
    }, 300);
  });

  renderMods();
  setupAccordion();
  updateCountLabels();

  // Arama inputu için dinleme
  document.addEventListener('input', function(ev){
    var t = ev.target;
    if(!(t instanceof Element)) return;
    if (t.id === 'mod-search'){
      renderMods();
    }
  });

  // Kategori seçimi
  document.addEventListener('change', function(ev){
    var t = ev.target;
    if(!(t instanceof Element)) return;
    if (t.id === 'mod-category' || t.id === 'mod-sort'){
      renderMods();
    }
  });

  // Kategori seçeneklerini populate et
  (function populateCategories(){
    var select = document.getElementById('mod-category');
    if(!select) return;
    var cats = getAllCategories(MOD_FILES);
    // İlk seçenek zaten all
    cats.filter(function(c){ return c !== 'all'; }).sort().forEach(function(c){
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
  })();

  // Global arama kaldırıldı
})();


