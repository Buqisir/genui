/* 第 2 幕 · 火箭：太空中不推空气也能加速（锁定预测、史料）；一次喷气的 Δv = Δm·u / m；怎样飞得更快（喷气速度、质量比、多级火箭）；水火箭为什么要装水 */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  // 太空中的火箭：第 2 句起点火，燃气向左、箭体向右；下面是燃气、火箭的动量柱子
  function space(ctx, w, h, t, C, beat) {
    RCL.stars(ctx, w, h, C);
    var on = beat >= 1, tt = on ? Math.min(t, 3) : 0, L = Math.min(170, w * 0.34), y = h * 0.3;
    var x = w * 0.42 + tt * w * 0.035;
    if (on) RCL.exhaust(ctx, x - 4, y, t, Math.min(150, w * 0.3), C);
    RCL.rocket(ctx, x, y, L, C);
    txt(ctx, '太空，没有空气', 12, 18, { size: 12, color: C.steel });
    txt(ctx, '向右为正', w - 12, 18, { size: 12, color: C.steel, align: 'right' });
    if (on) {
      MOM.vArrow(ctx, x + L * 0.4, y + L * 0.3 + 14, 1, 40, C, '火箭');
      MOM.vArrow(ctx, x - 20, y + L * 0.3 + 14, -1, 40, C, '燃气');
    }
    var g = on ? Math.min(tt / 1.5, 1) : 0, top = y + L * 0.3 + 44;
    RCL.bars(ctx, { x: 12, y: top, w: Math.min(340, w - 24), h: h - top - 6 }, [
      { label: '燃气', v: -g, text: on ? '向后' : '0' },
      { label: '火箭', v: g, text: on ? '向前' : '0' },
      { label: '和', v: 0, ink: true, text: '0' }
    ], C, { max: 1.2, neg: 0.45, title: '动量（以点火前的火箭为参考系）' });
  }

  // 一次喷气：上面喷气前（质量 m + Δm，静止），下面喷气后（火箭 m 以 Δv 向前，燃气 Δm 以 u 向后）
  function once(ctx, w, h, t, C, beat) {
    var L = Math.min(160, w * 0.36), x = w * 0.42, y1 = h * 0.24, y2 = h * 0.62;
    txt(ctx, '喷气前（以它为参考系，静止）', 12, y1 - L * 0.3 - 12, { size: 12, color: C.steel });
    RCL.rocket(ctx, x, y1, L, C, { label: 'm + Δm' });
    txt(ctx, '喷气后', 12, y2 - L * 0.3 - 12, { size: 12, color: C.steel });
    RCL.rocket(ctx, x + 18, y2, L, C, { label: 'm' });
    ctx.save(); ctx.fillStyle = MOM.rgba(C.force, 0.7);
    for (var i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(x - 30 - (i % 4) * 7, y2 - 6 + (i % 3) * 6, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    txt(ctx, 'Δm', x - 42, y2 - 14, { size: 12, color: C.graphite, align: 'center' });
    MOM.vArrow(ctx, x + 18 + L + 8, y2, 1, 36, C, 'Δv');
    MOM.vArrow(ctx, x - 54, y2 + 24, -1, 40, C, 'u');
  }

  // 多级火箭：第 3 句起，第一级脱落
  function stages(ctx, w, h, t, C, beat) {
    RCL.stars(ctx, w, h, C);
    var L = Math.min(240, w * 0.5), y = h * 0.36, x = w * 0.3, drop = beat >= 2, tt = drop ? Math.min(t, 2.4) : 0;
    if (drop) {
      // 第一级（后 40%）留在后面并下坠，后两级继续前进
      var sx = x - tt * 26, sy = y + tt * tt * 10;
      ctx.save(); ctx.globalAlpha = Math.max(0.25, 1 - tt * 0.3);
      RCL.rocket(ctx, sx, sy, L * 0.4, C); ctx.restore();
      txt(ctx, '空壳扔掉', sx + L * 0.2, sy + L * 0.13 + 22, { size: 12, color: C.steel, align: 'center' });
      var x2 = x + L * 0.4 + tt * 20;
      RCL.exhaust(ctx, x2 - 4, y, t, 90, C, 18);
      RCL.rocket(ctx, x2, y, L * 0.6, C, { stages: [0.5] });
    } else {
      RCL.exhaust(ctx, x - 4, y, t, 90, C, 18);
      RCL.rocket(ctx, x, y, L, C, { stages: [0.4, 0.7] });
      txt(ctx, '一级', x + L * 0.2, y + L * 0.13 + 22, { size: 12, color: C.steel, align: 'center' });
      txt(ctx, '二级', x + L * 0.55, y + L * 0.13 + 22, { size: 12, color: C.steel, align: 'center' });
      txt(ctx, '三级', x + L * 0.82, y + L * 0.13 + 22, { size: 12, color: C.steel, align: 'center' });
    }
    txt(ctx, '多级火箭', 12, 18, { size: 12, color: C.steel });
  }

  // 水火箭：左边只打气，右边装了水；上面箭头是瓶子得到的速度
  function bottles(ctx, w, h, t, C, beat) {
    var gy = h * 0.72, bw = Math.min(56, w * 0.12), bh = Math.min(170, h * 0.5);
    [[w * 0.28, 0, '只打气'], [w * 0.68, 0.45, '装三分之一的水']].forEach(function (b, i) {
      var x = b[0];
      RCL.bottle(ctx, x, gy - 30, bw, bh, b[1], C);
      txt(ctx, b[2], x, gy + 18, { size: 14, color: C.graphite, align: 'center' });
      ctx.save();
      if (i === 0) {
        ctx.fillStyle = MOM.rgba(C.steel, 0.35);
        for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + (k - 2) * 5, gy - 18 + (k % 2) * 6, 3, 0, Math.PI * 2); ctx.fill(); }
      } else {
        ctx.fillStyle = MOM.rgba(C.vel, 0.45);
        for (var j = 0; j < 12; j++) { ctx.beginPath(); ctx.arc(x + Math.sin(j * 7.1) * 6, gy - 22 + j * 2.6, 2.6, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
      if (beat >= 1) {
        var up = i === 0 ? 14 : 70;
        GRAV.draw.arrow(ctx, x + bw * 0.9, gy - 40, x + bw * 0.9, gy - 40 - up, C.vel, 2);
        txt(ctx, i === 0 ? '慢' : '快', x + bw * 0.9 + 8, gy - 44 - up / 2, { size: 12, color: C.vel });
      }
    });
    txt(ctx, '瓶口朝下，打气加压后放开', 12, 18, { size: 12, color: C.steel });
  }

  // 锁定预测，之后按选项给反馈（同第 4 节）
  var GUESS = [
    { html: '不能：没有空气，没有东西可推', check: '这是很多人的直觉，1920 年的《纽约时报》也这么认为。可火箭推的不是空气，而是它自己喷出的燃气。' },
    { html: '能：向后喷出燃气，燃气推火箭', ok: true, check: '对。' },
    { html: '能：靠惯性一直加速', check: '惯性只能保持速度不变，不能让它加速。加速靠的是喷出的燃气。' }
  ];

  GRAV.act({
    id: 2,
    name: '火箭',
    tag: '第 2 幕 · 火箭',
    steps: [
      {
        title: '太空中没有空气，火箭能加速吗？',
        beats: [
          { say: '太空中没有空气。火箭发动机点火后，能加速吗？选了就锁定。' },
          {
            say: function () {
              var i = GRAV.state.r4, head = i == null ? '' : (GUESS[i].ok ? '你选的是「' + GUESS[i].html + '」，' + GUESS[i].check : '你选的是「' + GUESS[i].html + '」。' + GUESS[i].check) + ' ';
              return head + '把火箭和喷出的燃气看成一个系统：没有外力，总动量保持 0。燃气带走向后的动量，火箭就得到向前的动量。';
            }
          },
          { say: '推火箭的是燃气：发动机把燃气向后推，燃气就把火箭向前推。这和空气无关，在真空里燃气反而更容易喷出去。' },
          { say: '1920 年，《纽约时报》的一篇社论断言火箭在真空中没法工作，理由是那里没有东西可推。1969 年阿波罗 11 号发射的第二天，它登出一则更正："火箭在真空中和在大气中一样能工作。本报为此错误致歉。"' }
        ],
        gateAt: 0,
        button: '喷一次快多少',
        play: true,
        playAt: 1,
        tall: true,
        draw: space,
        mount: function (el, api) {
          var box = document.createElement('div');
          box.className = 'opts';
          var btns = GUESS.map(function (g, i) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'opt';
            b.innerHTML = '<span class="opt-html">' + g.html + '</span><span class="mark" aria-hidden="true"></span>';
            b.addEventListener('click', function () {
              if (GRAV.state.r4 != null) return;
              GRAV.state.r4 = i; lock();
              api.me('我猜「' + g.html + '」');
              api.say('记下了。点火看看。');
              api.open();
            });
            box.appendChild(b);
            return b;
          });
          function lock() {
            btns.forEach(function (b, i) {
              b.disabled = true;
              if (i === GRAV.state.r4) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
            });
          }
          if (GRAV.state.r4 != null) { lock(); api.open(); }
          el.appendChild(box);
        }
      },
      {
        title: '喷一次气，火箭快多少？',
        beats: [
          { say: '以喷气前的火箭为参考系，它原来静止。喷出质量 Δm 的燃气，燃气相对喷气前的火箭以 u 向后；喷气后火箭的质量是 m。火箭的速度增加多少？' },
          { say: '喷气前总动量为 0：0 = mΔv − Δm·u，所以 Δv = Δm·u / m。这和冰面扔背包是同一个算法，燃气就是背包。' },
          { say: '注意 u 是相对喷气前的火箭的速度。列动量守恒式时，所有速度都要相对同一个参考系。' }
        ],
        gateAt: 0,
        button: '怎样飞得更快',
        tall: true,
        draw: once,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: 'Δ' + S('m') + '·' + S('u') + ' / ' + S('m'), correct: true, say: '对。0 = mΔv − Δm·u。' },
              { html: S('u'), say: '火箭比燃气重得多，速度不会一样大。两者动量等大反向：mΔv = Δm·u。' },
              { html: S('m') + '·' + S('u') + ' / Δ' + S('m'), say: '比例用反了：喷出去的少、剩下的多，Δv 应该比 u 小得多。' },
              { html: 'Δ' + S('m') + '·' + S('u') + ' / (' + S('m') + ' + Δ' + S('m') + ')', say: '喷气后火箭只剩 m，燃气已经出去了。在 Δm 很小时两者差得不多，但式子要写 m。' }
            ],
            hints: ['喷气前（以它为参考系）总动量是多少？', '0。喷气后火箭动量 mΔv，燃气动量 −Δm·u。', '0 = mΔv − Δm·u。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            if (bt >= 1 && !shown) {
              shown = true;
              wk.line('0 = ' + S('m') + 'Δ' + S('v') + ' − Δ' + S('m') + '·' + S('u'), '喷气前总动量为 0');
              wk.line('Δ' + S('v') + ' = Δ' + S('m') + '·' + S('u') + ' / ' + S('m'));
            }
          });
        }
      },
      {
        title: '想让火箭飞得更快，该怎么做？',
        beats: [
          { say: '看着 Δv = Δm·u / m 想一想：想让火箭最终飞得更快，该怎么做？' },
          { say: 'u 越大越快；喷出去的质量越多、剩下的越轻，也越快。现代火箭的喷气速度通常是 2000～5000 m/s，很难再大幅提高。' },
          { say: '那就在"剩下的越轻"上下功夫。火箭起飞时的质量与箭体质量之比叫质量比，一般小于 10，单级火箭还到不了 7.9 km/s。办法是多级火箭：一级的燃料用完，就把这一级的空壳扔掉，后面喷同样多的燃气，m 小了，Δv 就大了。' }
        ],
        gateAt: 0,
        button: '课标里的水火箭',
        play: true,
        playAt: 2,
        tall: true,
        draw: stages,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '提高喷气速度，增大质量比', correct: true, say: '对。u 大，Δm/m 大，Δv 就大。' },
              { html: '把喷口做大，让燃气推开更多空气', say: '火箭推的不是空气。看式子：Δv 只和 u、Δm、m 有关。' },
              { html: '把箭体造得更重、更结实', say: '箭体越重，m 越大，Δv 反而越小。' },
              { html: '多装燃料就行，喷多快无所谓', say: '喷气速度 u 也在式子里，喷得慢，再多燃料也事倍功半。' }
            ],
            hints: ['看式子 Δv = Δm·u / m。', '哪些量变大、哪个量变小，Δv 会变大？', 'u 大、Δm/m 大。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      },
      {
        title: '水火箭：只打气不装水，为什么飞不高？',
        beats: [
          { say: '课标建议做一个水火箭：塑料瓶里装些水，打气加压，瓶口朝下放开。只打气、不装水，为什么飞不高？' },
          { say: '水的密度约是空气的 800 倍（NASA 水火箭教程）。同样从瓶口喷出去，水的质量大得多，带走的动量也大得多，瓶子得到的动量就大。' },
          { say: '水也不是越多越好：没喷出去的水，要被瓶子一起带上天。装多少最好，留作课后的实验。' }
        ],
        gateAt: 0,
        button: '原来在动的系统呢',
        draw: bottles,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '喷出的空气质量太小，带走的动量小', correct: true, say: '对。喷出去的东西要有质量。' },
              { html: '没有水，就推不动地面', say: '水火箭和火箭一样，推它的是喷出去的水，不是地面。' },
              { html: '水只是让瓶子飞得更稳，和动量无关', say: '水是被喷出去的"燃料"，正是它带走了向下的动量。' }
            ],
            hints: ['瓶子的动量从哪里来？', '来自喷出去的东西带走的反向动量。', '空气太轻，带走的动量小。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
