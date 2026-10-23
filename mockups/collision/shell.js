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

  // ---------- 结论区（题板顶部的一条推理链） ----------
  // 每条：{ id, html, at: [幕号, 第几步, 第几句] 出现；hyp: true 先以猜想（？）出现；
  //        out: [...] 到这里出局；ok: { at: [...], html, title } 到这里成立并改写；mask: 回忆时盖住关键词的写法；
  //        title: 链上显示的短标题（8 字左右，可选，缺省截取正文）；under: 另一条的 id，那一条出现后，这一条收到它下面 }
  // 显示与否只看当前位置，前进、后退、跳转都一致。
  var notes = [];
  GRAV.board = function (list) { notes = list || []; };

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
  // 推荐档写死为唯一模式：tw ask near nb nbk 五个类恒开，不读存储、无切换
  root.classList.add('tw', 'ask', 'near', 'nb', 'nbk');
  GRAV.tw = function () { return root.classList.contains('tw'); };
  function nearOn() { return GRAV.tw() && root.classList.contains('near'); }
  // 方案 B（html.nb，在方案 A 之上）：结论不在板顶排链，收进顶栏的"笔记"；笔记按幕列出结论和做错过的停点，每条能跳回去

  function nbOn() { return GRAV.tw() && root.classList.contains('nb'); }
  // 推荐档（html.nbk，在方案 B 之上）：笔记照常收结论，板顶的结论链也保留；新结论飞向链上那一项，笔记按钮同时亮一下
  function nbkOn() { return nbOn() && root.classList.contains('nbk'); }
  var far = { ai: 0, si: 0, bi: 0 }, mistakes = {};
  function farther(a, b) { return a.ai !== b.ai ? a.ai > b.ai : a.si !== b.si ? a.si > b.si : a.bi > b.bi; }
  function reachedFar(at) {
    if (!at) return false;
    var i = actIdx(at[0]), p = { ai: i, si: at[1] - 1, bi: at[2] || 0 };
    return !farther(p, far);
  }
  // 笔记里的一条：按走到过的最远处算，跳回前面看时笔记不会变少
  function nbItem(n) {
    if (!reachedFar(n.at)) return null;
    var st = n.out && reachedFar(n.out) ? { tag: '出局', html: n.html, at: n.out }
      : n.ok && reachedFar(n.ok.at) ? { tag: '成立', html: n.ok.html, title: n.ok.title, at: n.ok.at }
      : { tag: n.hyp ? '猜想' : '', html: n.html, at: n.at };
    return { n: n, tag: st.tag, title: st.title || n.title || plainText(st.html).slice(0, 12), html: st.html, at: n.at };
  }
  function renderNb() {
    if (!E.nb) return;
    var list = notes.map(nbItem).filter(Boolean);
    E.btnNb.innerHTML = '笔记' + (list.length ? '<span class="nb-n">' + list.length + '</span>' : '');
    if (E.nb.hidden) return;
    var html = '<div class="nb-head"><b>笔记</b><button type="button" class="nb-x" aria-label="收起">×</button></div>';
    var mk = Object.keys(mistakes).map(function (k) { return mistakes[k]; });
    if (mk.length) {
      html += '<section><h3>做错过的停点</h3>' + mk.map(function (m) {
        return '<button type="button" class="nb-go nb-miss" data-ai="' + m.ai + '" data-si="' + m.si + '">' +
          '<span class="nb-where">第 ' + acts[m.ai].id + ' 幕</span>' + m.title + '<span class="nb-arrow">回去看 ›</span></button>';
      }).join('') + '</section>';
    }
    acts.forEach(function (a, i) {
      var mine = list.filter(function (it) { return actIdx(it.at[0]) === i; });
      if (!mine.length) return;
      html += '<section><h3>第 ' + a.id + ' 幕 · ' + a.name + '</h3>' + mine.map(function (it) {
        return '<div class="nb-it">' + (it.tag ? '<span class="note-tag">' + it.tag + '</span>' : '') + '<b>' + it.title + '</b>' +
          '<div class="nb-body">' + it.html + '</div>' +
          '<button type="button" class="nb-go" data-ai="' + actIdx(it.at[0]) + '" data-si="' + (it.at[1] - 1) + '">回到得出它的那一步 ›</button></div>';
      }).join('') + '</section>';
    });
    if (!list.length) html += '<p class="nb-empty">得出的结论会记在这里。</p>';
    E.nb.innerHTML = html;
  }
  function openNb() { E.nb.hidden = false; E.btnNb.setAttribute('aria-expanded', 'true'); renderNb(); }
  function closeNb() { if (!E.nb) return; E.nb.hidden = true; E.btnNb.setAttribute('aria-expanded', 'false'); }
  function askOn() {
    if (!GRAV.tw() || !root.classList.contains('ask')) return false;
    return !root.classList.contains('near') || window.innerWidth <= 760;
  }
  // 停点那句讲述里的问句（最后一个带问号的句子），板上复述用
  function askLine(st) {
    var g = gateBeat(st);
    if (g < 0) return '';
    var d = document.createElement('div');
    d.innerHTML = beatText(beatsOf(st)[g]);
    // 取最后一个问句，连同紧挨在它前面的问句（"变成了多少？少了多少？"）
    var parts = d.textContent.split(/(?<=[。！？])/), q = /？\s*$/, i = parts.length - 1;
    while (i >= 0 && !q.test(parts[i])) i--;
    if (i < 0) return '';
    var j = i;
    while (j > 0 && q.test(parts[j - 1])) j--;
    return parts.slice(j, i + 1).join('').trim();
  }
  function addEcho(st, ans) {
    ans = ans || E.answer;   // 预演时传入页面外的作答区
    if (ans.querySelector('.stem') || ans.querySelector('.q-echo') || ans.getAttribute('data-stem')) return;
    var q = askLine(st);
    if (!q) return;
    var host = ans === E.answer && E.act && E.act.querySelector('.opts') ? E.act : ans;
    var first = host.querySelector('.opts');
    if (!first) return;
    while (first.parentNode !== host) first = first.parentNode;
    var e = document.createElement('p');
    e.className = 'q-echo';
    e.textContent = q;
    host.insertBefore(e, first);
  }
  // 方案 A，手机：到停点时把这一问要看的东西（板上题干，没有就是画面）滚到屏幕顶上，
  // 和贴底的选项同屏；已经整块露出来就不动。每个停点只滚一次。
  var fitted = -1, mounting = false;
  function fitStop() {
    if (mounting || !locked() || fitted === token) return;
    if (window.innerWidth > 760) { fitted = token; return; }   // 电脑：版面按一屏排好，页面不滚
    // 要和选项同屏的证据：板上题干 > 画面 > 演算的最后几行
    var lines = E.answer.querySelectorAll('.wk');
    var t = E.answer.querySelector('.stem') || (E.work.classList.contains('single') ? lines[lines.length - 1] : document.getElementById('scene'));
    if (!t) return;
    fitted = token;
    requestAnimationFrame(function () {
      var r = t.getBoundingClientRect();
      // 手机上底部那一条（选项或"下一句"）一直贴底，证据要停在它上面
      var bar = E.btnGo.parentNode.getBoundingClientRect().top;
      var opts = E.answer.querySelector('.opts');
      var bottom = t.classList.contains('stem') && opts ? opts.getBoundingClientRect().bottom : r.bottom;
      if (r.top >= 0 && bottom <= bar) return;
      // 先让下沿贴到选项条上面；画面、题干比剩下的空间还高，就让上沿贴顶（演算看最新几行，总是贴下沿）
      var dy = t.classList.contains('wk') ? bottom - bar + 8 : Math.min(bottom - bar + 8, r.top - 8);
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, window.scrollY + dy), behavior: reduce ? 'auto' : 'smooth' });
    });
  }
  function syncEchoIn(h) {
    if (!h) return;
    var e = h.querySelector('.q-echo');
    if (!e) return;
    var vis = Array.prototype.some.call(h.querySelectorAll('.opt'), function (o) { return o.offsetParent !== null || h === E.act; });
    var sib = e.nextElementSibling;
    var nv = !sib || sib.hidden || !vis;
    if (e.hidden !== nv) e.hidden = nv;
  }
  function syncEcho() {
    syncEchoIn(E.answer);
    syncEchoIn(E.act);
  }

  // 预演前后存还原 GRAV.state：存引用，普通对象/数组另存一份内容克隆（失败就只存引用）。
  // 还原时对象要原地恢复、保持身份：挂载时可能已经拿着 GRAV.state.quiz 这类对象的引用，浅拷贝恢复不回来被改过的内容。
  function snapState() {
    var snap = {};
    Object.keys(GRAV.state).forEach(function (k) {
      var v = GRAV.state[k], e = { ref: v, hasCopy: false, copy: null };
      if (v && typeof v === 'object' && (Array.isArray(v) || Object.getPrototypeOf(v) === Object.prototype)) {
        try { e.copy = structuredClone(v); e.hasCopy = true; } catch (err) { e.hasCopy = false; }
      }
      snap[k] = e;
    });
    return snap;
  }
  function restoreState(snap) {
    Object.keys(GRAV.state).forEach(function (k) { if (!(k in snap)) delete GRAV.state[k]; });
    Object.keys(snap).forEach(function (k) {
      var e = snap[k], ref = e.ref;
      if (e.hasCopy && ref && typeof ref === 'object') {
        if (Array.isArray(ref)) {
          ref.length = 0;
          for (var i = 0; i < e.copy.length; i++) ref[i] = e.copy[i];
        } else {
          Object.keys(ref).forEach(function (p) { delete ref[p]; });
          Object.keys(e.copy).forEach(function (p) { ref[p] = e.copy[p]; });
        }
      }
      GRAV.state[k] = ref;
    });
  }

  // ---------- 整板推导（电脑，html.tw.near）：这一步里版面一点都不动 ----------
  // 演算每拍多几行、右栏到停点才出选项、答对后才出表，所以进入这一步时先"预演"：
  // 在页面外的隐藏容器里用同样的样式把这一步挂载一遍，每一拍都走完（含选项、答对后的表），
  // 量出演算最终的宽高和右栏最高时的高度，据此一次定下字号、整组的宽度、作答区的预留高度和整组的上下偏移。
  // 预演用的是空壳 api：不放声音、不记讲解、不碰 far/mistakes/笔记/进度；GRAV.state 挂载前后还原。
  var fplan = null;
  var F_GAP = 40, F_RC = 340, F_RCMIN = 260, F_FMIN = 16, F_FFLOOR = 12;
  var F_VARS = ['--f-fs', '--f-wk', '--f-rc', '--f-W', '--f-h', '--f-wkoff', '--f-off'];
  function fDesktop() { return nearOn() && window.innerWidth > 760; }
  // 在隐藏容器里按字号 F、右栏宽 RC 挂载并走完所有拍；不是整板推导（没有 .wk）返回 null
  function probeF(st, F, RC) {
    var box = document.createElement('div');
    box.className = 'fx fprobe';
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:fixed;left:-99999px;top:0;width:3000px;visibility:hidden;pointer-events:none;';
    box.style.setProperty('--f-fs', F + 'px');
    box.style.setProperty('--f-rc', RC + 'px');
    box.style.setProperty('--f-wk', 'max-content');
    var work = document.createElement('div');
    work.className = 'work single';
    var ans = document.createElement('div');
    ans.className = 'answer';
    work.appendChild(ans);
    box.appendChild(work);
    document.body.appendChild(box);
    var snap = snapState();
    var res = null;
    try {
      var hk = [];
      var noop = function () {};
      st.mount(ans, {
        open: noop, win: noop, say: noop, me: noop, status: noop, next: noop, jump: noop, replay: noop, boardMask: noop, redraw: noop,
        onBeat: function (fn) { if (typeof fn === 'function') { hk.push(fn); fn(0); } }
      });
      var wk = ans.querySelector('.wk');
      if (wk) {
        addEcho(st, ans);
        var w = 0, h = 0, r = 0, last = beatsOf(st).length - 1;
        for (var b = 0; b <= last; b++) {
          hk.forEach(function (fn) { fn(b); });
          syncEchoIn(ans);
          var wr = wk.getBoundingClientRect();
          w = Math.max(w, wr.width); h = Math.max(h, wr.height);
          var sum = 0;
          Array.prototype.forEach.call(ans.children, function (c) {
            if (c === wk || !c.getClientRects().length) return;
            var cs = getComputedStyle(c);
            sum += c.getBoundingClientRect().height + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
          });
          r = Math.max(r, sum);
        }
        res = { w: Math.ceil(w), h: h, r: r };
      }
    } catch (e) {
      res = null;
    }
    box.remove();
    restoreState(snap);
    return res;
  }
  function planF(st) {
    if (!st || !fDesktop() || newLayout()) return null;
    if ((st.layout || 'split') === 'split' && typeof st.draw === 'function') return null;
    if (typeof st.mount !== 'function') return null;
    var bcs = getComputedStyle(E.board);
    var avail = E.board.clientWidth - parseFloat(bcs.paddingLeft) - parseFloat(bcs.paddingRight);
    var F0 = clamp(window.innerWidth * 0.0208, 20, 30), rc = F_RC, F = F0;
    var m = probeF(st, F, rc);
    if (!m) return null;
    function fits(mm, r) { return mm.w + F_GAP + r <= avail; }
    if (!fits(m, rc)) {
      // 演算宽度大致随字号线性变：量两个字号，解出放得下的字号
      var half = probeF(st, F0 / 2, rc);
      if (!half) return null;
      var k = (m.w - half.w) / (F0 / 2), a = m.w - k * F0;
      var need = function (r) { return (avail - F_GAP - r - a) / k; };
      F = need(rc);
      if (F < F_FMIN) {
        // 字号已缩到下限还放不下（窄屏）：右栏在 260–340 之间让出宽度，再不够就继续缩字号
        rc = clamp(avail - F_GAP - (a + k * F_FMIN), F_RCMIN, F_RC);
        F = Math.max(F_FFLOOR, Math.min(F_FMIN, need(rc)));
      }
      F = Math.floor(Math.min(F0, F) * 10) / 10;
      m = probeF(st, F, rc);
      for (var i = 0; m && !fits(m, rc) && F > F_FFLOOR && i < 8; i++) {
        F = Math.max(F_FFLOOR, Math.floor((F - Math.max(0.3, (m.w + F_GAP + rc - avail) / k)) * 10) / 10);
        m = probeF(st, F, rc);
      }
      if (!m || !fits(m, rc)) return null;
    }
    var H = Math.ceil(Math.max(m.h, m.r));
    return { F: F, rc: rc, wk: m.w, W: m.w + F_GAP + rc, H: H, wkOff: (H - m.h) / 2, avail: avail };
  }
  function setFVars() {
    var s = E.board.style;
    if (!fplan) { F_VARS.forEach(function (v) { s.removeProperty(v); }); return; }
    s.setProperty('--f-fs', fplan.F + 'px');
    s.setProperty('--f-wk', fplan.wk + 'px');
    s.setProperty('--f-rc', fplan.rc + 'px');
    s.setProperty('--f-W', fplan.W + 'px');
    s.setProperty('--f-h', fplan.H + 'px');
    s.setProperty('--f-wkoff', fplan.wkOff + 'px');
    s.setProperty('--f-off', '0px');
  }
  // 整组（幕名、标题、作答区）在"结论链底边"和"题板内容区底边"之间上下居中；
  // 作答区高度已按最终高度预留，所以第 0 拍就能量准
  function settleF() {
    if (!fplan || finished || !E.board.classList.contains('fx')) return;
    E.board.style.setProperty('--f-off', '0px');
    var cs = getComputedStyle(E.board), br = E.board.getBoundingClientRect();
    var top = br.top + parseFloat(cs.paddingTop), bottom = br.bottom - parseFloat(cs.paddingBottom);
    var chainOn = E.chain && !E.chain.hidden && getComputedStyle(E.chain).display !== 'none';
    var Ct = chainOn ? E.chain.getBoundingClientRect().bottom : top;
    var Gt = E.tag.getBoundingClientRect().top, Gb = E.work.getBoundingClientRect().bottom;
    var off = Math.max(0, ((bottom - Ct) - (Gb - Gt)) / 2 - (Gt - Ct));
    E.board.style.setProperty('--f-off', off + 'px');
  }
  // 窗口尺寸变了、字体加载完了：重新预演，重新算
  function replanF() {
    if (!E.board || finished) return;
    var st = curStep();
    fplan = planF(st);
    setFVars();
    E.board.classList.toggle('fx', !!fplan);
    settleF();
  }
  var replanT = 0;
  function scheduleReplan() {
    clearTimeout(replanT);
    replanT = setTimeout(function () {
      if (finished) return;
      if (newLayout()) planLive(curStep());
      else if (fplan || fDesktop()) replanF();
    }, 120);
  }
  // ---------- 电脑版面（规格第 2 节）：主区按这一步最满的那一拍排好，整步不跳 ----------
  // 进入一步时，在页面外的隐藏容器里用同样的样式把这一步挂载一遍、每一拍都走完，量出左列（题干、演算块）和右列（问句、选项、表格）
  // 各自最高时的高度；据此一次定下两列宽、整组高度、画布高度和缩放系数 --k，逐拍不动。
  // 左列放证据（画面、题干卡、演算），右列放作答；右列的竖直中线对齐左列；整组在主区里上下左右居中。
  function newLayout() { return nearOn() && window.innerWidth > 760; }
  var movedBind = [], movedObs = [], CMIN = 200, CMAX = 640, PBH = 40, KMIN = 0.8;
  function visChain(el, root) { for (var p = el; p && p !== root; p = p.parentNode) if (p.hidden) return false; return true; }
  function syncMoved(list) {
    (list || movedBind).forEach(function (m) { var nv = !m.anc.every(function (a) { return !a.hidden; }); if (m.el.hidden !== nv) m.el.hidden = nv; });
  }
  // G7 问句归位：题干末尾的问句留在题干卡里，最后一句包进 <b class="stem-q">（600 字重）
  function boldStemQ(c) {
    if (c.children.length) return;
    var parts = c.textContent.split(/(?<=[。！？])/).filter(function (x) { return x.trim(); });
    var q = /？\s*$/, i = parts.length - 1, j = i;
    if (i < 1 || !q.test(parts[i])) return;
    while (j > 1 && q.test(parts[j - 1])) j--;
    var head = parts.slice(0, j).join('').trim(), tail = parts.slice(j).join('').trim();
    c.textContent = head;
    var b = document.createElement('b');
    b.className = 'stem-q';
    b.textContent = tail;
    c.appendChild(b);
  }
  function boldStems(ans) {
    Array.prototype.forEach.call(ans.querySelectorAll('.stem'), boldStemQ);
  }
  // G3 版式判定（按顺序）：result / grid / fill / example / quiz / lab / derive / def / pic；st.frame 可覆盖
  var KINDS = ['result', 'grid', 'fill', 'example', 'quiz', 'lab', 'derive', 'def', 'pic'];
  var curKind = 'pic', TGAP = 24;   // TGAP：example 里题干卡和画面之间的间距（s5）
  function detectKind(ans, st, hasCanvas) {
    if (st && st.frame && KINDS.indexOf(st.frame) >= 0) return st.frame;
    var q = function (sel) { return !!ans.querySelector(sel); };
    if (q('.score')) return 'result';
    if (q('.hw')) return 'grid';
    if (q('.fill')) return 'fill';
    if (q('.stem')) return hasCanvas ? 'example' : 'quiz';
    if (hasCanvas && (q('.run') || q('table.dt'))) return 'lab';
    if (!hasCanvas && q('.bks')) return 'derive';
    if (hasCanvas && q('.def') && !q('.opt')) return 'def';
    return 'pic';
  }
  // 正文字号 B 的实际像素（k = 1，即 --B0 解出来的 px）
  function bpx() {
    var sp = document.createElement('span');
    sp.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:0;font-size:var(--B0);';
    sp.textContent = 'B';
    E.stage.appendChild(sp);
    var v = parseFloat(getComputedStyle(sp).fontSize) || 16;
    sp.remove();
    return v;
  }
  // 栏宽按版式取 B 的倍数：右栏 21B（pic/example/fill/derive/quiz），26B（lab），24B（def）；quiz 左 28B；其余左栏 = 内容宽 − 右栏 − 栏距
  function kindWidths(kind, W, B, cg) {
    var rcM = { lab: 26, def: 24 }[kind] || 21;
    var rc = Math.round(rcM * B), lw;
    if (kind === 'quiz') { lw = Math.round(28 * B); if (lw + cg + rc > W) lw = W - cg - rc; }
    else lw = W - rc - cg;
    return { lw: Math.max(200, Math.floor(lw)), rc: rc };
  }
  function soloWidth(kind, W, B) {
    if (kind === 'result') return Math.min(Math.round(32 * B), W);
    if (kind === 'grid') return Math.min(960, W);
    return Math.min(720, W);
  }
  // 把作答区里属于左列的东西搬进 lcol（example 里题干卡在左栏顶部、画面上方）；返回需要跟着祖先显隐的嵌套题干
  function arrange(ans, lcol, hasCanvas, kind) {
    var binds = [], late = [];
    var stemTo = lcol;
    Array.prototype.slice.call(ans.children).forEach(function (c) {
      var hasOpts = c.matches('.opts') || !!c.querySelector('.opts');
      if (c.classList.contains('stem')) { stemTo.appendChild(c); ans.setAttribute('data-stem', '1'); }
      else if (c.classList.contains('ex-sec') && !hasOpts && c.querySelector('.stem')) { stemTo.appendChild(c); ans.setAttribute('data-stem', '1'); }
      else if (kind === 'fill' && !hasOpts && (c.classList.contains('fill') || c.querySelector('.fill'))) lcol.appendChild(c);
      else if (!hasCanvas && !hasOpts && c.matches('.bks, .wk')) lcol.appendChild(c);
      else if (!hasCanvas && !hasOpts && c.matches('.def')) late.push(c);
    });
    Array.prototype.slice.call(ans.querySelectorAll('.stem')).forEach(function (st) {
      var anc = [];
      for (var p = st.parentNode; p && p !== ans; p = p.parentNode) anc.push(p);
      stemTo.appendChild(st);
      binds.push({ el: st, anc: anc });
      ans.setAttribute('data-stem', '1');
    });
    if (kind === 'fill' && !lcol.children.length) {
      Array.prototype.slice.call(ans.querySelectorAll('.fill')).forEach(function (f) { if (!f.querySelector('.opts')) lcol.appendChild(f); });
    }
    late.forEach(function (c) { lcol.appendChild(c); });
    syncMoved(binds);
    return binds;
  }
  function arrangeLive(st) {
    movedObs.forEach(function (o) { o.disconnect(); });
    movedObs = [];
    movedBind = arrange(E.answer, E.lcol, !E.work.classList.contains('single'), curKind);
    var seen = [];
    movedBind.forEach(function (m) {
      m.anc.forEach(function (a) {
        if (seen.indexOf(a) >= 0) return;
        seen.push(a);
        var ob = new MutationObserver(function () { syncMoved(); });
        ob.observe(a, { attributes: true, attributeFilter: ['hidden'] });
        movedObs.push(ob);
      });
    });
  }
  // 答完后问句和选项留在板上：作答区里直接子级的"选项块"一旦出现过，到了它出现的那一拍之后，就算课件代码又把它藏起来，也保持显示
  // （原版逻辑：6-0 的 act6.js 里 q.hidden = bt > 0，第 1 拍用总结替换题目；4-0 的 act4.js 里 box.hidden = bt !== 3，第 4 拍用表格替换选项）
  var keepMap = new Map();
  function keepShown(ans, map, beat) {
    Array.prototype.forEach.call(ans.children, function (c) {
      if (!(c.matches('.opts') || c.querySelector('.opts'))) return;
      if (c.getAttribute('data-keep') === '0' || c.querySelector('[data-keep="0"]')) return;   // 容器带 data-keep="0"：不强制保留
      if (!c.hidden) { if (!map.has(c)) map.set(c, beat); }
      else if (map.has(c) && beat >= map.get(c)) c.hidden = false;
    });
  }
  // 右列表格：数值 B；放不下才退到全表 S
  function fitTables(root) {
    Array.prototype.forEach.call(root.querySelectorAll('table.dt'), function (t) {
      if (!t.parentNode || !t.parentNode.clientWidth) return;
      t.classList.remove('dt-s');
      if (t.offsetWidth > t.parentNode.clientWidth + 0.5) t.classList.add('dt-s');
    });
  }
  // 预演：在页面外按版式的栏宽挂载（左列 lw、右列 rc、缩放 k），走完所有拍，返回各块最大高度；不是一步（没有 mount）返回 null
  // L = 左列文字块（不含画面；example 里是题干卡），R = 右列
  function probeL(st, hasCanvas, kind, W, wd, sg, soloW) {
    var box = document.createElement('div');
    box.className = 'work fprobe' + (sg.dn ? ' dense' : '') + (sg.dn > 1 ? ' dense2' : '');
    box.setAttribute('data-layout', kind);
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;display:flex;align-items:flex-start;gap:0;margin:0;';
    box.style.setProperty('--k', String(sg.k));
    box.style.setProperty('--ke', String(sg.ke));
    var sc = document.createElement('div'), lc = document.createElement('div'), ans = document.createElement('div');
    sc.className = 'scene-col'; lc.className = 'lcol'; ans.className = 'answer';
    sc.appendChild(lc); box.appendChild(sc); box.appendChild(ans);
    sc.style.cssText = 'flex:none;width:' + wd.lw + 'px;';
    ans.style.cssText = 'flex:none;width:' + wd.rc + 'px;';
    document.body.appendChild(box);
    var snap = snapState();
    var res = null;
    try {
      var hk = [], noop = function () {};
      st.mount(ans, {
        open: noop, win: noop, say: noop, me: noop, status: noop, next: noop, jump: noop, replay: noop, boardMask: noop, redraw: noop,
        onBeat: function (fn) { if (typeof fn === 'function') { hk.push(fn); fn(0); } }
      });
      boldStems(ans);
      var binds = arrange(ans, lc, hasCanvas, kind);
      addEcho(st, ans);
      var solo = !hasCanvas && !lc.children.length;
      if (solo) { box.classList.add('solo'); sc.style.display = 'none'; ans.style.width = soloW + 'px'; }
      var L = 0, R = 0, last = beatsOf(st).length - 1;
      var keep = new Map();
      var measure = function () {
        syncMoved(binds); syncEchoIn(ans); fitTables(ans);
        L = Math.max(L, solo ? 0 : lc.offsetHeight); R = Math.max(R, ans.offsetHeight);
      };
      var seen = [];
      for (var b = 0; b <= last; b++) {
        hk.forEach(function (fn) { fn(b); }); keepShown(ans, keep, b); measure();
        Array.prototype.forEach.call(ans.querySelectorAll('.opts'), function (o) { if (visChain(o, ans) && seen.indexOf(o) < 0) seen.push(o); });
      }
      // 答对才出现的东西（例如第二问、答完收成一行的选项）：每一拍都把「答对」走一遍再量，选项组收起、下一组出现的真实高度才量得准
      var done = [];
      for (var b3 = 0; b3 <= last; b3++) {
        hk.forEach(function (fn) { fn(b3); }); keepShown(ans, keep, b3);
        for (var rep3 = 0; rep3 < 8; rep3++) {
          var ok = Array.prototype.filter.call(ans.querySelectorAll('.opt[data-ok="1"]'), function (o) { return !o.disabled && visChain(o, ans) && done.indexOf(o) < 0; })[0];
          if (!ok) break;
          done.push(ok); ok.click(); keepShown(ans, keep, b3); measure();
          Array.prototype.forEach.call(ans.querySelectorAll('.opts'), function (o) { if (visChain(o, ans) && seen.indexOf(o) < 0) seen.push(o); });
        }
        measure();
      }
      // 答完才出现的选项（例如第二问）：每一拍都把它们摊开再量一遍
      var late = Array.prototype.filter.call(ans.querySelectorAll('.opts'), function (o) { return seen.indexOf(o) < 0; });
      if (late.length) {
        var keep2 = new Map();
        for (var b2 = 0; b2 <= last; b2++) {
          hk.forEach(function (fn) { fn(b2); }); keepShown(ans, keep2, b2);
          late.forEach(function (o) { for (var p = o; p && p !== ans; p = p.parentNode) p.hidden = false; });
          measure();
        }
      }
      // 答对的选项字重加粗，折行可能变多：全部加粗量一次
      var ops = ans.querySelectorAll('.opt');
      Array.prototype.forEach.call(ops, function (o) { o.classList.add('win'); });
      measure();
      Array.prototype.forEach.call(ops, function (o) { o.classList.remove('win'); });
      // 实验步：表格要做满三次才到最高，补三行占位量一下
      if (ans.querySelector('.run')) {
        Array.prototype.forEach.call(ans.querySelectorAll('table.dt'), function (t) {
          var lr = t.rows[t.rows.length - 1];
          for (var i = 0; i < 3 && lr; i++) {
            var nr = lr.cloneNode(true), cs = nr.cells;
            if (cs.length >= 3) { cs[0].textContent = '粘扣（粘住）'; for (var j = 1; j < cs.length - 1; j++) cs[j].textContent = '0.238'; cs[cs.length - 1].textContent = '少了 35%'; }
            t.appendChild(nr);
          }
        });
        measure();
      }
      res = { L: Math.ceil(L), R: Math.ceil(R), solo: solo, hw: !!ans.querySelector('.hw') };
    } catch (e) {
      res = null;
    }
    box.remove();
    restoreState(snap);
    return res;
  }
  var L_VARS = ['--lw', '--rc', '--cg', '--gh', '--rh', '--ch', '--ltop', '--rtop', '--gtop'];
  // 两栏的竖向几何：有画面时，右栏中心对齐左栏的中心（题干卡顶到画面底，不含播放条；没有题干卡就是画面本身）；没有画面时两栏各自居中（fill 例外：顶对齐）
  function rowGeom(ch, L, R, gap) {
    var span = L + gap + ch, stack = span + PBH;
    var cy = Math.max(span / 2, R / 2), lt = cy - span / 2, rt = cy - R / 2;
    return { lt: lt, rt: rt, rowH: Math.max(lt + stack, rt + R) };
  }
  function planLayout(st) {
    if (!st || typeof st.mount !== 'function') return null;
    var W = E.work.clientWidth, H = E.work.clientHeight, vw = window.innerWidth;
    var hasCanvas = !E.work.classList.contains('single');
    var kind = curKind, B0 = bpx(), cg = vw >= 1280 ? 64 : 40, m = null, sg = null, wd = null, B = B0;
    var STAGES = [{ ke: 1, dn: 0, k: 1 }, { ke: 0.9, dn: 0, k: 1 }, { ke: 0.8, dn: 0, k: 1 }, { ke: 0.8, dn: 1, k: 1 }, { ke: 0.8, dn: 2, k: 1 },
      { ke: 0.8, dn: 2, k: 0.93 }, { ke: 0.8, dn: 2, k: 0.86 }, { ke: 0.8, dn: 2, k: 0.8 }];
    for (var it = 0; it < STAGES.length; it++) {
      sg = STAGES[it];
      B = B0 * sg.k;
      wd = kindWidths(kind, W, B, cg);
      m = probeL(st, hasCanvas, kind, W, wd, sg, soloWidth(kind, W, B));
      if (!m) return null;
      var need = m.solo ? m.R : hasCanvas ? Math.max(m.L ? m.L + TGAP + CMIN + PBH : CMIN + PBH, m.R) : Math.max(m.L, m.R);
      if (need <= H + 0.5) break;
    }
    var p = { kind: kind, k: sg.k, ke: sg.ke, dn: sg.dn, solo: m.solo, cg: cg, rc: m.solo ? soloWidth(kind, W, B) : wd.rc, lw: m.solo ? 0 : wd.lw, rh: m.R };
    var av = H, rowH;
    if (m.solo) { rowH = m.R; p.ch = 0; p.ltop = 0; p.rtop = 0; }
    else if (hasCanvas) {
      var gap = m.L ? TGAP : 0, g;
      p.ch = Math.floor(clamp(av - m.L - gap - PBH, CMIN, CMAX));
      g = rowGeom(p.ch, m.L, m.R, gap);
      while (g.rowH > av + 0.5 && p.ch > CMIN) { p.ch -= 4; g = rowGeom(p.ch, m.L, m.R, gap); }
      rowH = g.rowH; p.ltop = g.lt; p.rtop = g.rt;
    } else if (kind === 'fill') {
      // fill：两栏顶对齐（右栏第一组的 q-echo 顶和结论卡顶齐平）
      rowH = Math.max(m.L, m.R); p.ch = 0; p.ltop = 0; p.rtop = 0;
    } else {
      rowH = Math.max(m.L, m.R); p.ch = 0; p.ltop = (rowH - m.L) / 2; p.rtop = (rowH - m.R) / 2;
    }
    p.gh = rowH;
    // G1：整组顶 = clamp(0, 0.42·H − gh/2, H − gh)
    var tot = rowH;
    p.gtop = Math.max(0, Math.min(0.42 * H - tot / 2, H - tot));
    return p;
  }
  function setLayoutVars(p) {
    var bs = E.board.style;
    if (!p) { L_VARS.forEach(function (v) { bs.removeProperty(v); }); E.stage.style.removeProperty('--k'); E.stage.style.removeProperty('--ke'); E.work.classList.remove('solo', 'dense', 'dense2'); return; }
    bs.setProperty('--lw', p.lw + 'px'); bs.setProperty('--rc', p.rc + 'px'); bs.setProperty('--cg', p.cg + 'px');
    bs.setProperty('--gh', p.gh + 'px'); bs.setProperty('--rh', p.rh + 'px'); bs.setProperty('--ch', p.ch + 'px');
    bs.setProperty('--ltop', p.ltop + 'px'); bs.setProperty('--rtop', p.rtop + 'px');
    bs.setProperty('--gtop', p.gtop + 'px');
    E.stage.style.setProperty('--ke', String(p.ke)); E.stage.style.setProperty('--k', String(p.k));
    E.work.classList.toggle('solo', !!p.solo);
    E.work.classList.toggle('dense', !!p.dn);
    E.work.classList.toggle('dense2', p.dn > 1);
  }
  function planLive(st) {
    lplan = planLayout(st);
    setLayoutVars(lplan);
    sizeCanvas();
  }
  var lplan = null;

  // 动作条：电脑上"下一句/继续"主按钮放板底居中，停点上旁边放"提示"（代理按钮，点它就是点选择题里那个提示），未答时上方写"先选一项"
  function activeHint() {
    var hs = Array.prototype.slice.call(E.answer.querySelectorAll('.hint-btn'));
    for (var i = 0; i < hs.length; i++) if (visChain(hs[i], E.answer)) return hs[i];
    return null;
  }
  function syncBar() {
    if (!E.barTip) return;
    var lk = !finished && locked();
    E.barTip.hidden = true;   // G5：不再显示「先选一项」
    E.barHint.hidden = !(lk && activeHint());
  }
  // ---------- G6 先选后提交（外壳层，捕获阶段拦截；对停点里所有 .opt 生效） ----------
  // 停点上点选项只是选中（.sel）；按「提交」（或回车）时，让被选中的按钮收到一次真正的 click，原逻辑照走。
  var selOpt = null, submitting = false;
  function optIn(el) { return !!el && (E.answer.contains(el) || (E.act && E.act.contains(el))); }
  function validSel() {
    if (selOpt && !(selOpt.isConnected && !selOpt.disabled && !finished && locked() && optIn(selOpt))) { selOpt.classList.remove('sel'); selOpt = null; }
    return selOpt;
  }
  function syncGo() {
    if (!E.btnGo) return;
    var lk = !finished && locked();
    // 「提交」只在停点有可选的 .opt 时出现；没有 .opt 的门（例如实验要做满三次）写「继续」并禁用
    var hasOpt = lk && Array.prototype.some.call(document.querySelectorAll('#answer .opt, .act-slot .opt'), function (o) { return !o.disabled && o.offsetParent !== null; });
    E.btnGo.textContent = lk && hasOpt ? '提交' : '继续';
    E.btnGo.disabled = lk && (!hasOpt || !validSel());
  }
  function selectOpt(o) {
    if (selOpt && selOpt !== o) selOpt.classList.remove('sel');
    selOpt = o; o.classList.add('sel');
    syncGo();
  }
  function submitSel() {
    var o = validSel();
    if (!o) return;
    o.classList.remove('sel'); selOpt = null;
    submitting = true;
    try { o.click(); } finally { submitting = false; }
    syncGo();
  }
  function onGo() { if (!finished && locked()) submitSel(); else advance(); }
  function placeGo() {
    if (!E.btnGo || !E.barIn) return;
    if (newLayout()) { if (E.btnGo.parentNode !== E.barIn) E.barIn.insertBefore(E.btnGo, E.barHint); }
    else if (E.btnGo.parentNode !== E.foot) E.foot.insertBefore(E.btnGo, E.goTip);
  }
  // 结论链放不下时，只留最新几项，前面折成"…+n"
  function fitChain() {
    var row = E.chain && E.chain.querySelector('.ch-row');
    if (!row || row.scrollWidth <= row.clientWidth + 1) return;
    var chips = row.querySelectorAll('.ch');
    if (chips.length < 2) return;
    var more = document.createElement('span');
    more.className = 'ch-more';
    row.insertBefore(more, chips[0]);
    for (var i = 0; i < chips.length - 1; i++) {
      chips[i].classList.add('chain-hide');
      var nx = chips[i].nextElementSibling;
      if (nx && nx.classList.contains('ch-arrow')) nx.classList.add('chain-hide');
      more.textContent = '…+' + (i + 1);
      if (row.scrollWidth <= row.clientWidth + 1) break;
    }
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
      ctx.font = fontFor(o.font, Math.max(13, o.size || 14));
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
      GRAV.draw.text(ctx, str, 14, h - 6, { font: 'ui', size: 13, color: C.graphite });
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
        font: 'ui', size: 13, color: opt.ink ? C.ink : C.graphite, align: opt.align || 'left'
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
        if (o.correct) b.setAttribute('data-ok', '1');   // 预排时探针按「答对」走一遍用
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
          btns.forEach(function (x) { x.disabled = true; });
          hintBtn.hidden = true;
          sayIf(o.say);
          api.win(true);
          api.open();
          if (typeof opts.onCorrect === 'function') opts.onCorrect();
          return;
        }
        wrongs++;
        GRAV.miss && GRAV.miss();
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
    },

    // 分块演算（规格 3.11）：每块一张卡，有小标题；result 是结论框（bezel 底 + 左侧 3px ink 竖线）。
    // lines 的每项是一行式子的 html，或 [html, 旁注]；note 是块底的一句 S 说明（可选）。
    blocks: function (el) {
      var box = document.createElement('div');
      box.className = 'bks';
      el.appendChild(box);
      function card(cls, title, lines, note) {
        var d = document.createElement('div');
        d.className = 'bk' + (cls ? ' ' + cls : '');
        var h = title ? '<div class="bk-t">' + title + '</div>' : '';
        (lines || []).forEach(function (l) {
          var eq = Array.isArray(l) ? l[0] : l, nt = Array.isArray(l) ? l[1] : '';
          h += '<div class="bk-l"><span class="bk-eq">' + eq + '</span>' + (nt ? '<span class="bk-note">' + nt + '</span>' : '') + '</div>';
        });
        if (note) h += '<div class="bk-s">' + note + '</div>';
        d.innerHTML = h;
        box.appendChild(d);
        return d;
      }
      return {
        block: function (title, lines, note) { return card('', title, lines, note); },
        result: function (title, lines, note) { return card('res', title, lines, note); }
      };
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
  // 进度条：每幕一段，可以点，点了跳到那一幕的开头
  function renderProgress() {
    var html = '';
    acts.forEach(function (a, i) {
      var cls = 'seg', fill = '';
      if (finished || i < ai) {
        cls += ' done';
      } else if (i === ai) {
        var total = 0, before = 0;
        a.steps.forEach(function (s, j) {
          var c = beatsOf(s).length;
          total += c;
          if (j < si) before += c;
        });
        var pct = clamp((before + bi + 1) / total * 100, 0, 100).toFixed(1);
        cls += ' cur';
        fill = '<span class="fill" style="width:' + pct + '%"></span>';
      }
      var name = '第 ' + a.id + ' 幕 · ' + a.name;
      html += '<button type="button" class="' + cls + '" data-i="' + i + '" title="' + name + '" aria-label="跳到' + name + '"' +
        (!finished && i === ai ? ' aria-current="step"' : '') + '><span class="bar">' + fill + '</span></button>';
    });
    // 方案 A，手机：每幕一段只有 9px 宽，点不准；整条进度条改成一个按钮，点开目录再跳
    if (nearOn() && window.innerWidth <= 760) {
      html = html.replace(/<button type="button" class="([^"]*)"[^>]*>/g, '<span class="$1">').replace(/<\/button>/g, '</span>');
      html = '<button type="button" class="prog-btn" aria-label="目录：跳到某一幕">' + html + '</button>';
    }
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
  // 讲述栏（规格 3.2）：当前句 B ink；同一步里只显示上一句的最后一句（S graphite，单行截断），点它展开整步记录；我的回答只留最近一条
  var logOpen = false;
  function lastSentence(html) {
    var t = plainText(html).replace(/\s+/g, ' ').trim();
    var parts = t.split(/(?<=[。！？；])/).filter(function (x) { return x.trim(); });
    return parts.length ? parts[parts.length - 1].trim() : t;
  }
  function renderLog() {
    if (!E.log) return;
    var vis = visibleItems(), lastSay = -1, prevSay = -1, lastMe = -1;
    vis.forEach(function (it, i) { if (it.type === 'say') { prevSay = lastSay; lastSay = i; } if (it.type === 'me') lastMe = i; });
    var html = '';
    if (finished) {
      html = '<div class="item say cur">' + vis[0].html + '</div>';
    } else if (logOpen && prevSay >= 0) {
      html += '<button type="button" class="item fold" data-fold="1">收起记录 ▴</button>';
      vis.forEach(function (it, i) {
        var cls = it.type === 'me' ? 'item me' : ('item say' + (i === lastSay ? ' cur' : ''));
        html += '<div class="' + cls + '">' + it.html + '</div>';
      });
    } else {
      var show = [];
      if (prevSay >= 0) show.push(prevSay);
      if (lastMe >= 0 && lastMe !== lastSay) show.push(lastMe);
      if (lastSay >= 0) show.push(lastSay);
      show.sort(function (x, y) { return x - y; });
      // 第一句前面留一行空位，当前句的位置每一句都一样
      if (prevSay < 0 && !logOpen) html += '<div class="item say prev ph" aria-hidden="true">&nbsp;</div>';
      show.forEach(function (i) {
        var it = vis[i];
        if (it.type === 'me') html += '<div class="item me">' + it.html + '</div>';
        else if (i === prevSay) html += '<button type="button" class="item prev" data-fold="1" title="展开本步记录" aria-expanded="false">' + lastSentence(it.html) + ' ▾</button>';
        else html += '<div class="item say cur">' + it.html + '</div>';
      });
    }
    E.log.innerHTML = html;
    var sig = vis.length + (logOpen ? 'o' : 'c');
    if (sig !== lastCount) {
      lastCount = sig;
      requestAnimationFrame(function () { if (window.innerWidth <= 760 || logOpen) E.log.scrollTop = E.log.scrollHeight; });
      if (window.innerWidth <= 760 || logOpen) E.log.scrollTop = E.log.scrollHeight;
    }
  }

  // 当前位置是否已到 at（[幕号, 第几步, 第几句]）
  function reached(at) {
    if (!at) return false;
    if (finished) return true;
    var idx = -1;
    for (var i = 0; i < acts.length; i++) if (acts[i].id === at[0]) idx = i;
    if (idx < 0) return false;
    if (ai !== idx) return ai > idx;
    if (si !== at[1] - 1) return si > at[1] - 1;
    return bi >= (at[2] || 0);
  }
  function sameStep(at) {
    return at && !finished && acts[ai] && acts[ai].id === at[0] && si === at[1] - 1;
  }
  var maskIds = [];
  var returnTo = null;   // 从小测结果跳去回看时，记下回来的位置
  function noteState(n) {
    if (!reached(n.at)) return null;
    if (n.out && reached(n.out)) return { cls: 'out', html: n.html, tag: '出局', fresh: sameStep(n.out) };
    if (n.ok && reached(n.ok.at)) return { cls: 'ok', html: n.ok.html, tag: '成立', fresh: sameStep(n.ok.at) };
    return { cls: n.hyp ? 'hyp' : 'fact', html: n.hyp ? n.html.replace(/？?$/, '？') : n.html, tag: n.hyp ? '猜想' : '', fresh: sameStep(n.at) };
  }
  // 链上只放最高一级，按出现先后用 → 连起来；被收编的条目不单列，角标是下面有几条。
  // 点一项，浮层里展开正文和下属条目；这一步刚得出新结论时，浮层自动弹出一会儿。
  var chainOpen = null, chainAuto = '', chainTimer = null;
  function actIdx(id) { for (var i = 0; i < acts.length; i++) if (acts[i].id === id) return i; return 0; }
  function posNum(at) { return actIdx(at[0]) * 1e6 + (at[1] - 1) * 1e3 + (at[2] || 0); }
  function noteModel() {
    var byId = {}, items = [], tops = [], latest = null;
    notes.forEach(function (n) {
      var s = noteState(n);
      if (!s) return;
      var masked = maskIds.indexOf(n.id) >= 0 && !!n.mask;
      var okd = n.ok && reached(n.ok.at);
      var short = plainText(s.html);
      var it = {
        id: n.id, n: n, s: s, masked: masked, kids: [], pos: posNum(okd ? n.ok.at : n.at),
        title: masked ? '回忆一下' : ((okd && n.ok.title) || n.title || (short.length > 12 ? short.slice(0, 12) + '…' : short)),
        body: masked ? n.mask : s.html
      };
      items.push(it); byId[n.id] = it;
      if (!latest || it.pos >= latest.pos) latest = it;
    });
    items.forEach(function (it) {
      var p = it.n.under && byId[it.n.under];
      if (p) p.kids.push(it); else tops.push(it);
    });
    return { tops: tops, latest: latest, count: items.length };
  }
  function noteTag(it) {
    var t = it.masked ? '' : it.s.tag;
    return t ? '<span class="note-tag">' + t + '</span>' : '';
  }
  function closeChain() {
    clearTimeout(chainTimer);
    if (chainOpen === null) return;
    chainOpen = null;
    renderBoard();
  }
  function renderBoard() {
    if (!E.chain) return;
    var m = noteModel(), latestTop = null;
    m.tops.forEach(function (t) { if (t === m.latest || t.kids.indexOf(m.latest) >= 0) latestTop = t; });
    E.chain.hidden = !notes.length || finished;
    if (!m.count) { E.chain.innerHTML = '<div class="ch-row"><span class="ch-h">结论</span><span class="ch-empty">得出的结论会一条条接在这里</span></div>'; return; }
    // 新结论出现时自动弹出它所在的那一项，5 秒后收起（学生点过就不自动收）
    var key = m.latest.id + '@' + m.latest.pos;
    if (m.latest.s.fresh && chainAuto !== key) {
      chainAuto = key;
      if (!GRAV.tw()) {   // 微调：不弹浮层盖住画面，新结论只在链尾标成最新
        chainOpen = latestTop.id;
        clearTimeout(chainTimer);
        chainTimer = setTimeout(closeChain, 5000);
      }
    }
    var row = m.tops.map(function (t, i) {
      var cls = 'ch ' + t.s.cls.replace('fact masked', 'masked') + (t === latestTop ? ' latest' : '') + (chainOpen === t.id ? ' on' : '');
      return (i ? '<span class="ch-arrow" aria-hidden="true">→</span>' : '') +
        '<button type="button" class="' + cls + '" data-id="' + t.id + '" aria-expanded="' + (chainOpen === t.id) + '">' + noteTag(t) +
        '<span class="ch-t">' + t.title + '</span>' + (t.kids.length ? '<span class="ch-n">' + t.kids.length + '</span>' : '') + '</button>';
    }).join('');
    var open = null;
    m.tops.forEach(function (t) { if (t.id === chainOpen) open = t; });
    var pop = '';
    if (open) {
      pop = '<div class="ch-pop" role="dialog"><button type="button" class="ch-x" aria-label="收起">×</button>' +
        '<div class="ch-title">' + noteTag(open) + '<b>' + open.title + '</b></div><div class="ch-body">' + open.body + '</div>' +
        (open.kids.length ? '<ol>' + open.kids.map(function (k) {
          return '<li class="' + k.s.cls.replace('fact masked', 'masked') + (k === m.latest ? ' latest' : '') + '">' + noteTag(k) +
            '<b>' + k.title + '</b><div>' + k.body + '</div></li>';
        }).join('') + '</ol>' : '') + '</div>';
    }
    E.chain.innerHTML = '<div class="ch-row"><span class="ch-h">结论</span>' + row + '</div>' + pop;
    fitChain();
    // 新结论不加飞入、闪动：链尾那一项用"最新"样式标出，笔记只更新计数，不抢讲解和画面的注意
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
    placeGo();
    renderProgress();
    renderToc();
    renderLog();
    renderStatus();
    renderBoard();
    E.board.classList.toggle('finished', finished);
    E.board.classList.toggle('fx', !finished && !!fplan);
    E.board.classList.toggle('won', !finished && won);
    drawFn = null;
    if (!finished && st) {
      E.tag.textContent = a.tag || ('第 ' + a.id + ' 幕');
      E.title.innerHTML = st.title || '';
      var canvasOn = (st.layout || 'split') === 'split' && typeof st.draw === 'function';   // layout: 'answer' 关闭画布（旧属性）；版式覆盖用 st.frame
      E.work.classList.toggle('single', !canvasOn);
      E.work.classList.toggle('tall', !!st.tall);
      // 方案 A：分栏的步骤作答区一直留着，画面到停点不缩
      E.work.classList.toggle('wide', canvasOn && !answerHasContent() && !(nearOn() && window.innerWidth > 760));
      drawFn = canvasOn ? st.draw : null;
      var last = beatsOf(st).length - 1;
      E.btnGo.setAttribute('data-last', bi >= last ? '1' : '0');
      syncGo();   // G5：只有「继续」和「提交」，st.button 忽略
      E.goTip.hidden = true;
      E.playbar.hidden = !(canvasOn && st.play);
      // 方案 A：动画还没开播（讲到 playAt 那句之前，例如预测还没锁定）时，重播、慢放点了没反应，先不显示
      if (nearOn() && typeof st.playAt === 'number' && bi < st.playAt) E.playbar.hidden = true;
    }
    E.btnGo.hidden = finished;
    if (finished) E.btnGo.removeAttribute('data-last');
    if (newLayout() && !finished && !mounting) keepShown(E.answer, keepMap, bi);
    if (nearOn()) syncEcho();
    if (!finished && farther({ ai: ai, si: si, bi: bi }, far)) far = { ai: ai, si: si, bi: bi };
    if (finished) far = { ai: acts.length, si: 0, bi: 0 };
    if (E.btnNb) { E.btnNb.hidden = !nbOn(); if (nbOn()) renderNb(); else closeNb(); }
    if (E.act) {
      var shown = actShown();
      E.act.hidden = !shown;
      if (shown) E.goTip.hidden = true;   // 手机：选项在行动位里，下面仍留「提交」按钮
      // 手机上行动位是贴底的一条，选项多时变高：给页面底部留出同样高度，板子才滚得到底
      var foot = E.btnGo.parentNode;
      document.body.style.paddingBottom = shown && window.innerWidth <= 760 ? (foot.offsetHeight + 16) + 'px' : '';
    }
    // 手机：选项已挪进行动位，行动位的显示刚更新过，按钮要再判一次（上面那次 syncGo 时行动位还 hidden，会误判成没有选项）
    if (!finished) syncGo();
    if (nearOn()) fitStop();
    // 回看时的"回到小测结果"：走到那一步或点了它就消失
    if (returnTo && !finished && ai === returnTo.ai && si === returnTo.si) returnTo = null;
    E.btnReturn.hidden = !returnTo || finished;
    if (returnTo) E.btnReturn.textContent = '↩ 回到' + returnTo.title;
    if (finished) E.goTip.hidden = true;
    E.btnSlow.setAttribute('aria-pressed', String(rate !== 1));
    E.btnBack.disabled = !finished && ai === 0 && si === 0 && bi === 0;
    E.btnNext.disabled = finished || locked();
    E.btnTheme.setAttribute('aria-pressed', String(isDark()));
    if (newLayout() && !finished && !mounting) { keepShown(E.answer, keepMap, bi); fitTables(E.answer); }
    syncBar();
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
      // 跳到某一幕；记下现在这一步，回看时页面上一直有"回到这里"的按钮
      jump: function (id) {
        if (!alive()) return;
        var from = { ai: ai, si: si, title: plainText(curStep().title || '') };
        for (var i = 0; i < acts.length; i++) if (acts[i].id === id) { go(i, 0, 0); returnTo = from; render(); return; }
      },
      replay: function () { if (alive()) replay(); },
      // 回忆时盖住结论区里这些条目的关键词；传空数组揭开
      boardMask: function (ids) { if (alive()) { maskIds = ids || []; renderBoard(); } },
      redraw: function () {}
    };
  }

  // 讲解里的停点（题干在左栏的讲述里）：把选项整块挪到左栏的行动位，
  // 板子只留画面、表格、演算。这一步板上写了题干（.stem，练习和小测）就整步不挪，选项跟着题干。
  function moveAsks() {
    if (E.answer.querySelector('.stem')) return;
    Array.prototype.slice.call(E.answer.children).forEach(function (c) {
      if (!c.querySelector) return;
      var hasOpts = c.classList.contains('opts') || c.querySelector('.opts');
      if (!hasOpts || c.querySelector('.stem, .wk, table, canvas')) return;
      c.classList.add('act-moved');
      E.act.appendChild(c);
    });
  }
  function actShown() {
    if (!E.act || !askOn() || finished || unlocked) return false;
    return Array.prototype.some.call(E.act.children, function (c) { return !c.hidden; });
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
    logOpen = false;
    for (var j = 0; j <= bi; j++) pushBeat(j);
    statusHTML = st.status || '';
    E.answer.innerHTML = '';
    E.answer.removeAttribute('data-stem');
    keepMap = new Map();
    selOpt = null;
    if (E.lcol) E.lcol.innerHTML = '';
    E.answer.onclick = null;
    maskIds = [];
    chainOpen = null;
    clearTimeout(chainTimer);
    fplan = planF(st);   // 整板推导：先预演，版面进入这一步就定好
    setFVars();
    mounting = true;
    render();
    mounting = false;
    if (E.act) E.act.innerHTML = '';
    if (typeof st.mount === 'function') st.mount(E.answer, makeApi(my));
    boldStems(E.answer);
    curKind = detectKind(E.answer, st, !E.work.classList.contains('single'));
    E.work.setAttribute('data-layout', curKind);
    if (askOn()) moveAsks();
    if (newLayout()) arrangeLive(st); else setLayoutVars(null);
    if (nearOn()) addEcho(st);
    render();
    if (newLayout()) planLive(st);
    sizeCanvas();
    settleF();
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
    fplan = null;
    setFVars();
    won = false;
    unlocked = true;
    items = [];
    hooks = [];
    statusHTML = '';
    E.answer.innerHTML = '';
    selOpt = null;
    if (E.lcol) E.lcol.innerHTML = '';
    E.work.removeAttribute('data-layout');
    setLayoutVars(null);
    E.answer.onclick = null;
    closeToc();
    if (E.finishSub && typeof GRAV.finishNote === 'function') E.finishSub.innerHTML = GRAV.finishNote();
    render();
    if (!noLeave) confetti();
  }

  // ---------- 完成时撒彩带：两侧往上喷，3 秒落完；设置了"减少动画"就不撒 ----------
  function confetti() {
    if (reduceMotion) return;
    var cv = document.createElement('canvas');
    cv.className = 'confetti';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var c = cv.getContext('2d'), W = window.innerWidth, H = window.innerHeight, r = window.devicePixelRatio || 1;
    cv.width = W * r; cv.height = H * r;
    var P = palette(), cols = [P.vel, P.field, P.charge, P.accel, P.steel];
    var bits = [];
    for (var i = 0; i < 160; i++) {
      var left = i % 2 === 0, ang = (left ? -1 : -2.14) + (Math.random() - 0.5) * 0.7, sp = H * (1.3 + Math.random() * 0.8);
      bits.push({
        x: left ? W * 0.08 : W * 0.92, y: H + 10, vx: Math.cos(ang) * sp * 0.7, vy: Math.sin(ang) * sp,
        w: 6 + Math.random() * 5, h: 9 + Math.random() * 7, a: Math.random() * 6, va: (Math.random() - 0.5) * 12,
        col: cols[i % cols.length], delay: Math.random() * 0.25
      });
    }
    var t0 = 0, last = 0, DUR = 3.4;
    function step(ts) {
      if (!t0) { t0 = last = ts; }
      var t = (ts - t0) / 1000, dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      c.setTransform(r, 0, 0, r, 0, 0);
      c.clearRect(0, 0, W, H);
      c.globalAlpha = t > DUR - 0.8 ? Math.max(0, (DUR - t) / 0.8) : 1;
      bits.forEach(function (b) {
        if (t < b.delay) return;
        b.vy += H * 1.3 * dt; b.vx *= 1 - 1.2 * dt; b.vy *= 1 - 0.6 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
        c.save(); c.translate(b.x, b.y); c.rotate(b.a); c.scale(1, Math.cos(b.a * 1.7));
        c.fillStyle = b.col; c.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); c.restore();
      });
      if (t < DUR) requestAnimationFrame(step); else cv.remove();
    }
    requestAnimationFrame(step);
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
    returnTo = null;
    far = { ai: 0, si: 0, bi: 0 }; mistakes = {};
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
  GRAV.miss = function () {
    if (finished || !curStep()) return;
    mistakes[ai + '-' + si] = { ai: ai, si: si, title: plainText(curStep().title || '') };
    if (E.btnNb) renderNb();
  };
  function syncTwBtns() { E.goTip.textContent = '先在板上作答'; }
  // 换版本要重新挂载这一步（选项得挪回去或挪过来）
  function remount() { chainAuto = ''; if (finished) render(); else go(ai, si, bi); }
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
    E.log.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-fold]')) { logOpen = !logOpen; lastCount = -1; renderLog(); }
    });
    E.btnBack.addEventListener('click', back);
    E.btnNext.addEventListener('click', advance);
    E.btnGo.addEventListener('click', onGo);
    // 捕获阶段：停点上点选项只选中，不判；「提交」时用 submitting 放行真正的 click
    document.addEventListener('click', function (e) {
      if (submitting || finished || !locked()) return;
      var o = e.target.closest ? e.target.closest('.opt') : null;
      if (!o || !optIn(o)) return;
      e.stopPropagation(); e.preventDefault();
      if (!o.disabled) selectOpt(o);
    }, true);
    E.btnRestart.addEventListener('click', restart);
    E.btnReturn.addEventListener('click', function () {
      if (!returnTo) return;
      var r = returnTo;
      returnTo = null;
      go(r.ai, r.si, 0);
    });
    E.progress.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.prog-btn')) { e.stopPropagation(); toggleToc(); return; }
      var b = e.target.closest ? e.target.closest('.seg') : null;
      if (!b) return;
      go(Number(b.getAttribute('data-i')), 0, 0);
      closeToc();
    });
    E.btnClose.addEventListener('click', function () { try { window.close(); } catch (e) { /* 忽略 */ } });
    E.btnToc.addEventListener('click', toggleToc);
    E.btnTheme.addEventListener('click', toggleTheme);
    E.btnReplay.addEventListener('click', replay);
    E.btnSlow.addEventListener('click', toggleSlow);
    E.chain.addEventListener('click', function (e) {
      if (e.target.closest('.ch-x')) { closeChain(); return; }
      var b = e.target.closest('.ch');
      if (!b) return;
      var id = b.getAttribute('data-id');
      clearTimeout(chainTimer);
      chainOpen = chainOpen === id ? null : id;
      renderBoard();
    });
    // 捕获阶段先收起旧浮层，再让按钮处理点击：点"下一句"时新弹出的浮层不会被同一下点击关掉
    document.addEventListener('click', function (e) {
      if (chainOpen !== null && !E.chain.contains(e.target)) closeChain();
    }, true);
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
      if (e.key === 'Enter' && !e.shiftKey) {
        // 回车 = 按主按钮；别的按钮（提示、目录…）上的回车照它们自己的来
        var t = e.target;
        if (t && t.closest) {
          if (t.closest('input, textarea, select, a, summary')) return;
          if (t.closest('button') && !t.closest('.opt, #btn-go')) return;
          if (t.classList.contains('opt') && !finished && locked() && !t.disabled && t !== selOpt) { e.preventDefault(); t.click(); return; }
        }
        e.preventDefault();
        if (!E.btnGo.hidden && !E.btnGo.disabled) E.btnGo.click();
        return;
      }
      if (e.key === 'ArrowRight') advance();
      else if (e.key === 'ArrowLeft') back();
      else if (e.key === 'Escape') { closeToc(); closeChain(); }
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
    E.btnNb = document.createElement('button');
    E.btnNb.type = 'button'; E.btnNb.className = 'txt-btn nb-btn'; E.btnNb.setAttribute('aria-expanded', 'false');
    E.btnNb.addEventListener('click', function (e) { e.stopPropagation(); if (E.nb.hidden) openNb(); else closeNb(); });
    E.btnToc.parentNode.insertBefore(E.btnNb, E.btnToc);
    E.btnNb.addEventListener('animationend', function () { E.btnNb.classList.remove('pulse'); });
    E.nb = document.createElement('aside');
    E.nb.className = 'nb-panel'; E.nb.hidden = true; E.nb.setAttribute('aria-label', '笔记');
    document.body.appendChild(E.nb);
    E.nb.addEventListener('click', function (e) {
      if (e.target.closest('.nb-x')) { closeNb(); return; }
      var g = e.target.closest('.nb-go');
      if (!g) return;
      var from = finished ? null : { ai: ai, si: si, title: plainText(curStep().title || '') };
      closeNb();
      go(Number(g.getAttribute('data-ai')), Number(g.getAttribute('data-si')), 0);
      if (from && (from.ai !== ai || from.si !== si)) { returnTo = from; render(); }
    });
    document.addEventListener('click', function (e) {
      if (E.nb.hidden || E.nb.contains(e.target) || E.btnNb.contains(e.target)) return;
      closeNb();
    });

    E.capPrev = document.getElementById('cap-prev');
    E.log = document.getElementById('cap-cur');
    E.status = document.getElementById('status');
    E.board = document.getElementById('board');
    E.tag = document.getElementById('tag');
    E.title = document.getElementById('title');
    E.chain = document.createElement('div');
    E.chain.className = 'chain';
    E.chain.hidden = true;
    E.board.insertBefore(E.chain, E.tag);
    E.work = document.getElementById('work');
    E.stage = document.querySelector('.stage');
    E.lcol = document.createElement('div');
    E.lcol.className = 'lcol';
    E.work.querySelector('.scene-col').insertBefore(E.lcol, E.work.querySelector('.canvas-wrap'));
    E.answer = document.getElementById('answer');
    E.btnGo = document.getElementById('btn-go');
    E.btnRestart = document.getElementById('btn-restart');
    E.playbar = document.getElementById('playbar');
    E.finishSub = document.querySelector('.finish-sub');
    E.btnReplay = document.getElementById('btn-replay');
    E.btnSlow = document.getElementById('btn-slow');
    E.goTip = document.createElement('div');
    E.goTip.className = 'go-tip';
    E.goTip.textContent = '先在右边作答';
    E.goTip.hidden = true;
    E.foot = E.btnGo.parentNode;
    E.foot.appendChild(E.goTip);
    E.act = document.createElement('div');
    E.act.className = 'act-slot';
    E.act.hidden = true;
    E.btnGo.parentNode.insertBefore(E.act, E.btnGo);
    syncTwBtns();
    E.actbar = document.createElement('div');
    E.actbar.className = 'actbar';
    E.barIn = document.createElement('div');
    E.barIn.className = 'actbar-in';
    E.barTip = document.createElement('span');
    E.barTip.className = 'bar-tip'; E.barTip.textContent = '先选一项'; E.barTip.hidden = true;
    E.barHint = document.createElement('button');
    E.barHint.type = 'button'; E.barHint.className = 'txt-btn bar-hint'; E.barHint.textContent = '提示'; E.barHint.hidden = true;
    E.barHint.addEventListener('click', function () { var h = activeHint(); if (h) h.click(); });
    E.barIn.appendChild(E.barTip); E.barIn.appendChild(E.barHint);
    E.actbar.appendChild(E.barIn);
    E.board.appendChild(E.actbar);
    if (window.MutationObserver) new MutationObserver(function () { if (newLayout() && !finished) { keepShown(E.answer, keepMap, bi); syncEcho(); fitTables(E.answer); } syncBar(); syncGo(); }).observe(E.answer, { subtree: true, attributes: true, attributeFilter: ['hidden'], childList: true });
    if (window.matchMedia) {
      var mq = window.matchMedia('(max-width: 760px)');
      var onMq = function () { if (started && acts.length) remount(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }
    E.btnReturn = document.createElement('button');
    E.btnReturn.type = 'button';
    E.btnReturn.className = 'return-btn';
    E.btnReturn.hidden = true;
    E.btnGo.parentNode.insertBefore(E.btnReturn, E.btnGo);

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
    window.addEventListener('resize', scheduleReplan);
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(scheduleReplan);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', scheduleReplan);
    }
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
