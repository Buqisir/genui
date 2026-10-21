/* 第 3 幕 · 质量比全谱与减速剂：先锁定"想让它尽快慢下来该撞什么"，再拖质量比滑块（对数）：质量相等时动能全传过去；中子减速剂用水和石墨 */
(function () {
  'use strict';
  var f = MOM.f;
  var ST = { lk: Math.log(3) / Math.LN10, enough: false };
  function kOf(lk) { return Math.pow(10, lk); }
  function kTxt(k) { return k >= 10 ? String(Math.round(k)) : k >= 1 ? f(k, k < 2 ? 2 : 1) : '1/' + Math.round(1 / k); }

  function ratio(ctx, w, h, t, C, beat) {
    var k = kOf(ST.lk), r = ADV.after(k, 1);
    ADV.pair(ctx, w, h, C, { k: k, vA: r.a, vB: r.b, before: false, labels: ['A  m', 'B  ' + kTxt(k) + 'm'], tag: '弹性正碰后' });
    var top = 166;
    if (GRAV.state.a6 != null) ADV.shareCurve(ctx, { x: 8, y: top, w: Math.min(w - 16, 560), h: h - top - 8 }, k, C);
  }

  function moderator(ctx, w, h, t, C) {
    var items = [
      { label: '氢（水）', v: 1, text: '100%' },
      { label: '碳（石墨）', v: ADV.share(12), text: Math.round(ADV.share(12) * 100) + '%' },
      { label: '铅', v: ADV.share(207), text: Math.round(ADV.share(207) * 100) + '%' }
    ];
    RCL.bars(ctx, { x: 12, y: 12, w: Math.min(420, w - 24), h: h * 0.62 }, items, C, { max: 1.15, title: '中子一次弹性正碰，交给靶核的动能比例' });
    var y = h * 0.62 + 40;
    GRAV.draw.text(ctx, '从 2 MeV 降到热中子，平均要碰：氢 18 次，碳 114 次，铀 2172 次', 12, y, { size: 12, color: C.graphite });
    GRAV.draw.text(ctx, '数据：Wikipedia "Neutron moderator"', 12, y + 20, { size: 12, color: C.steel });
  }

  var GUESS = [
    { html: '撞很重的物体', check: '想想乒乓球撞保龄球：乒乓球几乎原速弹回，动能几乎一点没少。' },
    { html: '撞和它质量差不多的物体', ok: true, check: '对。一样重时，弹性正碰把动能全部交出去。' },
    { html: '撞很轻的物体', check: '撞很轻的物体，自己几乎不受影响，照样往前冲。' },
    { html: '撞什么都一样：弹性碰撞动能守恒', check: '总动能守恒，可它分给谁不一样：分出去得越多，它自己就越慢。' }
  ];

  GRAV.act({
    id: 3,
    name: '质量比全谱与减速剂',
    tag: '第 3 幕 · 质量比全谱与减速剂',
    steps: [
      {
        title: '想让它尽快慢下来，该撞什么？',
        beats: [
          { say: '刚才质量比固定是 1 : 3。现在只考虑弹性正碰，改质量比。想让一个快速运动的物体通过弹性正碰尽快慢下来，该让它撞什么样的静止物体？选了就锁定。' },
          { say: '锁定后拖动质量比滑块，从 1/100 到 207，看 A、B 碰后怎么动，以及下面的曲线：B 拿走了 A 多少动能。至少看两个位置。' },
          {
            say: function () {
              var i = GRAV.state.a6, head = i == null ? '' : '你选的是「' + GUESS[i].html + '」。' + GUESS[i].check + ' ';
              return head + '曲线在质量比为 1 时最高：一样重，动能 100% 传过去，A 停下。B 是 A 的 12 倍时只传 28%，207 倍（铅）时只有 2%。传过去的比例是 4k/(1 + k)²。';
            }
          }
        ],
        gateAt: 1,
        button: '这有什么用',
        tall: true,
        draw: ratio,
        mount: function (el, api) {
          var box = document.createElement('div');
          box.className = 'opts';
          var btns = GUESS.map(function (g, i) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'opt';
            b.innerHTML = '<span class="opt-html">' + g.html + '</span><span class="mark" aria-hidden="true"></span>';
            b.addEventListener('click', function () {
              if (GRAV.state.a6 != null) return;
              GRAV.state.a6 = i; lock();
              api.me('我猜「' + g.html + '」');
              api.say('记下了。拖动下面的滑块看看。');
              sl.hidden = false;
              if (ST.enough) api.open();
            });
            box.appendChild(b);
            return b;
          });
          function lock() {
            btns.forEach(function (b, i) {
              b.disabled = true;
              if (i === GRAV.state.a6) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
            });
          }
          el.appendChild(box);
          var sl = document.createElement('div');
          sl.className = 'q-gap';
          el.appendChild(sl);
          ADV.slider(sl, {
            label: 'B 与 A 的质量比', min: -2, max: 2.316, step: 0.001, value: ST.lk, need: 2,
            snaps: [{ v: 0, name: '1（一样重）' }, { v: 1.079, name: '12（碳）' }, { v: 2.316, name: '207（铅）' }],
            fmt: function (v) { var k = kOf(v); return kTxt(k) + '，传过去 ' + Math.round(ADV.share(k) * 100) + '%'; },
            onChange: function (v) { ST.lk = v; },
            onEnough: function () { ST.enough = true; if (GRAV.state.a6 != null) api.open(); }
          });
          sl.hidden = GRAV.state.a6 == null;
          if (GRAV.state.a6 != null) { lock(); if (ST.enough) api.open(); }
        }
      },
      {
        title: '核反应堆：给中子减速',
        beats: [
          { say: '核反应堆里，铀核裂变放出的中子太快，要先减速才容易引起下一次裂变。人教版教材第 5 节练习就问：该用质量较大还是较小的原子核去撞？用水（含氢）还是用铅？' },
          { say: '用水。氢核和中子质量几乎相等，一次正碰就能把动能几乎全部交出去。世界上约 75% 的反应堆用水作减速剂，约 20% 用石墨（碳）。铅太重，中子撞上去几乎原速弹回。' }
        ],
        gateAt: 0,
        button: '中子是怎么发现的',
        draw: moderator,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '水：氢核和中子质量差不多', correct: true, say: '对。质量相近，传得最多。' },
              { html: '铅：铅核重，中子撞上去会停下', say: '撞很重的东西，中子会几乎原速弹回，动能几乎没少。' },
              { html: '哪种都行', say: '看柱子：氢 100%，碳 28%，铅只有 2%。' }
            ],
            hints: ['回想刚才的曲线：质量比多少时传得最多？', '质量比为 1。', '氢核和中子差不多重。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
