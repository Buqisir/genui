/* 第 7 幕 · 小测与作业：7 道单选，按 L1 → L2 → L3 排；记录第一次是否答对，按目标给出回看链接；最后是分两层的作业 */
(function () {
  'use strict';

  var Qs = [
    {
      goal: 0,
      title: '碰后分开了（L1）',
      stem: '两物体碰后分开，测得总动能比碰前少了 10%。这次碰撞是？',
      options: [
        { html: '弹性碰撞：碰后分开了', say: '分开不等于弹性。总动能少了，就不是弹性碰撞。' },
        { html: '非弹性碰撞', correct: true, say: '对。总动能减少、碰后没有粘在一起：非弹性碰撞。' },
        { html: '完全非弹性碰撞', say: '完全非弹性是碰后粘在一起。这两个物体分开了。' },
        { html: '动量不守恒', say: '题目没说有外力。碰撞类型看的是动能，不是动量。' }
      ],
      hints: ['分类看总动能的结局。', '总动能少了，碰后又没粘住。', '非弹性碰撞。']
    },
    {
      goal: 0,
      title: '损失的动能去哪了（L1）',
      stem: '完全非弹性碰撞中损失的动能',
      options: [
        { html: '消失了，能量不守恒', say: '能量不会消失。碰撞面发热、形变，还有声音。' },
        { html: '转化为内能等其他形式的能，总能量守恒', correct: true, say: '对。动能少了，内能多了，总能量不变。' },
        { html: '转化成了动量', say: '动量和能量是两个不同的量，不能互相转化。动量本来就守恒。' },
        { html: '仍以动能的形式存在', say: '碰后的总动能确实变小了，少掉的部分变成了别的能量。' }
      ],
      hints: ['碰撞时碰撞面会怎样？', '会发热、形变，还有声音。', '变成了内能，总能量守恒。']
    },
    {
      goal: 2,
      title: '台球（L1）',
      stem: '台球的母球以 2 m/s 正碰静止的、质量相同的目标球，碰撞看作弹性碰撞。碰后',
      options: [
        { html: '母球停下，目标球以 2 m/s 前进', correct: true, say: '对。一样重的弹性正碰，交换速度。' },
        { html: '两球各以 1 m/s 前进', say: '动量对了，动能却只剩一半，那是粘住的结果。' },
        { html: '母球以 2 m/s 弹回，目标球不动', say: '动量从 +2m 变成 −2m，不守恒。' },
        { html: '两球一起以 1 m/s 前进', say: '一起走是粘住了，台球不会粘住。' }
      ],
      hints: ['两球质量相同，碰撞是弹性的。', '想想第 3 幕一样重的两车。', '交换速度。']
    },
    {
      goal: 1,
      title: '粘住损失多少动能（L2）',
      stem: '光滑水平面上，1 kg 的小车以 6 m/s 撞静止的 2 kg 小车，碰后粘在一起。损失了多少动能？',
      options: [
        { html: '12 J', correct: true, say: '对。共同速度 1 × 6 ÷ 3 = 2 m/s；动能 18 J → 6 J，损失 12 J。' },
        { html: '18 J', say: '粘住不等于动能全部损失：两车还以 2 m/s 一起走。' },
        { html: '6 J', say: '6 J 是碰后剩下的动能，问的是损失了多少。' },
        { html: '0', say: '动量守恒不等于动能守恒。粘在一起，动能一定减少。' }
      ],
      hints: ['先用动量守恒求共同速度。', '1 × 6 = 3v，v = 2 m/s。', '碰前 18 J，碰后 ½ × 3 × 2² = 6 J。']
    },
    {
      goal: 1,
      title: '判断碰撞类型（L2）',
      stem: '光滑水平面上，2 kg 的 A 以 3 m/s 撞静止的 1 kg 的 B，碰后 A 以 1 m/s、B 以 4 m/s 沿原方向运动。这次碰撞是？',
      options: [
        { html: '弹性碰撞', correct: true, say: '对。动量 6 = 2 + 4；动能 9 J → 1 J + 8 J = 9 J，不变。' },
        { html: '非弹性碰撞：A 变慢了', say: 'A 变慢了，可 B 获得了动能。看总动能：9 J → 1 J + 8 J。' },
        { html: '完全非弹性碰撞', say: '两者碰后速度不同，没有粘在一起。' },
        { html: '动量不守恒', say: '算一算：2 × 3 = 6，2 × 1 + 1 × 4 = 6，守恒。' }
      ],
      hints: ['算碰前、碰后的总动能。', '碰前 ½ × 2 × 3² = 9 J。', '碰后 ½ × 2 × 1² + ½ × 1 × 4² = 9 J。']
    },
    {
      goal: 2,
      title: '轻的撞重的（L2）',
      stem: '光滑水平面上，0.1 kg 的小球以 5 m/s 弹性正碰静止的 0.4 kg 小球。碰后 0.1 kg 的小球',
      options: [
        { html: '以 3 m/s 被弹回', correct: true, say: '对。v₁′ = (0.1 − 0.4)/(0.1 + 0.4) × 5 = −3 m/s。' },
        { html: '停下', say: '停下只在一样重时发生。代公式：(0.1 − 0.4)/0.5 × 5 = −3 m/s。' },
        { html: '以 1 m/s 继续向前', say: '轻的撞重的，轻的会被弹回。代公式算一算。' },
        { html: '以 5 m/s 被弹回', say: '原速弹回是撞墙（质量极大）的情况。0.4 kg 不算极大。' }
      ],
      hints: ['用弹性碰撞的公式。', 'v₁′ = (m₁ − m₂)v₁/(m₁ + m₂)。', '(0.1 − 0.4)/0.5 × 5 = −3 m/s。']
    },
    {
      goal: 2,
      title: '挑战：相向的弹性碰撞（L3）',
      stem: '光滑水平面上，两个相同的滑块相向运动，A 以 2 m/s 向右，B 以 1 m/s 向左，发生弹性碰撞。碰后（改编自 2024 年广东卷第 10 题的结论）',
      options: [
        { html: 'A 以 1 m/s 向左，B 以 2 m/s 向右', correct: true, say: '对。取向右为正，每千克算：动量 2 − 1 = 1 → −1 + 2 = 1，动能 2.5 J → 2.5 J。一样重的弹性碰撞，交换速度。' },
        { html: 'A 停下，B 以 2 m/s 向右', say: '这是套了"被碰的静止"的结论。检查动量：碰前 2 − 1 = 1，碰后 2，不守恒（每千克）。' },
        { html: '两者都以 0.5 m/s 向右', say: '动量对了，可两者一起走是粘住的结果，动能少了。' },
        { html: 'A 以 2 m/s 向左，B 以 1 m/s 向右', say: '各自原速弹回？检查动量：碰前 +1，碰后 −2 + 1 = −1，不守恒（每千克）。' }
      ],
      hints: ['取向右为正，B 的速度是 −1 m/s。', '一样重的弹性碰撞会怎样？', '交换速度：A 得到 −1，B 得到 +2。']
    }
  ];

  var GOALS = [
    { name: '区分三种碰撞', act: 1 },
    { name: '由数据判断类型、算动能损失', act: 5 },
    { name: '求弹性正碰的碰后速度', act: 4 }
  ];

  var HOMEWORK = [
    { tag: '必做 1 · L1', q: '光滑水平面上，0.5 kg 的小车以 4 m/s 撞静止的 1.5 kg 小车，碰后粘在一起。求共同速度和损失的动能。', a: '1 m/s；动能 4 J → 1 J，损失 3 J。' },
    { tag: '必做 2 · L2', q: '光滑水平面上，1 kg 的小球以 6 m/s 弹性正碰静止的 2 kg 小球。求碰后两球的速度，并验证动能不变。', a: '1 kg 的以 2 m/s 弹回，2 kg 的以 4 m/s 前进；18 J = 2 J + 16 J。' },
    { tag: '必做 3 · L2', q: '光滑水平面上，2 kg 的 A 以 4 m/s 撞静止的、同样 2 kg 的 B，碰后 A 以 1 m/s、B 以 3 m/s 沿原方向运动。判断碰撞类型，求损失的动能。', a: '非弹性碰撞；16 J → 10 J，损失 6 J。一样重也不一定交换速度：交换速度只在弹性碰撞时发生。' },
    { tag: '选做 · L3', q: '（2023 年广东卷第 15 题的碰撞部分）质量 2m 的 B 以 2v₀ 与静止的、质量 m 的 A 正碰，碰撞中损失的能量是碰前总动能的 1/4。求碰后 A、B 的速度。', a: 'v_A = 2v₀，v_B = v₀。动量 4v₀ = 2v_B + v_A；动能 3v_B² − 8v₀v_B + 5v₀² = 0，解得 v_B = v₀ 或 5v₀/3。后一组 v_A = 2v₀/3 比后面的 B 还慢，B 会穿过 A，舍去。' }
  ];

  function rec() {
    if (!GRAV.state.quiz) GRAV.state.quiz = {};
    return GRAV.state.quiz;
  }

  // 碰前示意图（静态）：kind 'cart' 滑块/小车，'ball' 球；每个物体 {name, m（质量文字）, v（m/s，向右为正）, r（球半径）}
  var PRE = {
    2: { kind: 'ball', o: [{ name: '母球', m: 'm', v: 2, r: 30 }, { name: '目标球', m: 'm', v: 0, r: 30 }] },
    3: { kind: 'cart', o: [{ m: '1 kg', v: 6, w: 84 }, { m: '2 kg', v: 0, w: 104 }] },
    4: { kind: 'cart', o: [{ name: 'A', m: '2 kg', v: 3, w: 104 }, { name: 'B', m: '1 kg', v: 0, w: 84 }] },
    5: { kind: 'ball', o: [{ m: '0.1 kg', v: 5, r: 30 }, { m: '0.4 kg', v: 0, r: 44 }] },
    6: { kind: 'cart', o: [{ name: 'A', m: 'm', v: 2, w: 92 }, { name: 'B', m: 'm', v: -1, w: 92 }] }
  };
  function ball(ctx, x, y, r, C, o) {
    var rgba = MOM.rgba;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y + r * 0.08, r, 0, Math.PI * 2); ctx.fillStyle = rgba(C.graphite, 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, C.card); g.addColorStop(1, C.bar);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = C.graphite; ctx.stroke();
    ctx.restore();
    GRAV.draw.text(ctx, o.m, x, y + 5, { font: 'num', size: 14, color: C.ink, align: 'center' });
    if (o.name) GRAV.draw.text(ctx, o.name, x, y - r - 10, { font: 'sym', size: 14, color: C.graphite, align: 'center' });
  }
  function preDraw(cfg) {
    return function (ctx, w, h, t, C) {
      var os = cfg.o, n = os.length, vmax = 0, i;
      os.forEach(function (o) { vmax = Math.max(vmax, Math.abs(o.v)); });
      var sc = Math.min(130, w * 0.2) / vmax;
      var ball_ = cfg.kind === 'ball', rmax = 0;
      os.forEach(function (o) { rmax = Math.max(rmax, o.r || 0); });
      var y = ball_ ? h * 0.4 : h * 0.42;
      var cx = [w * 0.26, w * 0.7];
      if (ball_) {
        ctx.save(); ctx.strokeStyle = MOM.rgba(C.graphite, 0.35); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(8, y + rmax + 10); ctx.lineTo(w - 8, y + rmax + 10); ctx.stroke(); ctx.restore();
      } else {
        MOM.track(ctx, 8, w - 8, y, C);
      }
      var ay = y + (ball_ ? rmax + 38 : 38);
      for (i = 0; i < n; i++) {
        var o = os[i];
        if (ball_) ball(ctx, cx[i], y, o.r, C, o);
        else MOM.cart(ctx, cx[i] - o.w / 2, y, o.w, 36, C, { name: o.name, label: o.m, heavy: o.m === '2 kg' });
        MOM.vArrow(ctx, cx[i], ay, o.v, sc, C, Math.abs(o.v) + ' m/s');
      }
      GRAV.draw.text(ctx, '碰前 · 向右为正', w - 8, 16, { size: 13, color: C.graphite, align: 'right' });
    };
  }

  var steps = Qs.map(function (q, i) {
    var pre = PRE[i];
    var step = {
      title: '小测 ' + (i + 1) + ' / ' + Qs.length + '：' + q.title,
      layout: 'answer',
      beats: [{ say: '第 ' + (i + 1) + ' 题。' }],
      gateAt: 0,
      button: i === Qs.length - 1 ? '看结果' : '下一题',
      mount: function (el, api) {
        var st = document.createElement('div');
        st.className = 'stem';
        st.textContent = q.stem;
        el.appendChild(st);
        var r = rec();
        GRAV.ui.choice(el, {
          options: q.options,
          hints: q.hints,
          onWrong: function () { if (r[i] == null) r[i] = false; },
          onCorrect: function () { if (r[i] == null) r[i] = true; }
        }, api);
      }
    };
    if (pre) { delete step.layout; step.tall = true; step.draw = preDraw(pre); }
    return step;
  });

  steps.push({
    title: '小测结果',
    layout: 'answer',
    beats: [{
      say: function () {
        var r = rec(), n = 0;
        Qs.forEach(function (q, i) { if (r[i] === true) n++; });
        return n === Qs.length ? '7 道题都是第一次就答对，三个目标都达成了。' : '第一次就答对 ' + n + ' 道。没全对的目标，点右边回去再看一遍。';
      }
    }],
    button: '看作业',
    mount: function (el, api) {
      var r = rec(), n = 0;
      Qs.forEach(function (q, i) { if (r[i] === true) n++; });
      var d = document.createElement('div');
      d.innerHTML = '<div class="score">' + n + ' / ' + Qs.length + '</div>' +
        '<div class="score-sub">第一次就答对的题数</div>';
      var rows = document.createElement('div');
      rows.className = 'score-rows';
      GOALS.forEach(function (g, gi) {
        var ok = Qs.every(function (q, i) { return q.goal !== gi || r[i] === true; });
        var row = document.createElement('div');
        row.className = 'score-row';
        row.innerHTML = '<span>' + g.name + '</span>';
        if (ok) {
          row.innerHTML += '<span class="ok">✓ 掌握了</span>';
        } else {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'txt-btn';
          b.textContent = '回第 ' + g.act + ' 幕再看 →';
          b.addEventListener('click', function () { api.jump(g.act); });
          row.appendChild(b);
        }
        rows.appendChild(row);
      });
      d.appendChild(rows);
      el.appendChild(d);
    }
  });

  steps.push({
    title: '作业',
    layout: 'answer',
    beats: [{ say: '课后做一做。必做三题由易到难；选做题是一道高考原题，方程会解出两组答案，想想哪一组不合理。' }],
    button: '完成',
    mount: function (el) {
      var d = document.createElement('div');
      d.className = 'hw';
      d.innerHTML = HOMEWORK.map(function (h) {
        return '<div class="hw-i"><div class="hw-t">' + h.tag + '</div><div class="hw-q">' + h.q + '</div>' +
          '<details class="hw-a"><summary>对答案</summary><div>' + h.a + '</div></details></div>';
      }).join('');
      el.appendChild(d);
    }
  });

  GRAV.finishNote = function () {
    var r = rec(), n = 0;
    Qs.forEach(function (q, i) { if (r[i] === true) n++; });
    var head = '你走完了弹性碰撞和非弹性碰撞这一课：会按动能给碰撞分类，也会算弹性碰撞后的速度。';
    if (n === Qs.length) return head + '<br>小测 <span class="num">' + n + ' / ' + n + '</span> 第一次全对，三个目标都拿下了。';
    return head + '<br>小测第一次答对 <span class="num">' + n + ' / ' + Qs.length + '</span>，没拿下的目标，回去再看一遍就好。';
  };

  GRAV.act({ id: 7, name: '小测', tag: '第 7 幕 · 小测', steps: steps });
})();
