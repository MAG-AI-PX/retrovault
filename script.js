/**
 * Retro Vault - Dynamic Games Engine (script.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const gamesGrid = document.getElementById('gamesGrid');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const emptyState = document.getElementById('emptyState');
  const resetFilterBtn = document.getElementById('resetFilterBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const langToggle = document.getElementById('langToggle');
  const langLabel = document.getElementById('langLabel');

  let gamesList = [];

  // Translations dictionary
  const translations = {
    en: {
      langLabel: 'العربية',
      title: 'Retro Vault | Curated Retro & Classic PC Games',
      subtitle: 'Curated Retro & Classic PC Games',
      heroHeadline: 'Relive the Golden Age of PC Gaming',
      heroDesc: 'A handpicked archive of classic PC gaming masterpieces, preserved and ready for direct download.',
      searchPlaceholder: 'Search games by title...',
      emptyTitle: 'No games found',
      emptyDesc: 'Try searching with different keywords.',
      resetFilters: 'View all games',
      footerCopy: 'A dedicated vault preserving digital retro gaming heritage. All game rights belong to their respective creators.',
      preparing: 'Preparing download archive...',
      startDownload: 'Direct Download',
      downloadBtnText: 'Download for Windows (PC)',
      toastSample: 'Clicked Windows download link for: '
    },
    ar: {
      langLabel: 'English',
      title: 'Retro Vault | مكتبة الألعاب الكلاسيكية النادرة',
      subtitle: 'مكتبة الألعاب الكلاسيكية النادرة',
      heroHeadline: 'أعد إحياء ذكريات العصر الذهبي للألعاب',
      heroDesc: 'مجموعة منتقاة بعناية من روائع ألعاب الكمبيوتر الكلاسيكية، جاهزة للتحميل المباشر والآمن بدون تعقيد',
      searchPlaceholder: 'ابحث عن اسم اللعبة...',
      emptyTitle: 'لم يتم العثور على ألعاب',
      emptyDesc: 'جرب البحث بكلمة أخرى.',
      resetFilters: 'عرض جميع الألعاب',
      footerCopy: 'مساحة هادئة لحفظ التراث الرقمي لألعاب الفيديو. جميع حقوق العناوين محفوظة لأصحابها الأصليين.',
      preparing: 'جارٍ تجهيز ملف التحميل...',
      startDownload: 'تحميل مباشر',
      downloadBtnText: 'تحميل لويندوز (PC)',
      toastSample: 'تم النقر على رابط تحميل الكمبيوتر: '
    }
  };

  // Default language: English
  let currentLang = localStorage.getItem('retro_vault_lang') || 'en';

  /**
   * تغيير لغة الموقع وتحديث النصوص والاتجاه (LTR / RTL)
   */
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('retro_vault_lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (translations[lang]) {
      document.title = translations[lang].title;

      if (langLabel) {
        langLabel.textContent = translations[lang].langLabel;
      }

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
          el.textContent = translations[lang][key];
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
          el.placeholder = translations[lang][key];
        }
      });
    }

    // إعادة عرض الألعاب لتحديث لغة الأزرار إذا كانت محملة
    if (gamesList && gamesList.length > 0) {
      filterGames();
    }
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'ar' : 'en';
      setLanguage(nextLang);
    });
  }

  // تفعيل اللغة الابتدائية (الإنجليزية تلقائياً)
  setLanguage(currentLang);

  /**
   * إظهار إشعار سريع للمستخدم (Toast)
   */
  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2500);
  }

  /**
   * إنشاء كارت اللعبة وإضافته للحاوية
   */
  function renderGameCard(game) {
    // دعم الحقول ثنائية اللغة مع fallback للحقول القديمة
    const title = (currentLang === 'ar' ? game.title_ar : game.title_en)
      || game.title
      || (currentLang === 'ar' ? 'لعبة غير معنونة' : 'Untitled Game');
    const description = (currentLang === 'ar' ? game.description_ar : game.description_en)
      || game.description
      || '';
    const developer = (currentLang === 'ar' ? game.developer_ar : game.developer_en)
      || game.developer
      || '';
    const image = game.image || 'assets/placeholder.jpg';
    const pcUrl = game.downloadUrl || game.pcDownloadUrl || '#';
    const downloadLabel = translations[currentLang]?.downloadBtnText || 'Download for Windows (PC)';
    const year = game.releaseYear || '';
    const fileSize = game.fileSize || game.size || '';
    const supportedOS = game.supportedOS || '';
    const metaRows = [];
    if (year) metaRows.push(`<div class="card-meta-item"><span class="card-meta-label">Year:</span> <span class="card-meta-value">${year}</span></div>`);
    if (fileSize) metaRows.push(`<div class="card-meta-item"><span class="card-meta-label">Size:</span> <span class="card-meta-value">${fileSize}</span></div>`);
    if (developer) metaRows.push(`<div class="card-meta-item" dir="auto"><span class="card-meta-label">Developer:</span> <span class="card-meta-value">${developer}</span></div>`);
    if (supportedOS) metaRows.push(`<div class="card-meta-item"><span class="card-meta-label">OS:</span> <span class="card-meta-value">${supportedOS}</span></div>`);
    const metaBar = metaRows.length ? `<div class="card-meta-bar">${metaRows.join('')}</div>` : '';

    // إنشاء عنصر الكارت الرئيسي
    const card = document.createElement('article');
    card.className = 'game-card';

    card.innerHTML = `
      <!-- الجزء العلوي: الصورة + النصوص -->
      <div class="card-top-row">
        <div class="card-image-wrap">
          <img 
            src="${image}" 
            alt="${title}" 
            class="card-image" 
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='assets/moh.jpg';"
          >
        </div>

        <div class="card-content">
          <h3 class="card-title" dir="auto">${title}</h3>
          <p class="card-desc" dir="auto">${description}</p>
        </div>
      </div>

      <!-- تفاصيل اللعبة: سنة الإصدار، الحجم، المطور، أنظمة التشغيل -->
      ${metaBar}

      <!-- الجزء السفلي: زر تحميل الويندوز -->
      <div class="card-actions">
        <a 
          href="${pcUrl}" 
          class="btn-card-download" 
          aria-label="${downloadLabel} - ${title}"
          ${pcUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>${downloadLabel}</span>
        </a>
      </div>
    `;

    // التعامل مع الروابط التجريبية # لإظهار إشعار أنيق
    const pcBtn = card.querySelector('.btn-card-download');

    if (pcUrl === '#') {
      pcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const toastPrefix = translations[currentLang]?.toastSample || 'Clicked Windows download link for: ';
        showToast(`${toastPrefix}${title}`);
      });
    }

    return card;
  }

  /**
   * عرض قائمة الألعاب في الحاوية مع تفريغها أولاً
   */
  function displayGames(gamesToRender) {
    if (!gamesGrid) return;

    // 4. تفريغ الحاوية بالكامل قبل إضافة الكروت الجديدة لضمان عدم التكرار
    gamesGrid.innerHTML = '';

    if (!gamesToRender || gamesToRender.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // 2. تكرار forEach على مصفوفة الألعاب
    gamesToRender.forEach(game => {
      // 3. إنشاء وإضافة كارت HTML لكل لعبة
      const cardElement = renderGameCard(game);
      gamesGrid.appendChild(cardElement);
    });
  }

  /**
   * 1. جلب البيانات من ملف games-data.json ومعالجة الأخطاء
   */
  async function loadGamesData() {
    try {
      const response = await fetch('games-data.json');

      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('تنسيق البيانات غير صحيح، المتوقع مصفوفة ألعاب.');
      }

      gamesList = data;
      displayGames(gamesList);

    } catch (error) {
      console.error('حدث خطأ أثناء تحميل ملف games-data.json:', error);

      // معالجة الخطأ وإشعار المستخدم في الواجهة
      if (gamesGrid) {
        gamesGrid.innerHTML = `
          <div class="empty-state" style="display: block;">
            <div class="empty-icon" style="color: #ef4444;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>تعذر تحميل الألعاب</h3>
            <p>يرجى التأكد من تشغيل الموقع عبر خادم محلي (Local Server) أو التأكد من سلامة ملف games-data.json.</p>
          </div>
        `;
      }
    }
  }

  /**
   * البحث والتصفية المباشرة
   */
  function filterGames() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    if (!query) {
      displayGames(gamesList);
      return;
    }

    const filtered = gamesList.filter(game => {
      const titleEn = (game.title_en || '').toLowerCase();
      const titleAr = (game.title_ar || '').toLowerCase();
      const descEn = (game.description_en || '').toLowerCase();
      const descAr = (game.description_ar || '').toLowerCase();

      return titleEn.includes(query) || titleAr.includes(query) || descEn.includes(query) || descAr.includes(query);
    });
    displayGames(filtered);
  }

  // أحداث البحث
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchInput.value ? 'flex' : 'none';
      }
      filterGames();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      filterGames();
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      filterGames();
    });
  }

  // بدء تحميل البيانات
  loadGamesData();
});
