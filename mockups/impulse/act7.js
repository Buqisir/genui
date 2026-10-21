/* 第 7 幕 · 收束：结论区盖住关键词、学生补全；回到冰壶求平均摩擦力，留下一节（动量守恒定律）的钩子 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  GRAV.act({
    id: 7,
    name: '收束',
    tag: '第 7 幕 · 收束',
    steps: [
      {
        title: '补全结论区',
        layout: 'answer',
        beats: [
          { say: '结论区里有两句关键的话被盖住了。不往回翻，你能补全吗？' },
          { say: '补全了。这节课的结论都在结论区里。' }
        ],
        gateAt: 0,
        button: '回到冰壶',
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">动量定理：___ 的冲量，等于动量的变化。</div>';
          b2.innerHTML = '<div class="stem">动量变化一定时，作用时间越 ___，平均力越小。</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: '合力', correct: true, say: '对：合力的冲量。竖直碰撞时，重力也在合力里。' },
              { html: '某一个力', say: '要用合力。只用一个力，竖直落地那题就会少算重力。' },
              { html: '动力', say: '物理里没有"动力"这个分类。用的是合力。' }
            ],
            hints: ['第 5 幕竖直落地那题，算的是哪几个力？', '支持力和重力一起。', '合力。'],
            onCorrect: function () { b2.hidden = false; api.boardMask(['cush']); }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '长', correct: true, say: '对。海绵、气囊、手往后撤，都是把时间拉长。' },
              { html: '短', say: '想想鸡蛋：落在海绵上时间长，力反而小。' }
            ],
            hints: ['鸡蛋落在海绵上，时间长还是短？', '面积一样，时间长的那条矮。', '长。'],
            onCorrect: function () { api.boardMask([]); }
          }, api);
          var note = document.createElement('div');
          note.className = 'stem';
          note.innerHTML = '动量定理把<b>力</b>、<b>时间</b>和<b>动量的变化</b>连在一起：知道其中两个，就能求第三个。';
          el.appendChild(note);
          api.boardMask(['thm', 'cush']);
          api.onBeat(function (bt) {
            q.hidden = bt > 0;
            note.hidden = bt < 1;
            if (bt > 0) api.boardMask([]);
          });
        }
      },
      {
        title: '回到冰壶',
        beats: [
          { say: '回到开头的冰壶 B：20 kg，以 2 m/s 滑出，20 s 后停下。冰面对它的平均摩擦力多大？' },
          { say: '动量从 40 kg·m/s 变到 0，用了 20 s：f = 40 ÷ 20 = 2 N。很小的力，作用够长的时间，照样把动量减到 0。' },
          { say: '再想一步：两只冰壶相撞的那一瞬间，A 推 B、B 推 A，两个力一样大、方向相反，作用时间也一样长。它们的动量变化有什么关系？下一节：动量守恒定律。' }
        ],
        gateAt: 0,
        button: '开始小测',
        play: true,
        draw: IMP.curlStop,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '2 N', correct: true, say: '对。20 × 2 ÷ 20 = 2 N。' },
              { html: '40 N', say: '40 是动量的变化（kg·m/s），还要除以时间。' },
              { html: '0.1 N', say: '0.1 是加速度的大小（m/s²），还要乘质量。' },
              { html: '0，冰面是光滑的', say: '冰面很滑，但不是没有摩擦。不然 B 会一直滑下去。' }
            ],
            hints: ['B 的动量从多少变到 0？', 'Δp = 20 × 2 = 40 kg·m/s。', 'f = 40 ÷ 20 = 2 N。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
