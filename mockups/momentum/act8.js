/* 第 8 幕 · 小测：6 道单选，记录一次就对的题数，按目标给出回看链接 */
(function () {
  'use strict';

  // 第 1 题的"实测"数据
  var m1 = 0.5, m2 = 0.3, v1 = 0.4, vc = 0.246;
  var mvPre = m1 * v1, mvPost = (m1 + m2) * vc;
  var m2Pre = m1 * v1 * v1, m2Post = (m1 + m2) * vc * vc;
  function pc(a, b) { var p = (b - a) / a * 100; return (p < 0 ? '少了 ' : '多了 ') + Math.abs(p).toFixed(1) + '%'; }

  var Qs = [
    {
      goal: 0,
      title: '哪个量可以看作不变？',
      stem: 'A 车 0.5 kg 以 0.40 m/s 撞上静止的 B 车 0.3 kg，碰后粘在一起，测得共同速度 0.246 m/s。按"相差 5% 以内算不变"，哪个量可以看作不变？',
      options: [
        { html: '<i class="sym">v</i> 之和', say: '0.40 → 0.49，多了两成多，变了。' },
        { html: '<i class="sym">mv</i> 之和', correct: true, say: '对。' + mvPre.toFixed(3) + ' → ' + mvPost.toFixed(3) + '，' + pc(mvPre, mvPost) + '，在误差范围内。' },
        { html: '<i class="sym">mv</i>² 之和', say: m2Pre.toFixed(3) + ' → ' + m2Post.toFixed(3) + '，' + pc(m2Pre, m2Post) + '，变了。' },
        { html: '三个都变了', say: '实验数据不会完全相等。按规则，差 5% 以内算不变。' }
      ],
      hints: ['分别算三个量碰撞前后的和。', 'mv：0.5 × 0.40 和 0.8 × 0.246。', 'mv 之和只差 1.6%，可以看作不变。']
    },
    {
      goal: 0,
      title: '哪种碰撞能分辨 mv 和 mv²？',
      stem: '要判断碰撞中不变的是"mv 之和"还是"mv² 之和"，应该选哪种碰撞来做实验？',
      options: [
        { html: '等质量，碰后分开', say: '这种碰撞里两者都不变，分不出来。' },
        { html: '不等质量，碰后分开', say: '这种碰撞里两者也都不变，第 1 轮就是这样。' },
        { html: '碰后粘在一起', correct: true, say: '对。粘住时 mv² 之和会变小，mv 之和不变，一下就分开了。' },
        { html: '哪种都可以', say: '碰后分开的碰撞里，mv 和 mv² 之和都不变，分不出谁对。' }
      ],
      hints: ['想想第 3 幕的第 1 轮：两者都过关了。', '哪种碰撞会让 mv² 之和变小？', '碰后粘在一起。']
    },
    {
      goal: 1,
      title: '两物体的总动量',
      stem: '光滑水平面上，A 物体 1 kg 以 3 m/s 向右运动，B 物体 2 kg 以 1 m/s 向左运动。两物体的总动量是多少？',
      options: [
        { html: '1 kg·m/s，向右', correct: true, say: '对。取向右为正：1 × 3 + 2 × (−1) = 1 kg·m/s。' },
        { html: '5 kg·m/s', say: '把动量当标量加了。B 向左，要记作负值。' },
        { html: '1 kg·m/s，向左', say: '算一算正负：3 − 2 = 1，是正的。' },
        { html: '0', say: '相向运动不一定抵消，要算一算：3 和 2 不相等。' }
      ],
      hints: ['先规定向右为正。', 'A：1 × 3；B：2 × (−1)。', '3 − 2 = 1，向右。']
    },
    {
      goal: 1,
      title: '网球的动量变化',
      stem: '0.06 kg 的网球以 30 m/s 飞来，被球拍以 40 m/s 反向击回。网球动量变化量的大小是多少？',
      options: [
        { html: '0.6 kg·m/s', say: '这是用速率直接相减：40 − 30。方向反了，要带正负算。' },
        { html: '4.2 kg·m/s，方向与来球方向相同', say: '大小对了，方向反了：Δp 和击回的方向相同。' },
        { html: '0', say: '速度方向变了，动量就变了。' },
        { html: '4.2 kg·m/s，方向与击回方向相同', correct: true, say: '对。取击回方向为正：Δp = 0.06 × [40 − (−30)] = 4.2 kg·m/s。' }
      ],
      hints: ['取击回方向为正，来球速度记作负值。', 'Δp = 0.06 × 40 − 0.06 × (−30)。', '4.2 kg·m/s，与击回方向相同。']
    },
    {
      goal: 2,
      title: '动能相等，动量之比是多少？',
      stem: '质量之比为 1 : 4 的两个物体，动能相等。它们的动量大小之比是多少？',
      options: [
        { html: '1 : 1', say: '动能相等，动量不一定相等。用 p = √(2mEₖ)。' },
        { html: '1 : 4', say: '动量不和质量成正比，两者速度不同。用 p = √(2mEₖ)。' },
        { html: '1 : 2', correct: true, say: '对。p = √(2mEₖ) ∝ √m，√1 : √4 = 1 : 2。' },
        { html: '1 : 16', say: '把平方关系用反了。p 和 √m 成正比。' }
      ],
      hints: ['把 p = mv 和 Eₖ = ½mv² 联系起来。', 'p = √(2mEₖ)，动能相等时 p ∝ √m。', '√1 : √4 = 1 : 2。']
    },
    {
      goal: 2,
      title: '匀速圆周运动',
      stem: '物体做匀速圆周运动时，下列说法正确的是？',
      options: [
        { html: '动量和动能都不变', say: '"匀速"指速率不变，速度方向一直在变。' },
        { html: '动能不变，动量变', correct: true, say: '对。速率不变，所以动能不变；方向一直在变，所以动量在变。' },
        { html: '动量不变，动能变', say: '弄反了。动能只看速率，动量还看方向。' },
        { html: '都在变', say: '动能是标量，只看速率，速率不变动能就不变。' }
      ],
      hints: ['动量是矢量，动能是标量。', '匀速圆周运动：速率变不变？方向变不变？', '动能不变，动量变。']
    }
  ];

  var GOALS = [
    { name: '碰撞中的不变量是 mv', act: 3 },
    { name: '动量是矢量，Δp 带方向', act: 5 },
    { name: '动量和动能的区别', act: 4 }
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
        st.style.cssText = 'width:auto;max-width:560px;font-size:16px;color:var(--c-ink);margin-bottom:18px';
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
        return n === Qs.length ? '6 道题都是一次答对，三个目标都达成了。' : '一次答对 ' + n + ' 道。没全对的目标，点右边回去再看一遍。';
      }
    }],
    button: '完成',
    mount: function (el, api) {
      var r = rec(), n = 0;
      Qs.forEach(function (q, i) { if (r[i] === true) n++; });
      var d = document.createElement('div');
      d.innerHTML = '<div class="score">' + n + ' / ' + Qs.length + '</div>' +
        '<div style="color:var(--c-steel);font-size:14px;margin-top:4px">一次就答对的题数</div>';
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

  GRAV.act({ id: 8, name: '小测', tag: '第 8 幕 · 小测', steps: steps });
})();
