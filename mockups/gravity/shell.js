/*
 * 万有引力定律 · 播放器外壳与公共工具（window.GRAV）
 * 接口见规格第四节。各幕文件只通过 GRAV.act 注册，不改这里。
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var acts = [];
  var GRAV = window.GRAV = {};
  var CLOSING = '这节课到此结束。';

  GRAV.state = {};

  GRAV.act = function (def) {
    acts.push(def);
  };

  // ---------- 格式化 ----------
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(s) {
    return s.split('').map(function (c) { return SUP[c] || c; }).join('');
  }

  GRAV.fmt = {
    sci: function (x, d) {
      d = d || 3;
      var p = Number(x).toExponential(Math.max(0, d - 1)).split('e');
      return p[0] + '×10' + sup(String(Number(p[1])));
    },
    num: function (x, d) {
      d = d || 3;
      x = Number(x);
      var a = Math.abs(x);
      if (a === 0) return '0';
      if (a < 1e-6 || a >= 1e21) return GRAV.fmt.sci(x, d);
      var e = Math.floor(Math.log(a) / Math.LN10);
      return x.toFixed(Math.min(20, Math.max(0, d - 1 - e)));
    }
  };

  GRAV.h = {
    sym: function (s) { return '<i class="sym">' + s + '</i>'; }
  };

  // ---------- 调色板与画布工具 ----------
  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function palette() {
    return {
      ink: cssVar('--c-ink'), graphite: cssVar('--c-graphite'), steel: cssVar('--c-steel'),
      hair: cssVar('--c-hairline'), accel: cssVar('--c-accel'), vel: cssVar('--c-velocity'),
      field: cssVar('--c-field'), force: cssVar('--c-force'), charge: cssVar('--c-charge'),
      card: cssVar('--c-card'), page: cssVar('--c-page'), bar: cssVar('--c-bar')
    };
  }
  function fontFor(font, size) {
    if (font === 'num') return size + 'px Inter, sans-serif';
    if (font === 'sym') return 'italic ' + size + 'px "Source Serif 4", serif';
    return size + 'px "Noto Sans SC", sans-serif';
  }

  GRAV.draw = {
    text: function (ctx, str, x, y, o) {
      o = o || {};
      ctx.save();
      ctx.font = fontFor(o.font, o.size || 13);
      ctx.fillStyle = o.color || cssVar('--c-ink') || '#1f2329';
      ctx.textAlign = o.align || 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(str, x, y);
      ctx.restore();
    },
    arrow: function (ctx, x1, y1, x2, y2, color, width) {
      width = width || 2;
      var ang = Math.atan2(y2 - y1, x2 - x1);
      var hl = Math.max(8, width * 4), hw = Math.max(4, width * 1.8);
      var bx = x2 - hl * Math.cos(ang), by = y2 - hl * Math.sin(ang);
      ctx.save();
      ctx.strokeStyle = color; ctx.fillStyle = color;
      ctx.lineWidth = width; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(bx, by); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(bx - hw * Math.sin(ang), by + hw * Math.cos(ang));
      ctx.lineTo(bx + hw * Math.sin(ang), by - hw * Math.cos(ang));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    note: function (ctx, str, w, h, C) {
      GRAV.draw.text(ctx, str, 14, h - 6, { font: 'ui', size: 11, color: C.steel });
    }
  };

  // ---------- 选择题（判对错的题都用它） ----------
  GRAV.ui = {
    choice: function (el, opts, api) {
      opts = opts || {};
      var options = opts.options || [];
      var hints = opts.hints || [];
      var btns = [];
      var correctIdx = -1;
      var hintNext = 0, wrongs = 0, done = false, revealed = false;

      var wrap = document.createElement('div');
      wrap.className = 'choice';
      var list = document.createElement('div');
      list.className = 'opts';
      var hintBtn = document.createElement('button');
      hintBtn.type = 'button';
      hintBtn.className = 'txt-btn hint-btn';
      hintBtn.textContent = '提示';

      options.forEach(function (o, i) {
        if (o.correct && correctIdx < 0) correctIdx = i;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.innerHTML = '<span class="opt-html">' + o.html + '</span><span class="mark" aria-hidden="true"></span>';
        b.addEventListener('click', function () { pick(i); });
        btns.push(b);
        list.appendChild(b);
      });

      function sayIf(html) {
        if (html) api.say(html);
      }

      function reveal() {
        revealed = true;
        hintBtn.hidden = true;
        if (correctIdx >= 0) btns[correctIdx].classList.add('reveal');
        if (hints.length) api.say(hints[Math.min(2, hints.length - 1)]);
      }

      function pick(i) {
        if (done) return;
        var o = options[i], b = btns[i];
        if (!o || b.disabled) return;
        if (o.correct) {
          done = true;
          b.classList.remove('reveal');
          b.classList.add('win');
          b.querySelector('.mark').textContent = '✓';
          btns.forEach(function (x, j) { if (j !== i) x.disabled = true; });
          hintBtn.hidden = true;
          sayIf(o.say);
          api.win(true);
          api.open();
          if (typeof opts.onCorrect === 'function') opts.onCorrect();
          return;
        }
        wrongs++;
        b.classList.add('lose');
        b.disabled = true;
        sayIf(o.say);
        if (wrongs === 2) reveal();
      }

      hintBtn.addEventListener('click', function () {
        if (done || revealed || hintNext >= hints.length) return;
        api.say(hints[hintNext]);
        hintNext++;
        if (hintNext >= hints.length) hintBtn.hidden = true;
      });

      wrap.appendChild(list);
      if (hints.length) {
        var foot = document.createElement('div');
        foot.className = 'choice-foot';
        foot.appendChild(hintBtn);
        wrap.appendChild(foot);
      }
      el.appendChild(wrap);
    }
  };

  // ---------- 外壳状态 ----------
  var E = {};
  var started = false;
  var ai = 0, si = 0, finished = false;
  var token = 0;
  var unlocked = true, won = false;
  var prevHTML = '', curHTML = '', statusHTML = '';
  var drawFn = null, stepStart = 0;
  var canvas = null, ctx = null, wrap = null;
  var cw = 1, ch = 1, dpr = 1;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function curStep() { var a = acts[ai]; return a ? a.steps[si] : null; }
  function capOf(st) {
    if (!st) return '';
    return typeof st.caption === 'function' ? st.caption() : (st.caption || '');
  }
  function prevStepOf() {
    if (si > 0) return acts[ai].steps[si - 1];
    if (ai > 0) { var pa = acts[ai - 1]; return pa.steps[pa.steps.length - 1]; }
    return null;
  }
  function isDark() {
    var t = root.getAttribute('data-theme');
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    return t === 'dark' || (t !== 'light' && !!(mq && mq.matches));
  }

  // ---------- 渲染 ----------
  function renderProgress() {
    var html = '';
    acts.forEach(function (a, i) {
      if (finished || i < ai) {
        html += '<span class="seg done"></span>';
      } else if (i === ai) {
        var pct = ((si + 1) / a.steps.length * 100).toFixed(1);
        html += '<span class="seg cur"><span class="fill" style="width:' + pct + '%"></span></span>';
      } else {
        html += '<span class="seg"></span>';
      }
    });
    E.progress.innerHTML = html;
  }

  function renderToc() {
    E.toc.innerHTML = acts.map(function (a, i) {
      var on = !finished && i === ai;
      return '<button type="button" class="toc-item' + (on ? ' on' : '') + '" data-i="' + i + '"' +
        (on ? ' aria-current="true"' : '') + '><span class="num">' + a.id + '</span><span>' + a.name + '</span></button>';
    }).join('');
  }

  function renderCaption() {
    if (!E.capCur) return;
    E.capPrev.innerHTML = prevHTML;
    E.capCur.innerHTML = curHTML;
  }

  function renderStatus() {
    if (E.status) E.status.innerHTML = statusHTML;
  }

  function updateHash() {
    if (!acts.length) return;
    var h = finished ? '#done' : '#a' + acts[ai].id + 's' + (si + 1);
    if (location.hash === h) return;
    try { history.replaceState(null, '', h); } catch (e) { /* 文件地址等情况下忽略 */ }
  }

  function render() {
    if (!E.board) return;
    var a = acts[ai], st = curStep();
    renderProgress();
    renderToc();
    renderCaption();
    renderStatus();
    E.board.classList.toggle('finished', finished);
    E.board.classList.toggle('won', !finished && won);
    drawFn = null;
    if (!finished && st) {
      E.tag.textContent = a.tag || ('第 ' + a.id + ' 幕');
      E.title.innerHTML = st.title || '';
      var canvasOn = (st.layout || 'split') === 'split' && typeof st.draw === 'function';
      E.work.classList.toggle('single', !canvasOn);
      E.work.classList.toggle('wide', canvasOn && typeof st.mount !== 'function');
      drawFn = canvasOn ? st.draw : null;
      E.btnGo.textContent = st.button || '继续';
      E.btnGo.disabled = !unlocked;
    }
    E.btnBack.disabled = !finished && ai === 0 && si === 0;
    E.btnNext.disabled = finished || !unlocked;
    E.btnTheme.setAttribute('aria-pressed', String(isDark()));
    updateHash();
  }

  // ---------- 进入、离开、前进、后退 ----------
  function leave() {
    var st = curStep();
    if (st && typeof st.leave === 'function') st.leave();
  }

  function makeApi(my) {
    function alive() { return my === token; }
    return {
      open: function () { if (alive()) { unlocked = true; render(); } },
      win: function (v) { if (alive()) { won = !!v; render(); } },
      say: function (html) {
        if (!alive()) return;
        prevHTML = curHTML;
        curHTML = html == null ? '' : String(html);
        renderCaption();
      },
      status: function (html) {
        if (!alive()) return;
        statusHTML = html == null ? '' : String(html);
        renderStatus();
      },
      next: function () { if (alive()) forward(true); },
      redraw: function () {}
    };
  }

  function enter() {
    var st = curStep();
    token++;
    var my = token;
    unlocked = !st.gate;
    won = false;
    prevHTML = capOf(prevStepOf());
    curHTML = capOf(st);
    statusHTML = st.status || '';
    E.answer.innerHTML = '';
    E.answer.onclick = null;
    stepStart = performance.now();
    render();
    if (typeof st.mount === 'function') st.mount(E.answer, makeApi(my));
    render();
    sizeCanvas();
  }

  function go(a, s) {
    if (!acts.length) return;
    if (!finished) leave();
    finished = false;
    ai = clamp(a, 0, acts.length - 1);
    si = clamp(s, 0, acts[ai].steps.length - 1);
    enter();
  }

  function finish(noLeave) {
    var st = curStep();
    if (!noLeave && !finished) leave();
    token++;
    finished = true;
    won = false;
    unlocked = true;
    prevHTML = capOf(st);
    curHTML = CLOSING;
    statusHTML = '';
    E.answer.innerHTML = '';
    E.answer.onclick = null;
    closeToc();
    render();
  }

  function forward(force) {
    if (finished || !acts.length) return;
    if (!force && !unlocked) return;
    if (si < acts[ai].steps.length - 1) go(ai, si + 1);
    else if (ai < acts.length - 1) go(ai + 1, 0);
    else finish(false);
  }

  function back() {
    if (finished) {
      var last = acts.length - 1;
      go(last, acts[last].steps.length - 1);
      return;
    }
    if (si > 0) go(ai, si - 1);
    else if (ai > 0) go(ai - 1, acts[ai - 1].steps.length - 1);
  }

  function restart() {
    Object.keys(GRAV.state).forEach(function (k) { delete GRAV.state[k]; });
    go(0, 0);
  }

  // ---------- 目录与主题 ----------
  function openToc() {
    renderToc();
    E.toc.hidden = false;
    E.btnToc.setAttribute('aria-expanded', 'true');
  }
  function closeToc() {
    if (!E.toc) return;
    E.toc.hidden = true;
    E.btnToc.setAttribute('aria-expanded', 'false');
  }
  function toggleToc() {
    if (E.toc.hidden) openToc(); else closeToc();
  }
  function toggleTheme() {
    root.setAttribute('data-theme', isDark() ? 'light' : 'dark');
    render();
  }

  // ---------- 地址栏 hash ----------
  function parseHash() {
    var h = location.hash || '';
    if (h === '#done') return { done: true };
    var m = /^#a(\d+)s(\d+)$/.exec(h);
    if (!m) return null;
    var idx = -1;
    for (var i = 0; i < acts.length; i++) {
      if (acts[i].id === Number(m[1])) idx = i;
    }
    if (idx < 0) return null;
    return { ai: idx, si: Number(m[2]) - 1 };
  }

  // ---------- 画布 ----------
  function sizeCanvas() {
    if (!canvas || !wrap) return;
    var r = wrap.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    cw = Math.max(1, Math.round(r.width));
    ch = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!drawFn || finished || !ctx || cw < 2 || ch < 2) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    drawFn(ctx, cw, ch, Math.max(0, (now - stepStart) / 1000), palette());
  }

  // ---------- 事件 ----------
  function bind() {
    E.btnBack.addEventListener('click', back);
    E.btnNext.addEventListener('click', function () { forward(false); });
    E.btnGo.addEventListener('click', function () { forward(false); });
    E.btnRestart.addEventListener('click', restart);
    E.btnClose.addEventListener('click', function () { try { window.close(); } catch (e) { /* 忽略 */ } });
    E.btnToc.addEventListener('click', toggleToc);
    E.btnTheme.addEventListener('click', toggleTheme);
    E.toc.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.toc-item') : null;
      if (!b) return;
      go(Number(b.getAttribute('data-i')), 0);
      closeToc();
    });
    document.addEventListener('click', function (e) {
      if (E.toc.hidden) return;
      if (E.toc.contains(e.target) || E.btnToc.contains(e.target)) return;
      closeToc();
    });
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') forward(false);
      else if (e.key === 'ArrowLeft') back();
      else if (e.key === 'Escape') closeToc();
    });
    window.addEventListener('hashchange', function () {
      var t = parseHash();
      if (!t) return;
      if (t.done) { if (!finished) finish(false); return; }
      if (!finished && t.ai === ai && t.si === si) return;
      go(t.ai, t.si);
    });
  }

  // ---------- 启动 ----------
  GRAV.start = function () {
    if (started) return;
    started = true;
    acts.sort(function (x, y) { return x.id - y.id; });

    E.progress = document.getElementById('progress');
    E.toc = document.getElementById('toc');
    E.btnClose = document.getElementById('btn-close');
    E.btnBack = document.getElementById('btn-back');
    E.btnNext = document.getElementById('btn-next');
    E.btnToc = document.getElementById('btn-toc');
    E.btnTheme = document.getElementById('btn-theme');
    E.capPrev = document.getElementById('cap-prev');
    E.capCur = document.getElementById('cap-cur');
    E.status = document.getElementById('status');
    E.board = document.getElementById('board');
    E.tag = document.getElementById('tag');
    E.title = document.getElementById('title');
    E.work = document.getElementById('work');
    E.answer = document.getElementById('answer');
    E.btnGo = document.getElementById('btn-go');
    E.btnRestart = document.getElementById('btn-restart');

    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');
    wrap = document.getElementById('canvas-wrap');
    sizeCanvas();
    if (window.ResizeObserver) new ResizeObserver(sizeCanvas).observe(wrap);
    else window.addEventListener('resize', sizeCanvas);

    bind();
    if (!acts.length) return;

    var target = parseHash();
    if (target && target.done) {
      ai = acts.length - 1;
      si = acts[ai].steps.length - 1;
      finish(true);
    } else {
      ai = target ? target.ai : 0;
      si = target ? clamp(target.si, 0, acts[ai].steps.length - 1) : 0;
      enter();
    }
    requestAnimationFrame(frame);
  };
})();
