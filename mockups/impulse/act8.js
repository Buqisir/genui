/* 第 8 幕 · 小测与作业：7 道单选，按 L1 → L2 → L3 排；记录第一次是否答对，按目标给出回看链接；最后是分两层的作业 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  var Qs = [
    {
      goal: 0,
      title: '恒力的冲量（L1）',
      stem: '2 kg 的物体受 4 N 的恒定合力作用 3 s，动量变化多少？',
      options: [
        { html: '12 kg·m/s', correct: true, say: '对。Δp = FΔt = 4 × 3 = 12 kg·m/s。' },
        { html: '6 kg·m/s', say: '6 是速度的变化（m/s）：12 ÷ 2。题目问的是动量的变化。' },
        { html: '24 kg·m/s', say: '多乘了质量。冲量就是 FΔt，直接等于 Δp。' },
        { html: '1.5 kg·m/s', say: '再看一次：Δp = F × Δt。' }
      ],
      hints: ['动量定理：Δp = FΔt。', 'F = 4 N，Δt = 3 s。', '4 × 3 = 12 kg·m/s。']
    },
    {
      goal: 1,
      title: '读 F–t 图求冲量（L2）',
      stem: '一个力从 0 均匀增大到 10 N 用了 0.2 s，又均匀减小到 0 用了 0.2 s。这个力的冲量多大？',
      options: [
        { html: '2 N·s', correct: true, say: '对。F–t 图是三角形，面积 ½ × 0.4 × 10 = 2 N·s。' },
        { html: '4 N·s', say: '这是把它当成一直 10 N 推了 0.4 s。力是先增后减的。' },
        { html: '1 N·s', say: '只算了增大的那一半，减小的那 0.2 s 也有冲量。' },
        { html: '10 N·s', say: '冲量是面积，不是力的峰值。' }
      ],
      hints: ['画出 F–t 图，是什么形状？', '一个三角形：底 0.4 s，高 10 N。', '½ × 0.4 × 10 = 2 N·s。']
    },
    {
      goal: 1,
      title: '接球时手往后撤（L2）',
      stem: '接快速飞来的球时，手要顺势往后撤。这样做是为了什么？',
      options: [
        { html: '减小球受到的冲量', say: '球都是从飞来变成停下，动量变化一样，冲量也一样。' },
        { html: '减小球的动量变化', say: '不管撤不撤，球最后都停在手里，动量变化一样。' },
        { html: '延长作用时间，减小平均作用力', correct: true, say: '对。冲量一定，时间越长，力越小，手就不疼。' },
        { html: '减小球的动能', say: '球最后都停下，动能的变化也一样。' }
      ],
      hints: ['撤不撤手，球的动量变化一样吗？', '冲量一定时，什么变了？', '作用时间变长，平均力变小。']
    },
    {
      goal: 2,
      title: '撞墙弹回的平均力（L2）',
      stem: '0.2 kg 的球以 10 m/s 水平撞墙，以 8 m/s 弹回，与墙接触 0.02 s。墙对球的平均作用力多大？',
      options: [
        { html: '180 N', correct: true, say: '对。取弹回方向为正：Δp = 0.2 × 8 − 0.2 × (−10) = 3.6，F = 3.6 ÷ 0.02 = 180 N。' },
        { html: '20 N', say: '速率直接相减了：方向相反，要 8 + 10。' },
        { html: '100 N', say: '只算了从 10 m/s 减到 0 的那一段，球还弹回去了。' },
        { html: '80 N', say: '只算了弹回的那一段，还有停下的那一段。' }
      ],
      hints: ['先规定正方向。', 'Δp = 0.2 × 8 − 0.2 × (−10)。', '3.6 ÷ 0.02 = 180 N。']
    },
    {
      goal: 0,
      title: '平抛小球的动量变化（L2）',
      stem: '平抛的小球，任意 1 s 内动量变化的方向是？',
      options: [
        { html: '沿速度方向', say: '动量变化的方向跟合力的冲量走，不跟速度走。' },
        { html: '水平方向', say: '水平方向不受力，水平速度不变。' },
        { html: '竖直向下', correct: true, say: '对。合力只有重力，冲量竖直向下，动量变化也竖直向下。' },
        { html: '无法确定', say: '能确定：Δp 的方向就是合力冲量的方向。' }
      ],
      hints: ['平抛的小球受什么力？', '只受重力。', 'Δp 和重力的冲量同向：竖直向下。']
    },
    {
      goal: 0,
      title: '冲量和功（L2）',
      stem: '小球竖直上抛后落回抛出点（不计空气阻力）。整个过程中，重力做的功和重力的冲量分别是？',
      options: [
        { html: '功为 0，冲量为 0', say: '功看位移，位移为 0；冲量看时间，时间不为 0。' },
        { html: '功为 0，冲量竖直向下、不为 0', correct: true, say: '对。回到原处，位移为 0，功为 0；重力一直向下作用了一段时间，冲量 mgt 向下。' },
        { html: '功不为 0，冲量为 0', say: '回到抛出点，位移为 0，重力做的功为 0。' },
        { html: '都不为 0', say: '回到抛出点，位移为 0，重力做的功为 0。' }
      ],
      hints: ['功看什么？冲量看什么？', '功是力乘位移；冲量是力乘时间。', '位移为 0，时间不为 0。']
    },
    {
      goal: 2,
      title: '挑战：平台上飞出的物块（L3）',
      stem: '0.2 kg 的小物块从 0.8 m 高的平台边缘以 3 m/s 水平飞出，落地后 0.05 s 内竖直速度减为 0，水平速度不变。地面对它的平均竖直作用力多大？（g = 10 m/s²）',
      options: [
        { html: '18 N', correct: true, say: '对。落地竖直速度 4 m/s；(N − 2) × 0.05 = 0.2 × 4，N = 18 N。' },
        { html: '16 N', say: '16 N 是竖直方向的合力，还要加上 2 N 的重力。' },
        { html: '22 N', say: '用了合速度 5 m/s。竖直方向只看竖直速度 4 m/s。' },
        { html: '2 N', say: '这只是重力。物块竖直方向从 4 m/s 停下，需要大得多的力。' }
      ],
      hints: ['先求落地时的竖直速度：v² = 2gh。', '竖直 4 m/s；取向上为正，(N − mg)Δt = 0 − 0.2 × (−4)。', 'N − 2 = 16，N = 18 N。']
    }
  ];

  var GOALS = [
    { name: '说出并推出动量定理', act: 3 },
    { name: '用 F–t 图面积求冲量，解释缓冲', act: 4 },
    { name: '带方向列式，竖直碰撞算上重力', act: 5 }
  ];

  var HOMEWORK = [
    { tag: '必做 1 · L1', q: '质量 1500 kg 的汽车以 16 m/s 行驶，紧急刹车后 4 s 停下。平均制动力多大？', a: '6000 N。' },
    { tag: '必做 2 · L2', q: '一个力的 F–t 图：0～0.1 s 从 0 均匀增大到 20 N，0.1～0.3 s 保持 20 N，0.3～0.4 s 均匀减小到 0。求这个力的冲量，以及这 0.4 s 内的平均力。', a: '冲量 6 N·s（梯形面积 1 + 4 + 1），平均力 15 N。' },
    { tag: '必做 3 · L3', q: '0.5 kg 的球从 1.25 m 高处自由落下，与地面接触 0.05 s 后竖直弹起到 0.45 m 高。求地面对球的平均作用力。（g = 10 m/s²）', a: '落地 5 m/s，弹起 3 m/s；取向上为正，(N − 5) × 0.05 = 0.5 × 3 − 0.5 × (−5)，N = 85 N。' },
    { tag: '选做 · L3', q: '海鸥在 20 m 高处以 15 m/s 水平飞行，松开嘴里 0.1 kg 的鸟蛤，鸟蛤落到岩石上，0.005 s 内竖直速度减为 0、水平速度不变。求岩石对鸟蛤的平均竖直作用力。这里的重力能不能忽略？（改编自 2021 年山东卷第 16 题的情景）', a: '竖直落地速度 20 m/s；(N − 1) × 0.005 = 0.1 × 20，N = 401 N。重力 1 N 只占约 0.25%，作用时间很短、作用力远大于重力时，可以忽略重力。' }
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
    beats: [{ say: '课后做一做。必做三题由易到难，各对应一个目标；选做题想一想：什么时候可以忽略重力？' }],
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
    var head = '你走完了动量定理这一课：力、时间和动量的变化，连在了一起。';
    if (n === Qs.length) return head + '<br>小测 <span class="num">' + n + ' / ' + n + '</span> 第一次全对，三个目标都拿下了。';
    return head + '<br>小测第一次答对 <span class="num">' + n + ' / ' + Qs.length + '</span>，没拿下的目标，回去再看一遍就好。';
  };

  GRAV.act({ id: 8, name: '小测', tag: '第 8 幕 · 小测', steps: steps });
})();
