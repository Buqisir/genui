/* 第 2 幕 · 三种碰撞：先有事实再命名（弹性、非弹性、完全非弹性）；少掉的动能变成内能；粘住也不会损失全部动能 */
(function () {
  'use strict';
  var f = MOM.f, D = COL.D;

  function compare(ctx, w, h, t, C, beat) {
    var bw = Math.min(w - 40, 420);
    COL.keCompare(ctx, { x: (w - bw) / 2, y: 24, w: bw, h: h - 48 }, C, Math.min(3, beat + 1));
  }

  GRAV.act({
    id: 2,
    name: '三种碰撞',
    tag: '第 2 幕 · 三种碰撞',
    steps: [
      {
        title: '按动能的结局，碰撞分三类',
        beats: [
          { say: '弹性碰撞：碰撞前后总动能不变。磁体那次只差 1.5%，在误差以内，可以看作弹性碰撞。' },
          { say: '非弹性碰撞：总动能减少。橡皮那次，碰后弹开，动能少了 26%。' },
          { say: '完全非弹性碰撞：碰后粘在一起，动能减少得最多。粘扣那次少了 35%。' },
          { say: '少掉的动能没有消失，变成了内能：碰撞面发热、形变，还有声音。总能量仍然守恒。' }
        ],
        button: '粘住会不会全损失',
        draw: compare,
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'def';
          d.innerHTML =
            '<div class="row"><b>弹性</b><span>碰撞前后总动能不变</span></div>' +
            '<div class="row" data-b="1"><b>非弹性</b><span>总动能减少（碰后可以弹开）</span></div>' +
            '<div class="row" data-b="2"><b>完全非弹性</b><span>碰后粘在一起，动能减少最多</span></div>' +
            '<div class="row" data-b="3"><b>去哪了</b><span>变成内能（发热、形变、声音），总能量守恒</span></div>' +
            '<div class="row" data-b="3"><b>都一样</b><span>三种碰撞，动量都守恒</span></div>';
          el.appendChild(d);
          Array.prototype.forEach.call(d.querySelectorAll('.row b'), function (b) { b.style.width = '80px'; });
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      },
      {
        title: '粘在一起，会不会一起停下？',
        beats: [
          { say: '粘扣那次动能少得最多。两车粘在一起后，有没有可能一起停下，动能变成 0？' },
          { say: '不能。碰前总动量 0.24 kg·m/s，碰后也得是 0.24：两车只能一起以 0.24 ÷ 0.6 = 0.40 m/s 运动，动能至少还剩 ½ × 0.6 × 0.40² = 0.048 J。' },
          { say: '只有碰前总动量为 0 时，比如两辆一样的车以同样的速率相向而行，粘住后才会一起停下，动能全部损失。' }
        ],
        gateAt: 0,
        button: '弹性碰撞后怎么动',
        play: true,
        tall: true,
        draw: COL.scene(D.vel, { label: '碰撞面：粘扣，碰后粘住' }),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '不能：总动量 0.24 kg·m/s 要保持，两车只能一起以 0.40 m/s 运动', correct: true, say: '对。动量守恒管着它：总动量不是 0，两车就停不下来。' },
              { html: '能，只要粘得足够牢', say: '粘得再牢，总动量也要守恒：0.24 kg·m/s 不会变成 0。' },
              { html: '能，"完全非弹性"就是动能全部损失', say: '"完全"指的是粘在一起、损失最多，不是损失全部。看柱子：动能还剩 0.047 J。' }
            ],
            hints: ['碰后总动量必须是多少？', '还是 0.24 kg·m/s。两车一起停下，总动量是多少？', '总动量不为 0，两车只能一起以 0.40 m/s 运动。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            if (bt >= 1 && !shown) {
              shown = true;
              wk.line('0.4 × 0.60 = (0.4 + 0.2)' + GRAV.h.sym('v'));
              wk.line(GRAV.h.sym('v') + ' = 0.40 m/s，动能 ' + f(0.5 * 0.6 * 0.16, 3) + ' J');
            }
          });
        }
      }
    ]
  });
})();
