/* 第 8 幕 · 收束：先从结论区回忆、补全两句关键结论，再展开工具箱；最后回到冰壶，留下一节的钩子 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  function toolkit() {
    var d = document.createElement('div');
    d.className = 'tk';
    d.innerHTML =
      '<div class="lead"><span class="big">' + S('p') + ' = ' + S('m') + S('v') + '</span>' +
      '<span>单位 kg·m/s；矢量，方向与速度相同</span></div>' +
      '<div><h3>碰撞中不变的量</h3><p>两物体 ' + S('mv') + ' 的<b>矢量和</b>。' + S('v') + ' 之和、' + S('mv') + '² 之和都不是。</p></div>' +
      '<div><h3>怎么分清 ' + S('mv') + ' 和 ' + S('mv') + '²</h3><p>看碰后粘在一起的碰撞：' + S('mv') + ' 之和不变，' + S('mv') + '² 之和变小。</p></div>' +
      '<div><h3>动量的变化量</h3><p>Δ' + S('p') + ' = ' + S('p') + '′ − ' + S('p') + '。先规定正方向，再带正负相减。</p></div>' +
      '<div><h3>动量和动能</h3><p>' + S('p') + ' = ' + S('mv') + '，跟 ' + S('v') + ' 成正比，是矢量；' + S('E') + 'ₖ = ½' + S('mv') + '²，跟 ' + S('v') + '² 成正比，没有方向。</p></div>' +
      '<div class="warn"><h3>易错</h3><ul>' +
      '<li>小球原速弹回，Δ' + S('p') + ' 不是 0。</li>' +
      '<li>动量相加要带方向，相向运动时一正一负。</li>' +
      '<li>动量变了，动能不一定变；动能没变，动量也可能变了。</li>' +
      '<li>实验里"没变"指在误差范围内没变，不是数字完全相等。</li></ul></div>';
    return d;
  }

  GRAV.act({
    id: 8,
    name: '收束',
    tag: '第 8 幕 · 收束',
    steps: [
      {
        title: '补全结论区',
        layout: 'answer',
        beats: [
          { say: '结论区里有两句关键的话被盖住了。不往回翻，你能补全吗？' },
          { say: '补全了。把这节课收进一个工具箱。' }
        ],
        gateAt: 0,
        button: '回到冰壶',
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">碰撞前后，两物体 ___ 和不变。</div>';
          b2.innerHTML = '<div class="stem">能分清 ' + S('mv') + ' 和 ' + S('mv') + '² 的，是 ___ 的碰撞。</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          // 第一空答对还不能往下走：给它一个不开闸的 api
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: S('mv') + ' 的矢量', correct: true, say: '对：两物体 mv 的矢量和不变。' },
              { html: S('mv') + ' 的大小', say: '第 3 轮里 A 被弹回，不带方向加，和多了 65%。' },
              { html: S('mv') + '²', say: '第 2 轮粘住的碰撞里，mv² 之和明显变小，出局了。' },
              { html: S('v'), say: '第 1 轮里速度之和多了 65%，最早出局。' }
            ],
            hints: ['三轮实验里，最后剩下的是哪个量？', '第 3 轮告诉我们，还要带上方向。', 'mv 的矢量和。'],
            onCorrect: function () { b2.hidden = false; api.boardMask(['stick']); }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '碰后弹开', say: '弹开的碰撞里，mv 和 mv² 都没变，分不出。' },
              { html: '碰后粘在一起', correct: true, say: '对。粘住时 mv² 之和变小，mv 之和不变。' },
              { html: '两车一样重', say: '质量相等不是关键；关键是碰后粘不粘在一起。' }
            ],
            hints: ['回想第 2 轮你的设计。', '哪种碰撞让 mv² 之和变小了？', '碰后粘在一起。'],
            onCorrect: function () { api.boardMask([]); }
          }, api);
          var tk = toolkit();
          el.appendChild(tk);
          api.boardMask(['mv', 'stick']);
          api.onBeat(function (bt) {
            q.hidden = bt > 0;
            tk.hidden = bt < 1;
            if (bt > 0) api.boardMask([]);
          });
        }
      },
      {
        title: '回到冰壶',
        beats: [
          { say: '回到开头的冰壶。两只一样重，碰前 A 的速度是 v，B 静止；碰后 A 停住。B 的速度是多少？' },
          { say: '两只冰壶 mv 的和不变：m·v + 0 = 0 + m·v_B，所以 v_B = v。A 的动量几乎全部交给了 B。' },
          { say: '可是 B 滑了一段，最后也停下了。它的动量去哪了？是什么改变了它的动量？下一节：动量定理。' }
        ],
        gateAt: 0,
        button: '开始小测',
        play: true,
        draw: MOM.curlHit,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: S('v'), correct: true, say: '对。m·v + 0 = 0 + m·v_B，v_B = v。' },
              { html: S('v') + '/2', say: '那是把速度平分了。碰后 A 停住，动量全在 B 身上。' },
              { html: '2' + S('v'), say: '列出来算一算：m·v + 0 = 0 + m·v_B。' },
              { html: '0', say: 'B 被撞走了，它在动。' }
            ],
            hints: ['碰撞前后，两只冰壶 mv 的和不变。', '碰前：m·v + 0；碰后：0 + m·v_B。', 'v_B = v。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
