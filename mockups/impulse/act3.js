/* 第 3 幕 · 动量定理：由牛顿第二定律推出 FΔt = mv′ − mv，先有事实再起名；区分冲量和功；随堂 L1 题 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  GRAV.act({
    id: 3,
    name: '动量定理',
    tag: '第 3 幕 · 动量定理',
    steps: [
      {
        title: '从牛顿第二定律推一推',
        layout: 'answer',
        beats: [
          { say: '从牛顿第二定律出发：F = ma。物体受恒力 F，经过时间 Δt，速度从 v 变成 v′。' },
          { say: '加速度怎么用速度表示？补上缺的这一步。' },
          { say: '代进去，两边乘 Δt：FΔt = mv′ − mv。右边正是动量的变化 Δp。所以刚才的 FΔt = Δp 不是巧合。' },
          { say: '左边的 FΔt 起个名字，叫"冲量"，记作 I。物体所受合力的冲量，等于它动量的变化。这就是动量定理。' },
          { say: '冲量的单位是 N·s，和 kg·m/s 一样。它是矢量，方向和力的方向相同。别和功混了：功是力乘位移，冲量是力乘时间。' }
        ],
        gateAt: 1,
        button: '试一道',
        mount: function (el, api) {
          var wk = GRAV.ui.work(el), shown = 0;
          var box = document.createElement('div');
          box.className = 'q-gap';
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: S('a') + ' = (' + S('v') + '′ − ' + S('v') + ') / Δ' + S('t'), correct: true, say: '对。加速度是速度的变化除以时间。' },
              { html: S('a') + ' = ' + S('v') + '′ / Δ' + S('t'), say: '要用速度的变化，不是末速度。' },
              { html: S('a') + ' = (' + S('v') + '′ − ' + S('v') + ')Δ' + S('t'), say: '加速度是"每秒"速度变多少，要除以时间。' }
            ],
            hints: ['加速度的定义是什么？', '速度的变化量除以所用的时间。', 'a = (v′ − v) / Δt。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var def = document.createElement('div');
          def.className = 'def';
          def.innerHTML = '<div class="big">' + S('I') + ' = ' + S('F') + 'Δ' + S('t') + ' = Δ' + S('p') + '</div>' +
            '<div class="row"><b>名称</b><span>冲量；动量定理</span></div>' +
            '<div class="row" data-b="4"><b>单位</b><span>N·s，与 kg·m/s 相同</span></div>' +
            '<div class="row" data-b="4"><b>方向</b><span>与力的方向相同，是矢量</span></div>' +
            '<div class="row" data-b="4"><b>对照</b><span>功 = 力 × 位移；冲量 = 力 × 时间</span></div>';
          el.appendChild(def);
          api.onBeat(function (bt) {
            if (bt >= 0 && shown < 1) { wk.line(S('F') + ' = ' + S('m') + S('a')); shown = 1; }
            if (bt >= 2 && shown < 2) {
              wk.line(S('a') + ' = (' + S('v') + '′ − ' + S('v') + ') / Δ' + S('t'));
              wk.line(S('F') + 'Δ' + S('t') + ' = ' + S('mv') + '′ − ' + S('mv') + ' = Δ' + S('p'));
              shown = 2;
            }
            box.hidden = bt !== 1;
            def.hidden = bt < 3;
            Array.prototype.forEach.call(def.querySelectorAll('[data-b]'), function (r) { r.hidden = bt < Number(r.getAttribute('data-b')); });
          });
        }
      },
      {
        title: '汽车刹车，多久停下？',
        layout: 'answer',
        beats: [
          { say: '1000 kg 的汽车以 20 m/s 行驶，制动力恒为 5000 N。多久停下？' },
          { say: '用动量定理一步就出来：t = mv / F。不必先算加速度。' }
        ],
        gateAt: 0,
        button: '力不恒定呢',
        mount: function (el, api) {
          var st = document.createElement('div');
          st.className = 'stem';
          st.textContent = '1000 kg 的汽车以 20 m/s 行驶，制动力恒为 5000 N，多久停下？';
          el.appendChild(st);
          GRAV.ui.choice(el, {
            options: [
              { html: '4 s', correct: true, say: '对。Δp = 1000 × 20 = 20 000 kg·m/s，t = 20 000 ÷ 5000 = 4 s。' },
              { html: '0.25 s', say: '倒过来算了：要用动量变化除以力。' },
              { html: '40 s', say: '再算一次：20 000 ÷ 5000。' },
              { html: '不知道加速度，算不出', say: '不用加速度：动量定理直接连起了力、时间和动量变化。' }
            ],
            hints: ['动量变化多少？', 'Δp = 1000 × 20。', 't = Δp ÷ F = 4 s。']
          }, api);
        }
      }
    ]
  });
})();
