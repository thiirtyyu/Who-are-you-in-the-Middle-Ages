/**
 * visitor-counter.js — นับจำนวนผู้เข้าชมเว็บไซต์
 * ใช้ CountAPI (countapi.xyz) ฟรี เก็บจำนวน hit
 * แสดงผลเฉพาะเมื่อเจ้าของเว็บเปิดด้วย ?admin ใน URL
 * ผู้เข้าชมทั่วไปจะไม่เห็น
 */

(function () {
  'use strict';

  var NAMESPACE = 'thiirtyyu-middle-ages';
  var KEY = 'site-visits';
  var VISITED_FLAG = 'ma_visited';

  function isAdmin() {
    return new URLSearchParams(window.location.search).has('admin');
  }

  // นับ +1 และ return จำนวน
  function hitCounter() {
    return fetch('https://api.countapi.xyz/hit/' + NAMESPACE + '/' + KEY)
      .then(function (res) {
        if (!res.ok) throw new Error('API ' + res.status);
        return res.json();
      })
      .then(function (data) { return data.value || 0; })
      .catch(function () { return null; });
  }

  // ดึงจำนวนอย่างเดียว (ไม่ increment)
  function getCounter() {
    return fetch('https://api.countapi.xyz/get/' + NAMESPACE + '/' + KEY)
      .then(function (res) {
        if (!res.ok) throw new Error('API ' + res.status);
        return res.json();
      })
      .then(function (data) { return data.value || 0; })
      .catch(function () { return null; });
  }

  function formatNum(n) {
    if (n === null || n === undefined) return '—';
    return n.toLocaleString('th-TH');
  }

  function renderAdmin(count) {
    var panel = document.getElementById('adminPanel');
    if (!panel) return;

    var displayCount = count !== null ? formatNum(count) : 'ไม่สามารถโหลดได้';
    var valClass = count !== null ? 'admin-stat-val' : 'admin-stat-val admin-stat-loading';

    panel.innerHTML =
      '<div class="admin-card">' +
        '<div class="admin-card-header">' +
          '<span class="admin-card-icon" aria-hidden="true">👑</span>' +
          '<span class="admin-card-title">Admin Panel</span>' +
        '</div>' +
        '<div class="admin-stat-row">' +
          '<span class="admin-stat-label">ผู้เข้าชมทั้งหมด</span>' +
          '<span class="' + valClass + '" id="adminVisitorCount">' + displayCount + '</span>' +
        '</div>' +
        '<div class="admin-footer">' +
          'เฉพาะเจ้าของเว็บเท่านั้นที่เห็น' +
        '</div>' +
      '</div>';

    panel.classList.add('admin-panel--show');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var alreadyVisited = localStorage.getItem(VISITED_FLAG);

    if (!alreadyVisited) {
      // ครั้งแรกของ browser นี้ — นับ +1
      hitCounter().then(function (count) {
        localStorage.setItem(VISITED_FLAG, '1');
        if (isAdmin()) renderAdmin(count);
      });
    } else {
      // เคยเข้าแล้ว — ถ้าเป็น admin ก็แค่ดึงจำนวน
      if (isAdmin()) {
        getCounter().then(function (count) {
          renderAdmin(count);
        });
      }
    }
  });

})();
