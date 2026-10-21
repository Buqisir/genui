/*
 * 反冲与火箭课的画法（window.RCL）：可带负值的柱子组、冰面扔背包、火箭喷气、水火箭、分离、人船、斜射炮车。
 * 颜色只从调色板 C 取：速度 velocity，力 force，能量 charge；"和"用 ink，单个物体用 steel。
 */
(function () {
  'use strict';
  var RCL = window.RCL = {};
  var f = MOM.f, rgba = MOM.rgba, TAU = Math.PI * 2;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  // ---------- 一组柱子，可有负值：items = [{ label, v, ink }]；o.max 正向满格值；o.neg 零线以下占几成 ----------
  RCL.bars = function (ctx, box, items, C, o) {
    o = o || {};
    var top = box.y + 28, bot = box.y + box.h - 22, nf = o.neg || 0;
    var zero = bot - (bot - top) * nf, max = o.max;
    var Y = function (v) { return zero - (zero - top) * v / max; };
    var n = items.length, bw = Math.min(30, box.w / (n * 2.2)), gap = (box.w - n * bw) / (n + 1);
    ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(box.x, zero); ctx.lineTo(box.x + box.w, zero); ctx.stroke(); ctx.restore();
    if (o.ref != null) {
      ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.graphite;
      ctx.beginPath(); ctx.moveTo(box.x, Y(o.ref)); ctx.lineTo(box.x + box.w, Y(o.ref)); ctx.stroke(); ctx.restore();
      if (o.refLabel) txt(ctx, o.refLabel, box.x, Y(o.ref) - 5, { size: 12, color: C.steel });
    }
    items.forEach(function (it, i) {
      var x = box.x + gap + i * (bw + gap), y1 = Y(it.v);
      ctx.fillStyle = it.color || (it.ink ? C.ink : rgba(C.steel, 0.75));
      ctx.fillRect(x, Math.min(zero, y1), bw, Math.max(1, Math.abs(zero - y1)));
      txt(ctx, it.label, x + bw / 2, bot + 16, { size: 12, color: it.ink ? C.ink : C.graphite, align: 'center' });
      var tv = it.text != null ? it.text : f(it.v, o.dp == null ? 1 : o.dp);
      var ty = it.v >= 0 ? Math.min(zero, y1) - 6 : Math.max(zero, y1) + 14;
      txt(ctx, tv, x + bw / 2, ty, { font: 'num', size: 12, color: it.ink ? C.ink : C.graphite, align: 'center' });
    });
    if (o.title) txt(ctx, o.title, box.x + box.w / 2, box.y + 10, { size: 14, color: C.graphite, align: 'center' });
  };

  // ---------- 冰面 ----------
  RCL.ice = function (ctx, x0, x1, y, C) {
    ctx.save(); ctx.fillStyle = rgba(C.vel, 0.06); MOM.rr(ctx, x0, y, x1 - x0, 14, 6); ctx.fill();
    ctx.strokeStyle = rgba(C.vel, 0.25); ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  };
  RCL.box = function (ctx, x, y, s, C, label) {   // x 是中点，y 是底边
    ctx.save(); MOM.rr(ctx, x - s / 2, y - s, s, s, 4); ctx.fillStyle = rgba(C.charge, 0.55); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    if (label) txt(ctx, label, x, y - s - 8, { size: 12, color: C.graphite, align: 'center' });
  };

  // ---------- 冰面扔背包：人 60 kg，背包 5 kg 以 6 m/s 向后（左），人以 0.5 m/s 向前（右） ----------
  // o.go：是否已经扔出；o.bars：'p' 画动量柱子，'k' 画动能柱子，'pk' 两组都画
  RCL.throwScene = function (o) {
    return function (ctx, w, h, t, C, beat) {
      var go = typeof o.go === 'function' ? o.go(beat) : o.go;
      var bars = typeof o.bars === 'function' ? o.bars(beat) : o.bars;
      var narrow = w < 520, x0 = 12, x1 = w - 12;
      var gy = bars ? Math.max(120, h * 0.36) : h * 0.62;
      RCL.ice(ctx, x0, x1, gy, C);
      var T = 1.8, tt = go ? Math.min(t, T) : 0, k = (x1 - x0) * 0.4 / (6 * T);
      var px0 = w * 0.55, px = px0 + 0.5 * k * tt * 6, s = narrow ? 30 : 36;
      var bx = go ? px0 - 24 - 6 * k * tt : px0 - 22, by = go ? gy - s * 0.9 : gy - s * 0.95;
      bx = Math.max(x0 + 14, bx);
      CNS.person(ctx, px, gy, s, C, '60 kg');
      RCL.box(ctx, bx, by + 12, 18, C, '5 kg');
      if (go && tt > 0.15) {
        MOM.vArrow(ctx, px - 10, gy + 30, 0.5, 60, C, '0.5 m/s');
        MOM.vArrow(ctx, bx + 8, gy + 30, -6, Math.min(14, (bx - x0) / 6), C, '6 m/s');
      }
      txt(ctx, '光滑冰面，向右为正', x1, 18, { size: 12, color: C.steel, align: 'right' });
      if (!bars) return;
      var p = go ? [30, -30, 0] : [0, 0, 0], kk = go ? [7.5, 90, 97.5] : [0, 0, 0];
      var top = gy + 64, bh = h - top - 6, half = Math.min(260, (w - 2 * x0) / 2 - 10);
      var pb = [{ label: '人', v: p[0] }, { label: '背包', v: p[1] }, { label: '和', v: p[2], ink: true }];
      var kb = [{ label: '人', v: kk[0] }, { label: '背包', v: kk[1] }, { label: '和', v: kk[2], ink: true }];
      if (bars === 'p') RCL.bars(ctx, { x: x0, y: top, w: Math.min(360, w - 2 * x0), h: bh }, pb, C, { max: 48, neg: 0.45, dp: 0, title: '动量（kg·m/s）' });
      else if (bars === 'k') RCL.bars(ctx, { x: x0, y: top, w: Math.min(360, w - 2 * x0), h: bh }, kb, C, { max: 110, dp: 1, title: '动能（J）' });
      else {
        RCL.bars(ctx, { x: x0, y: top, w: half, h: bh }, pb, C, { max: 48, neg: 0.45, dp: 0, title: '动量（kg·m/s）' });
        RCL.bars(ctx, { x: x0 + half + 20, y: top, w: half, h: bh }, kb.map(function (b) { b.color = b.ink ? C.ink : rgba(C.charge, 0.7); return b; }), C, { max: 110, neg: 0.45, dp: 1, title: '动能（J）' });
      }
    };
  };

  // ---------- 火箭（向右），x 是箭尾，y 是中线，L 长 ----------
  RCL.rocket = function (ctx, x, y, L, C, o) {
    o = o || {};
    var hh = L * 0.13;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y - hh); ctx.lineTo(x + L * 0.78, y - hh);
    ctx.quadraticCurveTo(x + L, y, x + L * 0.78, y + hh); ctx.lineTo(x, y + hh); ctx.closePath();
    ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.stroke();
    // 尾翼
    ctx.beginPath(); ctx.moveTo(x, y - hh); ctx.lineTo(x - L * 0.08, y - hh * 2); ctx.lineTo(x + L * 0.14, y - hh); ctx.closePath();
    ctx.moveTo(x, y + hh); ctx.lineTo(x - L * 0.08, y + hh * 2); ctx.lineTo(x + L * 0.14, y + hh); ctx.closePath();
    ctx.fillStyle = C.bar; ctx.fill(); ctx.stroke();
    (o.stages || []).forEach(function (sx) {
      ctx.beginPath(); ctx.moveTo(x + L * sx, y - hh); ctx.lineTo(x + L * sx, y + hh); ctx.strokeStyle = C.steel; ctx.stroke();
    });
    ctx.restore();
    if (o.label) txt(ctx, o.label, x + L * 0.4, y + 4, { size: 12, color: C.graphite, align: 'center' });
  };
  // 燃气粒子：从喷口 (x, y) 向左喷，seed 让粒子位置稳定
  RCL.exhaust = function (ctx, x, y, t, len, C, n) {
    n = n || 26;
    ctx.save();
    for (var i = 0; i < n; i++) {
      var ph = (i * 0.618034) % 1, age = (t * 1.2 + ph) % 1;
      var px = x - age * len, py = y + Math.sin(i * 12.9898) * (4 + age * 10);
      ctx.beginPath(); ctx.arc(px, py, 2.4 - age * 1.2, 0, TAU);
      ctx.fillStyle = rgba(C.force, 0.75 * (1 - age)); ctx.fill();
    }
    ctx.restore();
  };
  RCL.stars = function (ctx, w, h, C) {
    ctx.save(); ctx.fillStyle = rgba(C.steel, 0.5);
    for (var i = 0; i < 28; i++) {
      var x = ((i * 0.6180339 * 977) % 1) * w, y = ((i * 0.4142135 * 613) % 1) * h * 0.55;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    ctx.restore();
  };

  // ---------- 水火箭的瓶子：x 中点，y 底（喷口朝下），装水的比例 fill ----------
  RCL.bottle = function (ctx, x, y, bw, bh, fill, C) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 4, y); ctx.lineTo(x - 4, y - 8); ctx.quadraticCurveTo(x - bw / 2, y - 16, x - bw / 2, y - 30);
    ctx.lineTo(x - bw / 2, y - bh + 10); ctx.quadraticCurveTo(x - bw / 2, y - bh, x, y - bh - 8);
    ctx.quadraticCurveTo(x + bw / 2, y - bh, x + bw / 2, y - bh + 10); ctx.lineTo(x + bw / 2, y - 30);
    ctx.quadraticCurveTo(x + bw / 2, y - 16, x + 4, y - 8); ctx.lineTo(x + 4, y);
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.stroke();
    if (fill > 0) {
      ctx.clip();
      ctx.fillStyle = rgba(C.vel, 0.25); ctx.fillRect(x - bw, y - 30 - (bh - 40) * fill, bw * 2, 30 + (bh - 40) * fill);
    }
    ctx.restore();
  };

  // ---------- 小船（侧视）：x 是船尾（左端），y 是水线，L 船长 ----------
  RCL.boat = function (ctx, x, y, L, C) {
    var d = 16;
    ctx.save(); ctx.beginPath();
    ctx.moveTo(x - 8, y - d); ctx.lineTo(x + L + 8, y - d); ctx.lineTo(x + L - 10, y + 8); ctx.lineTo(x + 10, y + 8); ctx.closePath();
    ctx.fillStyle = C.bar; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore();
  };
  RCL.water = function (ctx, x0, x1, y, C) {
    ctx.save(); ctx.fillStyle = rgba(C.vel, 0.07); ctx.fillRect(x0, y, x1 - x0, 30);
    ctx.strokeStyle = rgba(C.vel, 0.35); ctx.beginPath();
    for (var x = x0; x <= x1; x += 6) { var yy = y + Math.sin(x * 0.18) * 1.5; if (x === x0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
    ctx.stroke(); ctx.restore();
  };
})();
