/*
 * 弹性碰撞和非弹性碰撞课的画法与数据（window.COL）：气垫导轨上两车相碰，下面是动量、动能两组柱子。
 * 颜色只从调色板 C 取：速度 velocity，"和"用 ink，单个物体用 steel。
 */
(function () {
  'use strict';
  var COL = window.COL = {};
  var f = MOM.f, rgba = MOM.rgba;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  // ---------- 数据：同第 1 节的小车（规格第九节数据表） ----------
  // 磁体、粘扣是第 1 节的原数据；橡皮按恢复系数 0.5 的理想值乘 0.99
  var base = { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0 };
  function mk(o) { return Object.assign({}, base, o); }
  COL.D = {
    mag: mk({ a: 0.198, b: 0.794, side: 'mag', name: '磁体', note: '碰后弹开' }),
    rub: mk({ a: 0.297, b: 0.594, side: 'rubber', name: '橡皮', note: '碰后弹开' }),
    vel: mk({ a: 0.396, b: 0.396, side: 'velcro', name: '粘扣', note: '碰后粘住' }),
    eq: { mA: 0.2, mB: 0.2, vA: 0.6, vB: 0, a: 0, b: 0.594, side: 'mag' },
    lh: { mA: 0.2, mB: 0.4, vA: 0.6, vB: 0, a: -0.197, b: 0.396, side: 'mag' }
  };
  COL.p = function (r, after) { return after ? r.mA * r.a + r.mB * r.b : r.mA * r.vA + r.mB * r.vB; };
  COL.ke = function (r, after) {
    return after ? 0.5 * r.mA * r.a * r.a + 0.5 * r.mB * r.b * r.b : 0.5 * r.mA * r.vA * r.vA + 0.5 * r.mB * r.vB * r.vB;
  };
  // "少了 26%"
  COL.lossTxt = function (r) {
    var p = (COL.ke(r, true) - COL.ke(r, false)) / COL.ke(r, false) * 100;
    if (p > 0.05) return '多了 ' + p.toFixed(0) + '%';
    return '少了 ' + Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0) + '%';
  };

  // ---------- 一组柱子：A、B、和；零线位置由 nf（零线以下占几成）决定，两组共用 ----------
  function range(vals, pre) {
    var all = vals.concat([pre]);
    return {
      pos: Math.max.apply(null, all.concat([1e-9])) * 1.2,
      neg: -Math.min.apply(null, all.concat([0])) * 1.25
    };
  }
  function bars(ctx, box, now, R, nf, pre, C, o) {
    var top = box.y + 30, bot = box.y + box.h - 24, zero = bot - (bot - top) * nf;
    var Y = function (v) { return zero - (zero - top) * v / R.pos; };
    var bw = Math.min(28, box.w / 6), gap = (box.w - 3 * bw) / 4;
    var xl = box.x + gap * 0.5, xr = box.x + box.w - gap * 0.5;
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xl, zero); ctx.lineTo(xr, zero); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.graphite;
    ctx.beginPath(); ctx.moveTo(xl, Y(pre)); ctx.lineTo(xr, Y(pre)); ctx.stroke();
    ctx.restore();
    txt(ctx, '碰前', xl, Y(pre) - 5, { size: 12, color: C.steel });
    ['A', 'B', '和'].forEach(function (lab, i) {
      var x = box.x + gap + i * (bw + gap), v = now[i], y1 = Y(v);
      ctx.fillStyle = i === 2 ? C.ink : rgba(C.steel, 0.75);
      ctx.fillRect(x, Math.min(zero, y1), bw, Math.max(1, Math.abs(y1 - zero)));
      txt(ctx, o.names ? (o.names[i] || lab) : lab, x + bw / 2, box.y + box.h - 4, { size: 12, color: i === 2 ? C.ink : C.graphite, align: 'center' });
      if (i === 2) txt(ctx, f(v, o.dp), x + bw / 2, Math.min(zero, y1) - 6, { font: 'num', size: 12, color: C.ink, align: 'center' });
    });
    txt(ctx, o.title, box.x + box.w / 2, box.y + 14, { size: 14, color: C.graphite, align: 'center' });
  }

  // 橡皮碰撞面：画在车朝向对方的一侧，用石墨色，和磁体（速度色）、粘扣（电荷色）区分
  function rubberFace(ctx, x, y, w, h, face, C) {
    var top = y - h - 3, fx = face > 0 ? x + w : x - 5;
    ctx.save(); ctx.fillStyle = C.graphite; MOM.rr(ctx, fx, top + h * 0.3, 5, h * 0.4, 1.5); ctx.fill(); ctx.restore();
  }

  // ---------- 画面：导轨、两车、速度箭头；下面动量、动能两组柱子 ----------
  // r0：数据或返回数据的函数；r.idle 为真时停在碰撞前
  // o.holdUpTo：讲到第几句之前（含）停在碰撞前；o.bars(beat)：要不要画柱子；o.label：左上角说明
  // o.names：两车的名字（默认 A、B）；o.dp：速度的小数位；o.pdp、o.kdp：动量、动能"和"的小数位
  COL.scene = function (r0, o) {
    o = o || {};
    return function (ctx, w, h, t, C, beat) {
      var r = typeof r0 === 'function' ? r0() : r0;
      var label = typeof o.label === 'function' ? o.label() : o.label;
      var showBars = o.bars ? o.bars(beat) : true;
      var names = o.names || ['A', 'B'];
      var narrow = w < 520;
      var x0 = 8, x1 = w - 8, y = showBars ? Math.max(100, h * 0.24) : h * 0.42;
      var cw = Math.max(64, Math.min(110, w * 0.15)), chH = Math.max(30, Math.min(40, cw * 0.36));
      var wA = cw * (r.mA > r.mB ? 1.12 : r.mA < r.mB ? 0.9 : 1), wB = cw * (r.mB > r.mA ? 1.12 : r.mB < r.mA ? 0.9 : 1);
      var vmax = Math.max(Math.abs(r.vA), Math.abs(r.vB), Math.abs(r.a), Math.abs(r.b));
      var cfg = {
        xA0: x0 + 8, xB0: x0 + (x1 - x0) * (r.vB > 0 ? 0.32 : 0.42), wA: wA, wB: wB, k: (x1 - x0) * 0.2 / vmax,
        mA: r.mA, mB: r.mB, vA: r.vA, vB: r.vB, a: r.a, b: r.b,
        hold: r.idle || (o.holdUpTo != null && beat <= o.holdUpTo)
      };
      var s = MOM.sim(t, cfg);
      var xB = Math.min(s.xB, x1 - 2 - wB), xA = Math.max(x0 + 2, Math.min(s.xA, xB - wA));
      MOM.track(ctx, x0, x1, y, C);
      var sideA = r.side === 'rubber' ? null : r.side;
      MOM.cart(ctx, xA, y, wA, chH, C, { name: names[0], label: r.mA + ' kg', heavy: r.mA > r.mB, face: 1, side: sideA });
      MOM.cart(ctx, xB, y, wB, chH, C, { name: names[1], label: r.mB + ' kg', heavy: r.mB > r.mA, face: -1, side: sideA });
      if (r.side === 'rubber') { rubberFace(ctx, xA, y, wA, chH, 1, C); rubberFace(ctx, xB, y, wB, chH, -1, C); }
      var ay = y + 28, sc = (narrow ? 50 : 70) * 0.8 / vmax, dp = o.dp == null ? 2 : o.dp;
      var arrow = function (cx, yy, v) {
        var x = v > 0 ? Math.min(cx, x1 - 4 - v * sc) : Math.max(cx, x0 + 4 - v * sc);
        MOM.vArrow(ctx, x, yy, v, sc, C, f(v, dp) + ' m/s');
      };
      var stuck = r.side === 'velcro' && s.after;
      arrow(xA + wA / 2, ay, s.vA);
      if (!stuck) arrow(xB + wB / 2, ay + 24, s.vB);
      txt(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
      if (label) txt(ctx, label, x0, 16, { size: 12, color: C.steel });
      if (!showBars) return;
      var pNow = [r.mA * s.vA, r.mB * s.vB], kNow = [0.5 * r.mA * s.vA * s.vA, 0.5 * r.mB * s.vB * s.vB];
      pNow.push(pNow[0] + pNow[1]); kNow.push(kNow[0] + kNow[1]);
      var pAll = [r.mA * r.vA, r.mB * r.vB, r.mA * r.a, r.mB * r.b, COL.p(r, true)];
      var kAll = [0.5 * r.mA * r.vA * r.vA, 0.5 * r.mB * r.vB * r.vB, 0.5 * r.mA * r.a * r.a, 0.5 * r.mB * r.b * r.b, COL.ke(r, true)];
      var pre = [COL.p(r, false), COL.ke(r, false)];
      var Rp = range(pAll, pre[0]), Rk = range(kAll, pre[1]);
      var nf = Math.max(Rp.neg / (Rp.pos + Rp.neg), Rk.neg / (Rk.pos + Rk.neg));
      var top = y + 78, bh = Math.min(h - top - 8, 300), gw = Math.min((x1 - x0) / 2, 300);
      var bx = narrow ? x0 : x0 + 20;
      var bn = { names: names.concat(['和']) };
      bars(ctx, { x: bx, y: top, w: gw - 10, h: bh }, pNow, Rp, nf, pre[0], C, Object.assign({ title: '动量（kg·m/s）', dp: o.pdp == null ? 3 : o.pdp }, bn));
      bars(ctx, { x: bx + gw + 10, y: top, w: gw - 10, h: bh }, kNow, Rk, nf, pre[1], C, Object.assign({ title: '动能（J）', dp: o.kdp == null ? 3 : o.kdp }, bn));
    };
  };

  // ---------- 三次碰撞碰后的动能，和碰前比 ----------
  COL.keCompare = function (ctx, box, C, upto) {
    var keys = ['mag', 'rub', 'vel'], items = keys.map(function (k, i) {
      var r = COL.D[k];
      return { label: i < upto ? r.name + ' ' + f(COL.ke(r, true), 3) : r.name, v: i < upto ? COL.ke(r, true) : 0 };
    });
    CNS.bars(ctx, box, items, C, { max: 0.09, ref: 0.072, refLabel: '碰前', title: '碰后的总动能（J），虚线是碰前 0.072 J' });
  };
})();
