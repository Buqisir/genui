/* 第 3 幕 · 三轮实验：v 之和、mv² 之和、不带方向的 mv 之和依次出局，剩下 mv 的矢量和 */
(function () {
  'use strict';

  var f = MOM.f, S = GRAV.h.sym;

  // 三轮数据：理想值附近的"实测"值（带一点误差）
  var R = [
    { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0, a: 0.198, b: 0.794, side: 'mag' },
    { mA: 0.4, mB: 0.2, vA: 0.6, vB: 0, a: 0.396, b: 0.396, side: 'velcro' },
    { mA: 0.2, mB: 0.4, vA: 0.6, vB: 0, a: -0.197, b: 0.396, side: 'mag' }
  ];
  var Q = {
    v: { name: S('v') + ' 之和', f: function (m, v) { return v; } },
    mv: { name: S('mv') + ' 之和', f: function (m, v) { return m * v; } },
    abs: { name: '|' + S('mv') + '| 之和', f: function (m, v) { return Math.abs(m * v); } },
    mv2: { name: S('mv') + '² 之和', f: function (m, v) { return m * v * v; } }
  };
  function sums(r, q) {
    var F = Q[q].f;
    return { pre: F(r.mA, r.vA) + F(r.mB, r.vB), post: F(r.mA, r.a) + F(r.mB, r.b) };
  }
  function pctTxt(s) {
    var p = MOM.pct(s.pre, s.post);
    return (p >= 0 ? '多了 ' : '少了 ') + Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0) + '%';
  }
  function d3(x) { return f(x, 3); }

  // ---------- 画面：导轨、两车、速度箭头 ----------
  function scene(r, label) {
    return function (ctx, w, h, t, C) {
      var x0 = 24, x1 = w - 24, y = h * 0.6;
      var cw = Math.max(70, Math.min(130, w * 0.15)), chH = Math.max(34, Math.min(46, cw * 0.36));
      var wA = cw * (r.mA >= r.mB ? 1.15 : 0.9), wB = cw * (r.mB >= r.mA ? 1.15 : 0.9);
      var k = (x1 - x0) * 0.42;
      MOM.track(ctx, x0, x1, y, C);
      var run = MOM.run(t, {
        xA0: x0 + 20, xB0: x0 + (x1 - x0) * 0.5, wA: wA, wB: wB,
        vA: r.vA, vB: r.vB, vA2: r.a, vB2: r.b, k: k, x0: x0, x1: x1
      });
      var stuck = r.side === 'velcro';
      MOM.cart(ctx, run.xA, y, wA, chH, C, { name: 'A', label: r.mA + ' kg', heavy: r.mA > r.mB, face: 1, side: r.side });
      MOM.cart(ctx, run.xB, y, wB, chH, C, { name: 'B', label: r.mB + ' kg', heavy: r.mB > r.mA, face: -1, side: r.side });
      var ay = y + 32, sc = 90;
      var va = run.after ? r.a : r.vA, vb = run.after ? r.b : r.vB;
      MOM.vArrow(ctx, run.xA + wA / 2, ay, va, sc, C, f(va, 2) + ' m/s');
      if (!(stuck && run.after)) MOM.vArrow(ctx, run.xB + wB / 2, ay + 26, vb, sc, C, f(vb, 2) + ' m/s');
      GRAV.draw.text(ctx, run.after ? '碰后' : '碰前', x0, h * 0.22, { size: 13, color: C.graphite });
      GRAV.draw.text(ctx, '向右为正', x1, h * 0.22, { size: 12, color: C.steel, align: 'right' });
      if (label) GRAV.draw.note(ctx, label, w, h, C);
    };
  }

  // ---------- 作答区：速度表 + 候选量表 ----------
  function speedTable(r) {
    return '<table class="dt"><tr><th></th><th>' + S('m') + '（kg）</th><th>碰前 ' + S('v') + '</th><th>碰后 ' + S('v') + '</th></tr>' +
      '<tr><td>A 车</td><td>' + r.mA + '</td><td>' + f(r.vA, 2) + '</td><td>' + d3(r.a) + '</td></tr>' +
      '<tr><td>B 车</td><td>' + r.mB + '</td><td>' + f(r.vB, 2) + '</td><td>' + d3(r.b) + '</td></tr></table>';
  }
  function candTable() {
    var t = document.createElement('table');
    t.className = 'dt';
    t.style.marginTop = '22px';
    t.innerHTML = '<tr><th>候选量</th><th>碰前</th><th>碰后</th><th></th></tr>';
    return {
      el: t,
      row: function (r, q) {
        var s = sums(r, q), keep = MOM.kept(s.pre, s.post);
        var tr = document.createElement('tr');
        tr.className = 'in';
        tr.innerHTML = '<td>' + Q[q].name + '</td><td>' + d3(s.pre) + '</td><td>' + d3(s.post) + '</td>' +
          '<td><span class="vd ' + (keep ? 'keep' : 'drop') + '">' + (keep ? '不变' : '变了') + '</span></td>';
        t.appendChild(tr);
      }
    };
  }
  // 按句逐行出现：rows[k] = [句序号, 候选量]
  function roundMount(r, rows, extra) {
    return function (el, api) {
      var sp = document.createElement('div');
      sp.innerHTML = speedTable(r);
      el.appendChild(sp);
      var ct = candTable(), shown = 0;
      el.appendChild(ct.el);
      api.onBeat(function (bt) {
        sp.hidden = bt < (r.showAt || 0);
        while (shown < rows.length && rows[shown][0] <= bt) { ct.row(r, rows[shown][1]); shown++; }
        ct.el.hidden = shown === 0;
      });
      if (extra) extra(el, api);
    };
  }

  function say(r, q) {
    var s = sums(r, q);
    return Q[q].name.replace(/<[^>]+>/g, '') + '：' + d3(s.pre) + ' → ' + d3(s.post) + '，' + pctTxt(s);
  }

  R[1].showAt = 1;
  R[2].showAt = 2;

  GRAV.act({
    id: 3,
    name: '三轮实验',
    tag: '第 3 幕 · 三轮实验',
    steps: [
      {
        title: '气垫导轨上的两辆小车',
        beats: [
          { say: '气垫导轨把小车托起来，摩擦很小。光电门测出每辆车碰撞前后的速度。' },
          { say: '约定向右为正。每一轮都算三个候选量在碰撞前后的和：v 之和、mv 之和、mv² 之和。' },
          { say: '实验有误差，数字不会完全相等。我们约定：前后相差 5% 以内，算没变；超过 10%，算变了。' }
        ],
        button: '开始第 1 轮',
        draw: scene(R[0], '碰撞面装磁体：碰后弹开'),
        mount: function (el, api) {
          var d = document.createElement('div');
          d.innerHTML = '<div class="rule">候选量：' + S('v') + ' 之和、' + S('mv') + ' 之和、' + S('mv') + '² 之和<br>判断规则：相差 5% 以内算不变</div>';
          el.appendChild(d);
          api.onBeat(function (bt) { d.hidden = bt < 1; });
        }
      },
      {
        title: '第 1 轮：重车撞轻车，碰后分开',
        beats: [
          { say: 'A 车 0.4 kg 以 0.60 m/s 撞上静止的 B 车 0.2 kg，碰撞面装着磁体，碰后分开。' },
          { say: '测得碰后 A ' + d3(R[0].a) + ' m/s，B ' + d3(R[0].b) + ' m/s。来算三个量。' },
          { say: say(R[0], 'v') + '。猜想 1 又被推翻。' },
          { say: say(R[0], 'mv') + '，没变。' },
          { say: say(R[0], 'mv2') + '，也没变。' },
          { say: 'mv 和 mv² 都过关了，这一轮分不出谁对。得找一种碰撞，让它们表现不同。' }
        ],
        button: '开始第 2 轮',
        draw: scene(R[0]),
        mount: roundMount(R[0], [[2, 'v'], [3, 'mv'], [4, 'mv2']])
      },
      {
        title: '第 2 轮：同样两辆车，碰后粘在一起',
        beats: [
          { say: '把碰撞面换成粘扣，碰后两车粘在一起。先想一想：粘住之后，mv² 之和会怎样？' },
          { say: '测得两车的共同速度是 ' + d3(R[1].a) + ' m/s。' },
          { say: say(R[1], 'mv') + '，还是没变。' },
          { say: say(R[1], 'mv2') + '，远远超出误差。猜想 3 出局。' },
          { say: '这是最关键的一轮：第 1 轮里 mv² 也不变，可它不是每次碰撞都不变。只有粘在一起的碰撞，才把它和 mv 分开。' }
        ],
        gateAt: 0,
        button: '开始第 3 轮',
        draw: scene(R[1], '碰撞面装粘扣：碰后粘在一起'),
        mount: roundMount(R[1], [[2, 'mv'], [3, 'mv2']], function (el, api) {
          var box = document.createElement('div');
          box.style.marginTop = '22px';
          el.insertBefore(box, el.firstChild);
          GRAV.ui.choice(box, {
            options: [
              { html: '不变', say: '第 1 轮里它确实不变，可这一轮碰撞方式不同了。看数据。' },
              { html: '变大', say: '碰撞不会凭空让车跑得更快。看数据。' },
              { html: '变小', correct: true, say: '你的判断是变小。粘住时两车挤压，有一部分运动"损失"掉了。看数据。' }
            ],
            hints: ['粘住的时候，两车会互相挤压。', '挤压会发热，运动会"损失"一些吗？', '会变小。看数据验证。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt > 0; });
        })
      },
      {
        title: '第 3 轮：轻车撞重车，碰后分开',
        beats: [
          { say: '这次反过来：A 车 0.2 kg 以 0.60 m/s 撞上静止的 B 车 0.4 kg。' },
          { say: 'A 被弹了回来，速率 0.197 m/s。按向右为正，它的速度该记作多少？' },
          { say: 'B 车以 ' + d3(R[2].b) + ' m/s 向右。先不管方向，把 mv 的大小加起来：' + say(R[2], 'abs').split('：')[1] + '。' },
          { say: '带上方向再算：' + say(R[2], 'mv').split('：')[1] + '，不变。' },
          { say: '所以守得住的，是 mv 的矢量和。方向要算进去。' }
        ],
        gateAt: 1,
        button: '回头看三轮',
        draw: scene(R[2]),
        mount: roundMount(R[2], [[2, 'abs'], [3, 'mv']], function (el, api) {
          var box = document.createElement('div');
          box.style.marginTop = '22px';
          el.insertBefore(box, el.firstChild);
          GRAV.ui.choice(box, {
            options: [
              { html: '0.197 m/s', say: '它是向左运动的，方向和约定的正方向相反。' },
              { html: '−0.197 m/s', correct: true, say: '对。向左运动，记作负值。' }
            ],
            hints: ['我们约定了哪个方向为正？', 'A 弹回去，是向左还是向右？', '向左，记作 −0.197 m/s。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        })
      },
      {
        title: '三轮实验，剩下一个',
        layout: 'answer',
        beats: [
          { say: '回头看三轮：每一轮都淘汰掉一个候选。' },
          { say: '剩下的是：碰撞前后，两车 mv 的矢量和不变。' }
        ],
        button: '给它起个名字',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.innerHTML = '<table class="dt" style="max-width:520px"><tr><th>轮次</th><th>碰撞</th><th>淘汰了</th></tr>' +
            '<tr><td>第 1 轮</td><td>重车撞轻车，分开</td><td>' + S('v') + ' 之和</td></tr>' +
            '<tr><td>第 2 轮</td><td>碰后粘在一起</td><td>' + S('mv') + '² 之和</td></tr>' +
            '<tr><td>第 3 轮</td><td>轻车撞重车，反弹</td><td>不带方向的 ' + S('mv') + ' 之和</td></tr></table>';
          var big = document.createElement('div');
          big.className = 'big';
          big.style.marginTop = '28px';
          big.innerHTML = '两车 ' + S('mv') + ' 的矢量和不变';
          el.appendChild(d); el.appendChild(big);
          api.onBeat(function (bt) { big.hidden = bt < 1; api.win(bt >= 1); });
        }
      }
    ]
  });
})();
