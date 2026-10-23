/* 第 5 幕 · 收束：结论区盖住关键词、学生补全；五节新授课连成一条问题链，钩子留给进阶课 A */
(function () {
  'use strict';

  var CHAIN = [
    { n: '第 1 节 动量', q: '碰撞前后，有什么量不变？', a: '两物体 mv 的矢量和不变：动量 p = mv' },
    { n: '第 2 节 动量定理', q: '是什么改变了动量？', a: '合力的冲量 = 动量的变化' },
    { n: '第 3 节 动量守恒定律', q: '总动量不变，什么时候成立？', a: '不受外力或合外力为零；近似守恒、某方向守恒' },
    { n: '第 4 节 弹性碰撞和非弹性碰撞', q: '同样守恒，动能的结局有什么不同？', a: '弹回多少决定动能损失多少' },
    { n: '第 5 节 反冲与火箭', q: '没有"撞"，守恒还管用吗？', a: '反冲、火箭、分离、人船，照样守恒' }
  ];

  GRAV.act({
    id: 5,
    name: '收束',
    tag: '第 5 幕 · 收束',
    steps: [
      {
        title: '补全结论区',
        layout: 'answer',
        beats: [
          { say: '结论区里有几处关键词被盖住了。不往回翻，你能补全吗？' },
          { say: '补全了。反冲和火箭都是"内力把系统分开"：总动量不变，动能却可以增加。' }
        ],
        gateAt: 0,
        button: '回头看五节课',
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">原来静止的系统反冲后，总动量 ___，总动能 ___。</div>';
          b2.innerHTML = '<div class="stem">火箭加速，靠的是 ___ 推火箭。</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: '仍为 0，增加', correct: true, say: '对。背包 90 J，人 7.5 J，都是从 0 来的。' },
              { html: '仍为 0，不变', say: '开始静止，动能是 0；分开后两部分都在动，动能增加了。' },
              { html: '增加，增加', say: '两部分动量一正一负，加起来仍是 0。' }
            ],
            hints: ['想想冰面扔背包。', '动量柱子：+30 和 −30；动能柱子：7.5 J 和 90 J。', '动量仍为 0，动能增加。'],
            onCorrect: function () { b2.hidden = false; api.boardMask(['rocket']); }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '喷出的燃气', correct: true, say: '对。在真空里照样能推。' },
              { html: '周围的空气', say: '太空里没有空气，火箭照样加速。' },
              { html: '地面', say: '火箭飞离地面以后照样加速。推它的是燃气。' }
            ],
            hints: ['太空里有什么可以推？', '只有它自己喷出去的东西。', '喷出的燃气。'],
            onCorrect: function () { api.boardMask([]); }
          }, api);
          var sum = document.createElement('div');
          sum.className = 'def';
          sum.innerHTML =
            '<div class="row"><b>反冲</b><span>原来静止，总动量始终为 0；动能增加，轻的分得多</span></div>' +
            '<div class="row"><b>火箭</b><span>燃气推火箭；Δv = Δm·u / m；喷气快、质量比大、多级</span></div>' +
            '<div class="row"><b>延伸</b><span>原来在动也守恒；人船：位移与质量成反比</span></div>';
          el.appendChild(sum);
          api.boardMask(['recoil', 'ke', 'rocket']);
          api.onBeat(function (bt) {
            q.hidden = bt > 0;
            sum.hidden = bt < 1;
            if (bt > 0) api.boardMask([]);
          });
        }
      },
      {
        title: '五节课，一条问题链',
        layout: 'answer',
        beats: [
          { say: '回头看这五节课：每一节都在回答上一节留下的问题。' },
          { say: '新授课到这里结束。下一步是进阶课：给你碰前的速度和一组碰后速度，你能判断这次碰撞可能发生吗？动量守恒够不够用？' }
        ],
        button: '开始小测',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'chain-map';
          d.innerHTML = CHAIN.map(function (c, i) {
            return '<div class="cm-i"><div class="cm-n">' + c.n + '</div><div class="cm-q">' + c.q + '</div><div class="cm-a">' + c.a + '</div></div>' +
              (i < CHAIN.length - 1 ? '<div class="cm-arrow" aria-hidden="true">↓</div>' : '');
          }).join('') +
            '<div class="cm-arrow" aria-hidden="true" data-b="1">↓</div><div class="cm-i cm-next" data-b="1"><div class="cm-n">进阶课 A</div><div class="cm-q">一组碰后速度，可能发生吗？</div></div>';
          el.appendChild(d);
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      }
    ]
  });
})();
