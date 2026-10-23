/* 第 2 幕 · 第 1 轮：重车撞轻车、碰后弹开。数据推翻猜想 1；学生筛候选组合；在真实数据上引出"变没变"的判断标准 */
(function () {
  'use strict';

  var S = GRAV.h.sym, R = RD.R1;

  // 候选判断：每个组合三选一（留下 / 淘汰：单位不同 / 淘汰：和现象相反），选的就是理由
  var REASONS = [
    { k: 'keep', t: '留下' },
    { k: 'unit', t: '淘汰：单位不同，不能相加' },
    { k: 'opp', t: '淘汰：和现象相反' }
  ];
  var CANDS = [
    {
      t: S('m') + ' + ' + S('v'), right: 'unit',
      say: {
        unit: '对。质量和速度单位不同，不能相加。',
        keep: 'kg 和 m/s 能直接相加吗？',
        opp: '先别看现象，先看单位：kg 和 m/s 能直接相加吗？'
      }
    },
    {
      t: S('v') + ' / ' + S('m'), right: 'opp',
      say: {
        opp: '对。按 v/m，质量越大，这一项越小、越不重要；可重车 A 只慢下来一部分，轻车 B 却跑得飞快，重的那辆分量反而更大。',
        keep: '按 v/m，质量越大越不重要。和刚才的现象对得上吗？',
        unit: '不同单位相除是可以的，m/s 除以 kg 是个正常的单位。毛病在别处。'
      }
    },
    {
      t: S('mv'), right: 'keep',
      say: {
        keep: '留下。质量乘进去：重车速度变得少，轻车速度变得多，正好对得上。',
        unit: '相乘不要求单位相同，kg·m/s 是个正常的单位。',
        opp: '质量越大，mv 越大，重的那辆分量更大，和现象一致。'
      }
    },
    {
      t: S('mv') + '²', right: 'keep',
      say: {
        keep: '留下。这个组合也和现象一致，值得检验。',
        unit: '相乘不要求单位相同。',
        opp: '质量越大，mv² 也越大，和现象一致。'
      }
    }
  ];

  function mountCands(el, api) {
    var wrap = document.createElement('div');
    wrap.className = 'cands';
    var left = CANDS.length;
    CANDS.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'cand';
      row.innerHTML = '<div class="cand-t">' + c.t + '</div>';
      var bs = document.createElement('div');
      bs.className = 'cand-bs';
      REASONS.forEach(function (r) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'cand-b'; b.textContent = r.t;
        b.addEventListener('click', function () {
          if (b.disabled) return;
          api.me('「' + c.t.replace(/<[^>]+>/g, '') + '」：' + r.t);
          api.say(c.say[r.k]);
          if (r.k !== c.right) { b.disabled = true; b.classList.add('lose'); return; }
          b.classList.add(r.k === 'keep' ? 'keep' : 'drop');
          row.classList.add('done', r.k === 'keep' ? 'kept' : 'dropped');
          Array.prototype.forEach.call(bs.children, function (x) { x.disabled = true; });
          if (--left === 0) { api.win(true); api.open(); }
        });
        bs.appendChild(b);
      });
      row.appendChild(bs);
      wrap.appendChild(row);
    });
    el.appendChild(wrap);
    api.onBeat(function (bt) { wrap.classList.toggle('settled', bt > 0); });
  }

  GRAV.act({
    id: 2,
    name: '第 1 轮',
    tag: '第 2 幕 · 第 1 轮',
    steps: [
      {
        title: '第 1 轮：重车撞轻车，碰后弹开',
        beats: [
          { say: '换到气垫导轨上：小车被气垫托起，摩擦很小，光电门测出每辆车碰撞前后的速度。约定向右为正。' },
          { say: 'A 车 0.4 kg 以 0.60 m/s 撞上静止的 B 车 0.2 kg，碰撞面装着磁体，碰后弹开。按猜想 1，碰后两车的速度之和应该是多少？' },
          { say: '看碰撞。下面是两车的 v–t 图，碰撞前后各有一段平台，速度从平台上读：A ' + RD.d3(R.a) + ' m/s，B ' + RD.d3(R.b) + ' m/s。' },
          { say: RD.say(R, 'v') + '。猜想 1 出局。' },
          { say: '再看现象：轻的 B 跑得比 A 原来还快（0.794 > 0.600），重的 A 只慢下来一部分。质量也要算进去。' }
        ],
        gateAt: 1,
        button: '质量怎么算进去',
        play: true,
        playAt: 2,
        tall: true,
        draw: RD.scene(R, '碰撞面装磁体：碰后弹开', 1, false),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '0.60 m/s', correct: true, say: '对。猜想 1 说速度之和不变，碰前是 0.60 + 0 = 0.60。看看实际怎样。' },
              { html: '比 0.60 m/s 大', say: '猜想 1 说速度之和不变。按它推，碰后应该还是碰前的 0.60。' },
              { html: '比 0.60 m/s 小', say: '猜想 1 说速度之和不变。按它推，碰后应该还是碰前的 0.60。' }
            ],
            hints: ['碰前两车的速度之和是多少？', 'A 0.60 m/s，B 静止：和是 0.60 m/s。', '猜想 1 说它不变，所以碰后也该是 0.60 m/s。'],
            onCorrect: function () { api.win(false); }
          }, api);
          RD.tables(el, api, R, 2, [[3, 'v']]);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      },
      {
        title: '质量怎么算进去？',
        beats: [
          { say: '下面四种组合，逐个判断：留下来检验，还是直接淘汰？淘汰的话，理由是什么？' },
          { say: '留下 mv 和 mv²。mv² 这个组合眼熟：动能就是 ½mv²。' },
          { say: '两个都和现象对得上。光看现象分不出，得用数据算一算。' }
        ],
        gateAt: 0,
        button: '用数据算',
        tall: true,
        draw: RD.scene(R, null, null, false),
        mount: mountCands
      },
      {
        title: '用第 1 轮的数据算一算',
        beats: [
          { say: '把 mv 和 mv² 也算出来。下面的柱子画出 A、B 和它们的和，虚线是碰前的和。' },
          { say: 'mv 之和：0.240 → 0.238。这算不算变了？' },
          { say: '实验总有摩擦和测量误差，数字不会完全相等。我们约定：前后只差几个百分点，算没变；差几十个百分点，才算变了。0.240 → 0.238 只差 0.8%，没变。' },
          { say: RD.say(R, 'mv2') + '，也没变。' },
          { say: 'mv 和 mv² 都过关了，这一轮分不出谁对。得找一种碰撞，让它们一个变、一个不变。' }
        ],
        gateAt: 1,
        button: '你来设计',
        play: true,
        tall: true,
        draw: RD.scene(R, null, null, true),
        mount: function (el, api) {
          var box = document.createElement('div');
          box.className = 'q-gap';
          GRAV.ui.choice(box, {
            options: [
              { html: '变了，数字不一样', say: '数字是不一样，可实验总有误差。只差 0.8%，要看作没变。' },
              { html: '可以看作没变', correct: true, say: '对。只差 0.8%，在实验误差之内。' },
              { html: '无法判断', say: '能判断：只差 0.8%，在实验误差之内。' }
            ],
            hints: ['算一算差了百分之几。', '(0.240 − 0.238) ÷ 0.240 ≈ 0.8%。', '只差 0.8%，可以看作没变。'],
            onCorrect: function () { api.win(false); }
          }, api);
          RD.tables(el, api, R, 0, [[0, 'v'], [2, 'mv'], [3, 'mv2']]);
          el.appendChild(box);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      }
    ]
  });
})();
