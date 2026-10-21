/* 第 6 幕 · 收束：结论区盖住关键词、学生补全；留下进阶课 B（子弹打木块与板块）的钩子 */
(function () {
  'use strict';

  GRAV.act({
    id: 6,
    name: '收束',
    tag: '第 6 幕 · 收束',
    steps: [
      {
        title: '补全结论区',
        layout: 'answer',
        beats: [
          { say: '结论区里有几处关键词被盖住了。不往回翻，你能补全吗？' },
          { say: '补全了。这节课的三件事，用的都是第 4 节的那两个式子：动量守恒、动能不变。' }
        ],
        gateAt: 0,
        button: '下一课',
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">判断一组碰后速度是否可能：动量 ___；总动能 ___；速度合理。</div>';
          b2.innerHTML = '<div class="stem">弹性正碰中，两物体质量 ___ 时，静止的那个得到的动能最多。</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: '守恒，不增加', correct: true, say: '对。动能可以少，不能多。' },
              { html: '守恒，守恒', say: '非弹性碰撞动能会减少，照样可能发生。' },
              { html: '不变，减少', say: '弹性碰撞动能不变，也是可能的。是"不增加"。' }
            ],
            hints: ['想想 0.6v 那组为什么不行。', '动能凭空多了。', '动量守恒，动能不增加。'],
            onCorrect: function () { b2.hidden = false; api.boardMask(['share']); }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '相等', correct: true, say: '对。所以减速剂用氢。' },
              { html: '被碰的大得多', say: '撞很重的物体会原速弹回，几乎不交出动能。' },
              { html: '被碰的小得多', say: '撞很轻的物体，自己几乎不受影响。' }
            ],
            hints: ['回想质量比滑块的曲线。', '峰值在质量比为 1。', '相等。'],
            onCorrect: function () { api.boardMask([]); }
          }, api);
          var sum = document.createElement('div');
          sum.className = 'def';
          sum.innerHTML =
            '<div class="row"><b>全谱</b><span>碰后速度介于粘住和弹性两端之间</span></div>' +
            '<div class="row"><b>三条检查</b><span>动量守恒；总动能不增加；后面的不能比前面的快</span></div>' +
            '<div class="row"><b>质量比</b><span>相等时动能全传过去；减速剂用水、石墨</span></div>' +
            '<div class="row"><b>中子</b><span>两种靶核的速度之比消去未知速度，M ≈ 1</span></div>';
          Array.prototype.forEach.call(sum.querySelectorAll('.row b'), function (b) { b.style.width = '72px'; });
          el.appendChild(sum);
          api.boardMask(['checks', 'share']);
          api.onBeat(function (bt) {
            q.hidden = bt > 0;
            sum.hidden = bt < 1;
            if (bt > 0) api.boardMask([]);
          });
        }
      },
      {
        title: '下一课：损失的动能去哪了',
        layout: 'answer',
        beats: [
          { say: '完全非弹性碰撞损失的动能最多。那子弹打进木块、木块滑上木板，两者最后一起运动，损失的动能去哪了？和什么有关？下一节进阶课：子弹打木块与板块。' }
        ],
        button: '开始小测',
        mount: function (el) {
          var d = document.createElement('div');
          d.className = 'stem';
          d.textContent = '想一想：子弹打进木块的深度，和子弹损失的动能有什么关系？';
          el.appendChild(d);
        }
      }
    ]
  });
})();
