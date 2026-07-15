// 靜態展示版的密碼遮罩——只是防止隨手被看到／被搜尋引擎索引，不是真正的存取控制。
// 靜態網站本來就沒有伺服器可以擋資料傳輸，這裡只是在畫面上蓋一層遮罩，
// 資料其實已經在瀏覽器裡，只要看原始碼/關掉JS/直接抓data.js網址就能繞過，
// 見 CLAUDE.md 說明。密碼不是明文寫在這裡，而是存 SHA-256 雜湊值，
// 至少不會打開這個檔案就直接看到明文密碼。
(function () {
  var PASSWORD_HASH = "25eeecff84fda6f1ae12fea95a700483164eb5831c5e7175bd7b0e3fc07099e0";
  var STORAGE_KEY = "site_unlocked_v1";

  if (localStorage.getItem(STORAGE_KEY) === "1") return;

  document.documentElement.style.visibility = "hidden";

  function sha256Hex(str) {
    var buf = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", buf).then(function (hashBuf) {
      return Array.prototype.map
        .call(new Uint8Array(hashBuf), function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    });
  }

  function showGate() {
    var overlay = document.createElement("div");
    overlay.id = "_pw_gate_overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;background:#0d0d1a;color:#e0e0f0;display:flex;" +
      "flex-direction:column;align-items:center;justify-content:center;gap:14px;" +
      "font-family:'Segoe UI','Microsoft JhengHei',sans-serif;z-index:999999;";
    overlay.innerHTML =
      '<div style="font-size:15px;color:#9090b0">請輸入密碼</div>' +
      '<input type="password" id="_pw_gate_input" autocomplete="off" style="padding:8px 12px;font-size:14px;' +
      'border-radius:6px;border:1px solid #2a2a50;background:#1a1a35;color:#e0e0f0;outline:none;">' +
      '<button id="_pw_gate_btn" style="padding:8px 18px;font-size:13px;border-radius:6px;border:none;' +
      'background:#7c3aed;color:#fff;cursor:pointer;">進入</button>' +
      '<div id="_pw_gate_err" style="font-size:12px;color:#ef4444;height:14px;"></div>';
    document.body.appendChild(overlay);
    document.documentElement.style.visibility = "visible";

    var input = document.getElementById("_pw_gate_input");
    var btn = document.getElementById("_pw_gate_btn");
    var err = document.getElementById("_pw_gate_err");
    input.focus();

    function tryUnlock() {
      sha256Hex(input.value).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          localStorage.setItem(STORAGE_KEY, "1");
          overlay.remove();
        } else {
          err.textContent = "密碼錯誤";
          input.value = "";
          input.focus();
        }
      });
    }
    btn.onclick = tryUnlock;
    input.onkeydown = function (e) {
      if (e.key === "Enter") tryUnlock();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showGate);
  } else {
    showGate();
  }
})();
