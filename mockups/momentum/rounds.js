/* 气垫导轨三轮实验的公用部分（window.RD）：数据、候选量、画面、数据表。第 2、3、4 幕共用。 */
(function () {
  'use strict';

  var f = MOM.f, S = GRAV.h.sym;
  var RD = window.RD = {};

  // 第 1 轮、第 3 轮的"实测"数据：理想值附近，带一点误差。第 2 轮由学生设计，见第 3 幕。
  RD.R1 = { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0, a: 0.198, b: 0.794, side: 'mag' };
  RD.R3 = { mA: 0.2, mB: 0.4, vA: 0.6, vB: 0, a: -0.197, b: 0.396, side: 'mag' };

  RD.Q = {
    v: { name: S('v') + ' 之和', f: function (m, v) { return v; } },
    mv: { name: S('mv') + ' 之和', f: function (m, v) { return m * v; } },
    abs: { name: '|' + S('mv') + '| 之和', f: function (m, v) { return Math.abs(m * v); } },
    mv2: { name: S('mv') + '² 之和', f: function (m, v) { return m * v * v; } }
  };
  RD.sums = function (r, q) {
    var F = RD.Q[q].f;
    return { pre: F(r.mA, r.vA) + F(r.mB, r.vB), post: F(r.mA, r.a) + F(r.mB, r.b) };
  };
  RD.pctTxt = function (s) {
    var p = MOM.pct(s.pre, s.post);
    return (p >= 0 ? '多了 ' : '少了 ') + Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0) + '%';
  };
  RD.d3 = function (x) { return f(x, 3); };
  // 一句读数："mv 之和：0.240 → 0.238，少了 0.8%"
  RD.say = function (r, q) {
    var s = RD.sums(r, q);
    return RD.Q[q].name.replace(/<[^>]+>/g, '') + '：' + RD.d3(s.pre) + ' → ' + RD.d3(s.post) + '，' + RD.pctTxt(s);
  };

  // ---------- 画面：导轨、两车、速度箭头；下面是 v–t 图，bars 为真时再加动量柱子 ----------
  // r0：数据对象，或返回数据的函数（第 2 轮由学生设计）；r.idle 表示还没做实验，停在碰撞前
  // label0：左上角说明（字符串或函数）；holdUpTo：讲到第几句之前（含）停在碰撞前，留给学生预测
  // bars：是否画动量柱子；可以是函数 (beat) => 布尔
  RD.scene = function (r0, label0, holdUpTo, bars) {
    return function (ctx, w, h, t, C, beat) {
      var r = typeof r0 === 'function' ? r0() : r0;
      var label = typeof label0 === 'function' ? label0() : label0;
      var showBars = typeof bars === 'function' ? bars(beat) : bars !== false;
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
      var ay = y + 28, sc = narrow ? 50 : 70;
      // 箭头从车的中点画出；快到导轨右端时整体左移，免得画出画布
      var arrow = function (cx, yy, v) {
        var x = v > 0 ? Math.min(cx, x1 - 4 - v * sc) : cx;
        MOM.vArrow(ctx, x, yy, v, sc, C, f(v, 2) + ' m/s');
      };
      arrow(s.xA + wA / 2, ay, s.vA);
      if (!(r.side === 'velcro' && s.after)) arrow(s.xB + wB / 2, ay + 24, s.vB);
      GRAV.draw.text(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
      if (label) GRAV.draw.text(ctx, label, x0, 16, { size: 12, color: C.steel });
      var top = y + 78;
      if (!showBars) {
        MOM.vtGraph(ctx, { x: x0, y: top, w: Math.min(x1 - x0 - 30, 560), h: h - top - 8 }, s, cfg, C);
      } else if (narrow) {
        var gh = (h - top - 20) * 0.5;
        MOM.vtGraph(ctx, { x: x0, y: top, w: x1 - x0 - 30, h: gh }, s, cfg, C);
        MOM.pBars(ctx, { x: x0, y: top + gh + 16, w: x1 - x0, h: h - top - gh - 24 }, s, cfg, C);
      } else {
        var gw = (x1 - x0) * 0.56;
        MOM.vtGraph(ctx, { x: x0, y: top, w: gw - 30, h: h - top - 8 }, s, cfg, C);
        MOM.pBars(ctx, { x: x0 + gw + 10, y: top, w: x1 - x0 - gw - 10, h: h - top - 8 }, s, cfg, C);
      }
    };
  };

  // ---------- 作答区：速度表 + 候选量表 ----------
  RD.speedTable = function (r) {
    return '<table class="dt"><tr><th></th><th>' + S('m') + '（kg）</th><th>碰前 ' + S('v') + '</th><th>碰后 ' + S('v') + '</th></tr>' +
      '<tr><td>A 车</td><td>' + r.mA + '</td><td>' + f(r.vA, 2) + '</td><td>' + RD.d3(r.a) + '</td></tr>' +
      '<tr><td>B 车</td><td>' + r.mB + '</td><td>' + f(r.vB, 2) + '</td><td>' + RD.d3(r.b) + '</td></tr></table>';
  };
  RD.vd = function (keep) { return '<span class="vd ' + (keep ? 'keep' : 'drop') + '">' + (keep ? '没变' : '变了') + '</span>'; };
  RD.candTable = function () {
    var t = document.createElement('table');
    t.className = 'dt dt-gap';
    t.innerHTML = '<tr><th>候选量</th><th>碰前</th><th>碰后</th><th></th></tr>';
    return {
      el: t,
      row: function (r, q) {
        var s = RD.sums(r, q);
        var tr = document.createElement('tr');
        tr.className = 'in';
        tr.innerHTML = '<td>' + RD.Q[q].name + '</td><td>' + RD.d3(s.pre) + '</td><td>' + RD.d3(s.post) + '</td><td>' + RD.vd(MOM.kept(s.pre, s.post)) + '</td>';
        t.appendChild(tr);
      }
    };
  };
  // 速度表从 showAt 句起出现；候选量按 rows = [[句序号, 候选量], …] 逐行出现
  RD.tables = function (el, api, r, showAt, rows) {
    var sp = document.createElement('div');
    sp.innerHTML = RD.speedTable(r);
    el.appendChild(sp);
    var ct = RD.candTable(), shown = 0;
    el.appendChild(ct.el);
    api.onBeat(function (bt) {
      sp.hidden = bt < showAt;
      while (shown < rows.length && rows[shown][0] <= bt) { ct.row(r, rows[shown][1]); shown++; }
      ct.el.hidden = shown === 0;
    });
  };
})();
