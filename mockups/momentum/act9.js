/* 第 9 幕 · 小测与作业：7 道单选，记录第一次是否答对，按目标给出回看链接；最后是分两层的作业 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  // 第 1 题的"实测"数据
  var m1 = 0.5, m2 = 0.3, v1 = 0.4, vc = 0.246;
  var mvPre = m1 * v1, mvPost = (m1 + m2) * vc;
  var m2Pre = m1 * v1 * v1, m2Post = (m1 + m2) * vc * vc;
  function pc(a, b) { var p = (b - a) / a * 100; return (p < 0 ? '少了 ' : '多了 ') + Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0) + '%'; }
  // 第 3 题：守门员接冰球（改编自 OpenStax《Physics》8.3 节例题，CC BY 4.0）
  var vG = 0.150 * 35 / 70.15, vGKE = 35 * Math.sqrt(0.150 / 70.15);

  var Qs = [
    {
      goal: 0,
      title: '哪个量可以看作不变？',
      stem: 'A 车 0.5 kg 以 0.40 m/s 撞上静止的 B 车 0.3 kg，碰后粘在一起，测得共同速度 0.246 m/s。按"差几个百分点算没变"，哪个量可以看作不变？',
      options: [
        { html: S('v') + ' 之和', say: '0.40 → 0.49，多了 23%，变了。' },
        { html: S('mv') + ' 之和', correct: true, say: '对。' + mvPre.toFixed(3) + ' → ' + mvPost.toFixed(3) + '，' + pc(mvPre, mvPost) + '，在误差范围内。' },
        { html: S('mv') + '² 之和', say: m2Pre.toFixed(3) + ' → ' + m2Post.toFixed(3) + '，' + pc(m2Pre, m2Post) + '，变了。' },
        { html: '三个都变了', say: '实验数据不会完全相等。差几个百分点，算没变。' }
      ],
      hints: ['分别算三个量碰撞前后的和。', 'mv：0.5 × 0.40 和 0.8 × 0.246。', 'mv 之和只差 1.6%，可以看作没变。']
    },
    {
      goal: 0,
      title: '哪种碰撞能分清 mv 和 mv²？',
      stem: '要判断碰撞中不变的是"mv 之和"还是"mv² 之和"，应该选哪种碰撞来做实验？',
      options: [
        { html: '等质量，碰后分开', say: '这种碰撞里两者都不变，分不出来。' },
        { html: '不等质量，碰后分开', say: '这种碰撞里两者也都不变，第 1 轮就是这样。' },
        { html: '碰后粘在一起', correct: true, say: '对。粘住时 mv² 之和会变小，mv 之和不变，一下就分开了。' },
        { html: '哪种都可以', say: '碰后分开的碰撞里，mv 和 mv² 之和都不变，分不出谁对。' }
      ],
      hints: ['想想第 1 轮：两者都过关了。', '哪种碰撞会让 mv² 之和变小？', '碰后粘在一起。']
    },
    {
      goal: 0,
      title: '守门员接冰球',
      stem: '0.150 kg 的冰球以 35 m/s 飞来，被静止站在冰面上的 70 kg 守门员接住，两者一起后退。后退的速度是多少？',
      options: [
        { html: vG.toFixed(3) + ' m/s', correct: true, say: '对。0.150 × 35 = (70 + 0.150) v，v ≈ ' + vG.toFixed(3) + ' m/s。' },
        { html: '35 m/s', say: '速度不会原样"传"过去。接住以后是守门员和冰球一起动。' },
        { html: vGKE.toFixed(1) + ' m/s', say: '这是按"mv² 之和不变"算出来的。接住冰球、粘在一起，mv² 之和不守恒。' },
        { html: '0，守门员太重，推不动', say: '再重也会被推动一点。算一算 mv 之和。' }
      ],
      hints: ['冰球被接住，两者粘在一起。哪个量守得住？', '碰前 mv 之和 = 0.150 × 35；碰后总质量 70.15 kg。', '5.25 ÷ 70.15 ≈ ' + vG.toFixed(3) + ' m/s。']
    },
    {
      goal: 1,
      title: '网球的动量变化',
      stem: '0.06 kg 的网球以 30 m/s 飞来，被球拍以 40 m/s 反向击回。网球动量的变化量是多少？',
      options: [
        { html: '0.6 kg·m/s', say: '这是用速率直接相减：40 − 30。方向反了，要带正负算。' },
        { html: '4.2 kg·m/s，与来球方向相同', say: '大小对了，方向反了：Δp 和击回的方向相同。' },
        { html: '0', say: '速度方向变了，动量就变了。' },
        { html: '4.2 kg·m/s，与击回方向相同', correct: true, say: '对。取击回方向为正：Δp = 0.06 × 40 − 0.06 × (−30) = 4.2 kg·m/s。' }
      ],
      hints: ['取击回方向为正，来球速度记作负值。', 'Δp = 0.06 × 40 − 0.06 × (−30)。', '4.2 kg·m/s，与击回方向相同。']
    },
    {
      goal: 1,
      title: '只给动量的碰撞',
      stem: '物体 1 的动量 25 kg·m/s，向左；物体 2 的动量 35 kg·m/s，向右。两者相撞后，物体 1 的动量变为 15 kg·m/s，向右。物体 2 碰后的动量是多少？',
      options: [
        { html: '5 kg·m/s，向左', correct: true, say: '对。取向右为正：−25 + 35 = 15 + p₂′，p₂′ = −5，向左。' },
        { html: '45 kg·m/s', say: '这是把动量当成没有方向的数在加减：25 + 35 − 15。要先规定正方向。' },
        { html: '75 kg·m/s', say: '这是把三个动量的大小全加起来了。动量是矢量，要带正负。' },
        { html: '10 kg·m/s', say: '10 是碰前的总动量（−25 + 35）。还要减去物体 1 碰后的动量。' }
      ],
      hints: ['先规定向右为正，写出碰前的总动量。', '碰前：−25 + 35 = 10；碰后：15 + p₂′。', 'p₂′ = 10 − 15 = −5，向左。']
    },
    {
      goal: 2,
      title: '动量翻倍，动能呢？',
      stem: '同一个物体，动量变成原来的 2 倍，动能变成原来的几倍？',
      options: [
        { html: '2 倍', say: '动量跟 v 成正比，动能跟 v² 成正比，它们不同步。' },
        { html: '4 倍', correct: true, say: '对。质量不变，动量翻倍说明速度翻倍；动能跟 v² 成正比，变成 4 倍。' },
        { html: '不变', say: '速度变了，动能也会变。' },
        { html: '无法确定', say: '同一个物体，质量不变，可以确定。' }
      ],
      hints: ['同一个物体，质量不变。动量翻倍，说明什么翻倍了？', '速度变成 2 倍。', '动能跟 v² 成正比：2² = 4 倍。']
    },
    {
      goal: 2,
      title: '动能没变，动量呢？',
      stem: '一个物体的动能没有变，它的动量一定没有变吗？',
      options: [
        { html: '一定没变', say: '想想小球原速撞墙弹回：动能没变，动量变了。' },
        { html: '不一定，速度方向可能变了', correct: true, say: '对。动能只看速率，动量还看方向。' },
        { html: '一定变了', say: '方向和速率都没变时，动量也没变。所以是"不一定"。' }
      ],
      hints: ['动能和速度方向有关吗？', '动量是矢量，方向变了动量就变了。', '不一定：速率不变、方向变了，动量就变了。']
    }
  ];

  var GOALS = [
    { name: '用碰撞数据找出不变的量', act: 3 },
    { name: '带方向算动量和 Δp', act: 6 },
    { name: '分清动量和动能', act: 5 }
  ];

  var HOMEWORK = [
    { tag: '必做 1', q: '1.0 t 的小车以 10 m/s 追尾静止的 1.5 t 小车，两车卡在一起。求共同速度，并求损失了多少动能。', a: '4 m/s；动能从 50 000 J 变为 20 000 J，损失 30 000 J。' },
    { tag: '必做 2', q: '0.2 kg 的小球以 5 m/s 竖直落地，以 3 m/s 竖直弹起。取向上为正，求动量的变化量。', a: 'p = −1.0 kg·m/s，p′ = +0.6 kg·m/s，Δp = 1.6 kg·m/s，向上。' },
    { tag: '必做 3', q: '同一辆车，速度从 10 m/s 提到 20 m/s，动量和动能各变为原来的几倍？', a: '动量 2 倍，动能 4 倍。' },
    { tag: '选做', q: '冰壶 B 最后停下了，它的动量变成了 0。是什么改变了它的动量？你觉得动量变化的快慢和什么有关？', a: '开放题，下一节"动量定理"揭晓。' }
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
    beats: [{ say: '课后做一做。必做三题，每题对应一个目标；选做题接着冰壶的问题，下一节揭晓。' }],
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
    var head = '你走完了动量这一课：自己设计实验，找出了碰撞里守得住的量。';
    if (n === Qs.length) return head + '<br>小测 <span class="num">' + n + ' / ' + n + '</span> 第一次全对，三个目标都拿下了。';
    return head + '<br>小测第一次答对 <span class="num">' + n + ' / ' + Qs.length + '</span>，没拿下的目标，回去再看一遍就好。';
  };

  GRAV.act({ id: 9, name: '小测', tag: '第 9 幕 · 小测', steps: steps });
})();
