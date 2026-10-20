/*
 * 动量课的公用画法和物理（window.MOM）：气垫导轨、小车、冰壶、摆球、速度箭头、一维碰撞。
 * 各幕都用它，保证画风一致。颜色只从调色板 C 取。
 */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  var MOM = window.MOM = {};

  function rgba(c, a) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || '');
    if (!m) return c;
    var h = m[1];
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  MOM.rgba = rgba;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  MOM.rr = rr;

  // ---------- 数字 ----------
  // 定小数位，负号用"−"
  MOM.f = function (x, d) {
    var s = Math.abs(x) < 1e-12 ? (0).toFixed(d) : x.toFixed(d);
    return s.charAt(0) === '-' ? '−' + s.slice(1) : s;
  };
  MOM.pct = function (a, b) { return (b - a) / a * 100; };
  // 判断"不变"：5% 以内
  MOM.kept = function (a, b) { return Math.abs(MOM.pct(a, b)) < 5; };

  // ---------- 物理：一维碰撞，e = 1 弹开，e = 0 粘住 ----------
  MOM.collide = function (mA, mB, vA, vB, e) {
    var p = mA * vA + mB * vB, M = mA + mB;
    return [(p - mB * e * (vA - vB)) / M, (p + mA * e * (vA - vB)) / M];
  };

  // ---------- 气垫导轨 ----------
  MOM.track = function (ctx, x0, x1, y, C) {
    ctx.save();
    rr(ctx, x0, y, x1 - x0, 10, 3);
    var g = ctx.createLinearGradient(0, y, 0, y + 10);
    g.addColorStop(0, C.bar); g.addColorStop(1, rgba(C.steel, 0.45));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(C.graphite, 0.55); ctx.stroke();
    // 气孔
    ctx.fillStyle = rgba(C.graphite, 0.35);
    for (var x = x0 + 16; x < x1 - 10; x += 22) { ctx.beginPath(); ctx.arc(x, y + 3.5, 1, 0, TAU); ctx.fill(); }
    // 两端挡板
    ctx.fillStyle = C.graphite;
    rr(ctx, x0 - 4, y - 16, 6, 26, 2); ctx.fill();
    rr(ctx, x1 - 2, y - 16, 6, 26, 2); ctx.fill();
    ctx.restore();
  };

  // 小车：x 是左边缘，y 是导轨顶面；w 宽，h 高；mass 文字；side：'mag' 磁体 / 'velcro' 粘扣（画在朝向对方的一侧）
  MOM.cart = function (ctx, x, y, w, h, C, o) {
    o = o || {};
    var top = y - h - 3;
    ctx.save();
    rr(ctx, x, top, w, h, 6);
    var g = ctx.createLinearGradient(0, top, 0, top + h);
    if (o.dark) { g.addColorStop(0, rgba(C.graphite, 0.9)); g.addColorStop(1, C.graphite); }
    else { g.addColorStop(0, C.card); g.addColorStop(1, C.bar); }
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite; ctx.stroke();
    // 质量块条纹
    if (o.heavy) {
      ctx.fillStyle = rgba(o.dark ? C.page : C.graphite, 0.18);
      rr(ctx, x + 8, top + 6, w - 16, 6, 2); ctx.fill();
    }
    // 碰撞面
    var face = o.face || 0;   // 1：右侧，-1：左侧
    if (face && o.side) {
      var fx = face > 0 ? x + w : x - 5;
      ctx.fillStyle = o.side === 'velcro' ? C.charge : C.vel;
      rr(ctx, fx, top + h * 0.3, 5, h * 0.4, 1.5); ctx.fill();
    }
    ctx.restore();
    if (o.label) {
      GRAV.draw.text(ctx, o.label, x + w / 2, top + h / 2 + 5, {
        font: 'num', size: 13, color: o.dark ? C.page : C.ink, align: 'center'
      });
    }
    if (o.name) {
      GRAV.draw.text(ctx, o.name, x + w / 2, top - 10, { font: 'sym', size: 16, color: C.graphite, align: 'center' });
    }
  };

  // 速度箭头：从 (x, y) 起，v>0 向右；scale 像素/(m/s)；label 写在箭头上方
  MOM.vArrow = function (ctx, x, y, v, scale, C, label) {
    if (Math.abs(v) < 1e-6) {
      if (label !== false) GRAV.draw.text(ctx, '静止', x, y + 4, { size: 12, color: C.steel, align: 'center' });
      return;
    }
    var len = v * scale;
    GRAV.draw.arrow(ctx, x, y, x + len, y, C.vel, 2);
    if (label) GRAV.draw.text(ctx, label, x + len / 2, y - 8, { font: 'num', size: 12, color: C.vel, align: 'center' });
  };

  // 冰壶（俯视）
  MOM.stone = function (ctx, x, y, r, C, name) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y + r * 0.08, r, 0, TAU); ctx.fillStyle = rgba(C.graphite, 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, C.card); g.addColorStop(1, C.bar);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.strokeStyle = rgba(C.graphite, 0.35); ctx.lineWidth = 1; ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineWidth = r * 0.22; ctx.strokeStyle = C.graphite;
    ctx.beginPath(); ctx.moveTo(x - r * 0.35, y); ctx.lineTo(x + r * 0.35, y); ctx.stroke();
    ctx.restore();
    if (name) GRAV.draw.text(ctx, name, x, y - r - 10, { font: 'sym', size: 16, color: C.graphite, align: 'center' });
  };

  // 冰壶场地的一段（俯视）：冰面、靶心
  MOM.sheet = function (ctx, x0, x1, y, C, houseX, half) {
    half = half || 60;
    ctx.save();
    ctx.fillStyle = rgba(C.vel, 0.05);
    rr(ctx, x0, y - half, x1 - x0, 2 * half, 12); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(C.vel, 0.25); ctx.stroke();
    if (houseX) {
      [half * 0.86, half * 0.6, half * 0.34, half * 0.1].forEach(function (r, i) {
        ctx.beginPath(); ctx.arc(houseX, y, r, 0, TAU);
        ctx.fillStyle = i % 2 ? C.card : rgba(C.vel, 0.16); ctx.fill();
        ctx.strokeStyle = rgba(C.vel, 0.3); ctx.stroke();
      });
    }
    ctx.restore();
  };

  // 摆球：悬点 (px, py)，摆长 L，偏角 th（弧度，向右为正），半径 r
  MOM.bob = function (ctx, px, py, L, th, r, C, o) {
    o = o || {};
    var x = px + L * Math.sin(th), y = py + L * Math.cos(th);
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    if (o.light) { g.addColorStop(0, C.card); g.addColorStop(1, C.bar); }
    else { g.addColorStop(0, rgba(C.graphite, 0.55)); g.addColorStop(1, C.graphite); }
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.restore();
    if (o.name) GRAV.draw.text(ctx, o.name, x, y + r + 18, { font: 'sym', size: 15, color: C.graphite, align: 'center' });
    return { x: x, y: y };
  };

  // ---------- 一维碰撞动画：返回两车左边缘位置 ----------
  // cfg：xA0, xB0（左边缘起点，像素），wA, wB（宽），vA, vB, vA2, vB2（m/s），k（像素/(m/s)/秒），x1（导轨右端）
  // 动画循环：碰前段 + 碰后 2.6 秒 + 停 0.8 秒
  MOM.run = function (t, cfg) {
    var gap = cfg.xB0 - (cfg.xA0 + cfg.wA);
    var rel = (cfg.vA - cfg.vB) * cfg.k;
    var tc = rel > 0 ? gap / rel : 1e9;
    var P = tc + 3.4;
    var tt = t % P;
    var xA, xB, after = tt > tc;
    if (!after) {
      xA = cfg.xA0 + cfg.vA * cfg.k * tt;
      xB = cfg.xB0 + cfg.vB * cfg.k * tt;
    } else {
      var d = Math.min(tt - tc, 2.6);
      var xAc = cfg.xA0 + cfg.vA * cfg.k * tc, xBc = cfg.xB0 + cfg.vB * cfg.k * tc;
      xA = xAc + cfg.vA2 * cfg.k * d;
      xB = xBc + cfg.vB2 * cfg.k * d;
    }
    var lo = cfg.x0 != null ? cfg.x0 + 2 : -1e9, hi = cfg.x1 != null ? cfg.x1 - 2 : 1e9;
    xB = Math.min(xB, hi - cfg.wB);
    xA = Math.max(lo, Math.min(xA, xB - cfg.wA));
    return { xA: xA, xB: xB, after: after, u: tt / P };
  };
})();
