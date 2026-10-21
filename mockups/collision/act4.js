/* 第 4 幕 · 弹性碰撞的公式：两条守恒式推出 v₁′、v₂′，先用"一样重"检验，再对第 1 节的实测；两种极限：铅球撞乒乓球、小球撞墙 */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  function q(s, sub) { return S(s) + (sub || ''); }
  var m1 = q('m', '₁'), m2 = q('m', '₂'), v1 = q('v', '₁'), v1p = q('v', '₁′'), v2p = q('v', '₂′');
  COL.F1 = v1p + ' = (' + m1 + ' − ' + m2 + ')' + v1 + ' / (' + m1 + ' + ' + m2 + ')';
  COL.F2 = v2p + ' = 2' + m1 + v1 + ' / (' + m1 + ' + ' + m2 + ')';

  // 两种极限：上面铅球撞乒乓球（播放），下面小球撞墙（第 3 句起出现，静止画面）
  function limits(ctx, w, h, t, C, beat) {
    var x0 = 16, x1 = w - 16, y = h * 0.3, R = 26, r = 9;
    var tt = beat >= 1 ? t : 0, k = (x1 - x0) * 0.16;
    var run = MOM.run(tt, { xA0: x0 + 6, xB0: x0 + (x1 - x0) * 0.38, wA: 2 * R, wB: 2 * r, vA: 1, vB: 0, vA2: 0.98, vB2: 1.98, k: k, x0: x0, x1: x1, after: 1.6 });
    ctx.save(); ctx.strokeStyle = C.steel; ctx.beginPath(); ctx.moveTo(x0, y + R); ctx.lineTo(x1, y + R); ctx.stroke(); ctx.restore();
    var ax = run.xA + R, bx = run.xB + r;
    ctx.save();
    ctx.beginPath(); ctx.arc(ax, y, R, 0, Math.PI * 2); ctx.fillStyle = C.graphite; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, y + R - r, r, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    GRAV.draw.text(ctx, '铅球', ax, y - R - 8, { size: 12, color: C.graphite, align: 'center' });
    GRAV.draw.text(ctx, '乒乓球', bx, y + R - 2 * r - 8, { size: 12, color: C.graphite, align: 'center' });
    var sc = 46, ay = y + R + 22;
    if (!run.after) MOM.vArrow(ctx, ax, ay, 1, sc, C, 'v');
    else {
      MOM.vArrow(ctx, ax, ay, 0.98, sc, C, '≈ v');
      MOM.vArrow(ctx, Math.min(bx, x1 - 2 * sc - 4), ay + 26, 1.98, sc, C, '≈ 2v');
    }
    if (beat >= 2) {
      var wy = h * 0.74, wx = x1 - 20;
      ctx.save();
      ctx.fillStyle = MOM.rgba(C.graphite, 0.25); ctx.fillRect(wx, wy - 50, 10, 70);
      ctx.strokeStyle = C.steel; ctx.beginPath(); ctx.moveTo(x0, wy + 20); ctx.lineTo(wx, wy + 20); ctx.stroke();
      ctx.beginPath(); ctx.arc(wx - 12, wy + 8, 12, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.stroke();
      ctx.restore();
      MOM.vArrow(ctx, wx - 30 - sc * 1.2, wy - 20, 1, sc, C, '撞墙前 v');
      MOM.vArrow(ctx, wx - 30, wy - 44, -1, sc, C, '弹回 ≈ v');
      GRAV.draw.text(ctx, '墙：质量极大的 ' + 'm₂', x0, wy + 40, { size: 12, color: C.steel });
    }
    GRAV.draw.text(ctx, '弹性正碰，被碰的静止', x0, 16, { size: 12, color: C.steel });
  }

  GRAV.act({
    id: 4,
    name: '弹性碰撞的公式',
    tag: '第 4 幕 · 弹性碰撞的公式',
    steps: [
      {
        title: '把三种情况放进一个式子',
        layout: 'answer',
        beats: [
          { say: '质量 m₁ 的物体以 v₁ 弹性正碰静止的 m₂，碰后速度 v₁′、v₂′。两个未知数，正好有两条规律：动量守恒、动能不变。' },
          { say: '两式各自移项，下式除以上式，得到 v₁ + v₁′ = v₂′。' },
          { say: '代回动量式，解出两个速度。' },
          { say: '先检验一下：用公式算一样重（m₁ = m₂）的情况，结果是什么？' },
          { say: '和第 3 幕一样重的那次一致。再代第 1 节的另外两组数据，公式和实测也对得上。' }
        ],
        gateAt: 3,
        button: '质量差得很多呢',
        mount: function (el, api) {
          var wk = GRAV.ui.work(el), shown = 0;
          var box = document.createElement('div');
          box.className = 'q-gap';
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: v1p + ' = 0，' + v2p + ' = ' + v1, correct: true, say: '对。m₁ − m₂ = 0，2m₁/(m₁ + m₂) = 1：交换速度。' },
              { html: v1p + ' = ' + v2p + ' = ' + v1 + '/2', say: '代一代：m₁ = m₂ 时，(m₁ − m₂) = 0，v₁′ 是 0。各一半是粘住的结果。' },
              { html: v1p + ' = −' + v1 + '，' + v2p + ' = 0', say: '那是撞墙（m₂ 极大）的情况。m₁ = m₂ 时，v₁′ 的分子是 0。' }
            ],
            hints: ['把 m₂ 换成 m₁。', 'v₁′ 的分子 m₁ − m₂ = 0。', 'v₂′ = 2m₁v₁/(2m₁) = v₁。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var tb = document.createElement('table');
          tb.className = 'dt dt-gap';
          tb.innerHTML = '<tr><th>第 1 节的数据</th><th>公式 ' + v1p + '，' + v2p + '</th><th>实测</th></tr>' +
            '<tr><td>一样重 0.2 / 0.2 kg</td><td>0，0.60</td><td>0.000，0.594</td></tr>' +
            '<tr><td>重撞轻 0.4 / 0.2 kg</td><td>0.20，0.80</td><td>0.198，0.794</td></tr>' +
            '<tr><td>轻撞重 0.2 / 0.4 kg</td><td>−0.20，0.40</td><td>−0.197，0.396</td></tr>';
          el.appendChild(tb);
          var unit = document.createElement('div');
          unit.className = 'score-sub';
          unit.textContent = '速度单位 m/s；A 都以 0.60 m/s 撞静止的 B';
          el.appendChild(unit);
          api.onBeat(function (bt) {
            if (bt >= 0 && shown < 1) {
              wk.line(m1 + v1 + ' = ' + m1 + v1p + ' + ' + m2 + v2p, '动量守恒');
              wk.line('½' + m1 + v1 + '² = ½' + m1 + v1p + '² + ½' + m2 + v2p + '²', '动能不变');
              shown = 1;
            }
            if (bt >= 1 && shown < 2) {
              wk.line(m1 + '(' + v1 + ' − ' + v1p + ') = ' + m2 + v2p);
              wk.line(m1 + '(' + v1 + '² − ' + v1p + '²) = ' + m2 + v2p + '²');
              wk.line(v1 + ' + ' + v1p + ' = ' + v2p, '下式除以上式');
              shown = 2;
            }
            if (bt >= 2 && shown < 3) {
              wk.line(COL.F1);
              wk.line(COL.F2);
              shown = 3;
            }
            box.hidden = bt !== 3;
            tb.hidden = unit.hidden = bt < 4;
          });
        }
      },
      {
        title: '质量差得很多时',
        beats: [
          { say: '很重的铅球以 v 弹性正碰静止的乒乓球。碰后乒乓球大约多快？' },
          { say: 'm₁ ≫ m₂ 时，公式里的 m₂ 可以忽略：铅球 v₁′ ≈ v，几乎不受影响；乒乓球 v₂′ ≈ 2m₁v/m₁ = 2v。' },
          { say: '反过来，m₁ ≪ m₂：v₁′ ≈ −v₁，v₂′ ≈ 0，原速弹回。第 1 节的小球撞墙就是这样：墙是质量极大的 m₂。' }
        ],
        gateAt: 0,
        button: '做一道例题',
        play: true,
        playAt: 1,
        tall: true,
        draw: limits,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '约 ' + S('v'), say: '速度原样传过去，只在一样重时发生。代公式：m₁ ≫ m₂ 时，2m₁/(m₁ + m₂) 接近 2。' },
              { html: '约 2' + S('v'), correct: true, say: '对。2m₁/(m₁ + m₂) → 2。' },
              { html: '略小于 ' + S('v'), say: '那是铅球自己碰后的速度。问的是乒乓球：v₂′ = 2m₁v/(m₁ + m₂)。' },
              { html: '约 ' + S('v') + '/2', say: '各一半是粘住的结果。代公式：2m₁/(m₁ + m₂) → 2。' }
            ],
            hints: ['m₁ ≫ m₂，公式里 m₂ 可以忽略。', 'v₂′ = 2m₁v/(m₁ + m₂) ≈ 2m₁v/m₁。', '约 2v。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
