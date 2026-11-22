export const LOCALFLIX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>LocalFlix</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #141414;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      -webkit-tap-highlight-color: transparent;
    }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .shelf-row-scroll { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }
    .card-press:active { transform: scale(0.96); transition: transform 0.12s ease; }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-red-600 selection:text-white">

  <!-- Top Navigation Bar -->
  <header class="sticky top-0 z-40 flex flex-col gap-2.5 px-4 py-3 bg-black/95 backdrop-blur border-b border-neutral-800">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center space-x-3">
        <span class="text-2xl font-black text-red-600 tracking-tighter cursor-pointer" onclick="switchNavMode('movies', 'All')">LOCALFLIX</span>
        <div class="flex items-center bg-neutral-900 border border-neutral-700 rounded-full p-0.5 text-[11px] font-bold">
          <button id="navBtnMovies" onclick="switchNavMode('movies')" class="px-3 py-1 rounded-full bg-red-600 text-white transition">Movies</button>
          <button id="navBtnTV" onclick="switchNavMode('tv')" class="px-3 py-1 rounded-full text-neutral-400 transition">TV Series</button>
        </div>
      </div>

      <button id="rescanBtn" onclick="startBackgroundRescan()" class="text-[11px] bg-neutral-900 active:bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded-full border border-neutral-700 flex items-center space-x-1 shrink-0">
        <span id="rescanIcon" class="inline-block">↻</span>
        <span id="rescanBtnText">Rescan</span>
      </button>
    </div>

    <!-- Live Rescan Progress Prompt -->
    <div id="rescanStatusBox" class="hidden bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-[11px] flex flex-col gap-1 shadow-xl">
      <div class="flex items-center justify-between gap-2">
        <span id="rescanStageText" class="font-bold text-neutral-100 truncate">Starting scan...</span>
        <div class="flex items-center space-x-2 shrink-0">
          <span id="rescanTimerText" class="font-mono text-[10px] text-red-400 font-bold">0s • ETA --</span>
          <button onclick="dismissRescanBox()" class="text-neutral-400 text-xs font-bold px-1">✕</button>
        </div>
      </div>
      <div class="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div id="rescanProgressBar" class="h-full bg-red-600 rounded-full transition-all duration-300" style="width: 0%"></div>
      </div>
      <div class="flex items-center justify-between text-[10px] font-mono text-neutral-400">
        <span id="rescanCountsText">0 movies • 0 series</span>
        <span id="rescanPercentText" class="text-white font-bold">0%</span>
      </div>
    </div>

    <!-- Search Bar & Filter Toggle -->
    <div class="flex items-center space-x-2">
      <div class="relative flex-1">
        <input type="text" id="searchInput" placeholder="Search titles, genres..." class="w-full bg-neutral-900 border border-neutral-700 rounded-full py-1.5 pl-4 pr-8 text-xs text-white focus:outline-none focus:border-red-600" />
        <button id="clearSearchBtn" onclick="resetSearch()" class="absolute right-3 top-1.5 text-neutral-400 text-xs hidden">✕</button>
      </div>
      <button onclick="toggleFilterDrawer(event)" id="filterToggleBtn" class="bg-neutral-800 text-neutral-200 text-[11px] px-3 py-1.5 rounded-full border border-neutral-700 shrink-0">
        ⚙ Filters
      </button>
    </div>
  </header>

  <!-- Filter Drawer -->
  <div id="filterDrawer" class="hidden bg-neutral-900 border-b border-neutral-800 px-4 py-3 text-xs flex flex-wrap items-center gap-3 z-30">
    <div class="flex items-center space-x-1.5">
      <span class="text-neutral-400">Type:</span>
      <select id="filterScope" onchange="triggerSearch()" class="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white">
        <option value="All">All Types</option>
        <option value="Movies">Movies Only</option>
        <option value="Series">TV Series Only</option>
      </select>
    </div>

    <div class="flex items-center space-x-1.5">
      <span class="text-neutral-400">Category:</span>
      <select id="filterCategory" onchange="triggerSearch()" class="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white">
        <option value="All">All Categories</option>
        <option value="English">English</option>
        <option value="Hindi">Hindi</option>
        <option value="South Hindi">South Hindi Dubbed</option>
        <option value="South">South Movies</option>
        <option value="Animation">Animation</option>
        <option value="Foreign">Foreign Movies</option>
        <option value="Kolkata Bangla">Kolkata Bangla</option>
        <option value="English & Web Series">English Web Series</option>
        <option value="Korean TV Series">Korean TV Series</option>
      </select>
    </div>

    <div class="flex items-center space-x-1.5">
      <span class="text-neutral-400">Year:</span>
      <select id="filterYear" onchange="triggerSearch()" class="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white">
        <option value="All">All Years</option>
        <option value="2024+">2024+</option>
        <option value="2020-2023">2020 - 2023</option>
        <option value="2010-2019">2010 - 2019</option>
        <option value="before_2000">Before 2000</option>
      </select>
    </div>

    <button onclick="resetSearchFilters()" class="text-neutral-400 underline text-[11px] ml-auto">Reset</button>
  </div>

  <!-- Category Tabs -->
  <nav class="bg-black/90 border-b border-neutral-800/80 px-4 py-2 overflow-x-auto hide-scrollbar">
    <div id="categoryTabs" class="flex space-x-2 text-xs font-semibold whitespace-nowrap"></div>
  </nav>

  <!-- Hero Billboard -->
  <section id="heroBillboard" class="relative h-[340px] w-full bg-neutral-950 overflow-hidden flex items-end hidden">
    <img id="heroImage" src="" class="absolute inset-0 w-full h-full object-cover object-center opacity-65" />
    <div class="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/45 to-transparent"></div>
    <div class="relative z-10 p-5 w-full space-y-2.5">
      <span id="heroBadge" class="bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">Featured</span>
      <h1 id="heroTitle" class="text-2xl font-black text-white leading-tight drop-shadow-xl">Title</h1>
      <p id="heroPlot" class="text-xs text-neutral-200 line-clamp-2 leading-relaxed">Loading description...</p>
      <div class="flex flex-wrap items-center gap-2.5 pt-1">
        <button id="heroPlayBtn" class="bg-orange-600 active:bg-orange-500 text-white font-extrabold px-5 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-lg">
          <span>▶</span>
          <span>Open in VLC</span>
        </button>
        <button id="heroInfoBtn" class="bg-neutral-800/90 text-white font-bold px-4 py-2 rounded-lg text-xs border border-neutral-700">
          ℹ Details
        </button>
        <button id="heroWatchlistBtn" class="bg-neutral-900/90 text-white font-bold px-4 py-2 rounded-lg text-xs border border-neutral-700">
          <span id="heroWatchlistIcon">＋</span> <span id="heroWatchlistLabel">Watch Later</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <main class="flex-1 p-4 space-y-8">
    <!-- Empty State Before First Scan -->
    <section id="emptyStateBox" class="hidden text-center py-16 px-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-4">
      <h2 class="text-xl font-black text-white">Connect to Home Wi-Fi & Index Catalog</h2>
      <p class="text-xs text-neutral-400 leading-relaxed">Tap below to scan your BDIX media servers directly from your iPhone. Keep the app open during the scan—your screen will stay awake automatically and categories save as they finish.</p>
      <button onclick="startBackgroundRescan()" class="bg-red-600 text-white font-extrabold text-xs px-6 py-3 rounded-full shadow-lg">↻ Start Server Scan</button>
    </section>

    <!-- Search Results -->
    <section id="searchSection" class="space-y-6 hidden">
      <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
        <h2 id="searchHeading" class="text-lg font-black text-white">Search Results</h2>
        <button onclick="resetSearch()" class="text-xs text-neutral-400">✕ Clear</button>
      </div>
      <div id="searchMoviesBlock" class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-neutral-200">Movies</h3>
          <span id="searchMovieCount" class="text-xs text-neutral-400 font-mono">0 found</span>
        </div>
        <div id="searchMoviesGrid" class="grid grid-cols-3 gap-3"></div>
      </div>
      <div id="searchTVBlock" class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-neutral-200">TV Series</h3>
          <span id="searchTVCount" class="text-xs text-neutral-400 font-mono">0 found</span>
        </div>
        <div id="searchTVGrid" class="grid grid-cols-3 gap-3"></div>
      </div>
    </section>

    <!-- Paginated See More Grid -->
    <section id="paginatedSection" class="space-y-4 hidden">
      <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div>
          <button onclick="exitPaginatedView()" class="text-xs text-neutral-400 mb-1">← Back</button>
          <h2 id="paginatedHeading" class="text-lg font-black text-white">Browse</h2>
        </div>
        <span id="paginatedCount" class="text-xs font-mono text-neutral-400"></span>
      </div>
      <div id="paginatedGrid" class="grid grid-cols-3 gap-3"></div>
      <div id="paginationBar" class="flex flex-wrap items-center justify-center gap-2 pt-4 pb-8"></div>
    </section>

    <!-- TV Series Hub -->
    <section id="seriesHubView" class="space-y-6 hidden">
      <button onclick="exitSeriesHub()" class="text-xs text-neutral-400">← Back to Series</button>
      <div class="relative h-64 w-full bg-neutral-900 rounded-2xl overflow-hidden flex items-end p-5 border border-neutral-800">
        <img id="hubBackdrop" src="" class="absolute inset-0 w-full h-full object-cover object-top opacity-55" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>
        <div class="relative z-10 space-y-2 w-full">
          <span id="hubCategoryBadge" class="bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded">Series</span>
          <h1 id="hubTitle" class="text-2xl font-black text-white">Title</h1>
          <p id="hubPlot" class="text-xs text-neutral-300 line-clamp-3">Loading overview...</p>
          <div class="pt-1 flex flex-wrap items-center gap-2">
            <button id="hubResumeBtn" onclick="resumeLastSeriesEpisodeInVLC()" class="hidden bg-red-600 active:bg-red-500 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs inline-flex items-center space-x-1 shadow-lg">
              <span>▶</span>
              <span id="hubResumeLabel">Resume S1 Episode 1 in VLC</span>
            </button>
            <button id="hubWatchlistBtn" onclick="toggleWatchlist(currentSeriesObj, event)" class="bg-neutral-900/90 text-white font-bold px-4 py-1.5 rounded-xl text-xs border border-neutral-700 inline-flex items-center space-x-1">
              <span id="hubWatchlistIcon">＋</span>
              <span id="hubWatchlistLabel">Watch Later</span>
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
          <select id="hubSeasonSelect" onchange="renderHubSeasonEpisodes()" class="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold"></select>
          <span id="hubEpisodeCount" class="text-xs font-mono text-neutral-400"></span>
        </div>
        <div id="hubEpisodesGrid" class="space-y-2.5"></div>
      </div>
    </section>

    <!-- Home Shelves -->
    <div id="homeSections" class="space-y-7"></div>
  </main>

  <!-- Movie Preview Modal -->
  <div id="previewModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex items-end sm:items-center justify-center p-3" onclick="closePreviewModal()">
    <div class="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
      <button onclick="closePreviewModal()" class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/75 text-white flex items-center justify-center text-sm font-bold">✕</button>

      <div class="relative h-72 w-full bg-neutral-950 overflow-hidden shrink-0">
        <img id="previewBackdrop" src="" class="w-full h-full object-cover object-top opacity-75" />
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4 space-y-2">
          <h2 id="previewTitle" class="text-2xl font-black text-white leading-tight">Title</h2>
          <div class="flex flex-wrap items-center gap-2">
            <span id="previewHistoryBadge" class="hidden bg-red-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">Played Earlier</span>
            <span id="previewRatingBadge" class="bg-yellow-500 text-black text-[11px] font-black px-2 py-0.5 rounded">IMDb 7.8</span>
            <span id="previewTomatoBadge" class="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded hidden">🍅 88%</span>
            <span id="previewPopcornBadge" class="bg-yellow-600 text-white text-[11px] font-black px-2 py-0.5 rounded hidden">🍿 90%</span>
            <span id="previewYearBadge" class="text-xs font-semibold text-neutral-300">2024</span>
            <span id="previewHdBadge" class="hidden text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">1080p HD</span>
          </div>
        </div>
      </div>

      <div class="p-5 space-y-4 overflow-y-auto">
        <div class="flex items-center gap-2.5">
          <button onclick="launchVLCFromPreview()" class="flex-1 bg-orange-600 active:bg-orange-500 text-white font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg">
            <span>▶</span>
            <span id="previewVlcBtnLabel">Open in VLC</span>
          </button>
          <button id="previewWatchlistBtn" onclick="toggleWatchlist(currentMovie, event)" class="bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl text-xs border border-neutral-700">
            <span id="previewWatchlistIcon">＋</span>
            <span id="previewWatchlistLabel">Watch Later</span>
          </button>
        </div>

        <div class="space-y-1">
          <h4 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Synopsis</h4>
          <p id="previewPlot" class="text-xs leading-relaxed text-neutral-200">Loading overview...</p>
        </div>

        <div class="space-y-1 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Direct Stream URL</span>
            <button onclick="copyCurrentMovieUrl()" class="text-[11px] text-red-400 font-bold">Copy Link</button>
          </div>
          <p id="previewDirectUrl" class="text-[10px] font-mono text-emerald-400 break-all select-all"></p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const DEFAULT_MOVIE_COVER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
    const DEFAULT_TV_COVER = 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80';

    function getMetaCacheKey(title, year, mtype) {
      const cleanTitle = String(title || '').replace(/\\(.*?\\)|\\[.*?\\]/g, '').replace(/\\b(19\\d{2}|20\\d{2})\\b/g, '').trim();
      return (cleanTitle + '_' + (year || '') + '_' + (mtype === 'series' ? 'series' : 'movie')).toLowerCase();
    }

    function getCover(item) {
      if (item && item.cover_url) return item.cover_url;
      if (item) {
        const cached = DETAILS_CACHE[getMetaCacheKey(item.title, item.year, item.type)];
        if (cached && (cached.poster || cached.backdrop)) {
          item.cover_url = cached.poster || cached.backdrop;
          return item.cover_url;
        }
      }
      return item && item.type === 'series' ? DEFAULT_TV_COVER : DEFAULT_MOVIE_COVER;
    }

    // --- Lazy Poster Loader for Cards Missing Local Thumbnails ---
    const posterQueue = [];
    const posterInFlight = new Set();
    let activePosterWorkers = 0;
    let detailsSaveTimer = null;

    function scheduleDetailsSave() {
      if (detailsSaveTimer) return;
      detailsSaveTimer = setTimeout(function() {
        detailsSaveTimer = null;
        nativeSaveStorage('details_cache', JSON.stringify(DETAILS_CACHE));
      }, 1500);
    }

    function pumpPosterQueue() {
      while (activePosterWorkers < 4 && posterQueue.length > 0) {
        const job = posterQueue.shift();
        if (!job || !job.imgEl || !job.imgEl.isConnected) {
          if (job) posterInFlight.delete(job.key);
          continue;
        }
        activePosterWorkers++;
        fetchCardPosterOnly(job.item)
          .then(function(url) {
            if (url && job.imgEl && job.imgEl.isConnected) {
              job.item.cover_url = url;
              job.imgEl.src = url;
            }
          })
          .finally(function() {
            posterInFlight.delete(job.key);
            activePosterWorkers--;
            pumpPosterQueue();
          });
      }
    }

    async function fetchCardPosterOnly(item) {
      const cleanTitle = String(item.title || '').replace(/\\(.*?\\)|\\[.*?\\]/g, '').replace(/\\b(19\\d{2}|20\\d{2})\\b/g, '').trim();
      if (!cleanTitle) return null;
      const cType = item.type === 'series' ? 'series' : 'movie';
      const cacheKey = getMetaCacheKey(item.title, item.year, item.type);

      if (DETAILS_CACHE[cacheKey]) {
        return DETAILS_CACHE[cacheKey].poster || DETAILS_CACHE[cacheKey].backdrop || null;
      }

      try {
        const cRes = await nativeFetch('https://v3-cinemeta.strem.io/catalog/' + cType + '/top/search=' + encodeURIComponent(cleanTitle) + '.json');
        const cData = JSON.parse(cRes.text || '{}');
        const metas = cData.metas || [];
        let posterUrl = null;
        let backdropUrl = null;
        let plot = '';
        let rating = '7.6';

        if (metas.length > 0) {
          let best = metas[0];
          if (item.year) {
            const yrMatch = metas.find(function(m) { return String(m.year || '').includes(String(item.year)); });
            if (yrMatch) best = yrMatch;
          }
          posterUrl = best.poster || best.background || null;
          backdropUrl = best.background || best.poster || null;
          if (best.description) plot = best.description;
          if (best.imdbRating) rating = String(best.imdbRating);
        }

        DETAILS_CACHE[cacheKey] = {
          plot: plot || 'High-definition stream ready for native VLC playback on your iPhone.',
          rating: rating,
          tomatometer: null,
          audience_score: null,
          poster: posterUrl,
          backdrop: backdropUrl
        };
        scheduleDetailsSave();
        return posterUrl;
      } catch (e) {
        return null;
      }
    }

    const cardPosterObserver = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            cardPosterObserver.unobserve(img);
            const item = img._mediaItem;
            if (!item || item.cover_url) return;
            const key = getMetaCacheKey(item.title, item.year, item.type);
            if (posterInFlight.has(key)) return;
            posterInFlight.add(key);
            posterQueue.push({ item: item, imgEl: img, key: key });
            pumpPosterQueue();
          });
        }, { rootMargin: '250px' })
      : null;

    function attachLazyPoster(imgEl, item) {
      if (!imgEl || !item) return;
      if (item.cover_url) return;
      const cached = DETAILS_CACHE[getMetaCacheKey(item.title, item.year, item.type)];
      if (cached && (cached.poster || cached.backdrop)) {
        item.cover_url = cached.poster || cached.backdrop;
        imgEl.src = item.cover_url;
        return;
      }
      imgEl._mediaItem = item;
      if (cardPosterObserver) {
        cardPosterObserver.observe(imgEl);
      } else {
        const key = getMetaCacheKey(item.title, item.year, item.type);
        if (!posterInFlight.has(key)) {
          posterInFlight.add(key);
          posterQueue.push({ item: item, imgEl: imgEl, key: key });
          pumpPosterQueue();
        }
      }
    }

    // --- Native React Native Bridge ---
    const pendingNativeCalls = {};
    let nativeReqCounter = 1;

    function nativeFetch(url, options) {
      return new Promise(function(resolve, reject) {
        const id = nativeReqCounter++;
        pendingNativeCalls[id] = { resolve: resolve, reject: reject };
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FETCH',
            id: id,
            url: url,
            options: options || {}
          }));
        } else {
          fetch(url, options).then(function(r) { return r.text(); }).then(function(text) {
            resolve({ ok: true, status: 200, text: text });
          }).catch(reject);
        }
      });
    }

    function nativeSaveStorage(key, value) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SET_STORAGE',
          key: key,
          value: value
        }));
      } else {
        try { localStorage.setItem(key, value); } catch (e) {}
      }
    }

    function nativeOpenVLC(rawUrl, title, historyEntry) {
      if (historyEntry) {
        recordWatchHistory(historyEntry);
      }
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'OPEN_VLC',
          url: rawUrl,
          title: title || 'LocalFlix'
        }));
      } else {
        window.location.href = 'vlc-x-callback://x-callback-url/stream?url=' + encodeURIComponent(rawUrl);
      }
    }

    function nativeCopyText(text) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'COPY_TEXT',
          text: text
        }));
      }
    }

    function startBackgroundRescan() {
      if (isScanning) return;
      isScanning = true;
      document.getElementById('emptyStateBox').classList.add('hidden');
      document.getElementById('rescanStatusBox').classList.remove('hidden');
      document.getElementById('rescanIcon').classList.add('animate-spin');
      document.getElementById('rescanBtnText').innerText = 'Scanning';
      document.getElementById('rescanStageText').innerText = 'Starting native high-speed scan...';
      document.getElementById('rescanProgressBar').style.width = '1%';
      document.getElementById('rescanProgressBar').className = 'h-full bg-red-600 rounded-full transition-all duration-300';

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'START_SCAN' }));
      }
    }

    function handleScanProgress(msg) {
      const box = document.getElementById('rescanStatusBox');
      const stageEl = document.getElementById('rescanStageText');
      const timerEl = document.getElementById('rescanTimerText');
      const barEl = document.getElementById('rescanProgressBar');
      const countsEl = document.getElementById('rescanCountsText');
      const pctEl = document.getElementById('rescanPercentText');
      const iconEl = document.getElementById('rescanIcon');
      const btnText = document.getElementById('rescanBtnText');

      box.classList.remove('hidden');
      stageEl.innerText = msg.label || 'Scanning...';
      barEl.style.width = (msg.pct || 0) + '%';
      countsEl.innerText = (msg.movieCount || 0).toLocaleString() + ' movies • ' + (msg.tvCount || 0).toLocaleString() + ' series';
      pctEl.innerText = (msg.pct || 0) + '%';

      const elapsed = msg.elapsedSec || 0.1;
      if (msg.done) {
        timerEl.innerText = 'Done in ' + formatShortTime(elapsed);
        barEl.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
        iconEl.classList.remove('animate-spin');
        btnText.innerText = 'Rescan';
        isScanning = false;
        setTimeout(dismissRescanBox, 6000);
      } else {
        const frac = (msg.pct || 0) / 100;
        const etaStr = frac >= 0.04 ? 'ETA ' + formatShortTime((elapsed / frac) - elapsed) : 'Estimating...';
        timerEl.innerText = formatShortTime(elapsed) + ' • ' + etaStr;
        barEl.className = 'h-full bg-red-600 rounded-full transition-all duration-300';
      }
    }

    window.onNativeMessage = function(msg) {
      if (!msg) return;
      if (msg.type === 'FETCH_RESULT' && pendingNativeCalls[msg.id]) {
        const cb = pendingNativeCalls[msg.id];
        delete pendingNativeCalls[msg.id];
        if (msg.error) cb.reject(new Error(msg.error));
        else cb.resolve(msg);
      } else if (msg.type === 'CATALOG_BEGIN') {
        MOVIE_CATALOG = [];
        TV_CATALOG = [];
        if (msg.watchlist !== null && msg.watchlist !== undefined) watchlistItems = msg.watchlist;
        if (msg.history !== null && msg.history !== undefined) watchHistoryList = msg.history;
        if (msg.details !== null && msg.details !== undefined) DETAILS_CACHE = msg.details;
      } else if (msg.type === 'CATALOG_CHUNK') {
        const targetArr = msg.target === 'tv' ? TV_CATALOG : MOVIE_CATALOG;
        const chunk = msg.items || [];
        for (let i = 0; i < chunk.length; i++) {
          targetArr.push(chunk[i]);
        }
      } else if (msg.type === 'CATALOG_END') {
        if (msg.isInitialBoot) {
          bootAppAfterStorage();
        } else {
          if (currentNavMode === 'movies') loadMoviesHome(activeCategoryTab);
          else loadTVHome(activeCategoryTab);
        }
      } else if (msg.type === 'SCAN_PROGRESS') {
        handleScanProgress(msg);
      }
    };

    const NETFLIX_TRENDING_KEYWORDS = [
      'gladiator', 'dune', 'avatar', 'oppenheimer', 'leave the world behind',
      'rebel ridge', 'society of the snow', 'nowhere', 'red notice', 'the adam project',
      'beverly hills cop', 'bad boys', 'under paris', 'godzilla', 'top gun', 'alien',
      'interstellar', 'batman', 'spider-man', 'john wick', 'deadpool', 'bullet train',
      'inception', 'matrix', 'avengers', 'mad max', 'furiosa', 'civil war', 'joker',
      'knives out', 'extraction', 'gray man', 'mission', 'fast', 'guardians'
    ];

    const GENRE_RULES = {
      "Action & Adventure": ['action', 'war', 'mission', 'fast', 'furious', 'avengers', 'batman', 'spider', 'wick', 'die hard', 'terminator', 'bond', 'gladiator', 'pirates', 'indiana', 'rambo', 'matrix', 'assassin', 'guardians', 'transformer', 'top gun', 'fury', 'bullet', 'sniper', 'pushpa', 'tomb', 'bad boys', 'expendables', 'weapon', 'rush', 'drive', 'speed', 'kgf', 'salaar', 'rrr'],
      "Sci-Fi & Fantasy": ['star', 'wars', 'trek', 'alien', 'dune', 'avatar', 'blade runner', 'interstellar', 'jurassic', 'marvel', 'godzilla', 'kong', 'space', 'galaxy', 'matrix', 'planet', 'lord of the rings', 'hobbit', 'harry potter', 'wizard', 'magic', 'cloverfield', 'gravity', 'arrival', 'inception', 'edge of tomorrow', 'moon', 'apocalypse', 'predator'],
      "Crime & Thriller": ['godfather', 'mafia', 'cop', 'detective', 'gangster', 'heist', 'sherlock', 'knives out', 'se7en', 'zodiac', 'shutter island', 'sicario', 'fbi', 'kill', 'crime', 'blood', 'bank', 'ocean', 'hustle', 'gone girl', 'prison', 'escape', 'fugitive', 'agent', 'hitman', 'drishyam'],
      "Horror & Mystery": ['horror', 'evil', 'dead', 'conjuring', 'saw', 'halloween', 'nightmare', 'quiet place', 'insidious', 'scream', 'dracula', 'exorcist', 'annabelle', 'resident evil', 'purge', 'ghost', 'demon', 'zombie', 'paranormal', 'nun', 'ring', 'grudge', 'sinister', 'witch'],
      "Animation & Family": ['toy story', 'frozen', 'shrek', 'dragon', 'minions', 'despicable', 'incredibles', 'monsters', 'nemo', 'dory', 'lion king', 'kung fu panda', 'cars', 'madagascar', 'ice age', 'pixar', 'disney', 'animation', 'anime', 'aladdin', 'moana', 'zootopia', 'coco', 'inside out', 'sing', 'ratatouille', 'up', 'wall-e', 'tangled', 'spider-verse'],
      "Comedy": ['comedy', 'hangover', 'ted', 'jump street', 'dumb', 'scary movie', 'meet the', 'american pie', 'horrible bosses', 'superbad', 'rush hour', 'borat', 'dictator', 'anchorman', 'step brothers', 'liar', 'bruce almighty', 'mask', 'grown ups', 'zoolander', 'dhamaal']
    };

    let MOVIE_CATALOG = [];
    let TV_CATALOG = [];
    let DETAILS_CACHE = {};
    let watchlistItems = [];
    let watchHistoryList = [];

    let currentNavMode = 'movies';
    let activeCategoryTab = 'All';
    let currentHeroItem = null;
    let currentSeriesObj = null;
    let currentMovie = null;
    let isScanning = false;
    let searchDebounce = null;

    function resolveUrl(base, href) {
      if (/^https?:\\/\\//i.test(href)) return href;
      if (href.startsWith('/')) {
        const origin = (base.match(/^https?:\\/\\/[^/]+/i) || [''])[0];
        return origin + href;
      }
      return base.endsWith('/') ? base + href : base + '/' + href;
    }

    function safeDecode(s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    }

    function formatRelativeTime(ts) {
      if (!ts) return 'Recently';
      const diffSec = Math.max(1, Math.floor((Date.now() - ts) / 1000));
      if (diffSec < 60) return 'Just now';
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return mins + 'm ago';
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return hrs + 'h ago';
      const days = Math.floor(hrs / 24);
      return days + 'd ago';
    }

    function formatShortTime(sec) {
      const s = Math.max(0, Math.floor(sec));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m > 0 ? m + 'm ' + r + 's' : r + 's';
    }

    function dismissRescanBox() {
      document.getElementById('rescanStatusBox').classList.add('hidden');
    }

    async function getDirectoryLinks(url) {
      try {
        const res = await nativeFetch(url);
        if (!res || !res.ok || !res.text) return [];
        const links = [];
        const regex = /<a\\s+[^>]*href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi;
        let match;
        while ((match = regex.exec(res.text)) !== null) {
          const href = match[1].trim();
          const txt = match[2].replace(/<[^>]+>/g, '').trim();
          if (!href || href.startsWith('?') || href === '../' || href === '/' || href === './' || /parent directory/i.test(txt)) continue;
          links.push(href);
        }
        return links;
      } catch (e) {
        return [];
      }
    }

    // --- Watch History / Continue Watching Engine ---
    function getHistoryRecord(item) {
      if (!item) return null;
      return watchHistoryList.find(function(h) { return h.id === item.id; }) || null;
    }

    function recordWatchHistory(entry) {
      if (!entry || !entry.id) return;
      const item = Object.assign({}, entry, { played_at: Date.now() });
      watchHistoryList = [item].concat(watchHistoryList.filter(function(h) { return h.id !== item.id; })).slice(0, 30);
      nativeSaveStorage('history_cache', JSON.stringify(watchHistoryList));
      renderTopPersonalShelves();
    }

    function removeFromHistory(itemId, e) {
      if (e) e.stopPropagation();
      watchHistoryList = watchHistoryList.filter(function(h) { return h.id !== itemId; });
      nativeSaveStorage('history_cache', JSON.stringify(watchHistoryList));
      renderTopPersonalShelves();
    }

    // --- Watch Later Engine ---
    function isInWatchlist(item) {
      if (!item) return false;
      return watchlistItems.some(function(w) { return w.id === item.id; });
    }

    function toggleWatchlist(item, e) {
      if (e) e.stopPropagation();
      if (!item) return;
      if (isInWatchlist(item)) {
        watchlistItems = watchlistItems.filter(function(w) { return w.id !== item.id; });
      } else {
        watchlistItems = [item].concat(watchlistItems.filter(function(w) { return w.id !== item.id; })).slice(0, 60);
      }
      nativeSaveStorage('watchlist_cache', JSON.stringify(watchlistItems));
      syncAllWatchlistButtons();
      renderTopPersonalShelves();
    }

    function syncAllWatchlistButtons() {
      if (currentHeroItem) {
        const saved = isInWatchlist(currentHeroItem);
        document.getElementById('heroWatchlistIcon').innerText = saved ? '✓' : '＋';
        document.getElementById('heroWatchlistLabel').innerText = saved ? 'Saved' : 'Watch Later';
      }
      if (currentMovie) {
        const saved = isInWatchlist(currentMovie);
        document.getElementById('previewWatchlistIcon').innerText = saved ? '✓' : '＋';
        document.getElementById('previewWatchlistLabel').innerText = saved ? 'Saved' : 'Watch Later';
      }
      if (currentSeriesObj) {
        const saved = isInWatchlist(currentSeriesObj);
        document.getElementById('hubWatchlistIcon').innerText = saved ? '✓' : '＋';
        document.getElementById('hubWatchlistLabel').innerText = saved ? 'Saved' : 'Watch Later';
      }
      document.querySelectorAll('.wl-card-btn').forEach(function(btn) {
        const id = btn.getAttribute('data-id');
        const saved = watchlistItems.some(function(w) { return w.id === id; });
        btn.innerText = saved ? '✓' : '＋';
        btn.className = saved
          ? 'wl-card-btn absolute bottom-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow'
          : 'wl-card-btn absolute bottom-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-black/80 text-white border border-white/30 text-xs font-black flex items-center justify-center shadow';
      });
    }

    function renderTopPersonalShelves() {
      const existingCW = document.getElementById('continueWatchingSection');
      if (existingCW) existingCW.remove();
      const existingWL = document.getElementById('watchlistSection');
      if (existingWL) existingWL.remove();

      const container = document.getElementById('homeSections');
      if (!container) return;

      const wlItems = currentNavMode === 'tv'
        ? watchlistItems.filter(function(x) { return x.type === 'series'; })
        : watchlistItems;

      if (wlItems.length > 0) {
        const wlSec = document.createElement('section');
        wlSec.id = 'watchlistSection';
        wlSec.className = 'space-y-2';
        wlSec.innerHTML =
          '<div class="flex items-center space-x-2">' +
            '<span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span>' +
            '<h2 class="text-base font-black text-white">Watch Later (' + wlItems.length + ')</h2>' +
          '</div>' +
          '<div id="wlRow" class="flex space-x-3 shelf-row-scroll hide-scrollbar py-1"></div>';
        const wlRow = wlSec.querySelector('#wlRow');
        wlItems.forEach(function(it) {
          const wrap = document.createElement('div');
          wrap.className = 'w-28 flex-shrink-0';
          wrap.appendChild(createCard(it));
          wlRow.appendChild(wrap);
        });
        container.prepend(wlSec);
      }

      const cwItems = currentNavMode === 'tv'
        ? watchHistoryList.filter(function(x) { return x.type === 'series'; })
        : watchHistoryList;

      if (cwItems.length > 0) {
        const cwSec = document.createElement('section');
        cwSec.id = 'continueWatchingSection';
        cwSec.className = 'space-y-2';
        cwSec.innerHTML =
          '<div class="flex items-center space-x-2">' +
            '<span class="w-1.5 h-4 bg-red-600 rounded-full"></span>' +
            '<h2 class="text-base font-black text-white">Continue Watching</h2>' +
          '</div>' +
          '<div id="cwRow" class="flex space-x-3 shelf-row-scroll hide-scrollbar py-1"></div>';
        const cwRow = cwSec.querySelector('#cwRow');
        cwItems.forEach(function(it) {
          const wrap = document.createElement('div');
          wrap.className = 'w-28 flex-shrink-0';
          wrap.appendChild(createHistoryCard(it));
          cwRow.appendChild(wrap);
        });
        container.prepend(cwSec);
      }
    }

    function createHistoryCard(item) {
      const card = document.createElement('div');
      card.className = 'card-press cursor-pointer flex flex-col rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 relative';

      const sMatch = String(item.season_key || 'Season 1').match(/\\d+/);
      const sNum = sMatch ? sMatch[0] : '1';
      const epNum = (item.episode_idx !== undefined ? item.episode_idx + 1 : 1);
      const fallbackUrl = item.type === 'series' ? DEFAULT_TV_COVER : DEFAULT_MOVIE_COVER;

      const badgeHtml = item.type === 'series'
        ? '<span class="absolute top-1.5 left-1.5 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">S' + sNum + ':E' + epNum + '</span>'
        : '<span class="absolute top-1.5 left-1.5 bg-black/85 text-neutral-200 font-bold text-[8px] px-1.5 py-0.5 rounded">' + formatRelativeTime(item.played_at) + '</span>';

      const subLine = item.type === 'series'
        ? 'S' + sNum + ':E' + epNum + ' • ' + formatRelativeTime(item.played_at)
        : formatRelativeTime(item.played_at);

      card.innerHTML =
        '<div class="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">' +
          '<img src="' + getCover(item) + '" class="card-poster-img w-full h-full object-cover" loading="lazy" onerror="this.src=\\'' + fallbackUrl + '\\'" />' +
          badgeHtml +
          '<button class="rm-cw-btn absolute top-1.5 right-1.5 z-30 w-5 h-5 rounded-full bg-black/80 text-white text-[10px] font-bold flex items-center justify-center">✕</button>' +
          '<div class="absolute bottom-0 inset-x-0 h-1 bg-red-600"></div>' +
        '</div>' +
        '<div class="p-2">' +
          '<h4 class="text-[11px] font-bold truncate text-white">' + item.title + '</h4>' +
          '<p class="text-[9px] font-mono text-neutral-400 truncate">' + subLine + '</p>' +
        '</div>';

      attachLazyPoster(card.querySelector('.card-poster-img'), item);
      card.querySelector('.rm-cw-btn').onclick = function(e) { removeFromHistory(item.id, e); };
      card.onclick = function() {
        if (item.type === 'series') openSeriesHub(item);
        else openPreviewModal(item);
      };
      return card;
    }

    // --- Home Shelves & Categorization ---
    function pickUnique(candidates, seenIds, count) {
      const avail = candidates.filter(function(m) { return !seenIds.has(m.id); });
      for (let i = avail.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = avail[i]; avail[i] = avail[j]; avail[j] = tmp;
      }
      const chosen = avail.slice(0, count);
      chosen.forEach(function(m) { seenIds.add(m.id); });
      return chosen;
    }

    function loadMoviesHome(category) {
      activeCategoryTab = category;
      const cats = ["All", "English", "Hindi", "South Hindi", "South", "Animation", "Foreign", "Kolkata Bangla"];
      renderCategoryTabs(cats, category, loadMoviesHome);

      const pool = category === 'All' ? MOVIE_CATALOG.slice() : MOVIE_CATALOG.filter(function(m) { return m.category === category; });
      const container = document.getElementById('homeSections');
      container.innerHTML = '';

      if (pool.length === 0) {
        document.getElementById('heroBillboard').classList.add('hidden');
        document.getElementById('emptyStateBox').classList.remove('hidden');
        return;
      }
      document.getElementById('emptyStateBox').classList.add('hidden');

      const seenIds = new Set();
      let trendingCand = pool.filter(function(m) {
        const low = m.title.toLowerCase();
        return NETFLIX_TRENDING_KEYWORDS.some(function(kw) { return low.includes(kw); }) || (m.is_hd && m.year >= 2021);
      });
      if (trendingCand.length < 18) trendingCand = pool.slice(0, 80);
      const trending = pickUnique(trendingCand, seenIds, 18);

      let recentCand = pool.filter(function(m) { return m.year >= 2022; });
      if (recentCand.length < 18) recentCand = pool.slice(0, 120);
      const recent = pickUnique(recentCand, seenIds, 18);

      const heroPool = trending.length ? trending : pool.slice(0, 10);
      setupHero(heroPool[Math.floor(Math.random() * heroPool.length)], 'movie');

      if (category === 'All') {
        if (trending.length) container.appendChild(createShelf('Trending on Netflix', 'netflix_trending', trending, 'movie', false));
        if (recent.length) container.appendChild(createShelf('Recent Releases', 'recent', recent, 'movie', false));

        const catLabels = {
          "English": "English Movies",
          "Hindi": "Hindi Movies",
          "South Hindi": "South Indian Movies (Hindi Dubbed)",
          "South": "South Movies",
          "Animation": "Animation Movies",
          "Foreign": "Foreign Language Movies",
          "Kolkata Bangla": "Kolkata Bangla Movies"
        };
        Object.keys(catLabels).forEach(function(catKey) {
          const catMovies = pickUnique(MOVIE_CATALOG.filter(function(m) { return m.category === catKey; }), seenIds, 18);
          if (catMovies.length) container.appendChild(createShelf(catLabels[catKey], catKey, catMovies, 'movie', false));
        });
      } else {
        if (trending.length) container.appendChild(createShelf('Trending in ' + category, 'netflix_trending', trending, 'movie', false));
        if (recent.length) container.appendChild(createShelf('Recent ' + category + ' Releases', 'recent', recent, 'movie', false));
      }

      Object.keys(GENRE_RULES).forEach(function(genre) {
        const kws = GENRE_RULES[genre];
        const gMovies = pickUnique(pool.filter(function(m) {
          const low = m.title.toLowerCase();
          return kws.some(function(kw) { return low.includes(kw); });
        }), seenIds, 18);
        if (gMovies.length) {
          const label = category === 'All' ? genre : genre + ' (' + category + ')';
          container.appendChild(createShelf(label, genre, gMovies, 'movie', true));
        }
      });

      renderTopPersonalShelves();
    }

    function loadTVHome(category) {
      activeCategoryTab = category;
      const cats = ["All", "English & Web Series", "Korean TV Series"];
      renderCategoryTabs(cats, category, loadTVHome);

      const pool = category === 'All' ? TV_CATALOG.slice() : TV_CATALOG.filter(function(s) { return s.category === category; });
      const container = document.getElementById('homeSections');
      container.innerHTML = '';

      if (pool.length === 0) {
        document.getElementById('heroBillboard').classList.add('hidden');
        document.getElementById('emptyStateBox').classList.remove('hidden');
        return;
      }
      document.getElementById('emptyStateBox').classList.add('hidden');

      const seenIds = new Set();
      const trending = pickUnique(pool.slice(0, 60), seenIds, 18);
      const eng = pickUnique(pool.filter(function(s) { return s.category === 'English & Web Series'; }), seenIds, 18);
      const kor = pickUnique(pool.filter(function(s) { return s.category === 'Korean TV Series'; }), seenIds, 18);

      setupHero(trending[0] || pool[0], 'series');

      if (trending.length) container.appendChild(createShelf('Trending TV Shows', 'all', trending, 'series', false));
      if (eng.length) container.appendChild(createShelf('English & Global Web Series', 'English & Web Series', eng, 'series', false));
      if (kor.length) container.appendChild(createShelf('Korean TV & K-Dramas', 'Korean TV Series', kor, 'series', false));

      renderTopPersonalShelves();
    }

    function renderCategoryTabs(categories, activeCat, callback) {
      const container = document.getElementById('categoryTabs');
      container.innerHTML = '';
      categories.forEach(function(cat) {
        const btn = document.createElement('button');
        const active = cat === activeCat;
        btn.className = active
          ? 'px-3 py-1 rounded-full bg-red-600 text-white font-bold'
          : 'px-3 py-1 rounded-full text-neutral-400';
        btn.innerText = cat;
        btn.onclick = function() { callback(cat); };
        container.appendChild(btn);
      });
    }

    function createShelf(title, shelfKey, items, mtype, isGenre) {
      const sec = document.createElement('section');
      sec.className = 'space-y-2';
      sec.innerHTML = '<div class="flex items-center justify-between"><h2 class="text-base font-bold text-white">' + title + '</h2><button class="text-xs font-bold text-neutral-400 see-more-btn">See More ▶</button></div><div class="flex space-x-3 shelf-row-scroll hide-scrollbar py-1 shelf-row"></div>';
      sec.querySelector('.see-more-btn').onclick = function() {
        openSeeMore(mtype, isGenre ? shelfKey : '', isGenre ? '' : shelfKey, title, 1);
      };
      const row = sec.querySelector('.shelf-row');
      items.forEach(function(item) {
        const wrap = document.createElement('div');
        wrap.className = 'w-28 flex-shrink-0';
        wrap.appendChild(createCard(item));
        row.appendChild(wrap);
      });
      return sec;
    }

    function createCard(item) {
      const card = document.createElement('div');
      card.className = 'card-press cursor-pointer flex flex-col rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800/80 relative';
      const saved = isInWatchlist(item);
      const fallbackUrl = item.type === 'series' ? DEFAULT_TV_COVER : DEFAULT_MOVIE_COVER;
      const wlClass = saved
        ? 'wl-card-btn absolute bottom-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow'
        : 'wl-card-btn absolute bottom-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-black/80 text-white border border-white/30 text-xs font-black flex items-center justify-center shadow';

      card.innerHTML =
        '<div class="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">' +
          '<img src="' + getCover(item) + '" class="card-poster-img w-full h-full object-cover" loading="lazy" onerror="this.src=\\'' + fallbackUrl + '\\'" />' +
          (item.year ? '<span class="absolute top-1.5 left-1.5 bg-black/80 text-neutral-200 font-bold text-[9px] px-1.5 py-0.5 rounded">' + item.year + '</span>' : '') +
          (item.is_hd ? '<span class="absolute top-1.5 right-1.5 bg-red-600 text-white font-bold text-[8px] px-1 py-0.5 rounded">HD</span>' : '') +
          '<button data-id="' + item.id + '" class="' + wlClass + '">' + (saved ? '✓' : '＋') + '</button>' +
        '</div>' +
        '<div class="p-2"><h4 class="text-[11px] font-semibold truncate text-neutral-100">' + item.title + '</h4></div>';

      attachLazyPoster(card.querySelector('.card-poster-img'), item);
      card.querySelector('.wl-card-btn').onclick = function(e) { toggleWatchlist(item, e); };
      card.onclick = function() {
        if (item.type === 'series') openSeriesHub(item);
        else openPreviewModal(item);
      };
      return card;
    }

    async function fetchOnlineMetadata(title, year, mtype) {
      const cleanTitle = title.replace(/\\(.*?\\)|\\[.*?\\]/g, '').replace(/\\b(19\\d{2}|20\\d{2})\\b/g, '').trim();
      const cacheKey = getMetaCacheKey(title, year, mtype);
      const existing = DETAILS_CACHE[cacheKey];
      if (existing && (existing.tomatometer || existing.audience_score || existing.checked_rt)) {
        return existing;
      }

      let plot = existing?.plot || '';
      let rating = existing?.rating || '7.6';
      let tomatometer = existing?.tomatometer || null;
      let audience_score = existing?.audience_score || null;
      let poster = existing?.poster || null;
      let backdrop = existing?.backdrop || null;

      if (!poster || !backdrop || !plot) {
        try {
          const cType = mtype === 'series' ? 'series' : 'movie';
          const cRes = await nativeFetch('https://v3-cinemeta.strem.io/catalog/' + cType + '/top/search=' + encodeURIComponent(cleanTitle) + '.json');
          const cData = JSON.parse(cRes.text || '{}');
          const metas = cData.metas || [];
          if (metas.length > 0) {
            let best = metas[0];
            if (year) {
              const yrMatch = metas.find(function(m) { return String(m.year || '').includes(String(year)); });
              if (yrMatch) best = yrMatch;
            }
            if (best.description) plot = best.description;
            if (best.imdbRating) rating = String(best.imdbRating);
            if (best.poster) poster = best.poster;
            if (best.background) backdrop = best.background;
            else if (best.poster) backdrop = best.poster;
          }
        } catch (e) {}
      }

      try {
        const rtRes = await nativeFetch('https://www.rottentomatoes.com/napi/search/all?searchQuery=' + encodeURIComponent(cleanTitle));
        if (rtRes.ok && rtRes.text) {
          const rtData = JSON.parse(rtRes.text);
          const list = (mtype === 'series' ? rtData.tvSeries : rtData.movies) || rtData.movies || rtData.tvSeries || [];
          if (list.length > 0) {
            const best = list[0];
            const tScore = best.tomatometerScore && best.tomatometerScore.score !== undefined ? best.tomatometerScore.score : best.tomatometerScore;
            const aScore = best.audienceScore && best.audienceScore.score !== undefined ? best.audienceScore.score : best.audienceScore;
            if (tScore !== null && tScore !== undefined && String(tScore).match(/^\\d+$/)) tomatometer = tScore + '%';
            if (aScore !== null && aScore !== undefined && String(aScore).match(/^\\d+$/)) audience_score = aScore + '%';
          }
        }
      } catch (e) {}

      if (!plot) plot = 'High-definition stream ready for native VLC playback on your iPhone.';
      const result = {
        plot: plot,
        rating: rating,
        tomatometer: tomatometer,
        audience_score: audience_score,
        poster: poster,
        backdrop: backdrop,
        checked_rt: true
      };
      DETAILS_CACHE[cacheKey] = result;
      scheduleDetailsSave();
      return result;
    }

    function setupHero(item, type) {
      if (!item) return;
      currentHeroItem = item;
      document.getElementById('heroBillboard').classList.remove('hidden');
      document.getElementById('heroTitle').innerText = item.title;
      document.getElementById('heroImage').src = getCover(item);
      document.getElementById('heroBadge').innerText = item.category || 'Featured';
      document.getElementById('heroWatchlistBtn').onclick = function(e) { toggleWatchlist(item, e); };
      syncAllWatchlistButtons();

      if (type === 'movie') {
        document.getElementById('heroPlayBtn').onclick = function() {
          nativeOpenVLC(item.raw_url, item.title, item);
        };
        document.getElementById('heroInfoBtn').onclick = function() { openPreviewModal(item); };
      } else {
        document.getElementById('heroPlayBtn').onclick = function() { openSeriesHub(item); };
        document.getElementById('heroInfoBtn').onclick = function() { openSeriesHub(item); };
      }

      fetchOnlineMetadata(item.title, item.year, type).then(function(d) {
        document.getElementById('heroPlot').innerText = d.plot;
        if (d.backdrop) {
          document.getElementById('heroImage').src = d.backdrop;
        }
        if (!item.cover_url && (d.poster || d.backdrop)) {
          item.cover_url = d.poster || d.backdrop;
        }
      });
    }

    async function openPreviewModal(movie) {
      currentMovie = movie;
      document.getElementById('previewTitle').innerText = movie.title;
      document.getElementById('previewYearBadge').innerText = movie.year || '';
      document.getElementById('previewBackdrop').src = getCover(movie);
      document.getElementById('previewPlot').innerText = 'Loading synopsis & ratings...';
      document.getElementById('previewRatingBadge').innerText = 'IMDb ...';
      document.getElementById('previewTomatoBadge').classList.add('hidden');
      document.getElementById('previewPopcornBadge').classList.add('hidden');
      document.getElementById('previewDirectUrl').innerText = movie.raw_url;

      const hist = getHistoryRecord(movie);
      const histBadge = document.getElementById('previewHistoryBadge');
      const vlcLabel = document.getElementById('previewVlcBtnLabel');
      if (hist) {
        histBadge.innerText = 'Played ' + formatRelativeTime(hist.played_at);
        histBadge.classList.remove('hidden');
        vlcLabel.innerText = 'Continue in VLC';
      } else {
        histBadge.classList.add('hidden');
        vlcLabel.innerText = 'Open in VLC';
      }

      const hdBadge = document.getElementById('previewHdBadge');
      if (movie.is_hd) hdBadge.classList.remove('hidden');
      else hdBadge.classList.add('hidden');

      syncAllWatchlistButtons();
      document.getElementById('previewModal').classList.remove('hidden');

      const d = await fetchOnlineMetadata(movie.title, movie.year, 'movie');
      document.getElementById('previewPlot').innerText = d.plot;
      if (d.rating) document.getElementById('previewRatingBadge').innerText = 'IMDb ' + d.rating;
      if (d.tomatometer) {
        document.getElementById('previewTomatoBadge').innerText = '🍅 ' + d.tomatometer;
        document.getElementById('previewTomatoBadge').classList.remove('hidden');
      }
      if (d.audience_score) {
        document.getElementById('previewPopcornBadge').innerText = '🍿 ' + d.audience_score;
        document.getElementById('previewPopcornBadge').classList.remove('hidden');
      }
      if (d.backdrop) document.getElementById('previewBackdrop').src = d.backdrop;
      if (!movie.cover_url && (d.poster || d.backdrop)) {
        movie.cover_url = d.poster || d.backdrop;
      }
    }

    function closePreviewModal() {
      document.getElementById('previewModal').classList.add('hidden');
    }

    function launchVLCFromPreview() {
      if (!currentMovie) return;
      nativeOpenVLC(currentMovie.raw_url, currentMovie.title, currentMovie);
    }

    function copyCurrentMovieUrl() {
      if (!currentMovie) return;
      nativeCopyText(currentMovie.raw_url);
    }

    // --- TV Series Hub with History & Resume ---
    async function openSeriesHub(series) {
      currentSeriesObj = series;
      document.getElementById('homeSections').classList.add('hidden');
      document.getElementById('heroBillboard').classList.add('hidden');
      document.getElementById('paginatedSection').classList.add('hidden');
      document.getElementById('searchSection').classList.add('hidden');

      const hub = document.getElementById('seriesHubView');
      hub.classList.remove('hidden');
      document.getElementById('hubTitle').innerText = series.title;
      document.getElementById('hubCategoryBadge').innerText = series.category || 'Series';
      document.getElementById('hubBackdrop').src = getCover(series);
      document.getElementById('hubPlot').innerText = 'Loading episodes...';
      syncAllWatchlistButtons();

      fetchOnlineMetadata(series.title, series.year, 'series').then(function(d) {
        document.getElementById('hubPlot').innerText = d.plot;
        if (d.backdrop) document.getElementById('hubBackdrop').src = d.backdrop;
        if (!series.cover_url && (d.poster || d.backdrop)) {
          series.cover_url = d.poster || d.backdrop;
        }
      });

      if (!series.seasons && series.series_url) {
        const items = await getDirectoryLinks(series.series_url);
        const subdirs = items.filter(function(f) { return f.endsWith('/') && !/sample|extra|subs/i.test(f); });
        const directVids = items.filter(function(f) { return /\\.(mp4|mkv|avi|webm)$/i.test(f) && !/sample|trailer/i.test(f); });
        const seasons = {};

        if (subdirs.length > 0) {
          for (let i = 0; i < subdirs.length; i++) {
            const sUrl = resolveUrl(series.series_url, subdirs[i]);
            const epItems = await getDirectoryLinks(sUrl);
            const epVids = epItems.filter(function(f) { return /\\.(mp4|mkv|avi|webm)$/i.test(f) && !/sample|trailer/i.test(f); })
              .sort(function(a, b) { return safeDecode(a).localeCompare(safeDecode(b), undefined, { numeric: true }); });
            if (epVids.length > 0) {
              const label = safeDecode(subdirs[i].replace(/\\/$/, '').split('/').pop() || subdirs[i]);
              seasons[label] = epVids.map(function(v, idx) {
                return { title: 'Episode ' + (idx + 1), filename: safeDecode(v.split('/').pop() || v), raw_url: resolveUrl(sUrl, v) };
              });
            }
          }
        } else if (directVids.length > 0) {
          directVids.sort(function(a, b) { return safeDecode(a).localeCompare(safeDecode(b), undefined, { numeric: true }); });
          seasons['Season 1'] = directVids.map(function(v, idx) {
            return { title: 'Episode ' + (idx + 1), filename: safeDecode(v.split('/').pop() || v), raw_url: resolveUrl(series.series_url, v) };
          });
        }
        series.seasons = seasons;
      }

      const select = document.getElementById('hubSeasonSelect');
      select.innerHTML = '';
      const keys = Object.keys(series.seasons || {});
      keys.forEach(function(k) {
        const opt = document.createElement('option');
        opt.value = k;
        opt.innerText = k + ' (' + series.seasons[k].length + ' Episodes)';
        select.appendChild(opt);
      });

      const hist = getHistoryRecord(series);
      const resumeBtn = document.getElementById('hubResumeBtn');
      if (hist && hist.season_key && series.seasons && series.seasons[hist.season_key]) {
        select.value = hist.season_key;
        const epNum = (hist.episode_idx !== undefined ? hist.episode_idx + 1 : 1);
        document.getElementById('hubResumeLabel').innerText = 'Resume ' + hist.season_key + ' Episode ' + epNum + ' in VLC';
        resumeBtn.classList.remove('hidden');
      } else {
        resumeBtn.classList.add('hidden');
      }

      renderHubSeasonEpisodes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resumeLastSeriesEpisodeInVLC() {
      if (!currentSeriesObj) return;
      const hist = getHistoryRecord(currentSeriesObj);
      if (!hist) return;
      const sKey = hist.season_key || Object.keys(currentSeriesObj.seasons || {})[0];
      const epIdx = hist.episode_idx || 0;
      const ep = (currentSeriesObj.seasons && currentSeriesObj.seasons[sKey] && currentSeriesObj.seasons[sKey][epIdx]) || null;
      if (!ep) return;

      const entry = {
        id: currentSeriesObj.id,
        type: 'series',
        title: currentSeriesObj.title,
        cover_url: getCover(currentSeriesObj),
        year: currentSeriesObj.year,
        category: currentSeriesObj.category,
        is_hd: currentSeriesObj.is_hd,
        series_url: currentSeriesObj.series_url,
        season_key: sKey,
        episode_idx: epIdx,
        episode_title: ep.title,
        raw_url: ep.raw_url
      };
      nativeOpenVLC(ep.raw_url, currentSeriesObj.title + ' - ' + ep.title, entry);
    }

    function renderHubSeasonEpisodes() {
      const sel = document.getElementById('hubSeasonSelect').value;
      const eps = (currentSeriesObj && currentSeriesObj.seasons && currentSeriesObj.seasons[sel]) || [];
      const grid = document.getElementById('hubEpisodesGrid');
      grid.innerHTML = '';
      document.getElementById('hubEpisodeCount').innerText = eps.length + ' Episodes';

      const hist = getHistoryRecord(currentSeriesObj);

      eps.forEach(function(ep, idx) {
        const isLastEp = hist && hist.season_key === sel && hist.episode_idx === idx;
        const card = document.createElement('div');
        card.className = 'bg-neutral-900 border ' + (isLastEp ? 'border-red-600' : 'border-neutral-800') + ' rounded-xl p-3 flex items-center justify-between gap-2';
        card.innerHTML =
          '<div class="min-w-0 flex-1">' +
            '<div class="flex items-center space-x-2">' +
              '<h4 class="text-xs font-bold text-white">' + ep.title + '</h4>' +
              (isLastEp ? '<span class="text-[9px] bg-red-600/20 text-red-400 border border-red-600/40 font-bold px-1.5 py-0.5 rounded">Last Played</span>' : '') +
            '</div>' +
            '<span class="text-[10px] text-neutral-400 font-mono truncate block">' + ep.filename + '</span>' +
          '</div>' +
          '<button class="bg-orange-600 active:bg-orange-500 text-white font-extrabold text-[11px] px-3 py-2 rounded-lg shrink-0">▶ VLC</button>';

        card.querySelector('button').onclick = function() {
          const entry = {
            id: currentSeriesObj.id,
            type: 'series',
            title: currentSeriesObj.title,
            cover_url: getCover(currentSeriesObj),
            year: currentSeriesObj.year,
            category: currentSeriesObj.category,
            is_hd: currentSeriesObj.is_hd,
            series_url: currentSeriesObj.series_url,
            season_key: sel,
            episode_idx: idx,
            episode_title: ep.title,
            raw_url: ep.raw_url
          };
          nativeOpenVLC(ep.raw_url, currentSeriesObj.title + ' - ' + ep.title, entry);
          renderHubSeasonEpisodes();
        };
        grid.appendChild(card);
      });
    }

    function exitSeriesHub() {
      document.getElementById('seriesHubView').classList.add('hidden');
      document.getElementById('homeSections').classList.remove('hidden');
      document.getElementById('heroBillboard').classList.remove('hidden');
      renderTopPersonalShelves();
    }

    // --- Search & Filters ---
    document.getElementById('searchInput').addEventListener('input', function(e) {
      const q = e.target.value.trim();
      const clearBtn = document.getElementById('clearSearchBtn');
      clearTimeout(searchDebounce);
      if (q.length > 0) {
        clearBtn.classList.remove('hidden');
        searchDebounce = setTimeout(triggerSearch, 200);
      } else {
        clearBtn.classList.add('hidden');
        resetSearch();
      }
    });

    function triggerSearch() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      const scope = document.getElementById('filterScope').value;
      const cat = document.getElementById('filterCategory').value;
      const yr = document.getElementById('filterYear').value;

      function matchItem(item) {
        if (cat !== 'All' && item.category !== cat) return false;
        if (yr === '2024+' && item.year < 2024) return false;
        if (yr === '2020-2023' && (item.year < 2020 || item.year > 2023)) return false;
        if (yr === '2010-2019' && (item.year < 2010 || item.year > 2019)) return false;
        if (yr === 'before_2000' && (item.year <= 0 || item.year >= 2000)) return false;
        if (q && !item.title.toLowerCase().includes(q)) return false;
        return true;
      }

      document.getElementById('homeSections').classList.add('hidden');
      document.getElementById('heroBillboard').classList.add('hidden');
      document.getElementById('paginatedSection').classList.add('hidden');
      document.getElementById('seriesHubView').classList.add('hidden');
      document.getElementById('searchSection').classList.remove('hidden');
      document.getElementById('searchHeading').innerText = 'Results for "' + (q || 'All') + '"';

      const mMatches = scope === 'Series' ? [] : MOVIE_CATALOG.filter(matchItem);
      const tvMatches = scope === 'Movies' ? [] : TV_CATALOG.filter(matchItem);

      const mGrid = document.getElementById('searchMoviesGrid');
      mGrid.innerHTML = '';
      document.getElementById('searchMovieCount').innerText = mMatches.length + ' found';
      document.getElementById('searchMoviesBlock').classList.toggle('hidden', mMatches.length === 0);
      mMatches.slice(0, 45).forEach(function(m) { mGrid.appendChild(createCard(m)); });

      const tvGrid = document.getElementById('searchTVGrid');
      tvGrid.innerHTML = '';
      document.getElementById('searchTVCount').innerText = tvMatches.length + ' found';
      document.getElementById('searchTVBlock').classList.toggle('hidden', tvMatches.length === 0);
      tvMatches.slice(0, 45).forEach(function(s) { tvGrid.appendChild(createCard(s)); });
    }

    function resetSearch() {
      document.getElementById('searchInput').value = '';
      document.getElementById('clearSearchBtn').classList.add('hidden');
      document.getElementById('searchSection').classList.add('hidden');
      document.getElementById('homeSections').classList.remove('hidden');
      if (MOVIE_CATALOG.length || TV_CATALOG.length) document.getElementById('heroBillboard').classList.remove('hidden');
      renderTopPersonalShelves();
    }

    function toggleFilterDrawer(e) {
      if (e) e.stopPropagation();
      document.getElementById('filterDrawer').classList.toggle('hidden');
    }

    function resetSearchFilters() {
      document.getElementById('filterScope').value = 'All';
      document.getElementById('filterCategory').value = 'All';
      document.getElementById('filterYear').value = 'All';
      triggerSearch();
    }

    function openSeeMore(mtype, genre, shelf, headingTitle, page) {
      document.getElementById('homeSections').classList.add('hidden');
      document.getElementById('heroBillboard').classList.add('hidden');
      document.getElementById('searchSection').classList.add('hidden');
      document.getElementById('seriesHubView').classList.add('hidden');

      let pool = mtype === 'movie' ? MOVIE_CATALOG.slice() : TV_CATALOG.slice();
      if (activeCategoryTab !== 'All') pool = pool.filter(function(x) { return x.category === activeCategoryTab; });
      if (shelf === 'recent') pool = pool.filter(function(x) { return x.year >= 2022; });
      else if (shelf && shelf !== 'netflix_trending' && shelf !== 'all') pool = pool.filter(function(x) { return x.category === shelf; });
      else if (genre && GENRE_RULES[genre]) {
        const kws = GENRE_RULES[genre];
        pool = pool.filter(function(x) { return kws.some(function(kw) { return x.title.toLowerCase().includes(kw); }); });
      }

      const perPage = 30;
      const totalPages = Math.max(1, Math.ceil(pool.length / perPage));
      const slice = pool.slice((page - 1) * perPage, page * perPage);

      document.getElementById('paginatedSection').classList.remove('hidden');
      document.getElementById('paginatedHeading').innerText = headingTitle;
      document.getElementById('paginatedCount').innerText = pool.length + ' titles (Page ' + page + '/' + totalPages + ')';

      const grid = document.getElementById('paginatedGrid');
      grid.innerHTML = '';
      slice.forEach(function(it) { grid.appendChild(createCard(it)); });

      const pBar = document.getElementById('paginationBar');
      pBar.innerHTML = '';
      if (totalPages > 1) {
        for (let i = 1; i <= Math.min(totalPages, 15); i++) {
          const btn = document.createElement('button');
          btn.className = i === page ? 'w-8 h-8 rounded text-xs font-bold bg-red-600 text-white' : 'w-8 h-8 rounded text-xs font-bold bg-neutral-900 border border-neutral-700 text-neutral-300';
          btn.innerText = i;
          btn.onclick = function() { openSeeMore(mtype, genre, shelf, headingTitle, i); };
          pBar.appendChild(btn);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function exitPaginatedView() {
      document.getElementById('paginatedSection').classList.add('hidden');
      document.getElementById('homeSections').classList.remove('hidden');
      document.getElementById('heroBillboard').classList.remove('hidden');
      renderTopPersonalShelves();
    }

    function switchNavMode(mode, category) {
      currentNavMode = mode;
      activeCategoryTab = category || 'All';
      document.getElementById('navBtnMovies').className = mode === 'movies' ? 'px-3 py-1 rounded-full bg-red-600 text-white font-bold' : 'px-3 py-1 rounded-full text-neutral-400';
      document.getElementById('navBtnTV').className = mode === 'tv' ? 'px-3 py-1 rounded-full bg-red-600 text-white font-bold' : 'px-3 py-1 rounded-full text-neutral-400';
      exitSeriesHub();
      exitPaginatedView();
      resetSearch();
      if (mode === 'movies') loadMoviesHome(activeCategoryTab);
      else loadTVHome(activeCategoryTab);
    }

    function bootAppAfterStorage() {
      switchNavMode('movies', 'All');
      if (MOVIE_CATALOG.length === 0 && TV_CATALOG.length === 0) {
        startBackgroundRescan();
      }
    }

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'REQUEST_INIT' }));
    } else {
      bootAppAfterStorage();
    }
  </script>
</body>
</html>`;
