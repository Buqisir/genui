/*
 * 动量定理课的公用画法（window.IMP）：F–t 图（面积随时间填充、可叠平均力矩形）、墙、地面、海绵、鸡蛋、气囊、蹦床。
 * 力和冲量用 force 色，速度用 velocity 色，动量变化用 accel 色；颜色只从调色板 C 取。
 */
(function () {
  'use strict';
  var IMP = window.IMP = {};
  var rgba = MOM.rgba;

  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  // ---------- F–t 图 ----------
  // o：{ tMax, fMax, tTicks, fTicks, curves: [{ pts: [[t, F], …], upto, label, labelAt: [t, F], dash, alpha, color }],
  //      rect: { f, t0, t1, label }, note }
  // upto 是物理时间：只画到这一刻，面积也只填到这一刻（用于动画）
  IMP.ft = function (ctx, box, o, C) {
    var L = box.x + 44, R = box.x + box.w - 24, T = box.y + 24, B = box.y + box.h - 28;
    var X = function (t) { return L + (R - L) * t / o.tMax; };
    var Y = function (F) { return B - (B - T) * F / o.fMax; };
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T - 8); ctx.lineTo(L, B); ctx.lineTo(R + 8, B); ctx.stroke();
    ctx.restore();
    txt(ctx, 'F（N）', box.x, box.y + 12, { size: 12, color: C.steel });
    txt(ctx, 't（s）', R + 12, B + 4, { size: 12, color: C.steel });
    (o.fTicks || []).forEach(function (f) {
      txt(ctx, String(f), L - 6, Y(f) + 4, { font: 'num', size: 12, color: C.steel, align: 'right' });
      ctx.save(); ctx.strokeStyle = C.hair; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(L, Y(f)); ctx.lineTo(R, Y(f)); ctx.stroke(); ctx.restore();
    });
    (o.tTicks || []).forEach(function (t) {
      txt(ctx, String(t), X(t), B + 16, { font: 'num', size: 12, color: C.steel, align: 'center' });
    });
    (o.curves || []).forEach(function (c) {
      var col = c.color || C.force, up = c.upto == null ? Infinity : c.upto;
      // 把折线截到 upto
      var pts = [], p = c.pts;
      for (var i = 0; i < p.length; i++) {
        if (p[i][0] <= up) { pts.push(p[i]); continue; }
        if (i > 0) {
          var a = p[i - 1], b = p[i], u = (up - a[0]) / (b[0] - a[0]);
          pts.push([up, a[1] + (b[1] - a[1]) * u]);
        }
        break;
      }
      if (pts.length < 2) return;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(X(pts[0][0]), B);
      pts.forEach(function (q) { ctx.lineTo(X(q[0]), Y(q[1])); });
      ctx.lineTo(X(pts[pts.length - 1][0]), B); ctx.closePath();
      ctx.fillStyle = rgba(col, c.alpha == null ? 0.16 : c.alpha); ctx.fill();
      ctx.beginPath();
      pts.forEach(function (q, k) { if (k) ctx.lineTo(X(q[0]), Y(q[1])); else ctx.moveTo(X(q[0]), Y(q[1])); });
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(c.dash || []); ctx.stroke();
      ctx.restore();
      if (c.label && c.labelAt) txt(ctx, c.label, X(c.labelAt[0]), Y(c.labelAt[1]), { size: 14, color: col, align: 'center' });
    });
    if (o.rect) {
      var r = o.rect;
      ctx.save();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
      ctx.strokeRect(X(r.t0), Y(r.f), X(r.t1) - X(r.t0), B - Y(r.f));
      ctx.restore();
      if (r.label) txt(ctx, r.label, X(r.t1) + 6, Y(r.f) + 4, { size: 14, color: C.ink });
    }
    if (o.note) txt(ctx, o.note, R, box.y + 12, { size: 12, color: C.steel, align: 'right' });
    return { X: X, Y: Y, B: B };
  };

  // ---------- 力箭头（force 色），label 写在箭头旁 ----------
  IMP.force = function (ctx, x1, y1, x2, y2, C, label, side) {
    GRAV.draw.arrow(ctx, x1, y1, x2, y2, C.force, 2.5);
    if (!label) return;
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    if (side === 'right') txt(ctx, label, Math.max(x1, x2) + 8, my + 5, { size: 14, color: C.force });
    else if (side === 'left') txt(ctx, label, Math.min(x1, x2) - 8, my + 5, { size: 14, color: C.force, align: 'right' });
    else txt(ctx, label, mx, Math.min(y1, y2) - 8, { size: 14, color: C.force, align: 'center' });
  };

  // ---------- 场景零件 ----------
  IMP.wall = function (ctx, x, y, h, C) {
    ctx.save();
    ctx.fillStyle = C.bar; ctx.fillRect(x, y - h / 2, 16, h);
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1; ctx.strokeRect(x, y - h / 2, 16, h);
    ctx.strokeStyle = rgba(C.graphite, 0.4);
    for (var k = -h / 2; k < h / 2; k += 12) { ctx.beginPath(); ctx.moveTo(x + 16, y + k); ctx.lineTo(x + 26, y + k + 10); ctx.stroke(); }
    ctx.restore();
  };
  IMP.ground = function (ctx, x0, x1, y, C) {
    ctx.save();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = rgba(C.graphite, 0.4); ctx.lineWidth = 1;
    for (var x = x0; x < x1; x += 12) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 9); ctx.stroke(); }
    ctx.restore();
  };
  // 海绵：一块软垫，press 是被压下去的深度
  IMP.sponge = function (ctx, x, y, w, h, C, press) {
    press = press || 0;
    ctx.save();
    MOM.rr(ctx, x, y - h + press, w, h - press, 8);
    ctx.fillStyle = rgba(C.charge, 0.22); ctx.fill();
    ctx.strokeStyle = rgba(C.charge, 0.7); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = rgba(C.charge, 0.35);
    for (var i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(x + 10 + (i * 37) % (w - 20), y - h * 0.3 - (i * 13) % (h * 0.5) + press * 0.5, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };
  IMP.egg = function (ctx, x, y, r, C, squash) {
    squash = squash || 0;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y - r * (1.3 - squash * 0.3), r * (1 + squash * 0.25), r * (1.3 - squash * 0.3), 0, 0, Math.PI * 2);
    ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  };
  // 蹦床：两条腿，一张网
  IMP.trampoline = function (ctx, x, y, w, C, sag) {
    sag = sag || 0;
    ctx.save();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x, y + 30); ctx.moveTo(x + w - 8, y); ctx.lineTo(x + w, y + 30); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + sag * 2, x + w, y); ctx.stroke();
    ctx.restore();
  };
  // 尺寸线：竖直方向，从 y1 到 y2，文字在左
  IMP.dim = function (ctx, x, y1, y2, C, label) {
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x - 5, y1); ctx.lineTo(x + 5, y1); ctx.moveTo(x - 5, y2); ctx.lineTo(x + 5, y2); ctx.stroke();
    ctx.restore();
    txt(ctx, label, x - 8, (y1 + y2) / 2 + 4, { font: 'num', size: 14, color: C.graphite, align: 'right' });
  };
})();
