import React, { useRef } from 'react';
import { StyleSheet, View, StatusBar, Linking, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LOCALFLIX_HTML } from './webUi';

const MOVIE_SOURCES = [
  { category: 'English', name: 'English 1080p', url: 'http://172.16.50.14/DHAKA-FLIX-14/English%20Movies%20%281080p%29/', is_hd: true },
  { category: 'English', name: 'English Movies', url: 'http://172.16.50.7/DHAKA-FLIX-7/English%20Movies/', is_hd: false },
  { category: 'Hindi', name: 'Hindi Movies', url: 'http://172.16.50.14/DHAKA-FLIX-14/Hindi%20Movies/', is_hd: false },
  { category: 'South Hindi', name: 'South Hindi Dubbed', url: 'http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/Hindi%20Dubbed/', is_hd: false },
  { category: 'South', name: 'South Movies', url: 'http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/South%20Movies/', is_hd: false },
  { category: 'Foreign', name: 'Foreign Movies', url: 'http://172.16.50.7/DHAKA-FLIX-7/Foreign%20Language%20Movies/', is_hd: false },
  { category: 'Kolkata Bangla', name: 'Kolkata Movies', url: 'http://172.16.50.7/DHAKA-FLIX-7/Kolkata%20Bangla%20Movies/', is_hd: false },
  { category: 'Animation', name: 'Animation 1080p', url: 'http://172.16.50.14/DHAKA-FLIX-14/Animation%20Movies%20%281080p%29/', is_hd: true },
  { category: 'Animation', name: 'Animation Movies', url: 'http://172.16.50.14/DHAKA-FLIX-14/Animation%20Movies/', is_hd: false },
];

const TV_SOURCES = [
  { category: 'English & Web Series', name: 'TV Series (0-9)', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%98%85%20%200%20%20%E2%80%94%20%209/' },
  { category: 'English & Web Series', name: 'TV Series (A-L)', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/' },
  { category: 'English & Web Series', name: 'TV Series (M-R)', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A6%20%20M%20%20%E2%80%94%20%20R/' },
  { category: 'English & Web Series', name: 'TV Series (S-Z)', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A6%20%20S%20%20%E2%80%94%20%20Z/' },
  { category: 'Korean TV Series', name: 'Korean TV Series', url: 'http://172.16.50.14/DHAKA-FLIX-14/KOREAN%20TV%20%26%20WEB%20Series/' },
];

const VIDEO_EXT_RE = /\.(mp4|mkv|avi|webm)$/i;
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp)$/i;
const ANCHOR_RE = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

function safeDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

function cleanName(raw) {
  let name = safeDecode(String(raw || '').replace(/\\/g, '/').replace(/\/$/, '').split('/').pop() || '');
  name = name.replace(VIDEO_EXT_RE, '');
  name = name.replace(/(1080p|720p|2160p|4k|bluray|web-dl|webrip|brrip|x264|x265|hevc|aac|dts|hdrip).*/i, '');
  return name.replace(/[._]/g, ' ').trim();
}

function extractYear(text) {
  const m = String(text || '').match(/\b(19\d{2}|20\d{2})\b/);
  return m ? parseInt(m[1], 10) : 0;
}

function resolveUrl(base, href) {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) {
    const origin = (base.match(/^https?:\/\/[^/]+/i) || [''])[0];
    return origin + href;
  }
  return base.endsWith('/') ? base + href : `${base}/${href}`;
}

function isChildUrl(parentUrl, childUrl) {
  const p = safeDecode(parentUrl).replace(/\/+$/, '').toLowerCase();
  const c = safeDecode(childUrl).replace(/\/+$/, '').toLowerCase();
  return c.length > p.length && c.startsWith(`${p}/`);
}

function createLimiter(maxConcurrent) {
  let active = 0;
  const queue = [];
  function next() {
    if (active >= maxConcurrent || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  }
  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}

async function fetchDirectoryLinksNative(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();
    const links = [];
    const seen = new Set();
    ANCHOR_RE.lastIndex = 0;
    let match;
    while ((match = ANCHOR_RE.exec(html)) !== null) {
      const href = match[1].trim();
      const label = match[2].replace(/<[^>]+>/g, '').trim();
      if (
        !href ||
        href.startsWith('?') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href === '../' ||
        href === '/' ||
        href === './' ||
        /parent directory/i.test(label) ||
        href.includes('/_h5ai/') ||
        href.includes('/icons/')
      ) {
        continue;
      }
      if (!seen.has(href)) {
        seen.add(href);
        links.push(href);
      }
    }
    return links;
  } catch (e) {
    clearTimeout(timeout);
    return [];
  }
}

function dedupeAndSortMovies(list) {
  const unique = {};
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    const key = `${m.title.toLowerCase()}_${m.category}`;
    if (!unique[key] || (m.is_hd && !unique[key].is_hd)) {
      unique[key] = m;
    }
  }
  return Object.values(unique).sort((a, b) => b.year - a.year);
}

export default function App() {
  const webviewRef = useRef(null);
  const scanningRef = useRef(false);

  function sendToWeb(payload) {
    if (!webviewRef.current) return;
    const js = `(function(){if(window.onNativeMessage){window.onNativeMessage(${JSON.stringify(payload)});}})();true;`;
    webviewRef.current.injectJavaScript(js);
  }

  async function sendCatalogInChunks(movies, tv, extras, isInitialBoot) {
    sendToWeb({
      type: 'CATALOG_BEGIN',
      watchlist: extras?.watchlist ?? null,
      history: extras?.history ?? null,
      details: extras?.details ?? null,
      isInitialBoot: !!isInitialBoot,
    });

    const CHUNK = 1200;
    for (let i = 0; i < movies.length; i += CHUNK) {
      sendToWeb({ type: 'CATALOG_CHUNK', target: 'movies', items: movies.slice(i, i + CHUNK) });
      await new Promise((r) => setTimeout(r, 8));
    }
    for (let i = 0; i < tv.length; i += CHUNK) {
      sendToWeb({ type: 'CATALOG_CHUNK', target: 'tv', items: tv.slice(i, i + CHUNK) });
      await new Promise((r) => setTimeout(r, 8));
    }
    sendToWeb({ type: 'CATALOG_END', isInitialBoot: !!isInitialBoot });
  }

  async function runNativeScan() {
    if (scanningRef.current) return;
    scanningRef.current = true;

    try {
      await activateKeepAwakeAsync('localflix-scan');
    } catch (e) {}

    const startTs = Date.now();
    const totalSources = MOVIE_SOURCES.length + TV_SOURCES.length;
    let completedSources = 0;
    let lastProgressTs = 0;

    const movieResults = [];
    const tvResults = [];
    const visitedDirs = new Set();
    const limit = createLimiter(20);

    function emitProgress(label, pctOverride, force = false, done = false) {
      const now = Date.now();
      if (!force && now - lastProgressTs < 350) return;
      lastProgressTs = now;
      const elapsedSec = Math.max(0.1, (now - startTs) / 1000);
      const pct =
        pctOverride !== undefined
          ? pctOverride
          : Math.min(99, Math.max(1, Math.round((completedSources / totalSources) * 100)));
      sendToWeb({
        type: 'SCAN_PROGRESS',
        label,
        pct,
        elapsedSec,
        movieCount: movieResults.length,
        tvCount: tvResults.length,
        done,
      });
    }

    async function scanMovieFolder(folderUrl, folderName, categoryName, isHdSource, depth) {
      const normKey = safeDecode(folderUrl).replace(/\/+$/, '').toLowerCase();
      if (visitedDirs.has(normKey)) return;
      visitedDirs.add(normKey);

      const items = await limit(() => fetchDirectoryLinksNative(folderUrl));
      if (!items.length) return;

      const videoFiles = [];
      const images = [];
      const subdirs = [];

      for (let i = 0; i < items.length; i++) {
        const f = items[i];
        if (VIDEO_EXT_RE.test(f)) {
          videoFiles.push(f);
        } else if (IMAGE_EXT_RE.test(f)) {
          images.push(f);
        } else {
          const lastPart = f.replace(/\/$/, '').split('/').pop() || '';
          if (f.endsWith('/') || !lastPart.includes('.')) {
            const subUrl = resolveUrl(folderUrl, f);
            if (isChildUrl(folderUrl, subUrl)) {
              subdirs.push({ href: f, url: subUrl });
            }
          }
        }
      }

      if (videoFiles.length > 0) {
        const filtered = videoFiles.filter((f) => !/sample|trailer|extra/i.test(f));
        const candidates = filtered.length > 0 ? filtered : videoFiles;
        candidates.sort((a, b) => {
          const score = (s) => {
            const low = s.toLowerCase();
            if (low.includes('2160p') || low.includes('4k')) return 4;
            if (low.includes('1080p')) return 3;
            if (low.includes('720p')) return 2;
            return 1;
          };
          return score(b) - score(a);
        });

        const vid = candidates[0];
        const vidUrl = resolveUrl(folderUrl, vid);
        const covUrl = images.length > 0 ? resolveUrl(folderUrl, images[0]) : '';
        const year = extractYear(folderName) || extractYear(vid);
        const isHd = isHdSource || /1080p/i.test(folderName) || /1080p/i.test(vid);

        movieResults.push({
          id: `mov_${vidUrl}`,
          type: 'movie',
          title: cleanName(depth > 0 ? folderName : vid),
          raw_url: vidUrl,
          is_hd: isHd,
          year,
          category: categoryName,
          cover_url: covUrl,
        });
        return;
      }

      if (depth < 3 && subdirs.length > 0) {
        await Promise.all(
          subdirs.map((sub) =>
            scanMovieFolder(sub.url, cleanName(sub.href), categoryName, isHdSource, depth + 1)
          )
        );
      }
    }

    try {
      emitProgress('Connecting to BDIX servers (keep screen open)...', 1, true);

      for (const src of MOVIE_SOURCES) {
        emitProgress(`Movies: ${src.name}`, undefined, true);
        const rootLinks = await limit(() => fetchDirectoryLinksNative(src.url));
        let doneSub = 0;
        const totalSub = Math.max(1, rootLinks.length);

        await Promise.all(
          rootLinks.map(async (link) => {
            const itemUrl = resolveUrl(src.url, link);
            if (!isChildUrl(src.url, itemUrl)) {
              doneSub++;
              return;
            }
            const title = cleanName(link);
            if (VIDEO_EXT_RE.test(link)) {
              movieResults.push({
                id: `mov_${itemUrl}`,
                type: 'movie',
                title,
                raw_url: itemUrl,
                is_hd: src.is_hd || /1080p/i.test(link),
                year: extractYear(link),
                category: src.category,
                cover_url: '',
              });
            } else {
              await scanMovieFolder(itemUrl, title, src.category, src.is_hd, 1);
            }
            doneSub++;
            const pct = Math.min(
              98,
              Math.max(1, Math.round(((completedSources + doneSub / totalSub) / totalSources) * 100))
            );
            emitProgress(`Movies: ${src.name}`, pct);
          })
        );

        completedSources++;
        // Checkpoint completed movie categories to disk immediately
        try {
          const snapshot = dedupeAndSortMovies(movieResults);
          await AsyncStorage.setItem('movies_cache', JSON.stringify(snapshot));
        } catch (e) {}
        emitProgress(`Saved ${src.name}`, undefined, true);
      }

      const finalMovies = dedupeAndSortMovies(movieResults);
      await AsyncStorage.setItem('movies_cache', JSON.stringify(finalMovies));

      for (const tvSrc of TV_SOURCES) {
        emitProgress(`TV: ${tvSrc.name}`, undefined, true);
        const rootLinks = await limit(() => fetchDirectoryLinksNative(tvSrc.url));

        await Promise.all(
          rootLinks.map(async (link) => {
            const lastPart = link.replace(/\/$/, '').split('/').pop() || '';
            if (!link.endsWith('/') && lastPart.includes('.')) return;

            const linkUrl = resolveUrl(tvSrc.url, link);
            if (!isChildUrl(tvSrc.url, linkUrl)) return;

            const sName = safeDecode(lastPart);
            const bareYear = sName.replace(/[()]/g, '').trim();

            if (/^(19|20)\d{2}$/.test(bareYear)) {
              const subLinks = await limit(() => fetchDirectoryLinksNative(linkUrl));
              for (let j = 0; j < subLinks.length; j++) {
                const slink = subLinks[j];
                const subPart = slink.replace(/\/$/, '').split('/').pop() || '';
                if (!slink.endsWith('/') && subPart.includes('.')) continue;
                const subUrl = resolveUrl(linkUrl, slink);
                if (!isChildUrl(linkUrl, subUrl)) continue;
                const subName = safeDecode(subPart);
                tvResults.push({
                  id: `tv_${subUrl}`,
                  type: 'series',
                  title: cleanName(subName),
                  year: extractYear(subName) || parseInt(bareYear, 10),
                  category: tvSrc.category,
                  is_hd: /1080p/i.test(subName),
                  series_url: subUrl,
                  cover_url: '',
                  seasons: null,
                });
              }
            } else {
              tvResults.push({
                id: `tv_${linkUrl}`,
                type: 'series',
                title: cleanName(sName),
                year: extractYear(sName),
                category: tvSrc.category,
                is_hd: /1080p/i.test(sName),
                series_url: linkUrl,
                cover_url: '',
                seasons: null,
              });
            }
          })
        );

        completedSources++;
        emitProgress(`TV: ${tvSrc.name}`, undefined, true);
      }

      const finalTV = tvResults.sort((a, b) => b.year - a.year);
      await AsyncStorage.setItem('tv_cache', JSON.stringify(finalTV));

      await sendCatalogInChunks(finalMovies, finalTV, null, false);
      emitProgress('Scan Complete!', 100, true, true);
    } catch (err) {
      emitProgress(`Scan interrupted: ${err.message}`, 100, true, true);
    } finally {
      scanningRef.current = false;
      try {
        deactivateKeepAwake('localflix-scan');
      } catch (e) {}
    }
  }

  async function handleWebMessage(event) {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      return;
    }

    if (msg.type === 'REQUEST_INIT') {
      try {
        const [mRaw, tvRaw, wlRaw, histRaw, detRaw] = await Promise.all([
          AsyncStorage.getItem('movies_cache'),
          AsyncStorage.getItem('tv_cache'),
          AsyncStorage.getItem('watchlist_cache'),
          AsyncStorage.getItem('history_cache'),
          AsyncStorage.getItem('details_cache'),
        ]);
        const movies = mRaw ? JSON.parse(mRaw) : [];
        const tv = tvRaw ? JSON.parse(tvRaw) : [];
        const extras = {
          watchlist: wlRaw ? JSON.parse(wlRaw) : [],
          history: histRaw ? JSON.parse(histRaw) : [],
          details: detRaw ? JSON.parse(detRaw) : {},
        };
        await sendCatalogInChunks(movies, tv, extras, true);
      } catch (e) {
        await sendCatalogInChunks([], [], { watchlist: [], history: [], details: {} }, true);
      }
    } else if (msg.type === 'START_SCAN') {
      runNativeScan();
    } else if (msg.type === 'SET_STORAGE') {
      try {
        await AsyncStorage.setItem(msg.key, msg.value);
      } catch (e) {}
    } else if (msg.type === 'FETCH') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(msg.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
            ...(msg.options?.headers || {}),
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const text = await res.text();
        sendToWeb({ type: 'FETCH_RESULT', id: msg.id, ok: res.ok, status: res.status, text });
      } catch (err) {
        clearTimeout(timeout);
        sendToWeb({ type: 'FETCH_RESULT', id: msg.id, ok: false, error: err.message });
      }
    } else if (msg.type === 'OPEN_VLC') {
      const cleanUrl = msg.url;
      const callbackUri = `vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(cleanUrl)}`;
      const fallbackUri = `vlc://${cleanUrl}`;
      try {
        const canCallback = await Linking.canOpenURL(callbackUri);
        if (canCallback) {
          await Linking.openURL(callbackUri);
          return;
        }
        const canFallback = await Linking.canOpenURL(fallbackUri);
        if (canFallback) {
          await Linking.openURL(fallbackUri);
          return;
        }
        Alert.alert(
          'VLC Not Found',
          'Install "VLC media player" from the iOS App Store, or tap Copy Link to paste into VLC.'
        );
      } catch (e) {
        Alert.alert('VLC Launch Error', e.message);
      }
    } else if (msg.type === 'COPY_TEXT') {
      await Clipboard.setStringAsync(msg.text);
      Alert.alert('Copied', 'Direct video link copied to clipboard.');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <WebView
        ref={webviewRef}
        source={{ html: LOCALFLIX_HTML, baseUrl: 'http://localhost/' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowsInlineMediaPlayback
        onMessage={handleWebMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  webview: { flex: 1, backgroundColor: '#141414' },
});
