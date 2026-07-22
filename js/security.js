/**
 * security.js — Basic security protections
 * ป้องกัน hacker เบื้องต้นสำหรับ static site
 */

(function () {
  'use strict';

  // ─── 1. Anti-Clickjacking (Frame-Busting) ───
  // ป้องกันไม่ให้เว็บถูก embed ใน iframe ของเว็บอื่น
  if (window.self !== window.top) {
    try {
      window.top.location = window.self.location;
    } catch (e) {
      // ถ้าไม่สามารถ redirect ได้ (cross-origin) ให้ซ่อนหน้าเว็บ
      document.documentElement.style.display = 'none';
    }
  }

  // ─── 2. Disable Right-Click Context Menu ───
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // ─── 3. Disable DevTools Shortcuts ───
  // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
    // Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }
  });

  // ─── 4. Disable Text Selection & Drag ───
  // ป้องกันการ copy ข้อความและลากรูปภาพ
  document.addEventListener('selectstart', function (e) {
    // อนุญาตให้เลือกข้อความใน input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  });

  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

  // ─── 5. Console Warning ───
  // แสดงข้อความเตือนใน DevTools Console
  var warningStyle = 'color:#e74c3c; font-size:32px; font-weight:bold; text-shadow:1px 1px 2px rgba(0,0,0,0.3);';
  var msgStyle = 'color:#2c3e50; font-size:14px; line-height:1.6;';

  console.log('%c⚠️ หยุด!', warningStyle);
  console.log(
    '%cนี่คือฟีเจอร์ของเบราว์เซอร์ที่ออกแบบมาสำหรับนักพัฒนา\n' +
    'ถ้ามีคนบอกให้คุณ copy-paste อะไรลงที่นี่ เพื่อเปิดฟีเจอร์หรือ "แฮ็ก" บัญชีของคนอื่น\n' +
    'นั่นคือมิจฉาชีพ กรุณาปิดหน้าต่างนี้ทันที',
    msgStyle
  );

  // ─── 6. DevTools Open Detection ───
  // ตรวจจับเมื่อ DevTools ถูกเปิด (เทคนิค debugger)
  var devToolsOpen = false;
  var threshold = 160;

  function checkDevTools() {
    var widthThreshold = window.outerWidth - window.innerWidth > threshold;
    var heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.clear();
        console.log('%c⚠️ ตรวจพบ Developer Tools', warningStyle);
        console.log('%cกรุณาปิด Developer Tools เพื่อใช้งานเว็บไซต์ตามปกติ', msgStyle);
      }
    } else {
      devToolsOpen = false;
    }
  }

  setInterval(checkDevTools, 1000);

})();
