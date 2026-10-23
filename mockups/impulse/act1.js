/* 第 1 幕 · 冰壶停下了：接住第 1 节的钩子，B 在摩擦力作用下减速到停；推翻"没有力推它，它自己停下" */
(function () {
  'use strict';

  // 冰壶 B 匀减速滑到靶心附近停下（屏幕上 3.2 秒），摩擦力箭头一直朝后，停下后消失
  function curlStop(ctx, w, h, t, C) {
    var y = h * 0.42, r = Math.max(20, Math.min(32, w * 0.045));
    var x0 = Math.max(10, w * 0.04), x1 = w - x0, sh = r * 2.6;
    MOM.sheet(ctx, x0, x1, y, C, w * 0.8, sh);
    var T = 3.2, start = x0 + r + 16, stop = w * 0.8;
    var v0 = 2 * (stop - start) / T, a = v0 / T, tt = Math.min(t, T);
    var x = start + v0 * tt - 0.5 * a * tt * tt, v = v0 - a * tt;
    MOM.stone(ctx, x, y, r, C, 'B');
    var ay = y + r + 24;
    if (v > 1) {
      MOM.vArrow(ctx, x - r * 0.2, ay, v / v0, 70, C, false);
      IMP.force(ctx, x - r - 4, y, x - r - 40, y, C, 'f', 'left');
    } else {
      GRAV.draw.text(ctx, 'v = 0', x, ay + 4, { font: 'num', size: 14, color: C.vel, align: 'center' });
    }
    GRAV.draw.text(ctx, '20 kg，以 2 m/s 滑出', x0 + 8, y + sh + 26, { size: 12, color: C.steel });
    GRAV.draw.note(ctx, '俯视图', w, h, C);
  }
  IMP.curlStop = curlStop;

  GRAV.act({
    id: 1,
    name: '冰壶停下了',
    tag: '第 1 幕 · 冰壶停下了',
    steps: [
      {
        title: '冰壶 B 是怎么停下的？',
        beats: [
          { say: '上一节最后留下一个问题：冰壶 B 被撞走后滑了一段，最后停下了。它的动量从 mv 变成了 0。' },
          { say: '是什么让它的动量变没的？' },
          { say: '冰面很滑，可还是有一点摩擦力，方向和运动方向相反。就是它，一点一点把 B 的动量减到了 0。' },
          { say: '摩擦力和动量的变化之间是什么关系？换一个容易测的场景来找。' }
        ],
        gateAt: 1,
        button: '去推小车',
        play: true,
        draw: curlStop,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '冰面的摩擦力', correct: true, say: '对。摩擦力和运动方向相反，一直在使它减速。' },
              { html: '没有力推它了，它自己慢慢停下', say: '没有力的话，它会一直匀速滑下去。它减速了，说明有力在使它减速。' },
              { html: '重力', say: '重力竖直向下，和冰面的支持力平衡，不影响水平方向的运动。' }
            ],
            hints: ['B 在减速。减速说明什么？', '水平方向上，B 受到什么力？', '冰面的摩擦力，方向和运动方向相反。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt < 1; });
        }
      }
    ]
  });
})();
