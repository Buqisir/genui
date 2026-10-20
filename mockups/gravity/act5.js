/*
 * 第 5 幕 · 真题
 * 第 1 步：2021 广东卷第 2 题（判对错用 GRAV.ui.choice）；第 2 步：一句大字收尾。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;

  var STEM = '2021 年 4 月，我国自主研发的空间站"天和"核心舱成功发射并入轨运行，若核心舱绕地球的运行可视为匀速圆周运动，已知引力常量，由下列物理量能计算出地球质量的是（　　）';

  var OPTIONS = [
    {
      html: 'A. 核心舱的质量和绕地半径',
      say: '核心舱的质量 m 在式子两边会约掉，只知道 m 和 r 求不出 M。'
    },
    {
      html: 'B. 核心舱的质量和绕地周期',
      say: 'm 会约掉；只知道周期 T，还缺轨道半径 r。'
    },
    {
      html: 'C. 核心舱的绕地角速度和绕地周期',
      say: '角速度和周期其实是同一个信息（ω = 2π/T），还缺轨道半径 r。'
    },
    {
      html: 'D. 核心舱的绕地线速度和绕地半径',
      correct: true,
      say: '对。万有引力提供向心力：GMm/r² = mv²/r，约去 m 得 M = v²r/G。知道 v 和 r 就能算。'
    }
  ];

  var HINTS = [
    '哪个力提供核心舱做圆周运动的向心力？',
    '写出 GMm/r² = mv²/r，看哪个量会约掉。',
    'M = v²r/G，需要线速度和轨道半径，选 D。'
  ];

  // 轨道示意（不按比例）：地球、核心舱沿圆轨道转，标 r、v、F
  function drawOrbit(ctx, w, h, t, C) {
    var s = Math.min(w, h);
    var cx = w / 2, cy = h / 2;
    var RE = s * 0.12, rO = s * 0.36;
    var th = -Math.PI / 2 + TAU * t / 20;
    var cos = Math.cos(th), sin = Math.sin(th);
    var px = cx + rO * cos, py = cy + rO * sin;
    var tx = -sin, ty = cos; // 切线方向（逆时针）

    // 轨道
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

    // 地心到核心舱的线，标 r
    ctx.save();
    ctx.globalAlpha = 0.7; ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.restore();
    GRAV.draw.text(ctx, 'r',
      cx + cos * rO * 0.5 + tx * 14, cy + sin * rO * 0.5 + ty * 14 + 5,
      { font: 'sym', size: 16, color: C.graphite, align: 'center' });

    // 核心舱
    ctx.save();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, TAU); ctx.fill();
    ctx.restore();

    // 沿切线的速度 v
    var vL = 56;
    GRAV.draw.arrow(ctx, px, py, px + tx * vL, py + ty * vL, C.vel, 2.5);
    GRAV.draw.text(ctx, 'v',
      px + tx * (vL + 12) + cos * 8, py + ty * (vL + 12) + sin * 8 + 5,
      { font: 'sym', size: 16, color: C.vel, align: 'center' });

    // 指向地心的引力 F
    var fL = 56;
    GRAV.draw.arrow(ctx, px, py, px - cos * fL, py - sin * fL, C.force, 2.5);
    GRAV.draw.text(ctx, 'F',
      px - cos * (fL / 2) - tx * 14, py - sin * (fL / 2) - ty * 14 + 5,
      { font: 'sym', size: 16, color: C.force, align: 'center' });

    GRAV.draw.note(ctx, '不按比例', w, h, C);
  }

  // 作答区：题干（原文）+ 选择题
  function mountQuiz(el, api) {
    var stem = document.createElement('div');
    stem.className = 'stem';
    stem.style.marginBottom = '18px';
    stem.textContent = STEM;
    el.appendChild(stem);
    GRAV.ui.choice(el, { options: OPTIONS, hints: HINTS }, api);
  }

  // 作答区：一句大字
  function mountFormula(el) {
    var big = document.createElement('div');
    big.className = 'big';
    big.innerHTML = GRAV.h.sym('GMm') + '/' + GRAV.h.sym('r') + '² = ' +
      GRAV.h.sym('mv') + '²/' + GRAV.h.sym('r') + ' ⇒ ' + GRAV.h.sym('M') + ' = ' +
      GRAV.h.sym('v') + '²' + GRAV.h.sym('r') + '/' + GRAV.h.sym('G');
    el.appendChild(big);
  }

  GRAV.act({
    id: 5,
    name: '真题',
    tag: '第 5 幕 · 真题',
    steps: [
      {
        title: '2021 广东卷 第 2 题',
        caption: '第 4 幕在地面上用 mg = GMm/R² 称出了地球。换到轨道上，引力提供的是向心力。',
        gate: true,
        draw: drawOrbit,
        mount: mountQuiz
      },
      {
        title: '下一节：万有引力理论的成就',
        caption: '用引力去"称"天体的质量、预言新的行星，就是下一节要讲的内容。',
        layout: 'answer',
        button: '下一幕',
        mount: mountFormula
      }
    ]
  });
})();
