/* 第 3 幕 · 三轮实验：v 之和、mv² 之和、不带方向的 mv 之和依次出局，剩下 mv 的矢量和 */
(function () {
  'use strict';

  var f = MOM.f, S = GRAV.h.sym;

  // 三轮数据：理想值附近的"实测"值（带一点误差）
  var R = [
    { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0, a: 0.198, b: 0.794, side: 'mag' },
    { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0, a: 0.396, b: 0.396, side: 'velcro' },
    { mA: 0.2, mB: 0.4, vA: 0.6, vB: 0, a: -0.197, b: 0.396, side: 'mag' }
  ];
  var Q = {
    v: { name: S('v') + ' 之和', f: function (m, v) { return v; } },
    mv: { name: S('mv') + ' 之和', f: function (m, v) { return m * v; } },
    abs: { name: '|' + S('mv') + '| 之和', f: function (m, v) { return Math.abs(m * v); } },
    mv2: { name: S('mv') + '² 之和', f: function (m, v) { return m * v * v; } }
  };
  function sums(r, q) {
    var F = Q[q].f;
    return { pre: F(r.mA, r.vA) + F(r.mB, r.vB), post: F(r.mA, r.a) + F(r.mB, r.b) };
  }
  function pctTxt(s) {
    var p = MOM.pct(s.pre, s.post);
    return (p >= 0 ? '多了 ' : '少了 ') + Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0) + '%';
  }
  function d3(x) { return f(x, 3); }

  // ---------- 画面：导轨、两车、速度箭头 ----------
  // holdUpTo：讲到第几句之前（含），动画停在碰撞前，免得学生还没预测就看到答案
  // r 可以是数据对象，也可以是返回数据的函数（第 2 轮由学生设计）；r.idle 表示还没开始
  function scene(r0, label0, holdUpTo) {
    return function (ctx, w, h, t, C, beat) {
      var r = typeof r0 === 'function' ? r0() : r0;
      var label = typeof label0 === 'function' ? label0() : label0;
      var narrow = w < 520;
      var x0 = 8, x1 = w - 8, y = Math.max(110, h * (narrow ? 0.24 : 0.25));
      var cw = Math.max(64, Math.min(110, w * 0.15)), chH = Math.max(30, Math.min(40, cw * 0.36));
      var wA = cw * (r.mA >= r.mB ? 1.12 : 0.9), wB = cw * (r.mB >= r.mA ? 1.12 : 0.9);
      var cfg = {
        xA0: x0 + 8, xB0: x0 + (x1 - x0) * 0.42, wA: wA, wB: wB, k: (x1 - x0) * 0.27,
        mA: r.mA, mB: r.mB, vA: r.vA, vB: r.vB, a: r.a, b: r.b,
        hold: r.idle || (holdUpTo != null && beat <= holdUpTo)
      };
      var s = MOM.sim(t, cfg);
      MOM.track(ctx, x0, x1, y, C);
      MOM.cart(ctx, s.xA, y, wA, chH, C, { name: 'A', label: r.mA + ' kg', heavy: r.mA > r.mB, face: 1, side: r.side });
      MOM.cart(ctx, s.xB, y, wB, chH, C, { name: 'B', label: r.mB + ' kg', heavy: r.mB > r.mA, face: -1, side: r.side });
      var ay = y + 28, sc = 70;
      MOM.vArrow(ctx, s.xA + wA / 2, ay, s.vA, sc, C, f(s.vA, 2) + ' m/s');
      if (!(r.side === 'velcro' && s.after)) MOM.vArrow(ctx, s.xB + wB / 2, ay + 24, s.vB, sc, C, f(s.vB, 2) + ' m/s');
      GRAV.draw.text(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
      if (label) GRAV.draw.text(ctx, label, x0, 16, { size: 12, color: C.steel });
      // 下半：v–t 图 + 动量柱子
      var top = y + 78;
      if (narrow) {
        var gh = (h - top - 20) * 0.5;
        MOM.vtGraph(ctx, { x: x0, y: top, w: x1 - x0 - 30, h: gh }, s, cfg, C);
        MOM.pBars(ctx, { x: x0, y: top + gh + 16, w: x1 - x0, h: h - top - gh - 40 }, s, cfg, C);
      } else {
        var gw = (x1 - x0) * 0.56;
        MOM.vtGraph(ctx, { x: x0, y: top, w: gw - 30, h: h - top - 24 }, s, cfg, C);
        MOM.pBars(ctx, { x: x0 + gw + 10, y: top, w: x1 - x0 - gw - 10, h: h - top - 24 }, s, cfg, C);
      }
    };
  }

  // ---------- 作答区：速度表 + 候选量表 ----------
  function speedTable(r) {
    return '<table class="dt"><tr><th></th><th>' + S('m') + '（kg）</th><th>碰前 ' + S('v') + '</th><th>碰后 ' + S('v') + '</th></tr>' +
      '<tr><td>A 车</td><td>' + r.mA + '</td><td>' + f(r.vA, 2) + '</td><td>' + d3(r.a) + '</td></tr>' +
      '<tr><td>B 车</td><td>' + r.mB + '</td><td>' + f(r.vB, 2) + '</td><td>' + d3(r.b) + '</td></tr></table>';
  }
  function candTable() {
    var t = document.createElement('table');
    t.className = 'dt';
    t.classList.add('dt-gap');
    t.innerHTML = '<tr><th>候选量</th><th>碰前</th><th>碰后</th><th></th></tr>';
    return {
      el: t,
      row: function (r, q) {
        var s = sums(r, q), keep = MOM.kept(s.pre, s.post);
        var tr = document.createElement('tr');
        tr.className = 'in';
        tr.innerHTML = '<td>' + Q[q].name + '</td><td>' + d3(s.pre) + '</td><td>' + d3(s.post) + '</td>' +
          '<td><span class="vd ' + (keep ? 'keep' : 'drop') + '">' + (keep ? '不变' : '变了') + '</span></td>';
        t.appendChild(tr);
      }
    };
  }
  // 按句逐行出现：rows[k] = [句序号, 候选量]
  function roundMount(r, rows, extra) {
    return function (el, api) {
      var sp = document.createElement('div');
      sp.innerHTML = speedTable(r);
      el.appendChild(sp);
      var ct = candTable(), shown = 0;
      el.appendChild(ct.el);
      api.onBeat(function (bt) {
        sp.hidden = bt < (r.showAt || 0);
        while (shown < rows.length && rows[shown][0] <= bt) { ct.row(r, rows[shown][1]); shown++; }
        ct.el.hidden = shown === 0;
      });
      if (extra) extra(el, api);
    };
  }

  function say(r, q) {
    var s = sums(r, q);
    return Q[q].name.replace(/<[^>]+>/g, '') + '：' + d3(s.pre) + ' → ' + d3(s.post) + '，' + pctTxt(s);
  }

  R[1].showAt = 1;
  R[2].showAt = 2;


  // ---------- 第 2 轮：学生自己设计实验 ----------
  var MASSES = [
    { name: '重车撞轻车', note: '0.4 / 0.2 kg', mA: 0.4, mB: 0.2 },
    { name: '一样重', note: '0.2 / 0.2 kg', mA: 0.2, mB: 0.2 },
    { name: '轻车撞重车', note: '0.2 / 0.4 kg', mA: 0.2, mB: 0.4 }
  ];
  var SIDES = [
    { name: '磁体', note: '碰后弹开', side: 'mag', e: 1 },
    { name: '粘扣', note: '碰后粘住', side: 'velcro', e: 0 }
  ];
  // 一次"实测"：理想碰撞的碰后速度乘 0.99，模拟一点损耗和测量误差
  function design(mi, si) {
    var M = MASSES[mi], Sd = SIDES[si];
    var v = MOM.collide(M.mA, M.mB, 0.6, 0, Sd.e);
    return {
      mA: M.mA, mB: M.mB, vA: 0.6, vB: 0, side: Sd.side,
      a: Math.round(v[0] * 0.99 * 1000) / 1000, b: Math.round(v[1] * 0.99 * 1000) / 1000
    };
  }
  var LAB = { mi: 0, si: 0, cur: null, ch: null };

  function mountLab(el, api) {
    LAB.cur = design(LAB.mi, LAB.si);
    LAB.cur.idle = true;
    var tries = 0, done = !!LAB.ch;
    var panel = document.createElement('div');
    function group(title, list, key, one) {
      var g = document.createElement('div');
      g.className = 'lab-g';
      g.innerHTML = '<div class="lab-t">' + title + '</div>';
      var row = document.createElement('div');
      row.className = 'chips' + (one ? ' one' : '');
      list.forEach(function (it, k) {
        var c = document.createElement('button');
        c.type = 'button'; c.className = 'chip pick' + (LAB[key] === k ? ' on' : '');
        c.innerHTML = '<span>' + it.name + '</span><span class="u">' + it.note + '</span>';
        c.addEventListener('click', function () {
          LAB[key] = k;
          Array.prototype.forEach.call(row.children, function (x, n) { x.classList.toggle('on', n === k); });
          LAB.cur = design(LAB.mi, LAB.si); LAB.cur.idle = true;
        });
        row.appendChild(c);
      });
      g.appendChild(row);
      return g;
    }
    panel.appendChild(group('两车的质量', MASSES, 'mi', true));
    panel.appendChild(group('碰撞面', SIDES, 'si'));
    var run = document.createElement('button');
    run.type = 'button'; run.className = 'run';
    run.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>做一次';
    panel.appendChild(run);
    var log = document.createElement('table');
    log.className = 'dt';
    log.classList.add('dt-gap');
    log.innerHTML = '<tr><th>你的设计</th><th>' + S('mv') + ' 之和</th><th>' + S('mv') + '² 之和</th></tr>';
    log.hidden = true;
    panel.appendChild(log);
    el.appendChild(panel);

    run.addEventListener('click', function () {
      var d = design(LAB.mi, LAB.si);
      LAB.cur = d;
      api.replay();
      tries++;
      // 窄屏上画布在面板上方，点完滚回去看碰撞
      var cv = document.getElementById('canvas-wrap');
      if (cv && cv.getBoundingClientRect().top < 0) cv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var m = MASSES[LAB.mi], sd = SIDES[LAB.si];
      api.me('我试：' + m.name + '，' + sd.name);
      var a = sums(d, 'mv'), b = sums(d, 'mv2');
      var ka = MOM.kept(a.pre, a.post), kb = MOM.kept(b.pre, b.post);
      var tr = document.createElement('tr');
      tr.className = 'in';
      function chip(k) { return '<span class="vd ' + (k ? 'keep' : 'drop') + '">' + (k ? '不变' : '变了') + '</span>'; }
      tr.innerHTML = '<td>' + m.name + '，' + sd.name + '</td><td>' + chip(ka) + '</td><td>' + chip(kb) + '</td>';
      log.appendChild(tr); log.hidden = false;
      if (ka && !kb) {
        api.say('分出来了：mv 之和不变，mv² 之和' + pctTxt(b) + '。');
        if (!done) { done = true; LAB.ch = d; api.win(true); api.open(); }
        return;
      }
      api.say('这次 mv 和 mv² 都没变，还是分不出谁对。换个设计试试。');
      if (!done && tries === 2) api.say('提示：前几次都是碰后弹开。想想有没有别的碰撞方式？');
      if (!done && tries === 3) api.say('再提示：把碰撞面换成粘扣，让两车碰后粘在一起。');
    });
    if (done) api.open();
    // 讲解往下走以后，画面固定放学生找到的那次实验，下面出数据表
    var sp = document.createElement('div'), ct = candTable(), shown = 0;
    el.appendChild(sp); el.appendChild(ct.el); ct.el.hidden = true;
    api.onBeat(function (bt) {
      panel.hidden = bt > 0;
      if (bt >= 1 && LAB.ch) {
        if (!sp.innerHTML) sp.innerHTML = speedTable(LAB.ch);
        if (LAB.cur !== LAB.ch) { LAB.cur = LAB.ch; api.replay(); }
      }
      sp.hidden = bt < 1;
      var rows = [[2, 'mv'], [3, 'mv2']];
      while (shown < rows.length && rows[shown][0] <= bt && LAB.ch) { ct.row(LAB.ch, rows[shown][1]); shown++; }
      ct.el.hidden = shown === 0;
    });
  }

  GRAV.act({
    id: 3,
    name: '三轮实验',
    tag: '第 3 幕 · 三轮实验',
    steps: [
      {
        title: '气垫导轨上的两辆小车',
        beats: [
          { say: '气垫导轨把小车托起来，摩擦很小。光电门测出每辆车碰撞前后的速度。' },
          { say: '约定向右为正。每一轮都算三个候选量在碰撞前后的和：v 之和、mv 之和、mv² 之和。' },
          { say: '下面左边是两车的 v–t 图，碰撞前后各有一段平台，速度就从平台上读。右边的柱子实时画出 mv 和 mv²：A、B 和它们的和，虚线是碰前的和。' },
          { say: '实验有误差，数字不会完全相等。我们约定：前后相差 5% 以内，算没变；超过 10%，算变了。' }
        ],
        button: '开始第 1 轮',
        play: true,
        tall: true,
        draw: scene(R[0], '碰撞面装磁体：碰后弹开'),
        mount: function (el, api) {
          var d = document.createElement('div');
          d.innerHTML = '<div class="rule">候选量：' + S('v') + ' 之和、' + S('mv') + ' 之和、' + S('mv') + '² 之和<br>判断规则：相差 5% 以内算不变</div>';
          el.appendChild(d);
          api.onBeat(function (bt) { d.hidden = bt < 1; });
        }
      },
      {
        title: '第 1 轮：重车撞轻车，碰后分开',
        beats: [
          { say: 'A 车 0.4 kg 以 0.60 m/s 撞上静止的 B 车 0.2 kg，碰撞面装着磁体，碰后分开。' },
          { say: '从 v–t 图的平台读出碰后速度：A ' + d3(R[0].a) + ' m/s，B ' + d3(R[0].b) + ' m/s。来算三个量。' },
          { say: say(R[0], 'v') + '。猜想 1 又被推翻。' },
          { say: say(R[0], 'mv') + '，没变。' },
          { say: say(R[0], 'mv2') + '，也没变。' },
          { say: 'mv 和 mv² 都过关了，这一轮分不出谁对。得找一种碰撞，让它们表现不同。' }
        ],
        button: '开始第 2 轮',
        play: true,
        tall: true,
        draw: scene(R[0]),
        mount: roundMount(R[0], [[2, 'v'], [3, 'mv'], [4, 'mv2']])
      },
      {
        title: '第 2 轮：你来设计',
        beats: [
          { say: '第 1 轮里 mv 和 mv² 都过关了。第 2 轮你来设计：做什么样的碰撞，才能让它们一个变、一个不变？选好就点"做一次"，可以试很多次。' },
          { say: function () { return 'v–t 图上，碰后两条线并成了一条：两车的共同速度是 ' + d3(LAB.ch.a) + ' m/s。'; } },
          { say: function () { return say(LAB.ch, 'mv') + '，还是没变。'; } },
          { say: function () { return say(LAB.ch, 'mv2') + '，远远超出误差。猜想 3 出局。'; } },
          { say: '这就是关键：弹开的碰撞里，mv 和 mv² 都不变，分不出谁对；只有粘在一起的碰撞，才把它们分开。' }
        ],
        gateAt: 0,
        button: '开始第 3 轮',
        play: true,
        tall: true,
        draw: scene(function () { return LAB.cur; }, function () { return LAB.cur.side === 'velcro' ? '碰撞面装粘扣：碰后粘在一起' : '碰撞面装磁体：碰后弹开'; }),
        mount: mountLab
      },
      {
        title: '第 3 轮：轻车撞重车，碰后分开',
        beats: [
          { say: '这次反过来：A 车 0.2 kg 以 0.60 m/s 撞上静止的 B 车 0.4 kg。' },
          { say: 'A 被弹了回来，速率 0.197 m/s。按向右为正，它的速度该记作多少？' },
          { say: 'B 车以 ' + d3(R[2].b) + ' m/s 向右。先不管方向，把 mv 的大小加起来：' + say(R[2], 'abs').split('：')[1] + '。' },
          { say: '带上方向再算：' + say(R[2], 'mv').split('：')[1] + '，不变。看柱子：A 的 mv 翻到了零线下面，和却没变。' },
          { say: '所以守得住的，是 mv 的矢量和。方向要算进去。' }
        ],
        gateAt: 1,
        button: '回头看三轮',
        play: true,
        tall: true,
        playAt: 2,
        draw: scene(R[2], null, 1),
        mount: roundMount(R[2], [[2, 'abs'], [3, 'mv']], function (el, api) {
          var box = document.createElement('div');
          el.insertBefore(box, el.firstChild);
          GRAV.ui.choice(box, {
            options: [
              { html: '0.197 m/s', say: '它是向左运动的，方向和约定的正方向相反。' },
              { html: '−0.197 m/s', correct: true, say: '对。向左运动，记作负值。' }
            ],
            hints: ['我们约定了哪个方向为正？', 'A 弹回去，是向左还是向右？', '向左，记作 −0.197 m/s。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        })
      },
      {
        title: '三轮实验，剩下一个',
        layout: 'answer',
        beats: [
          { say: '回头看三轮：每一轮都淘汰掉一个候选。' },
          { say: '剩下的是：碰撞前后，两车 mv 的矢量和不变。' }
        ],
        button: '给它起个名字',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.innerHTML = '<table class="dt"><tr><th>轮次</th><th>碰撞</th><th>淘汰了</th></tr>' +
            '<tr><td>第 1 轮</td><td>重车撞轻车，分开</td><td>' + S('v') + ' 之和</td></tr>' +
            '<tr><td>第 2 轮</td><td>碰后粘在一起</td><td>' + S('mv') + '² 之和</td></tr>' +
            '<tr><td>第 3 轮</td><td>轻车撞重车，反弹</td><td>不带方向的 ' + S('mv') + ' 之和</td></tr></table>';
          var big = document.createElement('div');
          big.className = 'big';
          big.style.marginTop = '40px';
          big.innerHTML = '两车 ' + S('mv') + ' 的矢量和不变';
          el.appendChild(d); el.appendChild(big);
          api.onBeat(function (bt) { big.hidden = bt < 1; api.win(bt >= 1); });
        }
      }
    ]
  });
})();
