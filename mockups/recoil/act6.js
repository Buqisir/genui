/* 第 6 幕 · 小测与作业：7 道单选，按 L1 → L2 → L3 排；记录第一次是否答对，按目标给出回看链接；最后是分两层的作业 */
(function () {
  'use strict';

  var Qs = [
    {
      goal: 0,
      title: '哪个不是反冲（L1）',
      stem: '下列现象中，不属于反冲的是？',
      options: [
        { html: '章鱼向后喷水，向前游', say: '章鱼把水向后喷出，自己向前：是反冲。' },
        { html: '射击时枪身向后撞肩', say: '子弹向前，枪身向后：是反冲。' },
        { html: '喷灌装置一边喷水一边旋转', say: '水从斜着的喷口喷出，喷管反向转动：是反冲。' },
        { html: '跳高运动员落在海绵垫上', correct: true, say: '对。那是延长作用时间、减小冲击力，是第 2 节的缓冲。' }
      ],
      hints: ['反冲：一部分向后抛出，另一部分向前。', '逐个看：有没有东西被抛出去？', '落在海绵垫上没有抛出任何东西。']
    },
    {
      goal: 0,
      title: '冰面推冰球（L1）',
      stem: '光滑冰面上，静止的 50 kg 的人把 1 kg 的冰球以 10 m/s 向前推出。人的速度是？',
      options: [
        { html: '0.2 m/s，向后', correct: true, say: '对。0 = 50v + 1 × 10，v = −0.2 m/s。' },
        { html: '0.2 m/s，向前', say: '开始总动量是 0，冰球向前，人就向后。' },
        { html: '10 m/s，向后', say: '人比冰球重得多，速度要小：50v = 1 × 10。' },
        { html: '0：没有外力推人', say: '冰球带走了向前的动量，人就得到等量的向后动量。' }
      ],
      hints: ['开始总动量是多少？', '0 = 50v + 1 × 10。', 'v = −0.2 m/s。']
    },
    {
      goal: 1,
      title: '谁推火箭（L1）',
      stem: '太空中火箭发动机工作时，使火箭加速的力的施力物体是？',
      options: [
        { html: '喷出的燃气', correct: true, say: '对。发动机推燃气，燃气推火箭。' },
        { html: '周围的空气', say: '太空中没有空气，火箭照样加速。' },
        { html: '地球', say: '地球的引力不会让火箭向前加速。推火箭的是燃气。' },
        { html: '太空中没有施力物体，火箭靠惯性加速', say: '惯性只能保持速度，不能加速。' }
      ],
      hints: ['火箭和谁在相互作用？', '和它喷出去的燃气。', '燃气推火箭。']
    },
    {
      goal: 0,
      title: '炮车和炮弹的动能（L2）',
      stem: '光滑水平面上，静止的炮车水平射出一枚炮弹，炮车比炮弹重得多。关于射出后两者的动能',
      options: [
        { html: '炮弹的动能远大于炮车', correct: true, say: '对。动量一样大，质量小的动能大：Ek = p²/(2m)。' },
        { html: '两者动能相等', say: '两者动量大小相等，动能并不相等。想想背包 90 J、人 7.5 J。' },
        { html: '两者动能之和为 0', say: '动能没有方向，不会正负抵消。' },
        { html: '炮车的动能更大，它更重', say: '炮车重，速度却小得多。动量相等时，质量小的动能大。' }
      ],
      hints: ['两者的动量有什么关系？', '等大反向。', 'Ek = p²/(2m)：质量小的动能大。']
    },
    {
      goal: 1,
      title: '质量比（L2）',
      stem: '两枚火箭喷气速度相同。A 起飞质量与箭体质量之比是 4，B 是 8。燃料用完时，谁的速度大？',
      options: [
        { html: 'B', correct: true, say: '对。质量比大，喷出去的相对多、剩下的相对少，速度大。' },
        { html: 'A', say: '质量比越大，越快。B 的质量比更大。' },
        { html: '一样大：喷气速度相同', say: '除了喷气速度，还要看质量比。' },
        { html: '无法比较', say: '能比较：喷气速度相同时，质量比大的更快。' }
      ],
      hints: ['火箭速度和哪两个因素有关？', '喷气速度和质量比。', '喷气速度相同，比质量比。']
    },
    {
      goal: 2,
      title: '最高点爆炸（L2）',
      stem: '斜抛的炮弹在最高点（速度 v₀，水平）炸成质量相等的两块，其中一块速度恰好为 0。另一块的速度是？（改编自 2023 年河北卷第 8 题情景）',
      options: [
        { html: '2v₀，水平向前', correct: true, say: '对。mv₀ = (m/2) × 0 + (m/2)v，v = 2v₀。' },
        { html: 'v₀', say: '一块停下了，它原来的动量都给了另一块。' },
        { html: 'v₀/2', say: '炸开前总动量是 mv₀，另一块只有 m/2，速度要更大。' },
        { html: '0：爆炸前后总动量都是 0', say: '炮弹原来在动，总动量是 mv₀，不是 0。' }
      ],
      hints: ['爆炸前的总动量是多少？', 'mv₀（水平方向）。', 'mv₀ = (m/2)v。']
    },
    {
      goal: 2,
      title: '挑战：人船（L3）',
      stem: '静止在水面上的 200 kg 小船长 4 m，50 kg 的人从船头走到船尾，不计水的阻力。船移动了多远？',
      options: [
        { html: '0.8 m', correct: true, say: '对。50x人 = 200x船，x人 + x船 = 4 m，x船 = 0.8 m。' },
        { html: '0', say: '水面没有阻力，人走船就退。' },
        { html: '1 m', say: '4 × 50 ÷ 200 = 1 用的是"人对地走了 4 m"。人是相对船走了 4 m：x人 + x船 = 4 m。' },
        { html: '3.2 m', say: '3.2 m 是人对地的位移。' }
      ],
      hints: ['每一刻总动量都是 0。', '50x人 = 200x船。', '再用 x人 + x船 = 4 m。']
    }
  ];

  var GOALS = [
    { name: '解释并计算反冲', act: 1 },
    { name: '说明火箭的原理', act: 2 },
    { name: '运动中分离与人船', act: 3 }
  ];

  var HOMEWORK = [
    { tag: '必做 1 · L1', q: '质量 4 kg 的步枪水平射出 10 g 的子弹，子弹出口速度 800 m/s（对地）。步枪的后坐速度多大？', a: '2 m/s。0 = 4v + 0.01 × 800。' },
    { tag: '必做 2 · L2', q: '（人教版教材本节练习与应用第 2 题）连同装备共 100 kg 的航天员，在离飞船 45 m 处与飞船相对静止。装备中的高压气源能以 50 m/s 的速度喷出气体。要在 10 min 内返回飞船，开始时需要一次性向后喷出多少气体？', a: '0.15 kg。返回速度 45 ÷ 600 = 0.075 m/s，0 = (100 − Δm) × 0.075 − 50Δm。' },
    { tag: '必做 3 · L3', q: '（人教版教材本节练习与应用第 1 题）火箭飞行速度是 8000 m/s 时，如果它喷出的气体相对火箭的速度小于 8000 m/s，以地面为参考系，气体的速度方向与火箭飞行方向相同。继续喷气，火箭的速度还会增加吗？为什么？', a: '会增加。以喷气前的火箭为参考系，它原来静止，燃气向后喷出，火箭就得到向前的速度增量；燃气对地朝哪边不影响这一点。' },
    { tag: '选做 · 实践', q: '（课标活动建议）做一枚水火箭。在同样的打气压力下，分别装 1/4、1/3、1/2 瓶水，比较飞行距离，用动量解释：为什么不装水飞不远，装太多水也飞不远？', a: '水喷出去才能带走动量；没喷出去的水要被瓶子带上天，成了负担。两者之间有一个最好的装水量。' }
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
    beats: [{ say: '课后做一做。必做三题由易到难，后两题是教材原题；选做是课标建议的水火箭实验。' }],
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
    var head = '你走完了反冲与火箭这一课，也走完了动量单元的五节新授课。';
    if (n === Qs.length) return head + '<br>小测 <span class="num">' + n + ' / ' + n + '</span> 第一次全对，三个目标都拿下了。';
    return head + '<br>小测第一次答对 <span class="num">' + n + ' / ' + Qs.length + '</span>，没拿下的目标，回去再看一遍就好。';
  };

  GRAV.act({ id: 6, name: '小测', tag: '第 6 幕 · 小测', steps: steps });
})();
