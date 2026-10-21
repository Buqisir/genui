/* 第 3 幕 · 运动中分离与人船：分离前总动量不为零也守恒（航天器分离）；人船模型：人走船退、人停船停，位移比 = 质量反比 */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  function block(ctx, x, y, bw, bh, C, label) {
    ctx.save(); MOM.rr(ctx, x, y - bh, bw, bh, 5); ctx.fillStyle = C.card; ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore();
    txt(ctx, label, x + bw / 2, y - bh / 2 + 5, { size: 12, color: C.graphite, align: 'center' });
  }

  // 分离：上面分离前（A、B 连在一起），下面分离后（A 在前、B 在后）；第 2 句起画动量柱子
  function separate(ctx, w, h, t, C, beat) {
    RCL.stars(ctx, w, h * 0.6, C);
    var narrow = w < 520, bh = 30, wa = narrow ? 84 : 110, wb = narrow ? 40 : 50;
    var y1 = 62, y2 = 142, x = narrow ? 30 : 60;
    txt(ctx, '分离前', 12, y1 - bh - 10, { size: 12, color: C.steel });
    block(ctx, x, y1, wb, bh, C, 'B 0.5 t');
    block(ctx, x + wb, y1, wa, bh, C, 'A 1.5 t');
    MOM.vArrow(ctx, x + wb + wa + 8, y1 - bh / 2, 7.5, 9, C, '7.5 km/s');
    txt(ctx, '分离后', 12, y2 - bh - 10, { size: 12, color: C.steel });
    block(ctx, x - 6, y2, wb, bh, C, 'B');
    block(ctx, x + wb + 20, y2, wa, bh, C, 'A');
    MOM.vArrow(ctx, x + wb + wa + 28, y2 - bh / 2, 7.6, 9, C, '7.6 km/s');
    if (beat >= 1) MOM.vArrow(ctx, x + wb + 4, y2 + 18, 7.2, 9, C, 'B：7.2 km/s');
    else txt(ctx, 'B：？', x + wb + 4, y2 + 22, { size: 12, color: C.vel });
    txt(ctx, '向右为正', w - 12, 18, { size: 12, color: C.steel, align: 'right' });
    if (beat < 1) return;
    var top = y2 + 40;
    RCL.bars(ctx, { x: 12, y: top, w: Math.min(380, w - 24), h: h - top - 6 }, [
      { label: '分离前', v: 15, ink: true, text: '15' },
      { label: 'A', v: 11.4, text: '11.4' },
      { label: 'B', v: 3.6, text: '3.6' },
      { label: '分离后和', v: 15, ink: true, text: '15' }
    ], C, { max: 18, title: '动量（t·km/s）' });
  }

  // 人船：船长 3 m、120 kg，人 60 kg 从船头（右）走到船尾（左）；第 2 句起播放
  function boat(ctx, w, h, t, C, beat) {
    var gy = h * 0.5, L = Math.min(w * 0.46, 300), m = L / 3;   // 每米多少像素
    var bx0 = w * 0.5 - L / 2 - m * 0.5, T = 3;
    var go = beat >= 1, u = go ? Math.min(t / T, 1) : 0, s = u * u * (3 - 2 * u);
    var bx = bx0 + m * s;   // 船对地向右 1 m
    RCL.water(ctx, 12, w - 12, gy, C);
    // 地面参照：岸边的竖杆（不动）
    ctx.save(); ctx.strokeStyle = C.steel; ctx.setLineDash([3, 3]);
    [bx0, bx0 + L].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, gy - 90); ctx.lineTo(x, gy + 34); ctx.stroke(); });
    ctx.restore();
    txt(ctx, '开始时船尾', bx0, gy + 48, { size: 12, color: C.steel, align: 'center' });
    txt(ctx, '开始时船头', bx0 + L, gy + 48, { size: 12, color: C.steel, align: 'center' });
    RCL.boat(ctx, bx, gy, L, C);
    txt(ctx, '船 120 kg，长 3 m', bx + L / 2, gy + 26, { size: 12, color: C.graphite, align: 'center' });
    var pxc = bx + L - 3 * m * s;   // 人相对船从船头走到船尾（3 m），对地向左 2 m
    CNS.person(ctx, Math.max(bx + 4, Math.min(bx + L - 4, pxc)), gy - 16, 26, C, '60 kg');
    if (go && u > 0.05 && u < 1) {
      MOM.vArrow(ctx, pxc - 6, gy - 86, -1, 24, C, '');
      MOM.vArrow(ctx, bx + L * 0.5, gy + 66, 1, 24, C, '');
    }
    if (u >= 1) {
      GRAV.draw.arrow(ctx, bx0 + L, gy - 100, pxc, gy - 100, C.vel, 1.6);
      txt(ctx, '人 2 m', (bx0 + L + pxc) / 2, gy - 108, { size: 12, color: C.vel, align: 'center' });
      GRAV.draw.arrow(ctx, bx0, gy + 64, bx, gy + 64, C.vel, 1.6);
      txt(ctx, '船 1 m', bx0 + m * 0.5, gy + 82, { size: 12, color: C.vel, align: 'center' });
    }
    txt(ctx, '不计水的阻力', 12, 18, { size: 12, color: C.steel });
  }

  GRAV.act({
    id: 3,
    name: '运动中分离与人船',
    tag: '第 3 幕 · 运动中分离与人船',
    steps: [
      {
        title: '原来就在运动，分开时还守恒吗？',
        beats: [
          { say: '2.0 t 的组合体以 7.5 km/s 飞行，分离成 1.5 t 的 A 和 0.5 t 的 B，A 的速度变成 7.6 km/s，方向不变。B 的速度多大？' },
          { say: '分离前总动量是 2.0 × 7.5 = 15 t·km/s，不是 0。分离时只有 A、B 之间的内力，总动量仍是 15：15 = 1.5 × 7.6 + 0.5v，v = 7.2 km/s。' },
          { say: '原来静止，总动量就是 0；原来在动，总动量就是原来那个值。反冲只是"原来静止"的特例。真题里的航天器分离（江苏 2024、山东 2025）就是这一类。' }
        ],
        gateAt: 0,
        button: '人在船上走',
        tall: true,
        draw: separate,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '7.2 km/s，方向不变', correct: true, say: '对。15 = 1.5 × 7.6 + 0.5v。' },
              { html: '7.4 km/s', say: 'A 快了 0.1 km/s，B 不是慢 0.1：要乘上质量。A 多了 0.15 t·km/s 的动量，B 就少 0.15，速度少 0.3 km/s。' },
              { html: '7.8 km/s', say: '方向弄反了：A 多拿走的动量是从 B 那里来的，B 应该变慢。' },
              { html: '22.8 km/s，向后', say: '这是按"分离前总动量为 0"列的式子。可组合体原来在动，总动量是 15 t·km/s。' }
            ],
            hints: ['分离前的总动量是多少？', '2.0 × 7.5 = 15 t·km/s，分离后仍是 15。', '15 = 1.5 × 7.6 + 0.5v。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            if (bt >= 1 && !shown) {
              shown = true;
              wk.line('2.0 × 7.5 = 1.5 × 7.6 + 0.5' + S('v'));
              wk.line(S('v') + ' = 7.2 km/s');
            }
          });
        }
      },
      {
        title: '人在船上走，船会怎样？',
        beats: [
          { say: '静止在水面上的 120 kg 小船长 3 m，60 kg 的人从船头走到船尾，不计水的阻力。船移动了多远？' },
          { say: '人向左走，船向右退；人停，船也停。每一刻总动量都是 0：60·v人 = 120·v船，所以走过的距离也满足 60·x人 = 120·x船。' },
          { say: '人从船头走到船尾，人和船一共错开一个船长：x人 + x船 = 3 m。两式联立，x船 = 1 m，x人 = 2 m。' }
        ],
        gateAt: 0,
        button: '做一道例题',
        play: true,
        playAt: 1,
        tall: true,
        draw: boat,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '1 m', correct: true, say: '对。60·x人 = 120·x船，x人 + x船 = 3 m。' },
              { html: '0：人在船上走，船不动', say: '水面没有阻力，人往左走时脚向右蹬船，船一定向右退。' },
              { html: '1.5 m', say: '人和船不是平分 3 m：船重，退得少。' },
              { html: '3 m', say: '那是人相对船走过的距离，不是船对地的位移。' },
              { html: '2 m', say: '2 m 是人对地的位移。船是人的两倍重，退的距离是人的一半。' }
            ],
            hints: ['每一刻总动量都是多少？', '0：60·v人 = 120·v船，所以 60·x人 = 120·x船。', '再用 x人 + x船 = 3 m。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = 0;
          api.onBeat(function (bt) {
            if (bt >= 1 && shown < 1) { wk.line('60' + S('x') + '人 = 120' + S('x') + '船', '每一刻总动量为 0'); shown = 1; }
            if (bt >= 2 && shown < 2) { wk.line(S('x') + '人 + ' + S('x') + '船 = 3 m'); wk.line(S('x') + '船 = 1 m，' + S('x') + '人 = 2 m'); shown = 2; }
          });
        }
      }
    ]
  });
})();
