/* 第 8 幕 · 小测与作业：7 道单选，按 L1 → L2 → L3 排；记录第一次是否答对，按目标给出回看链接；最后是分两层的作业 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  var Qs = [
    {
      goal: 2,
      title: '碰后粘在一起（L1）',
      stem: '光滑水平面上，2 kg 的小车以 3 m/s 撞上静止的 1 kg 小车，碰后粘在一起。共同速度多大？',
      options: [
        { html: '2 m/s', correct: true, say: '对。2 × 3 = 3v，v = 2 m/s。' },
        { html: '3 m/s', say: '速度不会原样传过去：粘在一起后是 3 kg 一起动。' },
        { html: '1.5 m/s', say: '不能把速度取平均。守恒的是动量。' },
        { html: '约 2.45 m/s', say: '这是按动能不变算出来的。粘在一起时动能不守恒。' }
      ],
      hints: ['碰前总动量是多少？', '2 × 3 = 6 kg·m/s；碰后总质量 3 kg。', '6 ÷ 3 = 2 m/s。']
    },
    {
      goal: 0,
      title: '另一个物体的动量变化（L2）',
      stem: '光滑水平面上 A、B 两物体发生相互作用，A 的动量增加了 3 kg·m/s，方向向右。B 的动量变化是？',
      options: [
        { html: '3 kg·m/s，向右', say: '两个冲量方向相反：A 增加多少，B 就减少多少。' },
        { html: '3 kg·m/s，向左', correct: true, say: '对。Δp_B = −Δp_A。' },
        { html: '0', say: 'B 受到 A 的反作用力，动量一定变了。' },
        { html: '无法确定', say: '能确定：系统不受外力，两者动量变化等大反向。' }
      ],
      hints: ['两物体之间的力有什么关系？', '等大反向，作用时间相同。', 'Δp_B = −Δp_A。']
    },
    {
      goal: 1,
      title: '哪个系统动量守恒（L2）',
      stem: '下列过程中，所选系统动量守恒的是？',
      options: [
        { html: '子弹射入静止在光滑水平面上的木块（子弹 + 木块）', correct: true, say: '对。水平方向不受外力，子弹和木块之间的力是内力。' },
        { html: '木块沿固定的粗糙斜面下滑（木块）', say: '木块受重力、支持力、摩擦力，合力不为零。' },
        { html: '小球自由下落（小球）', say: '小球受重力，合外力不为零，动量越来越大。' },
        { html: '汽车在水平路面上加速（汽车）', say: '路面对汽车的摩擦力是外力，正是它让汽车加速。' }
      ],
      hints: ['逐个看：所选系统受不受外力？', '合外力为零的才守恒。', '子弹射入木块：水平方向不受外力。']
    },
    {
      goal: 1,
      title: '小车、弹簧、滑块（L2）',
      stem: '光滑水平地面上有一小车，车厢挡板连一根弹簧，弹簧另一端连一滑块，滑块与车厢底板之间有摩擦。向右推小车压缩弹簧后撤去推力。之后，小车、弹簧、滑块组成的系统（改编自 2021 年全国乙卷选择题情景）',
      options: [
        { html: '动量守恒，机械能守恒', say: '滑块和底板之间有摩擦，会生热，机械能不守恒。' },
        { html: '动量守恒，机械能不守恒', correct: true, say: '对。摩擦力、弹力都是内力，地面光滑；摩擦生热，机械能减少。' },
        { html: '动量不守恒，机械能守恒', say: '撤去推力后，水平方向不受外力，动量守恒。' },
        { html: '都不守恒', say: '摩擦在系统内部，不改变总动量。' }
      ],
      hints: ['撤去推力后，系统受到哪些外力？', '地面光滑，水平方向不受外力。', '动量守恒；有摩擦生热，机械能不守恒。']
    },
    {
      goal: 1,
      title: '等大反向的拉力（L2）',
      stem: '光滑水平面上，两小球受到大小始终相等、方向相反的拉力，从静止开始相向运动，然后正碰。从开始运动到碰后，两球组成的系统总动量（改编自 2025 年广东卷第 3 题）',
      options: [
        { html: '始终为 0', correct: true, say: '对。两个拉力是外力，但合力为零，总动量一直保持开始时的 0。' },
        { html: '只在碰撞时守恒，其余时间不守恒', say: '两个拉力等大反向，合外力始终为零，整个过程都守恒。' },
        { html: '一直增大', say: '两球速度都在增大，可方向相反，总动量还是 0。' },
        { html: '无法确定', say: '能确定：合外力为零，总动量不变。' }
      ],
      hints: ['两个拉力的矢量和是多少？', '等大反向，合力为零。', '总动量保持开始时的值：0。']
    },
    {
      goal: 1,
      title: '挑战：斜面体（L3）',
      stem: '光滑水平面上放着 4 kg 的光滑斜面体，1 kg 的物块从顶端由静止滑下，到底端时水平速度为 4 m/s，向右。此时斜面体的速度是？',
      options: [
        { html: '1 m/s，向左', correct: true, say: '对。水平方向：0 = 1 × 4 + 4v，v = −1 m/s。' },
        { html: '0，斜面体不动', say: '地面光滑，斜面体会被物块推着退。' },
        { html: '4 m/s，向左', say: '要乘上质量：4 kg 的斜面体只需 1 m/s。' },
        { html: '1 m/s，向右', say: '开始水平动量是 0，物块向右，斜面体就向左。' }
      ],
      hints: ['哪个方向上不受外力？', '水平方向，开始总动量是 0。', '0 = 1 × 4 + 4v。']
    },
    {
      goal: 2,
      title: '挑战：气垫导轨的数据（L3）',
      stem: '气垫导轨上，0.2 kg 的滑块 A 以 0.6 m/s 撞静止的 0.3 kg 滑块 B。由 x–t 图测得碰后 A 静止。若动量守恒，碰后 B 的速度应约为？（改编自 2024 年山东卷第 13 题情景）',
      options: [
        { html: '0.4 m/s', correct: true, say: '对。0.2 × 0.6 = 0.3v，v = 0.4 m/s。' },
        { html: '0.6 m/s', say: '速度不会原样传过去，要乘上质量。' },
        { html: '0.24 m/s', say: '碰后 A 静止，只有 B 在动，要除以 B 的质量 0.3 kg。' },
        { html: '0.9 m/s', say: '质量比用反了：B 更重，速度应该更小。' }
      ],
      hints: ['碰前总动量是多少？', '0.2 × 0.6 = 0.12 kg·m/s。', '碰后只有 B 动：0.12 ÷ 0.3 = 0.4 m/s。']
    }
  ];

  var GOALS = [
    { name: '推出两物体总动量不变', act: 1 },
    { name: '判断系统动量是否守恒', act: 2 },
    { name: '用守恒定律算速度，处理实验数据', act: 5 }
  ];

  var HOMEWORK = [
    { tag: '必做 1 · L1', q: '静止在光滑冰面上的 60 kg 的人，把 2 kg 的球以 6 m/s 水平抛出。人的速度多大、朝哪？', a: '0.2 m/s，与球反向。' },
    { tag: '必做 2 · L2', q: '光滑水平面上，A（3 kg）、B（2 kg）之间夹一根被压缩的轻弹簧，用细线拴住，静止。烧断细线后：（1）系统动量守恒吗？为什么？（2）A 获得 2 m/s 的速度时，B 的速度多大？', a: '（1）守恒：弹簧弹力是内力，水平方向不受外力；（2）3 m/s，与 A 反向。' },
    { tag: '必做 3 · L3', q: '用斜槽验证动量守恒：m₁ = 20 g，m₂ = 10 g，测得 OP = 40.0 cm，OM = 13.2 cm，ON = 53.0 cm。（1）写出要验证的式子；（2）算出两边并判断是否守恒。', a: '（1）m₁·OP = m₁·OM + m₂·ON；（2）800 g·cm 和 794 g·cm，相差 0.75%，在误差内守恒。' },
    { tag: '选做 · L3', q: '（人船模型）静止在水面上的 100 kg 小船，船长 3 m，50 kg 的人从船头走到船尾，不计水的阻力。船移动了多远？', a: '1 m。系统总动量始终为 0，人和船的位移与质量成反比：50 × s人 = 100 × s船，s人 + s船 = 3 m。' }
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
    beats: [{ say: '课后做一做。必做三题由易到难，各对应一个目标；选做题是人船模型，进阶课还会再见到它。' }],
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

  // 完成页的一句话：按小测成绩说
  GRAV.finishNote = function () {
    var r = rec(), n = 0;
    Qs.forEach(function (q, i) { if (r[i] === true) n++; });
    var head = '你走完了动量守恒定律这一课：从两只冰壶推出了守恒，也弄清了它什么时候成立。';
    if (n === Qs.length) return head + '<br>小测 <span class="num">' + n + ' / ' + n + '</span> 第一次全对，三个目标都拿下了。';
    return head + '<br>小测第一次答对 <span class="num">' + n + ' / ' + Qs.length + '</span>，没拿下的目标，回去再看一遍就好。';
  };

  GRAV.act({ id: 8, name: '小测', tag: '第 8 幕 · 小测', steps: steps });
})();
