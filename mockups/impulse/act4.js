/* 第 4 幕 · 变力与缓冲：变力的冲量是 F–t 图下的面积，面积除以时间是平均力；鸡蛋落地板和海绵，面积相同、时间长的力小 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  // 三角形推力：峰值 10 N，0.2 s；屏幕慢放 10 倍，面积随时间填出来
  function triangle(ctx, w, h, t, C, beat) {
    var tp = Math.min(t / 10, 0.2);
    IMP.ft(ctx, { x: 8, y: 24, w: Math.min(w - 16, 560), h: h - 40 }, {
      tMax: 0.25, fMax: 12, tTicks: [0, 0.1, 0.2], fTicks: [5, 10],
      curves: [{ pts: [[0, 0], [0.1, 10], [0.2, 0]], upto: tp, label: tp >= 0.2 ? '面积 1 N·s' : null, labelAt: [0.1, 4] }],
      rect: beat >= 3 ? { f: 5, t0: 0, t1: 0.2, label: '平均力 5 N' } : null
    }, C);
  }

  // 鸡蛋：上半两个小场景（地板、海绵），下半两条示意 F–t 曲线（面积相等）
  function eggs(ctx, w, h, t, C, beat) {
    var named = beat >= 2;
    var half = w / 2, gy = h * 0.34, r = Math.max(9, Math.min(13, w * 0.02));
    var T = 1.0, tt = Math.min(t, T + 0.6);
    // 下落：屏幕 1 秒落到底；地板瞬间停，海绵压下去再停
    [0, 1].forEach(function (i) {
      var cx = half * i + half / 2, y0 = 30;
      var fall = Math.min(tt / T, 1), y = y0 + (gy - y0) * fall * fall;
      var squash = 0, press = 0;
      if (tt > T) {
        if (i === 0) squash = 0.5;
        else { press = Math.min(1, (tt - T) / 0.6) * 14; y = gy + press; }
      }
      if (i === 0) IMP.ground(ctx, cx - half * 0.35, cx + half * 0.35, gy, C);
      else { IMP.ground(ctx, cx - half * 0.35, cx + half * 0.35, gy + 24, C); IMP.sponge(ctx, cx - half * 0.3, gy + 24, half * 0.6, 24, C, press); }
      IMP.egg(ctx, cx, Math.min(y, i === 0 ? gy : gy + press), r, C, squash);
      GRAV.draw.text(ctx, i === 0 ? '落在地板上' : '落在海绵上', cx, gy + 52, { size: 14, color: C.ink, align: 'center' });
    });
    // 示意 F–t：A 高而窄，B 矮而宽，面积相等
    var box = { x: 8, y: gy + 70, w: Math.min(w - 16, 560), h: h - gy - 78 };
    IMP.ft(ctx, box, {
      tMax: 1, fMax: 1.2, note: '示意，两块面积相等',
      curves: [
        { pts: [[0.04, 0], [0.09, 1], [0.14, 0]], label: named ? 'A：地板' : 'A', labelAt: [0.09, 1.08] },
        { pts: [[0.04, 0], [0.29, 0.2], [0.54, 0]], dash: [6, 4], label: named ? 'B：海绵' : 'B', labelAt: [0.32, 0.3] }
      ]
    }, C);
  }

  GRAV.act({
    id: 4,
    name: '变力与缓冲',
    tag: '第 4 幕 · 变力与缓冲',
    steps: [
      {
        title: '力不恒定时，冲量怎么算？',
        beats: [
          { say: '真实的推，力不是恒定的：先增大、后减小。这次峰值 10 N，一共 0.2 s（慢放 10 倍）。' },
          { say: '冲量还是 F–t 图下的面积：½ × 0.2 × 10 = 1 N·s。' },
          { say: '换一个恒力，推同样长的时间 0.2 s、产生同样的冲量，这个力多大？' },
          { say: '这个恒力叫平均力：冲量除以作用时间，1 ÷ 0.2 = 5 N。图上虚线矩形和三角形面积相等。' }
        ],
        gateAt: 2,
        button: '同样的冲量，力能小一点吗',
        play: true,
        draw: triangle,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '5 N', correct: true, say: '对。5 N × 0.2 s = 1 N·s，和三角形面积相等。' },
              { html: '10 N', say: '10 N 是峰值。10 N 推 0.2 s 是 2 N·s，比三角形多了一倍。' },
              { html: '2.5 N', say: '2.5 N × 0.2 s = 0.5 N·s，只有三角形的一半。' }
            ],
            hints: ['冲量是 1 N·s，时间是 0.2 s。', '恒力 × 0.2 s = 1 N·s。', '1 ÷ 0.2 = 5 N。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 2; });
        }
      },
      {
        title: '鸡蛋落在哪里不容易碎？',
        beats: [
          { say: '50 g 的鸡蛋从 0.8 m 高处落下，落地前速度 4 m/s。一次落在地板上，一次落在海绵上，都停了下来。' },
          { say: '下面两条 F–t 曲线，哪条是落在海绵上的？' },
          { say: '两次鸡蛋的动量都从 0.2 kg·m/s 变到 0，冲量一样大，所以两块面积相等。' },
          { say: '地板上只用了约 0.002 s，平均力约 100 N，蛋碎了；海绵上用了约 0.1 s，平均力只有约 2 N。' },
          { say: '动量变化一定时，作用时间越长，平均力越小。这就是缓冲：安全气囊、跳远沙坑、接球时手往后撤，都是这个道理。' }
        ],
        gateAt: 1,
        button: '方向反过来呢',
        play: true,
        tall: true,
        draw: eggs,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: 'A：高而窄', say: '海绵软，鸡蛋要陷进去一段才停下，用的时间长。' },
              { html: 'B：矮而宽', correct: true, say: '对。海绵让鸡蛋慢慢停下，时间长，力就小。' }
            ],
            hints: ['落在海绵上，鸡蛋停下用的时间长还是短？', '时间长，曲线就宽。', '面积一样，宽的那条就矮：B。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      }
    ]
  });
})();
