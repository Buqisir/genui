/* 第 5 幕 · 动量和动能：被淘汰的 mv² 和动能有关；子弹与铅球动量相同，动能差 200 倍 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  var B = { m: 0.01, v: 800 }, P = { m: 2, v: 4 };
  function p(o) { return o.m * o.v; }
  function ek(o) { return 0.5 * o.m * o.v * o.v; }

  // 子弹与铅球：上半是题面（两件物体和它们的 m、v，用 17 号字，是题目本身）；
  // 下半讲到第 3 句出动量柱子（一样高），第 4 句出动能柱子（差 200 倍）。柱子出现时 0.6 秒长出来。
  function bullet(ctx, x, y, C) {
    ctx.save();
    ctx.fillStyle = C.graphite;
    ctx.beginPath();
    ctx.moveTo(x - 30, y - 7); ctx.lineTo(x + 8, y - 7);
    ctx.quadraticCurveTo(x + 30, y - 6, x + 34, y);
    ctx.quadraticCurveTo(x + 30, y + 6, x + 8, y + 7);
    ctx.lineTo(x - 30, y + 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = MOM.rgba(C.graphite, 0.25); ctx.fillRect(x - 30, y - 7, 6, 14);
    ctx.restore();
  }
  function ball(ctx, x, y, r, C) {
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, MOM.rgba(C.graphite, 0.55)); g.addColorStop(1, C.graphite);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  }
  function panel(ctx, box, title, rows, f, max, color, unit, grow, C) {
    GRAV.draw.text(ctx, title, box.x + box.w / 2, box.y, { size: 14, color: C.graphite, align: 'center' });
    var base = box.y + box.h - 26, top = box.y + 40, bw = Math.min(40, box.w / 5);
    ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(box.x + 8, base); ctx.lineTo(box.x + box.w - 8, base); ctx.stroke(); ctx.restore();
    rows.forEach(function (r, i) {
      var cx = box.x + box.w * (i ? 0.7 : 0.3), v = f(r.o);
      var hgt = Math.max(2, (base - top) * v / max * grow);
      ctx.fillStyle = color; ctx.fillRect(cx - bw / 2, base - hgt, bw, hgt);
      GRAV.draw.text(ctx, r.name, cx, base + 20, { size: 14, color: C.graphite, align: 'center' });
      if (grow >= 1) GRAV.draw.text(ctx, v.toFixed(0) + ' ' + unit, cx, base - hgt - 8, { font: 'num', size: 14, color: color, align: 'center' });
    });
  }
  function drawCompare(ctx, w, h, t, C, beat, tb) {
    var rows = [{ o: B, name: '子弹', m: '10 g', v: '800 m/s' }, { o: P, name: '铅球', m: '2 kg', v: '4 m/s' }];
    var yI = Math.max(56, h * 0.12);
    rows.forEach(function (r, i) {
      var cx = w * (i ? 0.72 : 0.28);
      if (i) ball(ctx, cx, yI, 26, C); else bullet(ctx, cx, yI, C);
      GRAV.draw.text(ctx, r.name, cx, yI + 58, { size: 17, color: C.ink, align: 'center' });
      GRAV.kit.math(ctx, [{ t: 'm', sym: true }, { t: ' = ' + r.m }], cx, yI + 88, C, { size: 17, color: C.graphite, align: 'center' });
      GRAV.kit.math(ctx, [{ t: 'v', sym: true }, { t: ' = ' + r.v }], cx, yI + 114, C, { size: 17, color: C.graphite, align: 'center' });
    });
    var top = yI + 160, bh = h - top - 8;
    if (bh < 120) return;
    ctx.save(); ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, top - 24); ctx.lineTo(w - 8, top - 24); ctx.stroke(); ctx.restore();
    var g = Math.min(1, tb / 0.6);
    if (beat >= 2) panel(ctx, { x: 0, y: top, w: w / 2, h: bh }, '动量 p', rows, p, 10, C.vel, 'kg·m/s', beat === 2 ? g : 1, C);
    if (beat >= 3) panel(ctx, { x: w / 2, y: top, w: w / 2, h: bh }, '动能 Eₖ', rows, ek, ek(B) * 1.15, C.charge, 'J', beat === 3 ? g : 1, C);
  }

  GRAV.act({
    id: 5,
    name: '动量和动能',
    tag: '第 5 幕 · 动量和动能',
    steps: [
      {
        title: '动量和动能',
        beats: [
          { say: '被淘汰的 mv² 也不是没用：½mv² 就是动能。动量 mv 和动能 ½mv² 都由 m 和 v 决定，它们是一回事吗？' },
          { say: '一颗 10 g 的子弹以 800 m/s 飞行，一个 2 kg 的铅球以 4 m/s 运动。谁的动量大？' },
          { say: '两个都是 8 kg·m/s。' },
          { say: '再算动能：子弹 ' + ek(B).toFixed(0) + ' J，铅球 ' + ek(P).toFixed(0) + ' J，差了 ' + (ek(B) / ek(P)).toFixed(0) + ' 倍。' },
          { say: '动量跟 v 成正比，动能跟 v² 成正比。同样的动量，速度大的那个动能大得多。' }
        ],
        gateAt: 1,
        button: '动量的变化量',
        tall: true,
        draw: drawCompare,
        mount: function (el, api) {
          var box = document.createElement('div');
          box.innerHTML = '<div class="stem">子弹和铅球，谁的动量大？</div>';
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '子弹', say: '子弹快，可它很轻。算一算：0.01 × 800 = ？' },
              { html: '一样大', correct: true, say: '对。0.01 × 800 = 8，2 × 4 = 8。' },
              { html: '铅球', say: '铅球重，可它慢。算一算：2 × 4 = ？' }
            ],
            hints: ['p = mv，质量要换成千克。', '子弹 0.01 kg × 800 m/s，铅球 2 kg × 4 m/s。', '都是 8 kg·m/s，一样大。']
          }, api);
          var wk = GRAV.ui.work(el), shown = 0;
          api.onBeat(function (bt) {
            box.hidden = bt < 1;
            if (bt >= 2 && shown < 1) { wk.line(S('p') + '子弹 = 0.01 × 800 = 8 kg·m/s'); wk.line(S('p') + '铅球 = 2 × 4 = 8 kg·m/s'); shown = 1; }
            if (bt >= 3 && shown < 2) {
              wk.line(S('E') + 'ₖ子弹 = ½ × 0.01 × 800² = ' + ek(B).toFixed(0) + ' J');
              wk.line(S('E') + 'ₖ铅球 = ½ × 2 × 4² = ' + ek(P).toFixed(0) + ' J');
              shown = 2;
            }
          });
        }
      }
    ]
  });
})();
