/* 第 5 幕 · 练习：示范例题（m 撞静止的 2m，B 可能是 0.5v、0.7v 吗，仿教材第 5 节练习第 5 题，L2）→ 同向追碰四组候选（L2～L3）→ 中子撞氢核和氮核（改编自湖南 2022-4 情景，L3） */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  function chase(ctx, w, h, t, C, beat) {
    var x0 = 8, x1 = w - 8, y = h * 0.42, cw = w < 520 ? 60 : 76, ch = 30;
    MOM.track(ctx, x0, x1, y, C);
    var ax = w * 0.18, bx = w * 0.5;
    MOM.cart(ctx, ax, y, cw, ch, C, { name: 'A', label: '1 kg' });
    MOM.cart(ctx, bx, y, cw, ch, C, { name: 'B', label: '1 kg' });
    MOM.vArrow(ctx, ax + cw / 2, y + 26, 6, 12, C, '6 m/s');
    MOM.vArrow(ctx, bx + cw / 2, y + 26, 2, 12, C, '2 m/s');
    GRAV.draw.text(ctx, '碰前：动量 8 kg·m/s，动能 20 J', x0, h - 16, { size: 12, color: C.graphite });
    GRAV.draw.text(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
  }
  function neutron(ctx, w, h, t, C, beat) {
    var x = w * 0.18;
    [[h * 0.3, '氢核', 1, beat >= 1 ? 'v₀' : '？'], [h * 0.68, '氮核（14 倍）', 14, beat >= 1 ? '2v₀/15' : '？']].forEach(function (r) {
      ctx.save(); ctx.fillStyle = MOM.rgba(C.steel, 0.6); ctx.beginPath(); ctx.arc(x, r[0], 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      MOM.vArrow(ctx, x - 70, r[0], 1, 50, C, '中子 v₀');
      var rad = r[2] > 1 ? 14 : 6, nx = x + 70;
      ctx.save(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(nx, r[0], rad, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      GRAV.draw.text(ctx, r[1], nx, r[0] + rad + 18, { size: 12, color: C.graphite, align: 'center' });
      if (beat >= 1) MOM.vArrow(ctx, nx + rad + 6, r[0], r[2] > 1 ? 2 / 15 : 1, 120, C, r[3]);
      else GRAV.draw.text(ctx, '碰后 ？', nx + rad + 10, r[0] + 4, { size: 12, color: C.vel });
    });
    GRAV.draw.text(ctx, '弹性正碰，靶核静止；中子质量取与氢核相等', 8, 16, { size: 12, color: C.steel });
  }

  function section(el, label) {
    var d = document.createElement('div');
    d.className = 'ex-sec';
    d.innerHTML = '<div class="ex-l">' + label + '</div>';
    el.appendChild(d);
    return d;
  }
  function stem(el, text) {
    var st = document.createElement('div');
    st.className = 'stem';
    st.textContent = text;
    el.appendChild(st);
  }

  GRAV.act({
    id: 5,
    name: '练习',
    tag: '第 5 幕 · 练习',
    steps: [
      {
        title: '例题：B 的速度可能是多少？',
        beats: [
          { say: '先看一道完整的例题，题目在右边。' },
          { say: '策略：B 的速度最大、最小，各在什么情况下？' },
          { say: '解答：粘住时 B 最慢，mv = 3mv′，v/3 ≈ 0.33v；弹性时 B 最快，2m/(3m) × v ≈ 0.67v。0.5v 在范围里，可能；0.7v 超出，不可能。' },
          { say: '讨论：检验 0.7v。A 的速度 = v − 2 × 0.7v = −0.4v；动能 ½m(0.4v)² + ½(2m)(0.7v)² = 0.57mv²，比碰前 0.5mv² 多，确实不可能。' }
        ],
        gateAt: 1,
        button: '自己做一道',
        tall: true,
        draw: function (ctx, w, h, t, C, beat) {
          var r = beat >= 3 ? { a: -0.4, b: 0.7 } : null;
          ADV.pair(ctx, w, h, C, { k: 2, vA: r ? r.a : null, vB: r ? r.b : null, before: true, labels: ['A  m', 'B  2m'], bars: !!r, tag: r ? '碰后（检验 0.7v）' : '碰后' });
        },
        mount: function (el, api) {
          var s1 = section(el, '情境 · 自编，仿人教版第 5 节练习与应用第 5 题');
          s1.insertAdjacentHTML('beforeend', '<div class="stem">光滑水平面上，质量 m 的 A 以 v 正碰静止的、质量 2m 的 B。碰后 B 的速度可能是 0.5v 吗？可能是 0.7v 吗？</div>');
          var s2 = section(el, '策略');
          var box = document.createElement('div');
          s2.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '弹性时最大，粘在一起时最小', correct: true, say: '对。B 的速度就在这两者之间。' },
              { html: '弹性时最小，粘在一起时最大', say: '反了：弹回得越多，B 被推得越快。回想第 2 幕的滑块。' },
              { html: 'B 的速度只有一个值', say: '碰撞类型不确定，B 的速度就有一个范围。' }
            ],
            hints: ['回想第 2 幕的"弹回程度"滑块。', '拖到 0（粘住）和 1（弹性）时 B 分别多快？', '粘住最慢，弹性最快。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var s3 = section(el, '解答'), w3 = GRAV.ui.work(s3);
          var s4 = section(el, '讨论'), w4 = GRAV.ui.work(s4);
          var shown = 0;
          api.onBeat(function (bt) {
            s2.hidden = bt < 1; s3.hidden = bt < 2; s4.hidden = bt < 3;
            if (bt >= 2 && shown < 1) {
              w3.line('粘住：' + S('mv') + ' = 3' + S('m') + S('v') + '′，' + S('v') + '_B = ' + S('v') + '/3 ≈ 0.33' + S('v'));
              w3.line('弹性：' + S('v') + '_B = 2' + S('m') + '/(3' + S('m') + ') × ' + S('v') + ' ≈ 0.67' + S('v'));
              w3.line('0.33' + S('v') + ' ≤ ' + S('v') + '_B ≤ 0.67' + S('v') + '：0.5' + S('v') + ' 可能，0.7' + S('v') + ' 不可能');
              shown = 1;
            }
            if (bt >= 3 && shown < 2) { w4.line('0.7' + S('v') + '：动能 0.57' + S('mv') + '² > 0.5' + S('mv') + '²'); shown = 2; }
          });
        }
      },
      {
        title: '追上去碰：哪组可能？',
        beats: [
          { say: '光滑水平面上，质量都是 1 kg 的 A、B 同向运动，A 在后以 6 m/s，B 在前以 2 m/s，A 追上 B 发生正碰。碰后 A、B 的速度可能是哪一组？三条检查逐条过。' },
          { say: '碰前动量 8 kg·m/s，动能 20 J。A 3、B 5：动量 8，动能 17 J，A 比 B 慢，三条都过。A 5、B 3 动能也没增加，可 A 比 B 快；A 7、B 1 和 A −1、B 9 动能都增加了。' }
        ],
        gateAt: 0,
        button: '再做一道',
        draw: chase,
        mount: function (el, api) {
          stem(el, '光滑水平面上，质量都是 1 kg 的 A、B 同向运动，A 在后以 6 m/s，B 在前以 2 m/s，A 追上 B 发生正碰。碰后 A、B 的速度（单位 m/s）可能是？');
          GRAV.ui.choice(el, {
            options: [
              { html: 'A 5，B 3', say: '动量 8，动能 17 J，都过了；可 A 在后面比 B 快，要穿过 B。' },
              { html: 'A 7，B 1', say: '动量 8 对；动能 24.5 + 0.5 = 25 J，比 20 J 多了。' },
              { html: 'A 3，B 5', correct: true, say: '对。动量 8，动能 4.5 + 12.5 = 17 J，A 比 B 慢。' },
              { html: 'A −1，B 9', say: '动量 8 对；动能 0.5 + 40.5 = 41 J，比 20 J 多了一倍。' }
            ],
            hints: ['先算碰前的动量和动能。', '8 kg·m/s，20 J。逐组查动量、动能，再看谁快。', '后面的 A 不能比 B 快。']
          }, api);
        }
      },
      {
        title: '挑战：中子撞氢核和氮核',
        beats: [
          { say: '中子以 v₀ 分别与静止的氢核、氮核发生弹性正碰。氮核质量取氢核的 14 倍，中子质量取与氢核相等。碰后氮核速度与氢核速度之比是多少？（改编自 2022 年湖南卷第 4 题情景）' },
          { say: '氢核：一样重，交换速度，v_H = v₀。氮核：v_N = 2 × 1/(1 + 14) × v₀ = 2v₀/15。所以 v_N : v_H = 2 : 15。这正是查德威克看到的：氮核被撞得慢得多。' }
        ],
        gateAt: 0,
        button: '收束',
        draw: neutron,
        mount: function (el, api) {
          stem(el, '中子以 v₀ 分别与静止的氢核、氮核发生弹性正碰。氮核质量取氢核的 14 倍，中子质量取与氢核相等。碰后氮核速度与氢核速度之比是？（改编自 2022 年湖南卷第 4 题情景）');
          GRAV.ui.choice(el, {
            options: [
              { html: '2 : 15', correct: true, say: '对。v_H = v₀，v_N = 2v₀/15。' },
              { html: '1 : 14', say: '速度不是简单地和质量成反比。用公式 v₂′ = 2m₁v₁/(m₁ + m₂)。' },
              { html: '1 : 7', say: '1 : 7 是把分母写成 14 了。m₁ + m₂ = 1 + 14 = 15。' },
              { html: '15 : 2', say: '比值反了：氮核重，被撞得慢。' }
            ],
            hints: ['用 v₂′ = 2m₁v₁/(m₁ + m₂)。', '氢核：2 × 1/2 = 1；氮核：2 × 1/15。', 'v_N : v_H = 2 : 15。']
          }, api);
        }
      }
    ]
  });
})();
