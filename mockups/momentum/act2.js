/* 第 2 幕 · 猜想：等质量钢球（猜想 v 之和不变）→ 重球撞轻球（推翻，留下 mv、mv²） */
(function () {
  'use strict';

  var TH0 = 0.5;          // A 放手的偏角（弧度）
  var Q = 1.4;            // 四分之一周期（屏幕秒）

  // 一维弹性碰撞后的速度比（以 A 碰前速度为 1）
  function after(ratio) {   // ratio = mA / mB
    var v = MOM.collide(ratio, 1, 1, 0, 1);
    return { a: v[0], b: v[1] };
  }

  // 摆的一次碰撞：A 从 TH0 摆下（Q 秒），碰后 A、B 按速度比摆出去再摆回（2Q 秒），停 0.8 秒后重来
  function pend(ctx, w, h, t, C, ratio, labelB) {
    var L = Math.min(h * 0.62, 320, w * 0.4), r = Math.max(14, Math.min(24, w * 0.03));
    var py = h * 0.16, cx = w * 0.5;
    var pA = cx - r, pB = cx + r;            // 两个悬点，静止时两球相切
    var v = after(ratio);
    var P = 3 * Q + 0.8, tt = t % P;
    var thA, thB;
    if (tt < Q) {
      thA = -TH0 * Math.cos(Math.PI / 2 * tt / Q); thB = 0;
    } else if (tt < 3 * Q) {
      var s = Math.sin(Math.PI / 2 * (tt - Q) / Q);
      thA = TH0 * v.a * s; thB = TH0 * v.b * s;
    } else { thA = 0; thB = 0; }
    // 支架
    ctx.save();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - L * 0.9, py); ctx.lineTo(cx + L * 0.9, py); ctx.stroke();
    ctx.restore();
    // 高度参考线：A 放手的高度、B 摆到的最高点
    var hA = py + L * Math.cos(TH0);
    ctx.save();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - L * 0.95, hA); ctx.lineTo(cx + L * 0.95, hA); ctx.stroke();
    var thBmax = Math.min(1.2, TH0 * v.b), hB = py + L * Math.cos(thBmax);
    if (Math.abs(hB - hA) > 2) {
      ctx.strokeStyle = MOM.rgba(C.vel, 0.6);
      ctx.beginPath(); ctx.moveTo(cx, hB); ctx.lineTo(cx + L * 0.95, hB); ctx.stroke();
    }
    ctx.restore();
    GRAV.kit.label(ctx, 'A 放手的高度', cx - L * 0.95, hA - 6, C);
    if (Math.abs(hB - hA) > 2) GRAV.draw.text(ctx, 'B 摆到的高度', cx + L * 0.95, hB - 6, { size: 12, color: C.vel, align: 'right' });
    MOM.bob(ctx, pA, py, L, thA, ratio > 1 ? r * 1.15 : r, C, { name: 'A' });
    MOM.bob(ctx, pB, py, L, thB, ratio > 1 ? r * 0.85 : r, C, { name: labelB, light: ratio > 1 });
  }

  function chips(el, api) {
    var list = [
      { t: 'm + v', keep: false, say: '质量和速度单位不同，不能相加。' },
      { t: 'v / m', keep: false, say: '这样质量越大越不重要。可重球几乎不减速，说明它更"有分量"，方向反了。' },
      { t: 'mv', keep: true, say: '留下。质量乘进去，重的球速度变得少、轻的球速度变得多，正好对得上。' },
      { t: 'mv²', keep: true, say: '留下。这个组合在动能里见过，也值得一试。' }
    ];
    var done = 0, wrap = document.createElement('div');
    var box = document.createElement('div');
    box.className = 'chips';
    var wk = GRAV.ui.work(wrap);
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = c.t;
      b.addEventListener('click', function () {
        if (b.disabled) return;
        b.disabled = true; b.classList.add(c.keep ? 'keep' : 'drop');
        api.me('「' + c.t + '」呢？');
        api.say(c.say);
        if (++done === list.length) {
          api.say('两个猜想都和演示不矛盾。要分出谁对，只看现象不够了，得测数字。');
          wk.line('猜想 2：' + GRAV.h.sym('mv') + ' 之和不变？');
          wk.line('猜想 3：' + GRAV.h.sym('mv') + '² 之和不变？');
          api.open();
        }
      });
      box.appendChild(b);
    });
    wrap.insertBefore(box, wrap.firstChild);
    api.onBeat(function (bt) { wrap.hidden = bt < 4; });
    el.appendChild(wrap);
  }

  GRAV.act({
    id: 2,
    name: '提出猜想',
    tag: '第 2 幕 · 提出猜想',
    steps: [
      {
        title: '两只一样的钢球',
        beats: [
          { say: '把钢球 A 拉起来放手，让它撞静止的钢球 B。两球一样重。' },
          { say: '碰后 A 停住，B 摆起的高度和 A 放手时一样高。' },
          { say: '摆起一样高，说明 B 碰后的速度和 A 碰前的速度一样大。' },
          { say: '于是可以猜：碰撞前后，速度之和不变。' },
          { say: '这对所有碰撞都成立吗？换两个不一样重的球试试。' }
        ],
        button: '换一对球',
        draw: function (ctx, w, h, t, C) { pend(ctx, w, h, t, C, 1, 'B'); },
        mount: function (el, api) {
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            if (bt >= 3 && !shown) { wk.line('猜想 1：' + GRAV.h.sym('v') + ' 之和不变？'); shown = true; }
          });
        }
      },
      {
        title: '重球撞轻球',
        beats: [
          { say: '换成钢球 A 撞一个轻得多的塑料球 B。A 的质量是 B 的 3 倍。' },
          { say: '碰后 B 摆得比 A 放手时还高，A 也没停住，还在往前摆。' },
          { say: '按速度算：碰前只有 A 在动，速度记作 v；碰后 A 约 0.5v，B 约 1.5v。速度之和变成了 2v，猜想 1 不成立。' },
          { say: '可见质量也要算进去：重的球速度变得少，轻的球速度变得多。' },
          { say: '下面四种组合，哪些值得留下来检验？逐个点一下。' }
        ],
        gateAt: 4,
        button: '去测数字',
        draw: function (ctx, w, h, t, C) { pend(ctx, w, h, t, C, 3, 'B（塑料）'); },
        mount: function (el, api) {
          var wk = GRAV.ui.work(el), shown = false;
          var v = after(3);
          api.onBeat(function (bt) {
            if (bt >= 2 && !shown) {
              shown = true;
              wk.line('碰前 ' + GRAV.h.sym('v') + ' 之和 = ' + GRAV.h.sym('v'));
              wk.line('碰后 = ' + v.a.toFixed(1) + GRAV.h.sym('v') + ' + ' + v.b.toFixed(1) + GRAV.h.sym('v') + ' = ' + (v.a + v.b).toFixed(0) + GRAV.h.sym('v'), '猜想 1 不成立');
            }
          });
          chips(el, api);
        }
      }
    ]
  });
})();
