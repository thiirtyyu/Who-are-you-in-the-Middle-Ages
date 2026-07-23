/**
 * visitor-counter.js — นับจำนวนผู้เข้าชมเว็บไซต์
 * ใช้ CounterAPI (ฟรี) เก็บจำนวน hit
 * แสดงผลเฉพาะเมื่อเจ้าของเว็บเปิดด้วย ?admin ใน URL
 * ผู้เข้าชมทั่วไปจะไม่เห็น
 */

(function () {
  'use strict';

  // ─── Config ───
  const NAMESPACE = 'thiirtyyu-middle-ages';
  const KEY = 'site-visits';
  const API_BASE = 'https://api.counterapi.dev/v1';
  const VISITED_FLAG = 'ma_visited'; // localStorage key to avoid double-counting

  // ─── Check if admin mode ───
  function isAdmin() {
    return new URLSearchParams(window.location.search).has('admin');
  }

  // ─── Increment visitor count (only once per browser) ───
  async function incrementCount() {
    try {
      const res = await fetch(`${API_BASE}/${NAMESPACE}/${KEY}/up`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return data.count || 0;
    } catch (err) {
      console.log('Visitor counter increment failed:', err.message);
      return null;
    }
  }

  // ─── Get current count without incrementing ───
  async function getCount() {
    try {
      const res = await fetch(`${API_BASE}/${NAMESPACE}/${KEY}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return data.count || 0;
    } catch (err) {
      console.log('Visitor counter get failed:', err.message);
      return null;
    }
  }

  // ─── Format number with commas ───
  function formatNum(n) {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('th-TH');
  }

  // ─── Render admin panel ───
  function renderAdmin(count) {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;

    const displayCount = count !== null ? formatNum(count) : 'ไม่สามารถโหลดได้';
    const valClass = count !== null ? 'admin-stat-val' : 'admin-stat-val admin-stat-loading';

    panel.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-icon" aria-hidden="true">👑</span>
          <span class="admin-card-title">Admin Panel</span>
        </div>
        <div class="admin-stat-row">
          <span class="admin-stat-label">ผู้เข้าชมทั้งหมด</span>
          <span class="${valClass}" id="adminVisitorCount">${displayCount}</span>
        </div>
        <div class="admin-footer">
          เฉพาะเจ้าของเว็บเท่านั้นที่เห็น
        </div>
      </div>
    `;

    panel.classList.add('admin-panel--show');
  }

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', async () => {
    const alreadyVisited = localStorage.getItem(VISITED_FLAG);

    if (!alreadyVisited) {
      // ครั้งแรกของ browser นี้ — นับ +1
      const count = await incrementCount();
      localStorage.setItem(VISITED_FLAG, '1');

      if (isAdmin()) {
        renderAdmin(count);
      }
    } else {
      // เคยเข้าแล้ว — ถ้าเป็น admin ก็แค่ดึงจำนวน (ไม่ increment)
      if (isAdmin()) {
        const count = await getCount();
        renderAdmin(count);
      }
    }
  });

})();
