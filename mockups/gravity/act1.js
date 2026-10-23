/*
 * 第 1 幕 · 悬念
 * 第 1 步：海面和月亮的开场画面。第 2 步：不判对错的表态，选项记到 GRAV.state.stance。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;
  var STANCE = ['是同一种力', '不是', '说不清'];

  // ---------- 第 1 步：海面和月亮 ----------
  function drawSea(ctx, w, h, t, C) {
    var s = Math.min(w, h);
    var mx = w * 0.64, my = h * 0.3, mr = s * 0.1;

    ctx.save();
    ctx.fillStyle = C.hair; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();

    // 三条海面线，周期约 6 秒，逐条变淡
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

  // ---------- 第 2 步：地球、苹果、树、绕行的月亮 ----------
  function drawOrbit(ctx, w, h, t, C) {
    // 进入步骤的第一帧画布尺寸可能还是 1px，太小就不画
    if (w < 100 || h < 150) return;
    var RE = Math.min(w * 0.14, h * 0.13);
    var cx = w / 2, cy = h * 0.55;
    var rO = Math.min(w * 0.42, cy - 30, h - cy - 30);

    // 月亮轨道（虚线）
    ctx.save();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rO, 0, TAU); ctx.stroke();
    ctx.restore();

    // 地球
    ctx.save();
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.vel;
    ctx.beginPath(); ctx.arc(cx, cy, RE, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, RE, 0, TAU); ctx.stroke();
    ctx.restore();

    // 地面（地球顶端的切线）、简笔树、反复下落的苹果（放大画）
    var gy = cy - RE;
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - 70, gy); ctx.lineTo(cx + 70, gy); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 14, gy); ctx.lineTo(cx - 14, gy - 40); ctx.stroke();
    ctx.globalAlpha = 0.45; ctx.fillStyle = C.steel;
    ctx.beginPath(); ctx.arc(cx - 14, gy - 54, 18, 0, TAU); ctx.fill();
    ctx.restore();

    var f = Math.min(1, (t % 1.6) / 1.2);
    var ax = cx + 18, y0 = gy - 46, y1 = gy - 7;
    var ay = y0 + (y1 - y0) * f * f;
    ctx.save();
    ctx.fillStyle = C.graphite;
    ctx.beginPath(); ctx.arc(ax, ay, 7, 0, TAU); ctx.fill();
    ctx.restore();
    GRAV.draw.text(ctx, '苹果', cx + 32, gy - 30, { size: 12, color: C.graphite });

    // 月亮沿圆轨道慢慢转
    var th = -Math.PI / 5 + TAU * t / 36;
    var mx = cx + rO * Math.cos(th), my = cy + rO * Math.sin(th);
    ctx.save();
    ctx.fillStyle = C.hair; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
    GRAV.draw.text(ctx, '月亮', mx, my - 16, { size: 12, color: C.graphite, align: 'center' });
    GRAV.draw.text(ctx, '地球', cx, cy + RE + 18, { size: 12, color: C.graphite, align: 'center' });

    GRAV.draw.note(ctx, '不按比例', w, h, C);
  }

  // ---------- 第 2 步作答区：三个不判对错的候选 ----------
  function mountStance(el, api) {
    var box = document.createElement('div');
    box.className = 'opts';
    var btns = STANCE.map(function (text) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.textContent = text;
      b.setAttribute('aria-pressed', 'false');
      box.appendChild(b);
      return b;
    });

    function mark(text) {
      btns.forEach(function (b, i) {
        var on = STANCE[i] === text;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }

    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var text = STANCE[i];
        GRAV.state.stance = text;
        mark(text);
        api.say('记下了：你选的是「' + text + '」。第 2 幕结束时我们回来看。');
        api.status('');
        api.open();
      });
    });
    el.appendChild(box);

    // 之前已经选过（例如后退又回来），直接还原选中状态
    if (STANCE.indexOf(GRAV.state.stance) >= 0) {
      mark(GRAV.state.stance);
      api.status('');
      api.open();
    }
  }

  GRAV.act({
    id: 1,
    name: '悬念',
    tag: '第 1 幕 · 悬念',
    steps: [
      {
        title: '海上明月共潮生',
        caption: '潮水每天涨落两次，涨落的时间跟着月亮走。月亮离我们 38 万公里，它是怎么"拉"动海水的？',
        button: '先回答一个更简单的问题',
        draw: drawSea
      },
      {
        title: '拉苹果的力和拉月亮的力，是同一种力吗？',
        caption: '苹果落向地面，月亮绕着地球转。你觉得拉它们的是同一种力吗？先凭直觉选一个，不判对错。',
        status: '等你选择……',
        button: '去找答案',
        gate: true,
        draw: drawOrbit,
        mount: mountStance
      }
    ]
  });
})();
