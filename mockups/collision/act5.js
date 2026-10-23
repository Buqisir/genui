/* 第 5 幕 · 练习：示范例题（重撞轻的弹性碰撞，自编，L2）→ 由碰后速度判断碰撞类型（自编，L2）→ 乙追上甲（改编自 2024 年广东卷第 10 题，L3） */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  var EX = { mA: 3, mB: 1, vA: 4, vB: 0, a: 2, b: 6, side: 'mag' };
  var P1 = { mA: 2, mB: 1, vA: 3, vB: 0, a: 1.5, b: 3 };
  var P2 = { mA: 1, mB: 1, vA: 3, vB: 1, a: 1, b: 3, side: 'mag' };

  function section(el, label) {
    var d = document.createElement('div');
    d.className = 'ex-sec';
    d.innerHTML = '<div class="ex-l">' + label + '</div>';
    el.appendChild(d);
    return d;
  }
  function stem(el, text) {
    var st = document.createElement('div');
    st.className = 'stem';
    st.textContent = text;
    el.appendChild(st);
  }

  GRAV.act({
    id: 5,
    name: '练习',
    tag: '第 5 幕 · 练习',
    steps: [
      {
        title: '例题：重的撞轻的',
        beats: [
          { say: '先看一道完整的例题，题目在右边。' },
          { say: '策略：要用哪两条规律？为什么？' },
          { say: '解答：取 A 原来的运动方向为正，直接代弹性碰撞的公式。' },
          { say: '讨论：核对一下，动量 12 = 6 + 6，动能 24 J = 6 J + 18 J，两条都守住了。再看是否合理：重的继续向前、变慢；轻的比 A 原来还快，但不到 2 倍，和上一幕的极限一致。' }
        ],
        gateAt: 1,
        button: '自己做一道',
        play: true,
        playAt: 2,
        tall: true,
        draw: COL.scene(EX, { holdUpTo: 1, dp: 0, pdp: 0, kdp: 0, bars: function (bt) { return bt >= 3; } }),
        mount: function (el, api) {
          var s1 = section(el, '情境 · 自编');
          s1.insertAdjacentHTML('beforeend', '<div class="stem">光滑水平面上，3 kg 的滑块 A 以 4 m/s 与静止的 1 kg 滑块 B 发生弹性正碰。求碰后两滑块的速度。</div>');
          var s2 = section(el, '策略');
          var box = document.createElement('div');
          s2.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '动量守恒，加上总动能不变：两个未知数，要两个方程', correct: true, say: '对。弹性碰撞两条都成立，正好解出两个速度。' },
              { html: '只用动量守恒就够了', say: '动量守恒只有一个方程，解不出 v₁′、v₂′ 两个未知数。' },
              { html: '动量守恒，加上 A 的动能不变', say: '弹性碰撞守恒的是总动能，A 的动能会变：它把一部分给了 B。' }
            ],
            hints: ['未知的有几个？', 'v₁′、v₂′ 两个，要两个方程。', '弹性碰撞：动量守恒，总动能不变。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var s3 = section(el, '解答'), w3 = GRAV.ui.work(s3);
          var shown = 0;
          api.onBeat(function (bt) {
            s2.hidden = bt < 1; s3.hidden = bt < 2;
            if (bt >= 2 && shown < 1) {
              w3.line(S('v') + '₁′ = (3 − 1)/(3 + 1) × 4 = 2 m/s');
              w3.line(S('v') + '₂′ = 2 × 3/(3 + 1) × 4 = 6 m/s');
              shown = 1;
            }
          });
        }
      },
      {
        title: '这是哪一种碰撞？',
        beats: [
          { say: '光滑水平面上，2 kg 的 A 以 3 m/s 撞静止的 1 kg 的 B，碰后 A 以 1.5 m/s、B 以 3 m/s 沿原方向运动。这次碰撞是哪一种？' },
          { say: '动量 2 × 3 = 2 × 1.5 + 1 × 3 = 6 kg·m/s，守恒。动能 9 J → 2.25 J + 4.5 J = 6.75 J，少了 1/4：非弹性碰撞。' }
        ],
        gateAt: 0,
        button: '再做一道',
        play: true,
        playAt: 1,
        tall: true,
        draw: COL.scene(P1, { holdUpTo: 0, dp: 1, pdp: 1, kdp: 2, bars: function (bt) { return bt >= 1; } }),
        mount: function (el, api) {
          stem(el, '光滑水平面上，2 kg 的 A 以 3 m/s 撞静止的 1 kg 的 B，碰后 A 以 1.5 m/s、B 以 3 m/s 沿原方向运动。这次碰撞是？');
          GRAV.ui.choice(el, {
            options: [
              { html: '非弹性碰撞，动能损失 1/4', correct: true, say: '对。9 J → 6.75 J，少了 2.25 J，是 1/4。' },
              { html: '弹性碰撞：碰后两者分开了', say: '分开不等于弹性。算一算动能：9 J → 2.25 J + 4.5 J。' },
              { html: '完全非弹性碰撞', say: '两者碰后速度不同，没有粘在一起。' },
              { html: '动量不守恒，不能判断', say: '算一算：2 × 3 = 6，2 × 1.5 + 1 × 3 = 6，守恒。' }
            ],
            hints: ['先查动量，再算碰前碰后的总动能。', '碰前 ½ × 2 × 3² = 9 J。', '碰后 ½ × 2 × 1.5² + ½ × 1 × 3² = 6.75 J。']
          }, api);
        }
      },
      {
        title: '挑战：乙追上甲',
        beats: [
          { say: '光滑水平面上，两个相同的滑块（都是 1 kg）同向运动，乙以 3 m/s 追上前面以 1 m/s 运动的甲，发生弹性碰撞。碰后两者的速度是？甲原来也在动，公式不能直接套，用两条守恒去检查每个选项。' },
          { say: '甲 3 m/s、乙 1 m/s：动量 4 = 4，动能 5 J = 5 J。一样重的弹性碰撞，被碰的那个在动也交换速度。' }
        ],
        gateAt: 0,
        button: '收束',
        play: true,
        playAt: 1,
        tall: true,
        draw: COL.scene(P2, { holdUpTo: 0, names: ['乙', '甲'], dp: 0, pdp: 0, kdp: 0, label: '改编自 2024 年广东卷第 10 题', bars: function (bt) { return bt >= 1; } }),
        mount: function (el, api) {
          stem(el, '改编自 2024 年广东卷第 10 题：光滑水平面上，两个相同的滑块（都是 1 kg）同向运动，乙以 3 m/s 追上前面以 1 m/s 运动的甲，发生弹性碰撞。碰后两者的速度是？');
          GRAV.ui.choice(el, {
            options: [
              { html: '甲 3 m/s，乙 1 m/s', correct: true, say: '对。动量 3 + 1 = 4 → 1 + 3 = 4；动能 4.5 + 0.5 = 5 J → 0.5 + 4.5 = 5 J。交换速度。' },
              { html: '甲 3 m/s，乙 0', say: '这是套了"被碰的静止"的结论。检查动量：碰前 4，碰后 3，不守恒。' },
              { html: '甲、乙都是 2 m/s', say: '检查：动量 4 → 4，守恒；动能 5 J → 4 J，少了。两者一起走是粘住的结果。' },
              { html: '甲 4 m/s，乙 0', say: '检查：动量 4 → 4，守恒；动能 5 J → 8 J，凭空多了，不可能。' }
            ],
            hints: ['碰前总动量、总动能各是多少？', '动量 4 kg·m/s，动能 ½ × 9 + ½ × 1 = 5 J。', '逐个选项检查，两条都要守住。']
          }, api);
        }
      }
    ]
  });
})();
