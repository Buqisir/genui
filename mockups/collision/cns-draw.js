/*
 * 动量守恒定律课的画法（window.CNS）：柱子组、木板木块、斜面体、斜槽实验落点、人形、v–t 图。
 * 颜色只从调色板 C 取：力 force，速度 velocity，动量相关的"和"用 ink，单个物体用 steel。
 */
(function () {
  'use strict';
  var CNS = window.CNS = {};
  var rgba = MOM.rgba, TAU = Math.PI * 2;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  // ---------- 一组柱子：items = [{ label, v, ink, color }]；scale 是每单位的像素；ref 画一条虚线参考值 ----------
  CNS.bars = function (ctx, box, items, C, o) {
    o = o || {};
    var n = items.length, bw = Math.min(36, box.w / (n * 2)), gap = (box.w - n * bw) / (n + 1);
    var base = box.y + box.h - 22, top = box.y + 22;
    var max = o.max || Math.max.apply(null, items.map(function (it) { return Math.abs(it.v); })) * 1.2;
    var Y = function (v) { return base - (base - top) * v / max; };
    ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(box.x, base); ctx.lineTo(box.x + box.w, base); ctx.stroke(); ctx.restore();
    if (o.ref != null) {
      ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = C.graphite;
      ctx.beginPath(); ctx.moveTo(box.x, Y(o.ref)); ctx.lineTo(box.x + box.w, Y(o.ref)); ctx.stroke(); ctx.restore();
      if (o.refLabel) txt(ctx, o.refLabel, box.x, Y(o.ref) - 5, { size: 13, color: C.graphite });
    }
    items.forEach(function (it, i) {
      var x = box.x + gap + i * (bw + gap), y1 = Y(it.v);
      ctx.fillStyle = it.color || (it.ink ? C.ink : rgba(C.steel, 0.75));
      ctx.fillRect(x, Math.min(base, y1), bw, Math.max(1, Math.abs(base - y1)));
      txt(ctx, it.label, x + bw / 2, base + 16, { size: 13, color: it.ink ? C.ink : C.graphite, align: 'center' });
      if (it.text) txt(ctx, it.text, x + bw / 2, Math.min(base, y1) - 6, { font: 'num', size: 13, color: it.ink ? C.ink : C.graphite, align: 'center' });
    });
    if (o.title) txt(ctx, o.title, box.x + box.w / 2, box.y + 10, { size: 14, color: C.graphite, align: 'center' });
  };

  // ---------- 人形（俯视不好看，用侧视简笔）：x 是脚下中点 ----------
  CNS.person = function (ctx, x, y, s, C, label) {
    ctx.save();
    ctx.fillStyle = C.graphite; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y - s * 1.75, s * 0.22, 0, TAU); ctx.fill();
    MOM.rr(ctx, x - s * 0.22, y - s * 1.5, s * 0.44, s * 0.8, s * 0.12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s * 0.1, y - s * 0.72); ctx.lineTo(x - s * 0.18, y); ctx.moveTo(x + s * 0.1, y - s * 0.72); ctx.lineTo(x + s * 0.18, y); ctx.stroke();
    ctx.restore();
    if (label) txt(ctx, label, x, y - s * 2.1, { size: 13, color: C.graphite, align: 'center' });
  };

  // ---------- 斜面体：底边 (x, y) 起，宽 w、高 h，斜边朝右下 ----------
  CNS.wedge = function (ctx, x, y, w, h, C) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w, y); ctx.closePath();
    ctx.fillStyle = C.bar; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  };

  // ---------- 斜槽实验：槽口在 (x0, y0)，地面 gy；落点按水平距离（米）× px 画 ----------
  CNS.chute = function (ctx, x0, y0, gy, px, C, o) {
    o = o || {};
    ctx.save();
    // 斜槽：一段向下弯的曲线，末端水平
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0 - 110, y0 - 110); ctx.quadraticCurveTo(x0 - 70, y0, x0, y0); ctx.stroke();
    ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.strokeStyle = C.steel;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, gy); ctx.stroke();
    ctx.restore();
    IMP.ground(ctx, x0 - 30, x0 + 0.62 * px + 20, gy, C);
    // 刻度尺
    for (var cm = 0; cm <= 60; cm += 10) {
      var x = x0 + cm / 100 * px;
      ctx.save(); ctx.strokeStyle = C.steel; ctx.beginPath(); ctx.moveTo(x, gy + 2); ctx.lineTo(x, gy + 10); ctx.stroke(); ctx.restore();
      txt(ctx, String(cm), x, gy + 24, { font: 'num', size: 13, color: C.graphite, align: 'center' });
    }
    txt(ctx, 'cm', x0 + 0.62 * px + 6, gy + 24, { size: 13, color: C.graphite });
    txt(ctx, 'O', x0 - 10, gy - 6, { font: 'sym', size: 14, color: C.ink, align: 'right' });
    (o.points || []).forEach(function (p) {
      var x = x0 + p.x * px, n = 24, fall = gy - y0;
      // 平抛轨迹：y 和 x² 成正比
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = rgba(C.vel, 0.55); ctx.lineWidth = 1.2; ctx.beginPath();
      for (var k = 0; k <= n; k++) { var u = k / n; var xx = x0 + (x - x0) * u, yy = y0 + fall * u * u; if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.stroke(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(x, gy - 4, 4, 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore();
      txt(ctx, p.name, x, gy - 14, { font: 'sym', size: 14, color: C.ink, align: 'center' });
    });
    // 槽口的两只小球
    ctx.save();
    ctx.beginPath(); ctx.arc(x0 - 14, y0 - 8, 8, 0, TAU); ctx.fillStyle = C.graphite; ctx.fill();
    ctx.beginPath(); ctx.arc(x0 + 4, y0 - 6, 6, 0, TAU); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.restore();
    txt(ctx, '1', x0 - 14, y0 - 22, { font: 'num', size: 13, color: C.graphite, align: 'center' });
    txt(ctx, '2', x0 + 4, y0 - 18, { font: 'num', size: 13, color: C.graphite, align: 'center' });
  };

  // ---------- v–t 图：lines = [{ name, v0, v1, dash }]；碰撞在中间 ----------
  CNS.vt = function (ctx, box, lines, C, o) {
    o = o || {};
    var L = box.x + 40, R = box.x + box.w - 30, T = box.y + 20, B = box.y + box.h - 20;
    var vmin = o.vmin, vmax = o.vmax;
    var Y = function (v) { return T + (B - T) * (vmax - v) / (vmax - vmin); };
    var tc = L + (R - L) * 0.45, tc2 = tc + 16;
    ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T - 6); ctx.lineTo(L, B); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L, Y(0)); ctx.lineTo(R + 6, Y(0)); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.hair; ctx.beginPath(); ctx.moveTo(tc, T); ctx.lineTo(tc, B); ctx.stroke();
    ctx.restore();
    txt(ctx, 'v（m/s）', box.x, box.y + 8, { size: 13, color: C.graphite });
    txt(ctx, 't', R + 10, Y(0) + 4, { font: 'sym', size: 14, color: C.graphite });
    txt(ctx, '碰撞', tc + 4, T + 4, { size: 13, color: C.graphite });
    (o.ticks || []).forEach(function (v) { txt(ctx, MOM.f(v, 0), L - 6, Y(v) + 4, { font: 'num', size: 13, color: C.graphite, align: 'right' }); });
    lines.forEach(function (l) {
      ctx.save(); ctx.strokeStyle = C.vel; ctx.lineWidth = 2; ctx.setLineDash(l.dash || []);
      ctx.beginPath(); ctx.moveTo(L, Y(l.v0)); ctx.lineTo(tc, Y(l.v0)); ctx.lineTo(tc2, Y(l.v1)); ctx.lineTo(R, Y(l.v1)); ctx.stroke(); ctx.restore();
      txt(ctx, l.name, R + 4, Y(l.v1) + 4, { font: 'sym', size: 14, color: C.vel });
    });
  };
})();
