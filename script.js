(function () {
  var $ = function (id) { return document.getElementById(id); };
  var ask = $("s-ask"), scan = $("s-scan"), result = $("s-result");
  var yes = $("yes"), no = $("no"), spacer = $("spacer"), counter = $("counter");
  var nameEl = $("name");
  var dodges = 0, LIMIT = 10, gaveUp = false, timers = [];

  var steps = [
    "Unshij baina...",
    "Neriig chini shalgaj baina...",
    "Medeelel unshij baina...",
    "Ur dung tootsoolj baina..."
  ];
  var verdicts = [
    "Tuuhen teneg",
    "Hamgiin teneg",
    "Naizuudiinxa dund hamgiin teneg n",
    "Avralgui teneg",
    "uruvdultei teneg",
    "teneg lalar, hardcore:3",
    "yag jinhene teneg",
    "hagas teneg",
    "zarim uyd teneg",
    "teneg bish um baina, Bayr xurgey lol",
    "teneg ch gesen daxiad teneg",
    "tengee meddeggui teneg"
  ];
  var notes = [
    "Naizuudiiga teneg gedgiig batlah gej xiiv.",
    "Shalgaltiig batalsan: Teneg Shalgalt LLC.",
    "Ur dun buruu baij bolno, gehdee bi buruu um xiixgui.",
    "Shalgalt ene ur dung buh system hamt tohiroltsloo.",
    "Naizuuddaa ilgeej, ur dung ni haraarai."
  ];

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function show(el) {
    [ask, scan, result].forEach(function (s) { s.hidden = s !== el; });
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function dodge() {
    if (gaveUp) return;
    dodges++;
    var r = no.getBoundingClientRect();
    var w = r.width || 120, h = r.height || 52;
    if (!no.classList.contains("fled")) {
      spacer.classList.add("on");
      no.classList.add("fled");
      no.style.left = r.left + "px";
      no.style.top = r.top + "px";
    }
    var pad = 12;
    var maxX = Math.max(pad, window.innerWidth - w - pad);
    var maxY = Math.max(pad, window.innerHeight - h - pad);
    var x, y, tries = 0, yr = yes.getBoundingClientRect();
    do {
      x = pad + Math.random() * (maxX - pad);
      y = pad + Math.random() * (maxY - pad);
      tries++;
    } while (tries < 20 && x < yr.right + 20 && x + w > yr.left - 20 && y < yr.bottom + 20 && y + h > yr.top - 20);
    requestAnimationFrame(function () {
      no.style.left = x + "px";
      no.style.top = y + "px";
    });
    counter.textContent = "Ugui darj chadsangui: " + dodges + " udaa";
    if (dodges >= LIMIT) giveUp();
  }

  function giveUp() {
    gaveUp = true;
    no.classList.add("gave-up");
    no.textContent = "Ok, tiim";
    counter.textContent = "Ugui tovch yadarlaa. Odoo darj bolno.";
    var yr = yes.getBoundingClientRect();
    no.style.left = (yr.right + 14) + "px";
    no.style.top = yr.top + "px";
    if (yr.right + 14 + 140 > window.innerWidth) {
      no.style.left = yr.left + "px";
      no.style.top = (yr.bottom + 12) + "px";
    }
  }

  no.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") dodge(); });
  no.addEventListener("pointerdown", function (e) {
    if (gaveUp) return;
    e.preventDefault();
    dodge();
  });
  no.addEventListener("click", function (e) {
    if (!gaveUp) { e.preventDefault(); dodge(); return; }
    startScan();
  });
  yes.addEventListener("click", startScan);
  nameEl.addEventListener("keydown", function (e) { if (e.key === "Enter") startScan(); });

  function startScan() {
    clearTimers();
    var name = (nameEl.value || "").trim() || "Chi";
    show(scan);
    var log = $("log"), bar = $("bar"), wrap = $("barwrap");
    log.innerHTML = "";
    bar.style.width = "0";
    steps.forEach(function (text, i) {
      timers.push(setTimeout(function () {
        var d = document.createElement("div");
        d.textContent = text;
        log.appendChild(d);
        var pct = Math.round(((i + 1) / steps.length) * 100);
        bar.style.width = pct + "%";
        wrap.setAttribute("aria-valuenow", String(pct));
      }, 700 * (i + 1)));
    });
    timers.push(setTimeout(function () { showResult(name); }, 700 * (steps.length + 1) + 300));
  }

    function showResult(name) {
    var h = hash(name.toLowerCase());
    var isNot = (h % 6) === 5;
    var pct = isNot ? 3 + (h % 13) : 87 + (h % 13);
    $("r-tag").textContent = "Shalgalt duuslaa · " + name;
    $("r-pct").textContent = pct + "%";
    if (isNot) {
      $("r-verdict").textContent = name + "teneg bish um baina, Bayr xurgey lol";
      $("r-note").textContent = "Skanner chamaig tengiin jagsaaltand olsongui.";
    } else {
      $("r-verdict").textContent = name + " bol " + verdicts[(h >> 3) % verdicts.length] + ".";
      $("r-note").textContent = notes[h % notes.length];
    }
    $("status").textContent = "";
    show(result);
  }

  $("again").addEventListener("click", function () {
    clearTimers();
    dodges = 0; gaveUp = false;
    no.classList.remove("fled", "gave-up");
    no.style.left = ""; no.style.top = "";
    no.textContent = "Ugui";
    spacer.classList.remove("on");
    counter.textContent = "";
    nameEl.value = "";
    show(ask);
  });

  $("share").addEventListener("click", function () {
    var url = window.location.href;
    var status = $("status");
    function fallback() {
      var box = $("linkbox"), f = $("linkfield");
      box.classList.add("on");
      f.value = url;
      f.focus();
      f.select();
      status.textContent = "Link doorh talbart bna. Huulaad naizdaa ilgee.";
    }
    try {
      navigator.clipboard.writeText(url).then(function () {
        status.textContent = "Link huulagdlaa. Naizdaa yavuul.";
      }, fallback);
    } catch (e) { fallback(); }
  });
})();
