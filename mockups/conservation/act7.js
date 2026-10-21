/* 第 7 幕 · 收束：结论区盖住关键词、学生补全；回到冰壶：碰后粘在一起会怎样，留下一节（弹性碰撞与非弹性碰撞）的钩子 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  // 两只一样重的冰壶：A 撞静止的 B 后粘在一起，以 v/2 前进
  function stick(ctx, w, h, t, C) {
    var y = h * 0.42, r = Math.max(20, Math.min(30, w * 0.045)), x0 = Math.max(10, w * 0.04), x1 = w - x0;
    MOM.sheet(ctx, x0, x1, y, C, 0, r * 2.4);
    var bx0 = w * 0.5, ax0 = x0 + r + 10, T1 = 1.2, va = (bx0 - 2 * r - ax0) / T1, tt = Math.min(t, 3);
    var xa, xb;
    if (tt < T1) { xa = ax0 + va * tt; xb = bx0; }
    else { var d = va / 2 * (tt - T1); xa = bx0 - 2 * r + d; xb = bx0 + d; }
    xb = Math.min(xb, x1 - r - 4); xa = Math.min(xa, xb - 2 * r);
    MOM.stone(ctx, xa, y, r, C, 'A');
    MOM.stone(ctx, xb, y, r, C, 'B');
    if (tt < T1) MOM.vArrow(ctx, xa, y + r + 24, 1, 60, C, 'v');
    else MOM.vArrow(ctx, xa + r, y + r + 24, 0.5, 60, C, '？');
    GRAV.draw.note(ctx, '俯视图，两只一样重；假如碰后粘在一起', w, h, C);
  }

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
          { say: '补全了。用守恒定律之前，先把系统和条件想清楚。' }
        ],
        gateAt: 0,
        button: '回到冰壶',
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">动量守恒定律：系统不受外力，或所受 ___ 为零，总动量保持不变。</div>';
          b2.innerHTML = '<div class="stem">系统内有摩擦时，动量 ___ 守恒，机械能 ___ 守恒。</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: '合外力', correct: true, say: '对：外力的矢量和为零。' },
              { html: '摩擦力', say: '摩擦力如果是系统内部的，不影响总动量。看的是外力。' },
              { html: '内力', say: '内力不改变总动量。看的是外力的合力。' }
            ],
            hints: ['窗帘滑块那题，是什么改变了总动量？', '电机的推力，是外力。', '合外力为零。'],
            onCorrect: function () { b2.hidden = false; api.boardMask(['fric']); }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '仍然 / 不', correct: true, say: '对。木块滑上木板：动量 3 → 3，动能 4.5 J → 1.5 J。' },
              { html: '不 / 也不', say: '摩擦在木块和木板之间，是内力，动量仍然守恒。' },
              { html: '仍然 / 也', say: '摩擦生热，动能变少了，机械能不守恒。' }
            ],
            hints: ['想想木块滑上木板。', '动量柱子的和没变，动能柱子的和变小了。', '动量仍然守恒，机械能不守恒。'],
            onCorrect: function () { api.boardMask([]); }
          }, api);
          var note = document.createElement('div');
          note.className = 'stem';
          note.innerHTML = '用动量守恒定律解题：<b>选系统 → 判断守恒 → 规定正方向 → 列式</b>。';
          el.appendChild(note);
          api.boardMask(['pair', 'fric']);
          api.onBeat(function (bt) {
            q.hidden = bt > 0;
            note.hidden = bt < 1;
            if (bt > 0) api.boardMask([]);
          });
        }
      },
      {
        title: '假如冰壶碰后粘在一起',
        beats: [
          { say: '回到冰壶。两只一样重，A 以 v 撞静止的 B。假如碰后粘在一起，它们一起以多大的速度前进？' },
          { say: 'mv + 0 = 2m·v′，v′ = v/2。动量守恒，一点不差。' },
          { say: '可算一下动能：碰前 ½mv²，碰后 ½(2m)(v/2)² = ¼mv²，少了一半。第 1 节真实的冰壶 A 停住、B 以 v 滑走，动能几乎没少。同样守恒，为什么有的弹开、有的粘住？少掉的动能去哪了？下一节：弹性碰撞和非弹性碰撞。' }
        ],
        gateAt: 0,
        button: '开始小测',
        play: true,
        draw: stick,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: S('v') + '/2', correct: true, say: '对。mv = 2m·v′，v′ = v/2。' },
              { html: S('v'), say: '速度不会原样传过去：粘在一起后是两只一起动，质量翻倍。' },
              { html: S('v') + '/√2', say: '这是按动能不变算出来的。粘在一起时，守恒的是动量。' }
            ],
            hints: ['碰前总动量是多少？', 'mv + 0。碰后两只一起，质量 2m。', 'mv = 2m·v′。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
