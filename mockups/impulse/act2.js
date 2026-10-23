/* 第 2 幕 · 推小车：两种推法速度一样（推翻"只看力的大小"）；三组数据里找出和 Δp 一致的那一列（FΔt） */
(function () {
  'use strict';
  var S = GRAV.h.sym, f = MOM.f;
  var M = 0.5;   // 小车质量 kg
  var PUSH = [
    { name: '甲', F: 2, t: 0.3 },
    { name: '乙', F: 1, t: 0.6 },
    { name: '丙', F: 3, t: 0.4 }
  ];
  var K = 4;          // 屏幕秒 / 物理秒（慢放 4 倍）
  var TP = 0.9;       // 画到的物理时间

  // 物理时间 tp 时，被推法 p 推动的小车的位移和速度
  function state(p, tp) {
    var a = p.F / M;
    if (tp <= p.t) return { x: 0.5 * a * tp * tp, v: a * tp, pushing: tp > 0 };
    var v = a * p.t;
    return { x: 0.5 * a * p.t * p.t + v * (tp - p.t), v: v, pushing: false };
  }
  function rectPts(p) { return [[0, 0], [0, p.F], [p.t, p.F], [p.t, 0]]; }

  // 两条（或三条）车道 + 下面的 F–t 图
  function lanes(list, holdUpTo) {
    return function (ctx, w, h, t, C, beat) {
      var hold = holdUpTo != null && beat <= holdUpTo;
      var tp = hold ? 0 : Math.min(t / K, TP);
      var x0 = 16, x1 = w - 16, cw = Math.max(60, Math.min(90, w * 0.13)), ch = 30;
      var pxm = (x1 - x0 - cw - 70) / 1.0;   // 像素 / 米
      var laneH = Math.min(70, h * 0.16), top = 40;
      list.forEach(function (p, i) {
        var y = top + i * laneH + 34;
        MOM.track(ctx, x0, x1, y, C);
        // 跑到导轨右端就停在挡板前（丙最快，会先到）
        var s = state(p, tp), cx = Math.min(x0 + 50 + s.x * pxm, x1 - cw - 70);
        MOM.cart(ctx, cx, y, cw, ch, C, { label: M + ' kg' });
        GRAV.draw.text(ctx, '推法' + p.name, x0, y - ch - 12, { size: 14, color: C.ink });
        if (s.pushing) IMP.force(ctx, cx - 34, y - ch / 2 - 3, cx - 4, y - ch / 2 - 3, C, p.F + ' N', 'left');
        if (tp >= TP - 1e-9 || (!hold && s.v > 0 && !s.pushing)) {
          GRAV.draw.text(ctx, f(s.v, 2) + ' m/s', cx + cw + 8, y - ch / 2 + 2, { font: 'num', size: 14, color: C.vel });
        }
      });
      var gy = top + list.length * laneH + 40;
      var done = tp >= TP - 1e-9;
      IMP.ft(ctx, { x: x0, y: gy, w: Math.min(x1 - x0, 520), h: h - gy - 8 }, {
        tMax: TP, fMax: 3.5, tTicks: [0, 0.3, 0.6, 0.9], fTicks: [1, 2, 3],
        curves: list.map(function (p, i) {
          return {
            pts: rectPts(p), upto: tp, dash: i === 1 ? [6, 4] : (i === 2 ? [2, 3] : []), alpha: 0.12,
            label: done ? p.name + '：' + f(p.F * p.t, 1) + ' N·s' : p.name,
            labelAt: [i === 1 ? 0.45 : p.t / 2, p.F + 0.25]
          };
        })
      }, C);
    };
  }

  // 预测：选了就锁定，不判对错
  var GUESS = ['推法甲（2 N，0.3 s）', '推法乙（1 N，0.6 s）', '一样大'];
  function mountGuess(el, api) {
    var box = document.createElement('div');
    box.className = 'opts';
    var btns = GUESS.map(function (g) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt';
      b.innerHTML = '<span class="opt-html">' + g + '</span><span class="mark" aria-hidden="true"></span>';
      b.addEventListener('click', function () {
        if (GRAV.state.push) return;
        GRAV.state.push = g;
        lock();
        api.me('我猜「' + g + '」');
        api.say('记下了，不能再改。推一下看看。');
        api.open();
      });
      box.appendChild(b);
      return b;
    });
    function lock() {
      btns.forEach(function (b, i) {
        b.disabled = true;
        if (GUESS[i] === GRAV.state.push) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
      });
    }
    if (GRAV.state.push) { lock(); api.open(); }
    api.onBeat(function (bt) { box.hidden = bt < 1; });
    el.appendChild(box);
  }

  GRAV.act({
    id: 2,
    name: '推小车',
    tag: '第 2 幕 · 推小车',
    steps: [
      {
        title: '哪次推完，小车更快？',
        beats: [
          { say: '气垫导轨上同一辆小车，0.5 kg，静止。推法甲：用 2 N 的力推 0.3 s；推法乙：用 1 N 的力推 0.6 s。' },
          { say: '哪次推完，小车的速度大？选了就不能改。' },
          { say: '看结果（慢放 4 倍）。下面是两次推力的 F–t 图。' },
          {
            say: function () {
              var g = GRAV.state.push;
              var head = '两次推完都是 1.20 m/s，一样快。';
              if (!g) return head;
              return head + (g === GUESS[2] ? '你猜对了。' : '你猜的是「' + g + '」，和实际不一样。');
            }
          },
          { say: '力大不一定推得快：甲的力是乙的 2 倍，可乙推的时间是甲的 2 倍。"动量变化只看力的大小"不成立。' }
        ],
        gateAt: 1,
        button: '再看一组数据',
        play: true,
        playAt: 2,
        tall: true,
        draw: lanes(PUSH.slice(0, 2), 1),
        mount: mountGuess
      },
      {
        title: '哪一列和 Δp 一致？',
        beats: [
          { say: '再加推法丙：3 N 推 0.4 s。三次的数据列在右边，Δp 是测出来的动量变化。' },
          { say: '力、时间、力乘时间，哪一列和 Δp 一致？' },
          { say: 'FΔt 一列逐行都和 Δp 相等。在 F–t 图上，FΔt 就是那块矩形的面积。' },
          { say: '动量的变化 = 力 × 作用时间。这是巧合，还是必然？' }
        ],
        gateAt: 1,
        button: '推导一下',
        play: true,
        tall: true,
        draw: lanes(PUSH),
        mount: function (el, api) {
          var tb = document.createElement('table');
          tb.className = 'dt';
          tb.innerHTML = '<tr><th>推法</th><th>' + S('F') + '（N）</th><th>Δ' + S('t') + '（s）</th><th class="ft-col">' + S('F') + 'Δ' + S('t') + '（N·s）</th><th>Δ' + S('p') + '（kg·m/s）</th></tr>' +
            PUSH.map(function (p) {
              return '<tr><td>' + p.name + '</td><td>' + p.F + '</td><td>' + p.t + '</td><td class="ft-col">' + f(p.F * p.t, 1) + '</td><td>' + f(M * p.F / M * p.t, 1) + '</td></tr>';
            }).join('') + '</table>';
          el.appendChild(tb);
          var box = document.createElement('div');
          box.className = 'q-gap';
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: S('F') + '（力）', say: '甲 2 N、乙 1 N，Δp 却一样，对不上。' },
              { html: 'Δ' + S('t') + '（时间）', say: '乙 0.6 s、丙 0.4 s，Δp 却是丙大，对不上。' },
              { html: S('F') + 'Δ' + S('t'), correct: true, say: '对。0.6、0.6、1.2，逐行和 Δp 相等。' }
            ],
            hints: ['逐行比一比，哪一列的数和 Δp 一模一样？', '力乘时间：2 × 0.3、1 × 0.6、3 × 0.4。', 'FΔt 一列。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; tb.classList.toggle('hl-ft', bt >= 2); });
        }
      }
    ]
  });
})();
