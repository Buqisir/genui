/* 第 1 幕 · 这个碰撞可能吗：m 撞静止的 3m，碰后 B 0.6v？动量算得通，可总动能变成碰前的 1.72 倍——动能不能增加 */
(function () {
  'use strict';
  var LAB = ['A  m', 'B  3m'];

  var GUESS = [
    { html: '可能：用动量守恒能算出 A 的速度', check: '动量这一关确实过了：A 是 −0.8v。可还要查动能。' },
    { html: '不可能', ok: true, check: '对。下面看为什么。' },
    { html: '要看碰撞是不是弹性的', check: '弹性也好、非弹性也好，有一条是所有碰撞都要满足的。下面就查它。' }
  ];

  GRAV.act({
    id: 1,
    name: '这个碰撞可能吗',
    tag: '第 1 幕 · 这个碰撞可能吗',
    steps: [
      {
        title: '碰后 B 的速度是 0.6v，可能吗？',
        beats: [
          { say: '上一节最后留下的问题：给你碰前的速度和一组碰后速度，它可能发生吗？' },
          { say: '质量 m 的 A 以 v 正碰静止的、质量 3m 的 B。有人说碰后 B 的速度是 0.6v。可能吗？凭直觉选一个，选了就锁定。' }
        ],
        gateAt: 1,
        button: '查一查',
        draw: function (ctx, w, h, t, C) { ADV.pair(ctx, w, h, C, { k: 3, vA: null, vB: 0.6, before: true, labels: LAB, tag: '碰后（有人说）' }); },
        mount: function (el, api) {
          var box = document.createElement('div');
          box.className = 'opts';
          var btns = GUESS.map(function (g, i) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'opt';
            b.innerHTML = '<span class="opt-html">' + g.html + '</span><span class="mark" aria-hidden="true"></span>';
            b.addEventListener('click', function () {
              if (GRAV.state.a1 != null) return;
              GRAV.state.a1 = i; lock();
              api.me('我猜「' + g.html + '」');
              api.say('记下了。');
              api.open();
            });
            box.appendChild(b);
            return b;
          });
          function lock() {
            btns.forEach(function (b, i) {
              b.disabled = true;
              if (i === GRAV.state.a1) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
            });
          }
          api.onBeat(function (bt) { box.hidden = bt < 1; });
          if (GRAV.state.a1 != null) { lock(); api.open(); }
          el.appendChild(box);
        }
      },
      {
        title: '动量过关了，动能呢？',
        beats: [
          {
            say: function () {
              var i = GRAV.state.a1, head = i == null ? '' : '你选的是「' + GUESS[i].html + '」。' + GUESS[i].check + ' ';
              return head + '先查动量：m·v = m·vA + 3m × 0.6v，vA = −0.8v，A 被弹回。再查动能：碰后的总动能比碰前怎样？';
            }
          },
          { say: '碰前 ½mv²，即 0.5mv²；碰后 ½m(0.8v)² + ½(3m)(0.6v)² = 0.86mv²，是碰前的 1.72 倍。碰撞时没有别的能量来源，动能不能凭空增加。所以不可能。' }
        ],
        gateAt: 0,
        button: 'B 到底能多快',
        tall: true,
        draw: function (ctx, w, h, t, C) { ADV.pair(ctx, w, h, C, { k: 3, vA: -0.8, vB: 0.6, before: true, labels: LAB, bars: true, tag: '碰后（有人说）' }); },
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '比碰前多', correct: true, say: '对。看动能柱子的"和"：0.86，高过碰前的虚线 0.5。' },
              { html: '和碰前一样', say: '算一算：½ × 0.64 + ½ × 3 × 0.36 = 0.86，碰前只有 0.5。' },
              { html: '比碰前少', say: '算一算：½ × 0.64 + ½ × 3 × 0.36 = 0.86，比碰前的 0.5 还多。' }
            ],
            hints: ['分别算 A、B 碰后的动能（单位 mv²）。', 'A：½ × 0.8²；B：½ × 3 × 0.6²。', '0.32 + 0.54 = 0.86，碰前 0.5。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
