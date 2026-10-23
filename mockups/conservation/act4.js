/* 第 4 幕 · 动量守恒定律：先有事实再命名；用的时候三步判断；普适性一句带过 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  GRAV.act({
    id: 4,
    name: '动量守恒定律',
    tag: '第 4 幕 · 动量守恒定律',
    steps: [
      {
        title: '动量守恒定律',
        layout: 'answer',
        beats: [
          { say: '把前面的结论归纳成一条定律：一个系统不受外力，或者所受外力的矢量和为零，这个系统的总动量保持不变。这就是动量守恒定律。' },
          { say: '用的时候分三步判断：先选系统，分清内力和外力；再看外力的合力是不是零；不是零，看能不能近似守恒，或者某一方向守恒。' },
          { say: '它不只管冰壶和小车：从天体到微观粒子都成立。中子就是靠它和碰撞规律被发现的，进阶课再讲。' }
        ],
        button: '怎样用实验验证',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'def';
          d.innerHTML = '<div class="big">' + S('p') + '₁ + ' + S('p') + '₂ = ' + S('p') + '₁′ + ' + S('p') + '₂′</div>' +
            '<div class="row"><b>条件</b><span>系统不受外力，或所受合外力为零</span></div>' +
            '<div class="row" data-b="1"><b>近似</b><span>外力远小于内力、作用时间极短（碰撞、爆炸）</span></div>' +
            '<div class="row" data-b="1"><b>分方向</b><span>某一方向不受外力，这一方向的动量守恒</span></div>' +
            '<div class="row" data-b="1"><b>注意</b><span>内力（包括摩擦）不改变总动量；动量守恒不等于机械能守恒</span></div>' +
            '<div class="row" data-b="2"><b>范围</b><span>宏观、微观都成立</span></div>';
          el.appendChild(d);
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      }
    ]
  });
})();
