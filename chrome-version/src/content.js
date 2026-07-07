(() => {
  'use strict';

  const DEFAULT_SETTINGS = {
    hidePriorityAds: true,
    hideAdmarkt: true,
    hideBusinessSellers: false,
    hideVerifiedSellers: false,
    hideExternalWebsite: true,
    hideReserved: false,
    compactLayout: true,
    hideBanners: true,
    keywordBlacklist: ['VidaXL', 'Used Products', 'Catawiki'],
    sellerBlacklist: [],
    showPanel: true
  };

  const LISTING_SELECTOR = 'ul.hz-Listings > li.hz-Listing, li.hz-Listing';
  const BANNER_SELECTOR = [
    '#banner-top-dt',
    '#banner-rubrieks-dt',
    '#banner-skyscraper-dt',
    '#banner-skyscraper-2-dt',
    '#banner-bottom-dt-l',
    '#banner-right-container',
    'li.bannerContainerLoading',
    'li#adsense-container-top-lazy',
    '.hz-Listings__container--cas[data-testid="BottomBlockLazyListings"]',
    '.hz-Page-element--main > div#adsense-container',
    '.hz-Banner',
    '.hz-Listings__container--cas'
  ].join(',');

  const REASON_LABELS = {
    priority: 'top/dagtopper',
    admarkt: 'Admarkt',
    business: 'zakelijke verkoper',
    verified: 'geverifieerde verkoper',
    external: 'externe website',
    keyword: 'keyword',
    reserved: 'gereserveerd',
    blacklisted: 'geblokkeerde verkoper'
  };

  const TOGGLE_LABELS = [
    ['hidePriorityAds', 'Top'],
    ['hideAdmarkt', 'Admarkt'],
    ['hideExternalWebsite', 'Website'],
    ['hideReserved', 'Gereserveerd'],
    ['hideBusinessSellers', 'Zakelijk'],
    ['hideBanners', 'Banners'],
    ['compactLayout', 'Compact']
  ];

  const RESERVED_SCAN_NODE_LIMIT = 20000;
  const RESERVED_SCAN_DEPTH_LIMIT = 100;

  let settings = cloneSettings(DEFAULT_SETTINGS);
  let reservedById = new Map();
  let lastNextDataText = '';
  let observer;
  let debounceTimer;

  const storage = {
    get(defaults) {
      if (globalThis.browser?.storage?.local) {
        return globalThis.browser.storage.local.get(defaults).catch(error => {
          warnStorageError('get', error);
          return defaults;
        });
      }

      if (globalThis.chrome?.storage?.local) {
        return new Promise(resolve => {
          globalThis.chrome.storage.local.get(defaults, result => {
            const error = globalThis.chrome.runtime?.lastError;
            if (error) {
              warnStorageError('get', error);
              resolve(defaults);
              return;
            }
            resolve(result || defaults);
          });
        });
      }

      return Promise.resolve(defaults);
    },

    set(value) {
      if (globalThis.browser?.storage?.local) {
        return globalThis.browser.storage.local.set(value).catch(error => {
          warnStorageError('set', error);
        });
      }

      if (globalThis.chrome?.storage?.local) {
        return new Promise(resolve => {
          globalThis.chrome.storage.local.set(value, () => {
            const error = globalThis.chrome.runtime?.lastError;
            if (error) warnStorageError('set', error);
            resolve();
          });
        });
      }

      return Promise.resolve();
    }
  };

  init();

  async function init() {
    settings = mergeSettings((await storage.get({ settings: DEFAULT_SETTINGS })).settings);
    addStorageListener();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }

  function start() {
    applyFilters();
    installObserver();
  }

  function addStorageListener() {
    const listener = (changes, areaName) => {
      if (areaName && areaName !== 'local') return;
      if (!changes.settings) return;

      settings = mergeSettings(changes.settings.newValue || {});
      applyFilters();
    };

    if (globalThis.browser?.storage?.onChanged) {
      globalThis.browser.storage.onChanged.addListener(listener);
    } else if (globalThis.chrome?.storage?.onChanged) {
      globalThis.chrome.storage.onChanged.addListener(listener);
    }
  }

  function installObserver() {
    if (observer || !document.documentElement) return;

    observer = new MutationObserver(mutations => {
      if (mutations.every(isOwnMutation)) return;
      scheduleApply();
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function isOwnMutation(mutation) {
    if (mutation.target instanceof Element && mutation.target.closest('#mzp-panel')) {
      return true;
    }

    const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
    return nodes.length > 0 && nodes.every(node => {
      if (!(node instanceof Element)) return true;
      return Boolean(
        node.id === 'mzp-panel' ||
        node.classList.contains('mzp-hide-seller') ||
        node.closest('#mzp-panel')
      );
    });
  }

  function scheduleApply() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 150);
  }

  function applyFilters() {
    refreshReservedMap();
    applyLayoutSettings();
    applyBannerFilter();

    const listings = Array.from(document.querySelectorAll(LISTING_SELECTOR));
    const stats = { total: listings.length, hidden: 0, visible: 0, reasons: {} };

    for (const listing of listings) {
      resetListing(listing);

      const sellerName = getSellerName(listing);
      addHideSellerAction(listing, sellerName);

      const signals = classifyListing(listing, sellerName);
      const activeReasons = signals.filter(isActiveReason);

      listing.dataset.mzpReasons = signals.join(',');
      if (activeReasons.length > 0) {
        listing.classList.add('mzp-hidden', 'mzp-hidden-listing');
        listing.dataset.mzpHiddenReasons = activeReasons.join(',');
        listing.title = `Verborgen door MZP: ${activeReasons.map(reason => REASON_LABELS[reason] || reason).join(', ')}`;
        stats.hidden += 1;
        for (const reason of activeReasons) {
          stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
        }
      } else {
        stats.visible += 1;
      }
    }

    updatePanel(stats);
  }

  function resetListing(listing) {
    listing.classList.remove('mzp-hidden', 'mzp-hidden-listing');
    delete listing.dataset.mzpReasons;
    delete listing.dataset.mzpHiddenReasons;
    if (listing.title?.startsWith('Verborgen door MZP:')) {
      listing.removeAttribute('title');
    }
  }

  function applyLayoutSettings() {
    document.documentElement.classList.toggle('mzp-compact', Boolean(settings.compactLayout));
  }

  function applyBannerFilter() {
    document.querySelectorAll('.mzp-hidden-banner').forEach(element => {
      element.classList.remove('mzp-hidden', 'mzp-hidden-banner');
    });

    if (!settings.hideBanners) return;

    document.querySelectorAll(BANNER_SELECTOR).forEach(element => {
      element.classList.add('mzp-hidden', 'mzp-hidden-banner');
    });
  }

  function classifyListing(listing, sellerName) {
    const signals = new Set();
    const itemId = getItemId(listing);
    const listingText = normalizeText(listing.textContent || '');

    if (hasPriorityMarker(listing)) signals.add('priority');

    if (
      itemId?.startsWith('a') ||
      listing.querySelector('img[src*="admarkt-cdn.marktplaats.com"], img[data-src*="admarkt-cdn.marktplaats.com"]')
    ) {
      signals.add('admarkt');
    }

    if (listing.querySelector('[data-testid="listing-other-seller"]')) {
      signals.add('business');
    }

    if (listing.querySelector('.hz-Icon--signalInfoDefault')) {
      signals.add('verified');
    }

    if (hasExternalWebsiteSignal(listing)) {
      signals.add('external');
    }

    if (itemId && reservedById.get(itemId) === true) {
      signals.add('reserved');
    } else if (/\bgereserveerd\b/i.test(listing.textContent || '')) {
      signals.add('reserved');
    }

    if (sellerName && settings.sellerBlacklist.includes(normalizeText(sellerName))) {
      signals.add('blacklisted');
    }

    if (settings.keywordBlacklist.some(keyword => keyword && listingText.includes(normalizeText(keyword)))) {
      signals.add('keyword');
    }

    return Array.from(signals);
  }

  function isActiveReason(reason) {
    switch (reason) {
      case 'priority':
        return settings.hidePriorityAds;
      case 'admarkt':
        return settings.hideAdmarkt;
      case 'business':
        return settings.hideBusinessSellers;
      case 'verified':
        return settings.hideVerifiedSellers;
      case 'external':
        return settings.hideExternalWebsite;
      case 'reserved':
        return settings.hideReserved;
      case 'blacklisted':
        return settings.sellerBlacklist.length > 0;
      case 'keyword':
        return settings.keywordBlacklist.length > 0;
      default:
        return false;
    }
  }

  function hasPriorityMarker(listing) {
    const marker = listing.querySelector('.hz-Listing-priority--all-devices');
    return Boolean(marker && /\b(Topadvertentie|Dagtopper|Topzoekertje)\b/i.test(marker.textContent || ''));
  }

  function hasExternalWebsiteSignal(listing) {
    if (listing.querySelector('.hz-Listing-seller-external-link')) return true;

    return Array.from(listing.querySelectorAll('.hz-Listing-sellerCoverLink span'))
      .some(element => /\bNaar website\b/i.test(element.textContent || ''));
  }

  function getSellerName(listing) {
    return cleanText(listing.querySelector('.hz-Listing-seller-name')?.textContent || '');
  }

  function addHideSellerAction(listing, sellerName) {
    if (!sellerName || listing.querySelector('.mzp-hide-seller')) return;

    const sellerElement = listing.querySelector('.hz-Listing-seller-name');
    if (!sellerElement) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mzp-hide-seller';
    button.textContent = 'Verberg verkoper';
    button.title = `Verberg alle advertenties van ${sellerName}`;
    button.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();

      const normalizedSeller = normalizeText(sellerName);
      if (!settings.sellerBlacklist.includes(normalizedSeller)) {
        settings = mergeSettings({
          ...settings,
          sellerBlacklist: [...settings.sellerBlacklist, normalizedSeller]
        });
        await saveSettings();
      }

      applyFilters();
    });

    sellerElement.insertAdjacentElement('afterend', button);
  }

  function getItemId(listing) {
    const link = listing.querySelector('a[href^="/v/"], a[href*="/v/"]');
    const href = link?.getAttribute('href') || link?.href || '';
    const match = href.match(/\/([am]\d+)-/i) || href.match(/\b([am]\d{3,})\b/i);
    return match ? match[1].toLowerCase() : '';
  }

  function refreshReservedMap() {
    const nextData = document.querySelector('script#__NEXT_DATA__');
    const text = nextData?.textContent || '';
    if (!text) {
      lastNextDataText = '';
      reservedById = new Map();
      return;
    }

    if (text === lastNextDataText) return;

    lastNextDataText = text;
    reservedById = new Map();

    try {
      collectReserved(JSON.parse(text), reservedById);
    } catch (error) {
      reservedById = new Map();
    }
  }

  function collectReserved(value, map) {
    const stack = [{ value, depth: 0 }];
    let scanned = 0;

    while (stack.length > 0 && scanned < RESERVED_SCAN_NODE_LIMIT) {
      const current = stack.pop();
      if (!current.value || typeof current.value !== 'object') continue;

      scanned += 1;
      if (!Array.isArray(current.value) && current.value.reserved === true) {
        for (const id of findIdsInObject(current.value)) {
          map.set(id, true);
        }
      }

      if (current.depth >= RESERVED_SCAN_DEPTH_LIMIT) continue;

      const children = Object.values(current.value);
      for (let index = children.length - 1; index >= 0; index -= 1) {
        stack.push({ value: children[index], depth: current.depth + 1 });
      }
    }
  }

  function warnStorageError(action, error) {
    console.warn(`MZP: storage ${action} failed.`, error?.message || error);
  }

  function findIdsInObject(object) {
    const ids = new Set();
    const preferredKeys = ['itemId', 'listingId', 'id', 'item_id', 'listing_id'];

    for (const key of preferredKeys) {
      addIdFromValue(object[key], ids);
    }

    if (ids.size === 0) {
      for (const value of Object.values(object)) {
        if (typeof value === 'string') addIdFromValue(value, ids);
      }
    }

    return ids;
  }

  function addIdFromValue(value, ids) {
    if (typeof value !== 'string' && typeof value !== 'number') return;
    const match = String(value).match(/\b([am]\d{3,})\b/i);
    if (match) ids.add(match[1].toLowerCase());
  }

  function updatePanel(stats) {
    const hasListings = stats.total > 0;
    let panel = document.getElementById('mzp-panel');

    if (!settings.showPanel || !hasListings) {
      panel?.remove();
      return;
    }

    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'mzp-panel';
      panel.className = 'mzp-ui';
      panel.setAttribute('aria-label', 'Markplaats Zonder Spam V2');
      document.body.appendChild(panel);
    }

    panel.replaceChildren();

    const header = document.createElement('div');
    header.className = 'mzp-panel-header';

    const title = document.createElement('strong');
    title.textContent = 'Zonder Spam';
    header.appendChild(title);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'mzp-panel-close';
    close.textContent = '×';
    close.title = 'Paneel verbergen';
    close.addEventListener('click', async () => {
      settings = mergeSettings({ ...settings, showPanel: false });
      await saveSettings();
      updatePanel(stats);
    });
    header.appendChild(close);
    panel.appendChild(header);

    const counts = document.createElement('div');
    counts.className = 'mzp-panel-counts';
    counts.textContent = `${stats.visible} zichtbaar · ${stats.hidden} verborgen`;
    panel.appendChild(counts);

    const buttons = document.createElement('div');
    buttons.className = 'mzp-panel-buttons';
    for (const [key, label] of TOGGLE_LABELS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mzp-panel-toggle';
      button.dataset.setting = key;
      button.setAttribute('aria-pressed', String(Boolean(settings[key])));
      button.textContent = `${settings[key] ? '✓' : '○'} ${label}`;
      button.addEventListener('click', async () => {
        settings = mergeSettings({ ...settings, [key]: !settings[key] });
        await saveSettings();
        applyFilters();
      });
      buttons.appendChild(button);
    }
    panel.appendChild(buttons);

    const reasons = Object.entries(stats.reasons)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `${REASON_LABELS[reason] || reason}: ${count}`)
      .join(' · ');
    if (reasons) {
      const reasonLine = document.createElement('div');
      reasonLine.className = 'mzp-panel-reasons';
      reasonLine.textContent = reasons;
      panel.appendChild(reasonLine);
    }
  }

  async function saveSettings() {
    await storage.set({ settings: cloneSettings(settings) });
  }

  function mergeSettings(saved) {
    const merged = {
      ...DEFAULT_SETTINGS,
      ...(saved && typeof saved === 'object' ? saved : {})
    };

    merged.sellerBlacklist = normalizeList(merged.sellerBlacklist).map(normalizeText);
    merged.keywordBlacklist = normalizeList(merged.keywordBlacklist);
    return cloneSettings(merged);
  }

  function cloneSettings(value) {
    return {
      ...value,
      sellerBlacklist: [...(value.sellerBlacklist || [])],
      keywordBlacklist: [...(value.keywordBlacklist || [])]
    };
  }

  function normalizeList(value) {
    const list = Array.isArray(value) ? value : [];
    return Array.from(new Set(list.map(cleanText).filter(Boolean)));
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeText(value) {
    return cleanText(value).toLocaleLowerCase('nl-NL');
  }
})();
