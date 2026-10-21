/* 第 6 幕 · 练习：示范例题（广东 2024 第 14 题第 2 问，原题）→ 蹦床（改编，L3）→ 窗帘滑块（广东 2023 第 10 题，改单选，L2） */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  // 头锤、气囊和三角形 F–t（峰值 6600 N，0.1 s）
  function airbag(ctx, w, h, t, C) {
    var cx = Math.min(Math.max(w * 0.32, 130), 170), gy = h * 0.42, bw = 110;   // 左边留出尺寸线文字的位置
    IMP.ground(ctx, cx - 80, cx + 80, gy, C);
    ctx.save();
    MOM.rr(ctx, cx - bw / 2, gy - 34, bw, 34, 16);
    ctx.fillStyle = MOM.rgba(C.charge, 0.2); ctx.fill(); ctx.strokeStyle = MOM.rgba(C.charge, 0.7); ctx.stroke();
    ctx.restore();
    GRAV.draw.text(ctx, '气囊', cx + bw / 2 + 8, gy - 12, { size: 14, color: C.graphite });
    var hy = 50;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, hy, 16, 0, Math.PI * 2); ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
    GRAV.draw.text(ctx, '头锤 30 kg', cx + 24, hy + 5, { size: 14, color: C.ink });
    IMP.dim(ctx, cx - 40, hy, gy - 34, C, 'H = 3.2 m');
    IMP.ft(ctx, { x: 8, y: gy + 24, w: Math.min(w - 16, 520), h: h - gy - 32 }, {
      tMax: 0.12, fMax: 7500, tTicks: [0, 0.05, 0.1], fTicks: [6600],
      curves: [{ pts: [[0, 0], [0.05, 6600], [0.1, 0]], label: '图丙', labelAt: [0.075, 4500] }]
    }, C);
  }

  // 蹦床：运动员（简化成方块）、两条高度线
  function trampoline(ctx, w, h, t, C) {
    var cx = Math.min(w * 0.45, 220), ty = h * 0.82, tw = 160;
    IMP.ground(ctx, cx - tw / 2 - 20, cx + tw / 2 + 20, ty + 30, C);
    IMP.trampoline(ctx, cx - tw / 2, ty, tw, C, 0);
    var y32 = ty - (ty - 40) * 1, y18 = ty - (ty - 40) * 1.8 / 3.2;
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.steel;
    ctx.beginPath(); ctx.moveTo(cx - 40, y32); ctx.lineTo(cx + 120, y32); ctx.moveTo(cx - 40, y18); ctx.lineTo(cx + 120, y18); ctx.stroke(); ctx.restore();
    GRAV.draw.text(ctx, '下落起点 3.2 m', cx + 124, y32 + 4, { size: 12, color: C.steel });
    GRAV.draw.text(ctx, '弹回 1.8 m', cx + 124, y18 + 4, { size: 12, color: C.steel });
    ctx.save(); MOM.rr(ctx, cx - 16, y32 - 2, 32, 40, 6); ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
    GRAV.draw.text(ctx, '60 kg', cx, y32 + 24, { font: 'num', size: 12, color: C.page, align: 'center' });
    GRAV.draw.arrow(ctx, cx - 30, y32 + 10, cx - 30, ty - 20, C.vel, 1.5);
    GRAV.draw.text(ctx, '接触 0.7 s', cx, ty + 22, { size: 12, color: C.steel, align: 'center' });
  }

  // 窗帘滑轨：滑块 1 被恒力 F 推着撞静止的滑块 2
  function curtain(ctx, w, h, t, C) {
    var y = h * 0.45, x0 = 24, x1 = w - 24, bw = 54;
    MOM.track(ctx, x0, x1, y, C);
    var xa = w * 0.25, xb = xa + bw + 40;
    MOM.cart(ctx, xa, y, bw, 32, C, { name: '1', label: '1 kg' });
    MOM.cart(ctx, xb, y, bw, 32, C, { name: '2', label: '1 kg' });
    IMP.force(ctx, xa - 46, y - 19, xa - 4, y - 19, C, 'F', 'left');
    MOM.vArrow(ctx, xa + bw / 2, y + 30, 0.4, 120, C, '0.40 m/s');
    GRAV.draw.text(ctx, '静止', xb + bw / 2, y + 34, { size: 12, color: C.steel, align: 'center' });
    GRAV.draw.text(ctx, '碰撞 0.04 s，碰后两块一起 0.22 m/s', x0, y + 70, { size: 12, color: C.steel });
  }

  function section(el, label) {
    var d = document.createElement('div');
    d.className = 'ex-sec';
    d.innerHTML = '<div class="ex-l">' + label + '</div>';
    el.appendChild(d);
    return d;
  }

  GRAV.act({
    id: 6,
    name: '练习',
    tag: '第 6 幕 · 练习',
    steps: [
      {
        title: '例题：安全气囊测试（2024 广东卷）',
        beats: [
          { say: '先看一道高考原题，完整走一遍。题目在右边。' },
          { say: '策略：列动量定理时，合力里有哪些力？' },
          { say: '解答①：F 的冲量是三角形的面积，½ × 0.1 × 6600 = 330 N·s，竖直向上。' },
          { say: '解答②：头锤落到气囊时 v₀ = √(2gH) = 8 m/s。取向上为正：I_F − Mgt = Mv − (−Mv₀)，330 − 30 = 30v + 240，v = 2 m/s，上升高度 h = v²/2g = 0.2 m。' },
          { say: '讨论：重力的冲量只有 30 N·s，比气囊的 330 N·s 小一个数量级，可丢了它，算出来 v = 3 m/s、h = 0.45 m，就错了。' }
        ],
        gateAt: 1,
        button: '自己做一道',
        draw: airbag,
        mount: function (el, api) {
          var s1 = section(el, '情境 · 2024 年广东卷第 14 题第（2）问');
          s1.insertAdjacentHTML('beforeend', '<div class="stem">在安全气囊的性能测试中，可视为质点的头锤从离气囊表面高度为 H 处做自由落体运动，与正下方的气囊发生碰撞。以头锤到气囊表面为计时起点，气囊对头锤竖直方向作用力 F 随时间 t 的变化规律，可近似用图丙所示的图像描述。已知头锤质量 M = 30 kg，H = 3.2 m，重力加速度大小取 g = 10 m/s²。求：①碰撞过程中 F 的冲量大小和方向；②碰撞结束后头锤上升的最大高度。</div>');
          var s2 = section(el, '策略');
          var box = document.createElement('div');
          s2.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '只有气囊的力 ' + S('F'), say: '碰撞时头锤还受重力，合力是 F 和重力一起。' },
              { html: S('F') + ' 和重力 ' + S('Mg'), correct: true, say: '对。合力是 F − Mg（向上为正）。' },
              { html: S('F') + '、重力和下落的冲力', say: '"冲力"不是一个单独的力。头锤只受气囊的力和重力。' }
            ],
            hints: ['碰撞的 0.1 s 里，头锤受到哪几个力？', '气囊向上推它，地球向下拉它。', 'F 和重力 Mg。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var s3 = section(el, '解答'), w3 = GRAV.ui.work(s3);
          var s4 = section(el, '讨论'), w4 = GRAV.ui.work(s4);
          var shown = 0;
          api.onBeat(function (bt) {
            s2.hidden = bt < 1; s3.hidden = bt < 2; s4.hidden = bt < 4;
            if (bt >= 2 && shown < 1) { w3.line('① ' + S('I') + '_F = ½ × 0.1 × 6600 = 330 N·s', '竖直向上'); shown = 1; }
            if (bt >= 3 && shown < 2) {
              w3.line('② ' + S('v') + '₀ = √(2' + S('gH') + ') = 8 m/s');
              w3.line('330 − 30 × 10 × 0.1 = 30' + S('v') + ' − 30 × (−8)');
              w3.line(S('v') + ' = 2 m/s，' + S('h') + ' = ' + S('v') + '²/2' + S('g') + ' = 0.2 m');
              shown = 2;
            }
            if (bt >= 4 && shown < 3) { w4.line('丢了重力：' + S('v') + ' = 3 m/s，' + S('h') + ' = 0.45 m', '错'); shown = 3; }
          });
        }
      },
      {
        title: '蹦床：蹦床对人的平均作用力',
        beats: [{ say: '60 kg 的运动员从离蹦床 3.2 m 高处下落，被弹回到离蹦床 1.8 m 高处，与蹦床接触 0.7 s。蹦床对运动员的平均作用力多大？（g = 10 m/s²）' }],
        gateAt: 0,
        button: '再做一道',
        tall: true,
        draw: trampoline,
        mount: function (el, api) {
          var st = document.createElement('div');
          st.className = 'stem';
          st.textContent = '60 kg 的运动员从离蹦床 3.2 m 高处下落，被弹回到离蹦床 1.8 m 高处，与蹦床接触 0.7 s。蹦床对运动员的平均作用力多大？（g = 10 m/s²）';
          el.appendChild(st);
          GRAV.ui.choice(el, {
            options: [
              { html: '1800 N', correct: true, say: '对。落下 8 m/s，弹起 6 m/s；(N − 600) × 0.7 = 60 × (6 + 8)，N = 1800 N。' },
              { html: '1200 N', say: '1200 N 是合力。蹦床的力还要顶住 600 N 的重力。' },
              { html: '约 770 N', say: '速率直接相减了：方向相反，动量变化是 60 × (6 + 8)。' },
              { html: '600 N', say: '这只是重力。运动员被弹回去，蹦床的力比重力大得多。' }
            ],
            hints: ['先求落到蹦床和离开蹦床时的速度。', '8 m/s 向下，6 m/s 向上；取向上为正。', '(N − 600) × 0.7 = 60 × 6 − 60 × (−8)。']
          }, api);
        }
      },
      {
        title: '窗帘滑块：滑块 2 受到的力（2023 广东卷）',
        beats: [{ say: '这道选自 2023 年广东卷第 10 题，原题是多选，这里只问其中一问：滑块 2 受到滑块 1 的平均作用力多大？' }],
        gateAt: 0,
        button: '收束',
        draw: curtain,
        mount: function (el, api) {
          var st = document.createElement('div');
          st.className = 'stem';
          st.textContent = '多个质量均为 1 kg 的滑块可在水平滑轨上滑动，忽略阻力。开窗帘过程中，电机对滑块 1 施加一个水平向右的恒力 F，推动滑块 1 以 0.40 m/s 的速度与静止的滑块 2 碰撞，碰撞时间为 0.04 s，碰撞结束后瞬间两滑块的共同速度为 0.22 m/s。滑块 2 受到滑块 1 的平均作用力大小为多少？';
          el.appendChild(st);
          GRAV.ui.choice(el, {
            options: [
              { html: '5.5 N', correct: true, say: '对。对滑块 2：FΔt = 1 × 0.22，F = 0.22 ÷ 0.04 = 5.5 N。' },
              { html: '10 N', say: '用了滑块 1 碰前的速度。滑块 2 是从 0 变到 0.22 m/s。' },
              { html: '4.5 N', say: '这是滑块 1 的冲量 0.18 N·s 除以时间。题目问的是滑块 2。' },
              { html: '0.22 N', say: '0.22 是冲量（N·s），还要除以时间 0.04 s。' }
            ],
            hints: ['只看滑块 2：它的动量从多少变到多少？', 'Δp = 1 × 0.22 = 0.22 kg·m/s。', 'F = 0.22 ÷ 0.04 = 5.5 N。']
          }, api);
        }
      }
    ]
  });
})();
