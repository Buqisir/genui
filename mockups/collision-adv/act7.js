/* 第 7 幕 · 小测与作业：7 道单选，按 L1 → L2 → L3 排（进阶课 L1 两道）；记录第一次是否答对，按目标给出回看链接；最后是分两层的作业 */
(function () {
  'use strict';

  var Qs = [
    {
      goal: 0, title: '动量过关吗（L1）',
      stem: '光滑水平面上，2 kg 的 A 以 3 m/s 撞静止的 1 kg 的 B，有人说碰后 A 1 m/s、B 3 m/s（同向）。这可能吗？',
      options: [
        { html: '不可能：动量不守恒', correct: true, say: '对。碰前 6，碰后 2 + 3 = 5。' },
        { html: '可能', say: '先查动量：碰前 2 × 3 = 6，碰后 2 × 1 + 1 × 3 = 5。' },
        { html: '不可能：动能增加了', say: '动能 9 J → 1 + 4.5 = 5.5 J，没增加。毛病在动量。' },
        { html: '不可能：A 比 B 慢', say: '后面的比前面的慢是可以的。毛病在动量。' }
      ],
      hints: ['三条逐条查，先查动量。', '碰前 6 kg·m/s。', '碰后 5 kg·m/s，不守恒。']
    },
    {
      goal: 1, title: '谁交出的动能最多（L1）',
      stem: '中子与下列静止的原子核发生弹性正碰，一次碰撞后中子损失动能最多的是与哪种核碰？',
      options: [
        { html: '氢核', correct: true, say: '对。一样重，动能全部交出去。' },
        { html: '碳核', say: '碳核是中子的 12 倍，只交出约 28%。' },
        { html: '铅核', say: '铅核太重，中子几乎原速弹回，只交出约 2%。' },
        { html: '都一样', say: '质量比不同，交出的比例差很多。' }
      ],
      hints: ['质量比多少时传得最多？', '质量比为 1。', '氢核和中子差不多重。']
    },
    {
      goal: 0, title: 'B 的速度范围（L2）',
      stem: '光滑水平面上，质量 m 的 A 以 v 正碰静止的、质量 4m 的 B。碰后 B 的速度可能是？',
      options: [
        { html: '0.3v', correct: true, say: '对。粘住 0.2v，弹性 0.4v，0.3v 在中间。' },
        { html: '0.5v', say: '弹性时最快也只有 2m/(5m) × v = 0.4v。' },
        { html: '0.1v', say: '粘住时最慢也有 v/5 = 0.2v。' },
        { html: '只能是 0.4v', say: '那是弹性碰撞的结果。非弹性碰撞也可能发生。' }
      ],
      hints: ['B 最慢、最快各在什么情况下？', '粘住：v/5；弹性：2v/5。', '0.2v ≤ vB ≤ 0.4v。']
    },
    {
      goal: 0, title: '动能过关吗（L2）',
      stem: '光滑水平面上，1 kg 的 A 以 4 m/s 撞静止的 1 kg 的 B，有人说碰后 A 以 1 m/s 弹回、B 以 5 m/s 前进。这可能吗？',
      options: [
        { html: '不可能：动能从 8 J 增加到 13 J', correct: true, say: '对。动量 4 = −1 + 5 守恒，动能却增加了。' },
        { html: '可能：动量守恒', say: '动量守恒只是第一条。再算动能：0.5 + 12.5 = 13 J，碰前只有 8 J。' },
        { html: '不可能：动量不守恒', say: '算一算：−1 + 5 = 4，动量守恒。毛病在动能。' },
        { html: '可能：等质量会交换速度', say: '交换速度是 A 停、B 4 m/s。这一组 B 是 5 m/s，动能多了。' }
      ],
      hints: ['先查动量，再查动能。', '动量 4 = −1 + 5。', '动能 8 J → 13 J。']
    },
    {
      goal: 0, title: '追上去碰（L2）',
      stem: '光滑水平面上，2 kg 的 A 以 5 m/s 追上前方同向运动的 1 kg 的 B（2 m/s），发生正碰。碰后速度（单位 m/s）可能的是？',
      options: [
        { html: 'A 4，B 4', correct: true, say: '对。粘在一起：动量 12，动能 24 J ≤ 27 J。' },
        { html: 'A 4.5，B 3', say: '动量 12、动能 24.75 J 都过了，可 A 在后面比 B 快。' },
        { html: 'A 6，B 0', say: '动量 12 对；动能 36 J，比碰前 27 J 多。' },
        { html: 'A 2，B 8', say: '动量 12 对；动能 4 + 32 = 36 J，比碰前 27 J 多。' }
      ],
      hints: ['碰前动量 12 kg·m/s，动能 27 J。', '逐组查动量、动能，再看谁快。', '只有一组三条都过。']
    },
    {
      goal: 1, title: '乒乓球撞保龄球（L2）',
      stem: '乒乓球以 v 正碰静止的保龄球，看作弹性碰撞。碰后',
      options: [
        { html: '乒乓球几乎以原速率弹回，几乎不损失动能', correct: true, say: '对。质量相差悬殊，几乎传不过去。' },
        { html: '乒乓球停下，动能全给了保龄球', say: '那是一样重时才会发生。' },
        { html: '两者以相同速度前进', say: '那是粘在一起。弹性碰撞会弹开。' },
        { html: '保龄球以约 2v 前进', say: '那是重的撞轻的。这里是轻的撞重的。' }
      ],
      hints: ['轻的撞很重的，会怎样？', '想想撞墙。', '原速弹回。']
    },
    {
      goal: 2, title: '挑战：称一称未知粒子（L3）',
      stem: '一种未知的中性粒子以同样的速度分别正碰静止的氢核和氦核（氦核质量取氢核的 4 倍），都是弹性碰撞，测得碰后氦核与氢核的最大速度之比为 2 : 5。粒子质量约为氢核的几倍？',
      options: [
        { html: '1 倍', correct: true, say: '对。(M + 1)/(M + 4) = 2/5，M = 1。' },
        { html: '4 倍', say: '如果和氦核一样重，氦核会被撞得和入射粒子一样快。' },
        { html: '2.5 倍', say: '2.5 是速度之比的倒数，不是质量。' },
        { html: '0.4 倍', say: '0.4 是速度之比。还要解方程。' }
      ],
      hints: ['u_He/u_H = [2M/(M + 4)] ÷ [2M/(M + 1)]。', '(M + 1)/(M + 4) = 2/5。', '5M + 5 = 2M + 8。']
    }
  ];

  var GOALS = [
    { name: '判断碰撞是否可能', act: 2 },
    { name: '质量比与动能传递', act: 3 },
    { name: '用碰撞称出中子', act: 4 }
  ];

  var HOMEWORK = [
    { tag: '必做 1 · L1', q: '光滑水平面上，1 kg 的 A 以 6 m/s 撞静止的 2 kg 的 B。下列碰后结果（A，B，单位 m/s）哪些可能？(1) 2，2；(2) −2，4；(3) 0，3；(4) −4，5。', a: '(1) 可能（粘在一起）；(2) 可能（弹性）；(3) 可能（动能 9 J ≤ 18 J，A 静止在 B 后面）；(4) 不可能（动能 8 + 25 = 33 J > 18 J）。' },
    { tag: '必做 2 · L2', q: '（人教版教材第 5 节练习与应用第 5 题）质量为 m、速度为 v 的 A 球跟质量为 3m 的静止 B 球发生正碰。碰撞可能是弹性的，也可能是非弹性的，因此碰撞后 B 球的速度可能有不同的值。请论证：碰撞后 B 球的速度可能是以下值吗？(1) 0.6v；(2) 0.4v。', a: '0.25v ≤ vB ≤ 0.5v：可能是 0.4v，不可能是 0.6v。' },
    { tag: '必做 3 · L3', q: '（人教版教材第 5 节练习与应用第 4 题）一种未知粒子跟静止的氢原子核正碰，测出碰撞后氢原子核的速度是 3.3×10⁷ m/s；该未知粒子跟静止的氮原子核正碰时，测出碰撞后氮原子核的速度是 4.4×10⁶ m/s。已知氢原子核的质量是 mH，氮原子核的质量是 14mH，上述碰撞都是弹性碰撞，求未知粒子的质量。', a: 'mH。(M + 14)/(M + 1) = 3.3×10⁷ ÷ 4.4×10⁶ = 7.5，M = 1。' },
    { tag: '选做 · 拓展', q: '（由教材第 5 节练习与应用第 3 题拓展）核电站常用石墨（碳）作中子减速剂。中子与静止的碳核（质量取中子的 12 倍）发生一次弹性正碰，把多少比例的动能交给碳核？查资料：实际碰撞大多不是正碰，中子要碰多少次才能从 2 MeV 降到热中子？', a: '48/169 ≈ 28%。实际约要碰 114 次（氢只要 18 次，数据见 Wikipedia "Neutron moderator"）。' }
  ];

  function rec() {
    if (!GRAV.state.quiz) GRAV.state.quiz = {};
    return GRAV.state.quiz;
  }

  var steps = Qs.map(function (q, i) {
    return {
      title: '小测 ' + (i + 1) + ' / ' + Qs.length + '：' + q.title,
      layout: 'answer',
      beats: [{ say: '第 ' + (i + 1) + ' 题。' }],
      gateAt: 0,
      button: i === Qs.length - 1 ? '看结果' : '下一题',
      mount: function (el, api) {
        var st = document.createElement('div');
        st.className = 'stem';
        st.textContent = q.stem;
        el.appendChild(st);
        var r = rec();
        GRAV.ui.choice(el, {
          options: q.options,
          hints: q.hints,
          onWrong: function () { if (r[i] == null) r[i] = false; },
          onCorrect: function () { if (r[i] == null) r[i] = true; }
        }, api);
      }
    };
  });

  steps.push({
    title: '小测结果',
    layout: 'answer',
    beats: [{
      say: function () {
        var r = rec(), n = 0;
        Qs.forEach(function (q, i) { if (r[i] === true) n++; });
        return n === Qs.length ? '7 道题都是第一次就答对，三个目标都达成了。' : '第一次就答对 ' + n + ' 道。没全对的目标，点右边回去再看一遍。';
      }
    }],
    button: '看作业',
    mount: function (el, api) {
      var r = rec(), n = 0;
      Qs.forEach(function (q, i) { if (r[i] === true) n++; });
      var d = document.createElement('div');
      d.innerHTML = '<div class="score">' + n + ' / ' + Qs.length + '</div>' +
        '<div class="score-sub">第一次就答对的题数</div>';
      var rows = document.createElement('div');
      rows.className = 'score-rows';
      GOALS.forEach(function (g, gi) {
        var ok = Qs.every(function (q, i) { return q.goal !== gi || r[i] === true; });
        var row = document.createElement('div');
        row.className = 'score-row';
        row.innerHTML = '<span>' + g.name + '</span>';
        if (ok) {
          row.innerHTML += '<span class="ok">✓ 掌握了</span>';
        } else {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'txt-btn';
          b.textContent = '回第 ' + g.act + ' 幕再看 →';
          b.addEventListener('click', function () { api.jump(g.act); });
          row.appendChild(b);
        }
        rows.appendChild(row);
      });
      d.appendChild(rows);
      el.appendChild(d);
    }
  });

  steps.push({
    title: '作业',
    layout: 'answer',
    beats: [{ say: '课后做一做。必做三题由易到难，后两题是教材原题；选做是减速剂的查资料题。' }],
    button: '完成',
    mount: function (el) {
      var d = document.createElement('div');
      d.className = 'hw';
      d.innerHTML = HOMEWORK.map(function (h) {
        return '<div class="hw-i"><div class="hw-t">' + h.tag + '</div><div class="hw-q">' + h.q + '</div>' +
          '<details class="hw-a"><summary>对答案</summary><div>' + h.a + '</div></details></div>';
      }).join('');
      el.appendChild(d);
    }
  });

  GRAV.finishNote = function () {
    var r = rec(), n = 0;
    Qs.forEach(function (q, i) { if (r[i] === true) n++; });
    var head = '你走完了进阶课：碰撞全谱与中子的发现。';
    if (n === Qs.length) return head + '<br>小测 <span class="num">' + n + ' / ' + n + '</span> 第一次全对，三个目标都拿下了。';
    return head + '<br>小测第一次答对 <span class="num">' + n + ' / ' + Qs.length + '</span>，没拿下的目标，回去再看一遍就好。';
  };

  GRAV.act({ id: 7, name: '小测', tag: '第 7 幕 · 小测', steps: steps });
})();
