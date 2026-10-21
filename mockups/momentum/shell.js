/*
 * 画布课件 · 播放器外壳与公共工具（window.GRAV），从万有引力课件复制而来
 * 接口见规格第四节；v2 增补：step.beats 逐句讲解、讲解记录、学生气泡、GRAV.kit、GRAV.ui.work。
 * 各幕文件只通过 GRAV.act 注册，不改这里。没有 beats 的旧步骤按 beats: [{ say: caption }] 运行。
 * 动量课增补：step.play 有动画（画布下出现重播、慢放），step.playAt 讲到第几句才从头播，step.tall 手机上用高画布。
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var acts = [];
  var GRAV = window.GRAV = {};
  var CLOSING = '这节课到此结束。';
  var TAU = Math.PI * 2;

  GRAV.state = {};

  GRAV.act = function (def) {
    acts.push(def);
  };

  // ---------- 格式化 ----------
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(s) {
    return String(s).split('').map(function (c) { return SUP[c] || c; }).join('');
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
      card: cssVar('--c-card'), page: cssVar('--c-page'), bar: cssVar('--c-bar'), side: cssVar('--c-side')
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
      ctx.font = fontFor(o.font, o.size || 14);
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
      GRAV.draw.text(ctx, str, 14, h - 6, { font: 'ui', size: 12, color: C.steel });
    }
  };

  // ---------- 颜色小工具（kit 用） ----------
  // '#rrggbb' 加透明度；解析不了就原样返回
  function rgba(c, a) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || '');
    if (!m) return c;
    var h = m[1];
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  // 调色板的底色是深的，就当深色模式
  function isDarkC(C) {
    var m = /^#([0-9a-f]{6})$/i.exec(C.page || '');
    if (!m) return false;
    var n = parseInt(m[1], 16);
    var lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum < 0.5;
  }
  function plainText(html) {
    var d = document.createElement('div');
    d.innerHTML = String(html == null ? '' : html);
    return d.textContent || '';
  }

  // ---------- 公用画法 GRAV.kit（所有幕画这些物体都用它） ----------
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }

  var kit = {
    earth: function (ctx, x, y, r, C) {
      r = Math.max(0.5, r);
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(C.vel, 0.28));
      g.addColorStop(1, rgba(C.vel, 0.45));
      ctx.save();
      circle(ctx, x, y, r); ctx.fillStyle = g; ctx.fill();
      // 左上高光，裁在球里
      var hx = x - r * 0.35, hy = y - r * 0.35, hr = r * 0.4;
      var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      var ha = isDarkC(C) ? 0.08 : 0.25;
      hg.addColorStop(0, 'rgba(255,255,255,' + ha + ')');
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      circle(ctx, x, y, r); ctx.clip();
      circle(ctx, hx, hy, hr); ctx.fillStyle = hg; ctx.fill();
      ctx.restore();
      ctx.save();
      circle(ctx, x, y, r); ctx.lineWidth = 1; ctx.strokeStyle = rgba(C.ink, 0.4); ctx.stroke();
      ctx.restore();
    },

    moon: function (ctx, x, y, r, C) {
      r = Math.max(0.5, r);
      var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, C.bar);
      g.addColorStop(1, rgba(C.steel, 0.6));
      ctx.save();
      circle(ctx, x, y, r); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = C.graphite; ctx.stroke();
      if (r >= 8) {
        // 2–3 个淡色小环形坑
        var pits = [[-0.32, -0.18, 0.22], [0.28, 0.22, 0.16], [0.08, -0.42, 0.12]];
        pits.forEach(function (p) {
          var px = x + p[0] * r, py = y + p[1] * r, pr = p[2] * r;
          circle(ctx, px, py, pr); ctx.strokeStyle = rgba(C.steel, 0.5); ctx.lineWidth = 1; ctx.stroke();
          circle(ctx, px, py, pr * 0.8); ctx.fillStyle = rgba(C.steel, 0.12); ctx.fill();
        });
      }
      ctx.restore();
    },

    sun: function (ctx, x, y, r, C) {
      r = Math.max(0.5, r);
      ctx.save();
      circle(ctx, x, y, r * 1.6); ctx.fillStyle = rgba(C.charge, 0.15); ctx.fill();
      circle(ctx, x, y, r); ctx.fillStyle = C.charge; ctx.fill();
      ctx.restore();
    },

    apple: function (ctx, x, y, r, C) {
      r = Math.max(0.5, r);
      ctx.save();
      circle(ctx, x, y, r); ctx.fillStyle = C.graphite; ctx.fill();
      // 梗
      ctx.beginPath();
      ctx.moveTo(x, y - r + 0.5);
      ctx.lineTo(x + r * 0.15, y - r * 1.6);
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.graphite; ctx.lineCap = 'round'; ctx.stroke();
      // 小叶
      ctx.beginPath();
      ctx.ellipse(x + r * 0.5, y - r * 1.45, r * 0.45, r * 0.2, -0.4, 0, TAU);
      ctx.fillStyle = C.steel; ctx.fill();
      ctx.restore();
    },

    ball: function (ctx, x, y, r, C, dark) {
      r = Math.max(0.5, r);
      ctx.save();
      circle(ctx, x, y, r);
      if (dark) {
        ctx.fillStyle = C.graphite; ctx.fill();
      } else {
        ctx.fillStyle = C.bar; ctx.fill();
        ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite; ctx.stroke();
      }
      ctx.restore();
    },

    sea: function (ctx, x0, x1, y, t, C) {
      var period = 6, amp = 4, wave = 140;
      var alphas = [1, 0.5, 0.25];
      ctx.save();
      ctx.strokeStyle = C.vel; ctx.lineWidth = 1.5;
      for (var i = 0; i < 3; i++) {
        ctx.globalAlpha = alphas[i];
        ctx.beginPath();
        var yy = y + i * 9;
        for (var x = x0; x <= x1 + 0.5; x += 4) {
          var phase = (x - x0) / wave * TAU - t / period * TAU + i * 1.1;
          var yv = yy + amp * Math.sin(phase);
          if (x === x0) ctx.moveTo(x, yv); else ctx.lineTo(x, yv);
        }
        ctx.stroke();
      }
      ctx.restore();
    },

    label: function (ctx, str, x, y, C, opt) {
      opt = opt || {};
      GRAV.draw.text(ctx, str, x, y, {
        font: 'ui', size: 12, color: opt.ink ? C.ink : C.graphite, align: opt.align || 'left'
      });
    },

    // 一行算式。parts: [{t, sym}]；返回宽度。opt.align 可选 'left'|'center'|'right'（默认 left）
    math: function (ctx, parts, x, y, C, opt) {
      opt = opt || {};
      var size = opt.size || 18, color = opt.color || C.ink, align = opt.align || 'left';
      var total = 0;
      ctx.save();
      parts.forEach(function (p) {
        ctx.font = p.sym ? 'italic ' + size + 'px "Source Serif 4", serif' : size + 'px Inter, "Noto Sans SC", sans-serif';
        p.w = ctx.measureText(p.t).width;
        total += p.w;
      });
      var px = align === 'center' ? x - total / 2 : (align === 'right' ? x - total : x);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = color;
      parts.forEach(function (p) {
        ctx.font = p.sym ? 'italic ' + size + 'px "Source Serif 4", serif' : size + 'px Inter, "Noto Sans SC", sans-serif';
        ctx.fillText(p.t, px, y);
        px += p.w;
      });
      ctx.restore();
      return total;
    }
  };
  GRAV.kit = kit;

  // ---------- 选择题（判对错的题都用它） ----------
  function workBoard(el) {
    var box = document.createElement('div');
    box.className = 'wk';
    el.appendChild(box);
    var last = null;
    return {
      line: function (html, note) {
        if (last) last.classList.remove('last');
        var row = document.createElement('div');
        row.className = 'wk-line last';
        row.innerHTML = '<span class="wk-eq">' + (html == null ? '' : html) + '</span>' +
          (note ? '<span class="wk-note">' + note + '</span>' : '');
        box.appendChild(row);
        last = row;
      },
      clear: function () {
        box.innerHTML = '';
        last = null;
      }
    };
  }

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
        api.me('我选「' + plainText(o.html) + '」');
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
        if (typeof opts.onWrong === 'function') opts.onWrong(i);
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
    },

    // 演算板：在 el 里建一块，line 逐行追加（淡入），clear 清空
    work: function (el) {
      return workBoard(el);
    }
  };

  // ---------- 外壳状态 ----------
  var E = {};
  var started = false;
  var ai = 0, si = 0, bi = 0, finished = false;
  var token = 0;
  var unlocked = true, won = false;
  var items = [], pushed = {}, hooks = [];   // 讲解记录；每项 {type:'say'|'me', beat, html}
  var lastCount = -1;
  var statusHTML = '';
  var drawFn = null;
  // 播放时钟：动画只播一次、停在最后一帧；重播把它拨回 0，慢放让它走得慢
  var playT = 0, beatT = 0, lastTs = 0, rate = 1, SLOW = 0.3;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var canvas = null, ctx = null, wrap = null;
  var cw = 1, ch = 1, dpr = 1;

  function now() { return performance.now(); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function curStep() { var a = acts[ai]; return a ? a.steps[si] : null; }
  function beatsOf(st) { return st.beats || [{ say: st.caption || '' }]; }
  function beatText(bt) {
    var s = bt.say;
    return typeof s === 'function' ? s() : (s == null ? '' : s);
  }
  // 本步的哪一句要先作答：gateAt 优先；gate:true 默认在最后一句
  function gateBeat(st) {
    if (typeof st.gateAt === 'number') return st.gateAt;
    return st.gate ? beatsOf(st).length - 1 : -1;
  }
  function locked() {
    var st = curStep();
    return !!st && !unlocked && bi === gateBeat(st);
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
        var total = 0, before = 0;
        a.steps.forEach(function (s, j) {
          var c = beatsOf(s).length;
          total += c;
          if (j < si) before += c;
        });
        var pct = clamp((before + bi + 1) / total * 100, 0, 100).toFixed(1);
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

  // 讲解记录：只显示 beat <= 当前句的项；最新一句老师的话是 cur
  function visibleItems() {
    if (finished) return [{ type: 'say', beat: 0, html: CLOSING }];
    return items.filter(function (it) { return it.beat <= bi; });
  }
  function renderLog() {
    if (!E.log) return;
    var vis = visibleItems(), lastSay = -1;
    vis.forEach(function (it, i) { if (it.type === 'say') lastSay = i; });
    var html = '';
    vis.forEach(function (it, i) {
      var cls = it.type === 'me' ? 'item me' : ('item say' + (i === lastSay ? ' cur' : ''));
      html += '<div class="' + cls + '">' + it.html + '</div>';
    });
    E.log.innerHTML = html;
    if (vis.length !== lastCount) {
      E.log.scrollTop = E.log.scrollHeight;
      lastCount = vis.length;
    }
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

  // 作答区里有没有看得见的东西（全部隐藏或空白时，画布占满整块板子）
  function answerHasContent() {
    return Array.prototype.some.call(E.answer.children, function (c) {
      if (c.hidden) return false;
      if (c.querySelector && c.querySelector('button, table, canvas, img, svg')) {
        return Array.prototype.some.call(c.querySelectorAll('button, table, canvas, img, svg'), function (n) {
          for (var p = n; p && p !== E.answer; p = p.parentNode) if (p.hidden) return false;
          return true;
        }) || c.textContent.trim() !== '';
      }
      return c.textContent.trim() !== '';
    });
  }

  function render() {
    if (!E.board) return;
    var a = acts[ai], st = curStep();
    renderProgress();
    renderToc();
    renderLog();
    renderStatus();
    E.board.classList.toggle('finished', finished);
    E.board.classList.toggle('won', !finished && won);
    drawFn = null;
    if (!finished && st) {
      E.tag.textContent = a.tag || ('第 ' + a.id + ' 幕');
      E.title.innerHTML = st.title || '';
      var canvasOn = (st.layout || 'split') === 'split' && typeof st.draw === 'function';
      E.work.classList.toggle('single', !canvasOn);
      E.work.classList.toggle('tall', !!st.tall);
      E.work.classList.toggle('wide', canvasOn && !answerHasContent());
      drawFn = canvasOn ? st.draw : null;
      var last = beatsOf(st).length - 1;
      E.btnGo.textContent = bi >= last ? (st.button || '继续') : '下一句';
      E.btnGo.disabled = locked();
      E.goTip.hidden = !locked();
      E.playbar.hidden = !(canvasOn && st.play);
    }
    E.btnGo.hidden = finished;
    if (finished) E.goTip.hidden = true;
    E.btnSlow.setAttribute('aria-pressed', String(rate !== 1));
    E.btnBack.disabled = !finished && ai === 0 && si === 0 && bi === 0;
    E.btnNext.disabled = finished || locked();
    E.btnTheme.setAttribute('aria-pressed', String(isDark()));
    updateHash();
  }

  // ---------- 句、步、幕的进退 ----------
  function leave() {
    var st = curStep();
    if (st && typeof st.leave === 'function') st.leave();
  }

  // 把第 j 句的老师的话放进记录（每句只放一次，之后用 beat 决定显示与否）
  function pushBeat(j) {
    if (pushed[j]) return;
    pushed[j] = true;
    var bt = beatsOf(curStep())[j];
    items.push({ type: 'say', beat: j, html: beatText(bt) });
  }

  function makeApi(my) {
    function alive() { return my === token; }
    return {
      open: function () { if (alive()) { unlocked = true; render(); } },
      win: function (v) { if (alive()) { won = !!v; render(); } },
      say: function (html) {
        if (!alive()) return;
        items.push({ type: 'say', beat: bi, html: html == null ? '' : String(html) });
        renderLog();
      },
      me: function (html) {
        if (!alive()) return;
        items.push({ type: 'me', beat: bi, html: html == null ? '' : String(html) });
        renderLog();
      },
      status: function (html) {
        if (!alive()) return;
        statusHTML = html == null ? '' : String(html);
        renderStatus();
      },
      onBeat: function (fn) {
        if (!alive() || typeof fn !== 'function') return;
        hooks.push(fn);
        fn(bi);   // 注册时先按当前句调用一次
      },
      next: function () { if (alive()) nextStep(); },
      jump: function (id) {
        if (!alive()) return;
        for (var i = 0; i < acts.length; i++) if (acts[i].id === id) { go(i, 0, 0); return; }
      },
      replay: function () { if (alive()) replay(); },
      redraw: function () {}
    };
  }

  function enter(b) {
    var st = curStep();
    token++;
    var my = token;
    var last = beatsOf(st).length - 1;
    bi = clamp(b || 0, 0, last);
    playT = beatT = 0;
    // 停在本步的后面几句（从后往前退回来的）说明已经过了作答关
    unlocked = gateBeat(st) < 0 || bi > gateBeat(st);
    won = false;
    items = [];
    pushed = {};
    hooks = [];
    lastCount = -1;
    for (var j = 0; j <= bi; j++) pushBeat(j);
    statusHTML = st.status || '';
    E.answer.innerHTML = '';
    E.answer.onclick = null;
    render();
    if (typeof st.mount === 'function') st.mount(E.answer, makeApi(my));
    render();
    sizeCanvas();
  }

  function go(a, s, b) {
    if (!acts.length) return;
    if (!finished) leave();
    finished = false;
    ai = clamp(a, 0, acts.length - 1);
    si = clamp(s, 0, acts[ai].steps.length - 1);
    enter(b || 0);
  }

  function finish(noLeave) {
    if (!noLeave && !finished) leave();
    token++;
    finished = true;
    won = false;
    unlocked = true;
    items = [];
    hooks = [];
    statusHTML = '';
    E.answer.innerHTML = '';
    E.answer.onclick = null;
    closeToc();
    render();
  }

  // 同一步内前进一句
  function setBeat(b) {
    bi = b;
    for (var j = 0; j <= b; j++) pushBeat(j);
    beatT = 0;
    var st = curStep();
    if (st.playAt === b) playT = 0;   // 讲到这一句才开始播（之前停在碰撞前）
    render();
    showCaption();
    hooks.slice().forEach(function (fn) { fn(bi); });
    render();
  }

  // 下一步（不看作答关）
  function nextStep() {
    if (finished || !acts.length) return;
    if (si < acts[ai].steps.length - 1) go(ai, si + 1, 0);
    else if (ai < acts.length - 1) go(ai + 1, 0, 0);
    else finish(false);
  }

  // 按钮、›、→：先走完本步的句，再进入下一步
  function advance() {
    if (finished || !acts.length) return;
    if (locked()) return;
    var last = beatsOf(curStep()).length - 1;
    if (bi < last) { setBeat(bi + 1); return; }
    nextStep();
  }

  function lastBeatOf(a, s) { return beatsOf(acts[a].steps[s]).length - 1; }

  // ‹、←：先退本步的句，到第 0 句再回上一步（停在它的最后一句）
  function back() {
    if (finished) {
      var last = acts.length - 1, ls = acts[last].steps.length - 1;
      go(last, ls, lastBeatOf(last, ls));
      return;
    }
    if (bi > 0) { setBeat(bi - 1); return; }
    if (si > 0) { go(ai, si - 1, lastBeatOf(ai, si - 1)); return; }
    if (ai > 0) {
      var pa = ai - 1, ps = acts[pa].steps.length - 1;
      go(pa, ps, lastBeatOf(pa, ps));
    }
  }

  function replay() { playT = beatT = 0; }
  function toggleSlow() { rate = rate === 1 ? SLOW : 1; render(); }

  // 手机上讲解在页面最上面：翻到下一句时，如果它已滚出屏幕，滚回去
  function showCaption() {
    var cap = E.log && E.log.parentNode;
    if (!cap || window.innerWidth > 760) return;
    if (cap.getBoundingClientRect().bottom < 40) cap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function restart() {
    Object.keys(GRAV.state).forEach(function (k) { delete GRAV.state[k]; });
    go(0, 0, 0);
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

  // draw(ctx, w, h, t, C, beat, tb)：t 是本步（或重播）开始后的秒数，beat 是当前句序号，tb 是本句开始后的秒数。
  // 两个时间都按播放速度走；系统设置了"减少动画"时直接给一个很大的 t，画面就是最后一帧。
  function frame(ts) {
    requestAnimationFrame(frame);
    var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    playT += dt * rate; beatT += dt * rate;
    if (!drawFn || finished || !ctx || cw < 2 || ch < 2) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    drawFn(ctx, cw, ch, reduceMotion ? 1e4 : playT, palette(), bi, reduceMotion ? 1e4 : beatT);
  }

  // ---------- 事件 ----------
  function bind() {
    E.btnBack.addEventListener('click', back);
    E.btnNext.addEventListener('click', advance);
    E.btnGo.addEventListener('click', advance);
    E.btnRestart.addEventListener('click', restart);
    E.btnClose.addEventListener('click', function () { try { window.close(); } catch (e) { /* 忽略 */ } });
    E.btnToc.addEventListener('click', toggleToc);
    E.btnTheme.addEventListener('click', toggleTheme);
    E.btnReplay.addEventListener('click', replay);
    E.btnSlow.addEventListener('click', toggleSlow);
    E.toc.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.toc-item') : null;
      if (!b) return;
      go(Number(b.getAttribute('data-i')), 0, 0);
      closeToc();
    });
    document.addEventListener('click', function (e) {
      if (E.toc.hidden) return;
      if (E.toc.contains(e.target) || E.btnToc.contains(e.target)) return;
      closeToc();
    });
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') advance();
      else if (e.key === 'ArrowLeft') back();
      else if (e.key === 'Escape') closeToc();
    });
    window.addEventListener('hashchange', function () {
      var t = parseHash();
      if (!t) return;
      if (t.done) { if (!finished) finish(false); return; }
      if (!finished && t.ai === ai && t.si === si) return;
      go(t.ai, t.si, 0);
    });
  }

  // ---------- 启动 ----------
  GRAV.replay = replay;

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
    E.log = document.getElementById('cap-cur');
    E.status = document.getElementById('status');
    E.board = document.getElementById('board');
    E.tag = document.getElementById('tag');
    E.title = document.getElementById('title');
    E.work = document.getElementById('work');
    E.answer = document.getElementById('answer');
    E.btnGo = document.getElementById('btn-go');
    E.btnRestart = document.getElementById('btn-restart');
    E.playbar = document.getElementById('playbar');
    E.btnReplay = document.getElementById('btn-replay');
    E.btnSlow = document.getElementById('btn-slow');
    E.goTip = document.createElement('div');
    E.goTip.className = 'go-tip';
    E.goTip.textContent = '先在右边作答';
    E.goTip.hidden = true;
    E.btnGo.parentNode.appendChild(E.goTip);

    // 讲解记录放在 #cap-cur 里；#cap-prev 不再用
    if (E.log) E.log.className = 'log';
    if (E.capPrev) E.capPrev.hidden = true;

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
      enter(0);
    }
    requestAnimationFrame(frame);
  };
})();
