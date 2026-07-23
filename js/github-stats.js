/**
 * github-stats.js — ดึงสถิติจาก GitHub Repository API
 * แสดง Stars, Forks, Watchers, Last Updated เป็น medieval-styled badge
 */

(function () {
  'use strict';

  const OWNER = 'thiirtyyu';
  const REPO = 'Who-are-you-in-the-Middle-Ages';
  const CACHE_KEY = 'gh_stats_cache';
  const CACHE_TTL = 5 * 60 * 1000; // 5 นาที

  // ─── Fetch with cache ───
  async function fetchStats() {
    // ตรวจ cache ก่อน
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          return data;
        }
      }
    } catch (_) { /* ignore parse error */ }

    // เรียก GitHub API
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const json = await res.json();

    const data = {
      stars: json.stargazers_count || 0,
      forks: json.forks_count || 0,
      watchers: json.subscribers_count || 0,
      updatedAt: json.updated_at || null,
      url: json.html_url || `https://github.com/${OWNER}/${REPO}`
    };

    // บันทึก cache
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch (_) { /* storage full */ }

    return data;
  }

  // ─── Format date เป็นภาษาไทย ───
  function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                     'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  // ─── Format number (e.g. 1234 → 1.2k) ───
  function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  // ─── Render badge ───
  function render(data) {
    const container = document.getElementById('githubStats');
    if (!container) return;

    container.innerHTML = `
      <a href="${data.url}" target="_blank" rel="noopener noreferrer"
         class="gh-stats-link" id="ghStatsLink" title="ดูบน GitHub">
        <span class="gh-stats-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
              1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56
              .82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07
              -.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </span>
        <span class="gh-stats-label">GitHub</span>
        <span class="gh-stats-divider" aria-hidden="true">│</span>
        <span class="gh-stats-items">
          <span class="gh-stat-item" title="Stars">
            <span class="gh-stat-emoji" aria-hidden="true">⭐</span>
            <span class="gh-stat-val" id="ghStars">${formatNum(data.stars)}</span>
          </span>
          <span class="gh-stat-item" title="Forks">
            <span class="gh-stat-emoji" aria-hidden="true">🍴</span>
            <span class="gh-stat-val" id="ghForks">${formatNum(data.forks)}</span>
          </span>
          <span class="gh-stat-item" title="Watchers">
            <span class="gh-stat-emoji" aria-hidden="true">👁️</span>
            <span class="gh-stat-val" id="ghWatchers">${formatNum(data.watchers)}</span>
          </span>
        </span>
      </a>
      <div class="gh-stats-updated" id="ghUpdated">
        อัปเดต: ${formatDate(data.updatedAt)}
      </div>
    `;

    // Animate in
    requestAnimationFrame(() => {
      container.classList.add('gh-stats--visible');
    });
  }

  // ─── Render fallback (API error / offline) ───
  function renderFallback() {
    const container = document.getElementById('githubStats');
    if (!container) return;

    container.innerHTML = `
      <a href="https://github.com/${OWNER}/${REPO}" target="_blank" rel="noopener noreferrer"
         class="gh-stats-link" id="ghStatsLink" title="ดูบน GitHub">
        <span class="gh-stats-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
              1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56
              .82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07
              -.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </span>
        <span class="gh-stats-label">GitHub</span>
      </a>
    `;

    requestAnimationFrame(() => {
      container.classList.add('gh-stats--visible');
    });
  }

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const data = await fetchStats();
      render(data);
    } catch (err) {
      console.log('GitHub Stats:', err.message);
      renderFallback();
    }
  });

})();
