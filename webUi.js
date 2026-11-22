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
      <p class="text-xs text-neutral-400 leading-relaxed">Tap below to scan your BDIX media servers directly from your iPhone. Once indexed, everything stays cached offline on your phone.</p>
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

    <!-- Home Shelves (Continue Watching + Watch Later + Trending + Genres) -->
    <div id="homeSections" class="space-y-7"></div>
  </main>

  <!-- Movie Preview Modal (Poster Background + Ratings + Synopsis + Open in VLC) -->
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

    window.onNativeMessage = function(msg) {
      if (!msg) return;
      if (msg.type === 'FETCH_RESULT' && pendingNativeCalls[msg.id]) {
        const cb = pendingNativeCalls[msg.id];
        delete pendingNativeCalls[msg.id];
        if (msg.error) cb.reject(new Error(msg.error));
        else cb.resolve(msg);
      } else if (msg.type === 'INIT_STORAGE') {
        if (msg.movies) MOVIE_CATALOG = msg.movies;
        if (msg.tv) TV_CATALOG = msg.tv;
        if (msg.watchlist) watchlistItems = msg.watchlist;
        if (msg.history) watchHistoryList = msg.history;
        if (msg.details) DETAILS_CACHE = msg.details;
        bootAppAfterStorage();
      }
    };

    // --- Sources & Genre Rules ---
    const MOVIE_SOURCES = [
      { category: "English", name: "English 1080p", url: "http://172.16.50.14/DHAKA-FLIX-14/English%20Movies%20%281080p%29/", is_hd: true },
      { category: "English", name: "English Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/English%20Movies/", is_hd: false },
      { category: "Hindi", name: "Hindi Movies", url: "http://172.16.50.14/DHAKA-FLIX-14/Hindi%20Movies/", is_hd: false },
      { category: "South Hindi", name: "South Hindi Dubbed", url: "http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/Hindi%20Dubbed/", is_hd: false },
      { category: "South", name: "South Movies", url: "http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/South%20Movies/", is_hd: false },
      { category: "Foreign", name: "Foreign Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/Foreign%20Language%20Movies/", is_hd: false },
      { category: "Kolkata Bangla", name: "Kolkata Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/Kolkata%20Bangla%20Movies/", is_hd: false },
      { category: "Animation", name: "Animation 1080p", url: "http://172.16.50.14/DHAKA-FLIX-14/Animation%20Movies%20%281080p%29/", is_hd: true },
      { category: "Animation", name: "Animation Movies", url: "http://172.16.50.14/DHAKA-FLIX-14/Animation%20Movies/", is_hd: false }
    ];

    const TV_SOURCES = [
      { category: "English & Web Series", name: "TV Series (0-9)", url: "http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%98%85%20%200%20%20%E2%80%94%20%209/" },
      { category: "English & Web Series", name: "TV Series (A-L)", url: "http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/" },
      { category: "English & Web Series", name: "TV Series (M-R)", url: "http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A6%20%20M%20%20%E2%80%94%20%20R/" },
      { category: "English & Web Series", name: "TV Series (S-Z)", url: "http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A6%20%20S%20%20%E2%80%94%20%20Z/" },
      { category: "Korean TV Series", name: "Korean TV Series", url: "http://172.16.50.14/DHAKA-FLIX-14/KOREAN%20TV%20%26%20WEB%20Series/" }
    ];

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

    function cleanMovieName(raw) {
      let name = decodeURIComponent(raw.replace(/\\\\/g, '/').replace(/\\/$/, '').split('/').pop() || '');
      name = name.replace(/\\.(mp4|mkv|avi|webm)$/i, '');
      name = name.replace(/(1080p|720p|2160p|4k|bluray|web-dl|webrip|brrip|x264|x265|hevc|aac|dts|hdrip).*/i, '');
      return name.replace(/[._]/g, ' ').trim();
    }

    function extractYear(text) {
      const m = text.match(/\\b(19\\d{2}|20\\d{2})\\b/);
      return m ? parseInt(m[1], 10) : 0;
    }

    function resolveUrl(base, href) {
      if (/^https?:\\/\\//i.test(href)) return href;
      if (href.startsWith('/')) {
        const origin = (base.match(/^https?:\\/\\/[^/]+/i) || [''])[0];
        return origin + href;
      }
      return base.endsWith('/') ? base + href : base + '/' + href;
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

    async function getDirectoryLinks(url) {
      try {
        const res = await nativeFetch(url);
        if (!res || !res.ok || !res.text) return [];
        const doc = new DOMParser().parseFromString(res.text, 'text/html');
        const links = [];
        doc.querySelectorAll('a').forEach(function(a) {
          const href = a.getAttribute('href');
          const txt = (a.textContent || '').trim();
          if (!href || href.startsWith('?') || href === '../' || href === '/' || href === './' || txt.includes('Parent Directory')) return;
          links.push(href);
        });
        return links;
      } catch (e) {
        return [];
      }
    }

    async function runPool(tasks, concurrency) {
      const out = [];
      let idx = 0;
      async function worker() {
        while (idx < tasks.length) {
          const cur = idx++;
          out[cur] = await tasks[cur]();
        }
      }
      await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
      return out;
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

    async function startBackgroundRescan() {
      if (isScanning) return;
      isScanning = true;
      document.getElementById('emptyStateBox').classList.add('hidden');

      const box = document.getElementById('rescanStatusBox');
      const stageEl = document.getElementById('rescanStageText');
      const timerEl = document.getElementById('rescanTimerText');
      const barEl = document.getElementById('rescanProgressBar');
      const countsEl = document.getElementById('rescanCountsText');
      const pctEl = document.getElementById('rescanPercentText');
      const iconEl = document.getElementById('rescanIcon');
      const btnText = document.getElementById('rescanBtnText');

      box.classList.remove('hidden');
      iconEl.classList.add('animate-spin');
      btnText.innerText = 'Scanning';

      const totalSources = MOVIE_SOURCES.length + TV_SOURCES.length;
      let completedSources = 0;
      const startTs = Date.now();
      const movieResults = [];
      const tvResults = [];

      function updateProgress(label, pctOverride) {
        const elapsed = Math.max(0.1, (Date.now() - startTs) / 1000);
        const pct = pctOverride !== undefined ? pctOverride : Math.min(99, Math.max(1, Math.round((completedSources / totalSources) * 100)));
        const frac = pct / 100;
        const etaStr = frac >= 0.04 ? 'ETA ' + formatShortTime((elapsed / frac) - elapsed) : 'Estimating...';

        stageEl.innerText = label;
        timerEl.innerText = formatShortTime(elapsed) + ' • ' + etaStr;
        barEl.style.width = pct + '%';
        barEl.className = 'h-full bg-red-600 rounded-full transition-all duration-300';
        countsEl.innerText = movieResults.length.toLocaleString() + ' movies • ' + tvResults.length.toLocaleString() + ' series';
        pctEl.innerText = pct + '%';
      }

      updateProgress('Connecting to BDIX servers...', 1);

      for (const src of MOVIE_SOURCES) {
        updateProgress('Movies: ' + src.name);
        const rootLinks = await getDirectoryLinks(src.url);
        let doneSub = 0;
        const totalSub = Math.max(1, rootLinks.length);

        const tasks = rootLinks.map(function(link) {
          return async function() {
            const itemUrl = resolveUrl(src.url, link);
            const cleanName = cleanMovieName(link);
            if (/\\.(mp4|mkv|avi|webm)$/i.test(link)) {
              movieResults.push({
                id: 'mov_' + itemUrl,
                type: 'movie',
                title: cleanName,
                raw_url: itemUrl,
                is_hd: src.is_hd || /1080p/i.test(link),
                year: extractYear(link),
                category: src.category,
                cover_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'
              });
            } else if (link.endsWith('/')) {
              const subItems = await getDirectoryLinks(itemUrl);
              const vids = subItems.filter(function(f) { return /\\.(mp4|mkv|avi|webm)$/i.test(f) && !/sample|trailer/i.test(f); });
              const imgs = subItems.filter(function(f) { return /\\.(jpg|jpeg|png|webp)$/i.test(f); });
              if (vids.length > 0) {
                vids.sort(function(a, b) { return (/1080p/i.test(b) ? 1 : 0) - (/1080p/i.test(a) ? 1 : 0); });
                const vidUrl = resolveUrl(itemUrl, vids[0]);
                const covUrl = imgs.length > 0 ? resolveUrl(itemUrl, imgs[0]) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
                movieResults.push({
                  id: 'mov_' + vidUrl,
                  type: 'movie',
                  title: cleanName,
                  raw_url: vidUrl,
                  is_hd: src.is_hd || /1080p/i.test(link) || /1080p/i.test(vids[0]),
                  year: extractYear(link) || extractYear(vids[0]),
                  category: src.category,
                  cover_url: covUrl
                });
              }
            }
            doneSub++;
            if (doneSub % 10 === 0) {
              const pct = Math.min(98, Math.max(1, Math.round(((completedSources + (doneSub / totalSub)) / totalSources) * 100)));
              updateProgress('Movies: ' + src.name, pct);
            }
          };
        });

        await runPool(tasks, 10);
        completedSources++;
        updateProgress('Movies: ' + src.name);
      }

      const uniqueMovies = {};
      movieResults.forEach(function(m) {
        const key = m.title.toLowerCase() + '_' + m.category;
        if (!uniqueMovies[key] || (m.is_hd && !uniqueMovies[key].is_hd)) {
          uniqueMovies[key] = m;
        }
      });
      MOVIE_CATALOG = Object.values(uniqueMovies).sort(function(a, b) { return b.year - a.year; });
      nativeSaveStorage('movies_cache', JSON.stringify(MOVIE_CATALOG));

      for (const tvSrc of TV_SOURCES) {
        updateProgress('TV: ' + tvSrc.name);
        const rootLinks = await getDirectoryLinks(tvSrc.url);
        for (const link of rootLinks) {
          if (!link.endsWith('/')) continue;
          const linkUrl = resolveUrl(tvSrc.url, link);
          const sName = decodeURIComponent(link.replace(/\\/$/, '').split('/').pop() || '');
          if (/^(19|20)\\d{2}$/.test(sName.trim())) {
            const subLinks = await getDirectoryLinks(linkUrl);
            subLinks.forEach(function(slink) {
              if (!slink.endsWith('/')) return;
              const subUrl = resolveUrl(linkUrl, slink);
              const subName = decodeURIComponent(slink.replace(/\\/$/, '').split('/').pop() || '');
              tvResults.push({
                id: 'tv_' + subUrl,
                type: 'series',
                title: cleanMovieName(subName),
                year: extractYear(subName) || parseInt(sName, 10),
                category: tvSrc.category,
                is_hd: /1080p/i.test(subName),
                series_url: subUrl,
                cover_url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80',
                seasons: null
              });
            });
          } else {
            tvResults.push({
              id: 'tv_' + linkUrl,
              type: 'series',
              title: cleanMovieName(sName),
              year: extractYear(sName),
              category: tvSrc.category,
              is_hd: /1080p/i.test(sName),
              series_url: linkUrl,
              cover_url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80',
              seasons: null
            });
          }
        }
        completedSources++;
        updateProgress('TV: ' + tvSrc.name);
      }

      TV_CATALOG = tvResults.sort(function(a, b) { return b.year - a.year; });
      nativeSaveStorage('tv_cache', JSON.stringify(TV_CATALOG));

      const totalElapsed = Math.round((Date.now() - startTs) / 1000);
      stageEl.innerText = 'Scan Complete!';
      timerEl.innerText = 'Done in ' + formatShortTime(totalElapsed);
      barEl.style.width = '100%';
      barEl.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
      countsEl.innerText = MOVIE_CATALOG.length.toLocaleString() + ' movies • ' + TV_CATALOG.length.toLocaleString() + ' series';
      pctEl.innerText = '100%';

      iconEl.classList.remove('animate-spin');
      btnText.innerText = 'Rescan';
      isScanning = false;

      if (currentNavMode === 'movies') loadMoviesHome(activeCategoryTab);
      else loadTVHome(activeCategoryTab);

      setTimeout(dismissRescanBox, 6000);
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

    // Renders Row 1: Continue Watching, Row 2: Watch Later
    function renderTopPersonalShelves() {
      const existingCW = document.getElementById('continueWatchingSection');
      if (existingCW) existingCW.remove();
      const existingWL = document.getElementById('watchlistSection');
      if (existingWL) existingWL.remove();

      const container = document.getElementById('homeSections');
      if (!container) return;

      // 1. Prepend Watch Later first so Continue Watching lands right above it
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

      // 2. Prepend Continue Watching at the very top
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

      const badgeHtml = item.type === 'series'
        ? '<span class="absolute top-1.5 left-1.5 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">S' + sNum + ':E' + epNum + '</span>'
        : '<span class="absolute top-1.5 left-1.5 bg-black/85 text-neutral-200 font-bold text-[8px] px-1.5 py-0.5 rounded">' + formatRelativeTime(item.played_at) + '</span>';

      const subLine = item.type === 'series'
        ? 'S' + sNum + ':E' + epNum + ' • ' + formatRelativeTime(item.played_at)
        : formatRelativeTime(item.played_at);

      card.innerHTML =
        '<div class="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">' +
          '<img src="' + item.cover_url + '" class="w-full h-full object-cover" loading="lazy" onerror="this.src=\\'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80\\'" />' +
          badgeHtml +
          '<button class="rm-cw-btn absolute top-1.5 right-1.5 z-30 w-5 h-5 rounded-full bg-black/80 text-white text-[10px] font-bold flex items-center justify-center">✕</button>' +
          '<div class="absolute bottom-0 inset-x-0 h-1 bg-red-600"></div>' +
        '</div>' +
        '<div class="p-2">' +
          '<h4 class="text-[11px] font-bold truncate text-white">' + item.title + '</h4>' +
          '<p class="text-[9px] font-mono text-neutral-400 truncate">' + subLine + '</p>' +
        '</div>';

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
      const wlClass = saved
        ? 'wl-card-btn absolute bottom-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow'
        : 'wl-card-btn absolute bottom-1.5 right-1.5 z-30 w-6 h-6 rounded-full bg-black/80 text-white border border-white/30 text-xs font-black flex items-center justify-center shadow';

      card.innerHTML =
        '<div class="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">' +
          '<img src="' + item.cover_url + '" class="w-full h-full object-cover" loading="lazy" onerror="this.src=\\'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80\\'" />' +
          (item.year ? '<span class="absolute top-1.5 left-1.5 bg-black/80 text-neutral-200 font-bold text-[9px] px-1.5 py-0.5 rounded">' + item.year + '</span>' : '') +
          (item.is_hd ? '<span class="absolute top-1.5 right-1.5 bg-red-600 text-white font-bold text-[8px] px-1 py-0.5 rounded">HD</span>' : '') +
          '<button data-id="' + item.id + '" class="' + wlClass + '">' + (saved ? '✓' : '＋') + '</button>' +
        '</div>' +
        '<div class="p-2"><h4 class="text-[11px] font-semibold truncate text-neutral-100">' + item.title + '</h4></div>';

      card.querySelector('.wl-card-btn').onclick = function(e) { toggleWatchlist(item, e); };
      card.onclick = function() {
        if (item.type === 'series') openSeriesHub(item);
        else openPreviewModal(item);
      };
      return card;
    }

    async function fetchOnlineMetadata(title, year, mtype) {
      const cleanTitle = title.replace(/\\(.*?\\)|\\[.*?\\]/g, '').replace(/\\b(19\\d{2}|20\\d{2})\\b/g, '').trim();
      const cacheKey = (cleanTitle + '_' + (year || '') + '_' + mtype).toLowerCase();
      if (DETAILS_CACHE[cacheKey]) return DETAILS_CACHE[cacheKey];

      let plot = '';
      let rating = '7.6';
      let tomatometer = null;
      let audience_score = null;
      let backdrop = null;

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
          if (best.background) backdrop = best.background;
          else if (best.poster) backdrop = best.poster;
        }
      } catch (e) {}

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
      const result = { plot: plot, rating: rating, tomatometer: tomatometer, audience_score: audience_score, backdrop: backdrop };
      DETAILS_CACHE[cacheKey] = result;
      nativeSaveStorage('details_cache', JSON.stringify(DETAILS_CACHE));
      return result;
    }

    function setupHero(item, type) {
      if (!item) return;
      currentHeroItem = item;
      document.getElementById('heroBillboard').classList.remove('hidden');
      document.getElementById('heroTitle').innerText = item.title;
      document.getElementById('heroImage').src = item.cover_url;
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
        if (d.backdrop) document.getElementById('heroImage').src = d.backdrop;
      });
    }

    async function openPreviewModal(movie) {
      currentMovie = movie;
      document.getElementById('previewTitle').innerText = movie.title;
      document.getElementById('previewYearBadge').innerText = movie.year || '';
      document.getElementById('previewBackdrop').src = movie.cover_url;
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
      document.getElementById('hubBackdrop').src = series.cover_url;
      document.getElementById('hubPlot').innerText = 'Loading episodes...';
      syncAllWatchlistButtons();

      fetchOnlineMetadata(series.title, series.year, 'series').then(function(d) {
        document.getElementById('hubPlot').innerText = d.plot;
        if (d.backdrop) document.getElementById('hubBackdrop').src = d.backdrop;
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
              .sort(function(a, b) { return decodeURIComponent(a).localeCompare(decodeURIComponent(b), undefined, { numeric: true }); });
            if (epVids.length > 0) {
              const label = decodeURIComponent(subdirs[i].replace(/\\/$/, ''));
              seasons[label] = epVids.map(function(v, idx) {
                return { title: 'Episode ' + (idx + 1), filename: decodeURIComponent(v), raw_url: resolveUrl(sUrl, v) };
              });
            }
          }
        } else if (directVids.length > 0) {
          directVids.sort(function(a, b) { return decodeURIComponent(a).localeCompare(decodeURIComponent(b), undefined, { numeric: true }); });
          seasons['Season 1'] = directVids.map(function(v, idx) {
            return { title: 'Episode ' + (idx + 1), filename: decodeURIComponent(v), raw_url: resolveUrl(series.series_url, v) };
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
        cover_url: currentSeriesObj.cover_url,
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
            cover_url: currentSeriesObj.cover_url,
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