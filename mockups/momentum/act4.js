/* 第 4 幕 · 第 3 轮与命名：轻车撞重车、A 被弹回，不带方向的 mv 之和对不上，带方向才对得上；再起名叫动量 */
(function () {
  'use strict';

  var S = GRAV.h.sym, R = RD.R3;

  GRAV.act({
    id: 4,
    name: '带上方向',
    tag: '第 4 幕 · 第 3 轮',
    steps: [
      {
        title: '第 3 轮：轻车撞重车，碰后分开',
        beats: [
          { say: '这次反过来：A 车 0.2 kg 以 0.60 m/s 撞上静止的 B 车 0.4 kg，碰撞面装磁体。' },
          { say: 'A 会被弹回来，速率 0.197 m/s。按向右为正，它的速度该记作多少？' },
          { say: 'B 车以 ' + RD.d3(R.b) + ' m/s 向右。先不管方向，把 mv 的大小加起来：' + RD.say(R, 'abs').split('：')[1] + '。' },
          { say: '带上方向再算：' + RD.say(R, 'mv').split('：')[1] + '，没变。看柱子：A 的 mv 翻到了零线下面，和却没变。' },
          { say: '所以守得住的，是两车 mv 的矢量和。方向要算进去。' }
        ],
        gateAt: 1,
        button: '给它起个名字',
        play: true,
        playAt: 2,
        tall: true,
        draw: RD.scene(R, '碰撞面装磁体：碰后弹开', 1),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '+0.197 m/s', say: '它是向左运动的，方向和约定的正方向相反。' },
              { html: '−0.197 m/s', correct: true, say: '对。向左运动，记作负值。' }
            ],
            hints: ['我们约定了哪个方向为正？', 'A 弹回去，是向左还是向右？', '向左，记作 −0.197 m/s。'],
            onCorrect: function () { api.win(false); }
          }, api);
          RD.tables(el, api, R, 2, [[2, 'abs'], [3, 'mv']]);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      },
      {
        title: '动量',
        layout: 'answer',
        beats: [
          { say: '碰撞前后守得住的 mv，物理学给它起名叫"动量"，用 p 表示。' },
          { say: '单位是 kg·m/s。它是矢量，方向就是速度的方向。' },
          { say: '牛顿把它叫作"运动的量"：质量越大、跑得越快，"运动的量"就越多。' }
        ],
        button: '动量和动能',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'def';
          d.innerHTML = '<div class="big">' + S('p') + ' = ' + S('m') + S('v') + '</div>' +
            '<div class="row" data-b="1"><b>单位</b><span>kg·m/s</span></div>' +
            '<div class="row" data-b="1"><b>方向</b><span>与速度方向相同，是矢量</span></div>' +
            '<div class="row" data-b="2"><b>来历</b><span>牛顿：运动的量（quantity of motion）</span></div>';
          el.appendChild(d);
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      }
    ]
  });
})();
