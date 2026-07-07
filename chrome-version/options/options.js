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

  const BOOLEAN_KEYS = [
    'hidePriorityAds',
    'hideAdmarkt',
    'hideBusinessSellers',
    'hideVerifiedSellers',
    'hideExternalWebsite',
    'hideReserved',
    'compactLayout',
    'hideBanners',
    'showPanel'
  ];

  const storage = {
    get(defaults) {
      if (globalThis.browser?.storage?.local) {
        return globalThis.browser.storage.local.get(defaults);
      }

      if (globalThis.chrome?.storage?.local) {
        return new Promise((resolve, reject) => {
          globalThis.chrome.storage.local.get(defaults, result => {
            const error = globalThis.chrome.runtime?.lastError;
            if (error) {
              reject(storageError('get', error));
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
        return globalThis.browser.storage.local.set(value);
      }

      if (globalThis.chrome?.storage?.local) {
        return new Promise((resolve, reject) => {
          globalThis.chrome.storage.local.set(value, () => {
            const error = globalThis.chrome.runtime?.lastError;
            if (error) {
              reject(storageError('set', error));
              return;
            }
            resolve();
          });
        });
      }

      return Promise.resolve();
    }
  };

  const form = document.getElementById('optionsForm');
  const status = document.getElementById('status');
  const sellerBlacklist = document.getElementById('sellerBlacklist');
  const keywordBlacklist = document.getElementById('keywordBlacklist');
  const importJson = document.getElementById('importJson');

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      fillForm(await loadSettings());
    } catch (error) {
      fillForm(DEFAULT_SETTINGS);
      showStatus(`Instellingen laden mislukt: ${formatError(error)}`, true);
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await saveSettings(readForm());
        showStatus('Instellingen opgeslagen.');
      } catch (error) {
        showStatus(`Opslaan mislukt: ${formatError(error)}`, true);
      }
    });

    document.getElementById('resetButton').addEventListener('click', async () => {
      if (!confirm('Alle instellingen terugzetten naar standaardwaarden?')) return;
      const defaults = cloneSettings(DEFAULT_SETTINGS);
      try {
        await saveSettings(defaults);
        fillForm(defaults);
        showStatus('Standaardinstellingen hersteld.');
      } catch (error) {
        showStatus(`Resetten mislukt: ${formatError(error)}`, true);
      }
    });

    document.getElementById('exportButton').addEventListener('click', () => {
      exportSettings(readForm());
      showStatus('Instellingen geëxporteerd.');
    });

    document.getElementById('importButton').addEventListener('click', async () => {
      let imported;
      try {
        const parsed = JSON.parse(importJson.value);
        imported = mergeSettings(parsed.settings || parsed);
      } catch (error) {
        showStatus('Importeren mislukt: ongeldige JSON.', true);
        return;
      }

      try {
        await saveSettings(imported);
        fillForm(imported);
        importJson.value = '';
        showStatus('Instellingen geïmporteerd.');
      } catch (error) {
        showStatus(`Importeren mislukt: ${formatError(error)}`, true);
      }
    });
  }

  async function loadSettings() {
    const result = await storage.get({ settings: DEFAULT_SETTINGS });
    return mergeSettings(result.settings);
  }

  async function saveSettings(settings) {
    await storage.set({ settings: cloneSettings(settings) });
  }

  function fillForm(settings) {
    for (const key of BOOLEAN_KEYS) {
      document.getElementById(key).checked = Boolean(settings[key]);
    }

    sellerBlacklist.value = settings.sellerBlacklist.join('\n');
    keywordBlacklist.value = settings.keywordBlacklist.join('\n');
  }

  function readForm() {
    const settings = cloneSettings(DEFAULT_SETTINGS);
    for (const key of BOOLEAN_KEYS) {
      settings[key] = document.getElementById(key).checked;
    }

    settings.sellerBlacklist = normalizeList(sellerBlacklist.value).map(normalizeText);
    settings.keywordBlacklist = normalizeList(keywordBlacklist.value);
    return settings;
  }

  function exportSettings(settings) {
    const blob = new Blob([JSON.stringify({ settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markplaats-zonder-spam-v2-instellingen.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function storageError(action, error) {
    return new Error(error?.message || `Storage ${action} failed.`);
  }

  function formatError(error) {
    return error?.message || 'onbekende fout';
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
    const list = Array.isArray(value) ? value : String(value || '').split(/[\n,]/);
    return Array.from(new Set(list.map(cleanText).filter(Boolean)));
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeText(value) {
    return cleanText(value).toLocaleLowerCase('nl-NL');
  }

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = isError ? 'error' : 'success';
    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 3500);
  }
})();
