/*
 * 第 6 幕 · 小结
 * 第 1 步：公式与易错点；第 2 步：你走过的路；第 3 步：回到开头（海面和月亮，自己画）。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;

  // 本幕专用样式，只用 shell.css 里的变量
  (function injectStyle() {
    if (document.getElementById('act6-style')) return;
    var st = document.createElement('style');
    st.id = 'act6-style';
    st.textContent = [
      ".a6-formula { font: 500 40px/1.4 'Noto Serif SC', serif; color: var(--c-ink); }",
      ".a6-line { margin-top: 14px; font-size: 15px; line-height: 1.7; color: var(--c-graphite); }",
      ".a6-h { margin: 28px 0 8px; font-size: 14px; color: var(--c-steel); }",
      ".a6-list { margin: 0; padding: 0; list-style: none; }",
      ".a6-list li { position: relative; padding: 4px 0 4px 18px; font-size: 15px; line-height: 1.7; color: var(--c-ink); }",
      ".a6-list li::before { content: ''; position: absolute; left: 2px; top: 14px; width: 6px; height: 6px; border-radius: 50%; background: var(--c-steel); }",
      ".a6-chain { width: 100%; max-width: 560px; display: flex; flex-direction: column; }",
      ".a6-ring { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px 16px; border: 1px solid var(--c-hairline); border-radius: 14px; padding: 14px 18px; background: var(--c-card); font-size: 16px; color: var(--c-ink); }",
      ".a6-ring small { font-size: 13px; color: var(--c-steel); }",
      ".a6-arrow { padding: 4px 0 4px 28px; font-size: 16px; line-height: 1.4; color: var(--c-steel); }",
      "@media (max-width: 700px) { .a6-formula { font-size: 32px; } }"
    ].join('\n');
    document.head.appendChild(st);
  })();

  // ---------- 第 3 步：海面和月亮（与第 1 幕第 1 步同一画面，本幕自己画） ----------
  function drawSea(ctx, w, h, t, C) {
    var s = Math.min(w, h);
    var mx = w * 0.64, my = h * 0.3, mr = s * 0.1;

    ctx.save();
    ctx.fillStyle = C.hair; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();

    var base = h * 0.7;
    var lines = [
      { y: base, a: 1, amp: 8, ph: 0 },
      { y: base + 22, a: 0.5, amp: 6, ph: 1.2 },
      { y: base + 44, a: 0.25, amp: 5, ph: 2.4 }
    ];
    lines.forEach(function (L) {
      ctx.save();
      ctx.globalAlpha = L.a; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var x = 0; x <= w + 4; x += 4) {
        var y = L.y + L.amp * Math.sin(TAU * t / 6 + x * 0.012 + L.ph);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    });

    GRAV.draw.note(ctx, '不按比例', w, h, C);
  }

  // ---------- 第 1 步：公式、适用范围、易错点 ----------
  function mountSummary(el) {
    var F = GRAV.h.sym('F'), G = GRAV.h.sym('G'), r = GRAV.h.sym('r');
    el.innerHTML =
      '<div class="a6-formula">' + F + ' = ' + G + ' ' + GRAV.h.sym('m') + '₁' + GRAV.h.sym('m') + '₂/' + r + '²</div>' +
      '<div class="a6-line">' + G + ' = 6.67×10⁻¹¹ N·m²/kg²（卡文迪什，1798 年）</div>' +
      '<div class="a6-line">适用：可看成质点的物体（取质点间的距离）；均匀球体（取球心间的距离）</div>' +
      '<div class="a6-h">易错点</div>' +
      '<ul class="a6-list">' +
        '<li>r 是球心距，不是到地面的距离</li>' +
        '<li>引力是相互的，两个力一样大</li>' +
        '<li>太空里也有引力</li>' +
        '<li>G 很小，所以日常物体之间感觉不到</li>' +
        '<li>r → 0 时不能用这个式子。</li>' +
      '</ul>';
  }

  // ---------- 第 2 步：你走过的路（竖排的链） ----------
  var PATH = [
    ['提出问题', '第 1 幕：苹果和月亮'],
    ['列出候选、用数据淘汰', '第 2 幕：月亮的周期'],
    ['推广', '第 3 幕：尺度阶梯'],
    ['测量', '第 4 幕：扭秤'],
    ['应用', '第 5 幕：真题']
  ];

  function mountPath(el) {
    var html = '<div class="a6-chain">';
    PATH.forEach(function (p, i) {
      html += '<div class="a6-ring"><span>' + p[0] + '</span><small>' + p[1] + '</small></div>';
      if (i < PATH.length - 1) html += '<div class="a6-arrow">↓</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  // ---------- 第 3 步：回到开头 ----------
  function stanceCaption() {
    var st = GRAV.state.stance;
    return (st ? '第 1 幕你选的是「' + st + '」。' : '') + '答案是：同一种力。潮汐也是它在起作用。';
  }

  GRAV.act({
    id: 6,
    name: '小结',
    tag: '第 6 幕 · 小结',
    steps: [
      {
        title: '万有引力定律',
        caption: '把这节课的内容收起来。',
        layout: 'answer',
        mount: mountSummary
      },
      {
        title: '你走过的路',
        caption: '这也是物理学家找规律的路。',
        layout: 'answer',
        mount: mountPath
      },
      {
        title: '回到开头',
        caption: stanceCaption,
        button: '完成',
        draw: drawSea
      }
    ]
  });
})();
