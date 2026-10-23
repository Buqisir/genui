/* 第 4 幕 · 练习：示范例题（航天员一次喷气返回空间站，自编，仿教材练习与应用第 2 题，L2）→ 冰面推冰车（L2）→ 炮车斜射炮弹，只有水平方向守恒（L3） */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  function station(ctx, w, h, t, C, beat) {
    RCL.stars(ctx, w, h, C);
    var y = h * 0.45, sx = w * 0.78, ax = w * 0.2;
    ctx.save(); ctx.fillStyle = C.card; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.3;
    MOM.rr(ctx, sx - 22, y - 26, 44, 52, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = MOM.rgba(C.vel, 0.18);
    ctx.fillRect(sx - 70, y - 10, 44, 20); ctx.strokeRect(sx - 70, y - 10, 44, 20);
    ctx.fillRect(sx + 26, y - 10, 44, 20); ctx.strokeRect(sx + 26, y - 10, 44, 20);
    ctx.restore();
    txt(ctx, '空间站', sx, y + 46, { size: 12, color: C.graphite, align: 'center' });
    CNS.person(ctx, ax, y + 30, 26, C, '航天员 120 kg');
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.steel;
    ctx.beginPath(); ctx.moveTo(ax + 14, y + 70); ctx.lineTo(sx - 22, y + 70); ctx.stroke(); ctx.restore();
    txt(ctx, '30 m', (ax + sx) / 2, y + 86, { font: 'num', size: 12, color: C.steel, align: 'center' });
    if (beat >= 2) {
      ctx.save(); ctx.fillStyle = MOM.rgba(C.force, 0.7);
      for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(ax - 20 - i * 6, y - 10 + (i % 3) * 5, 2.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      MOM.vArrow(ctx, ax - 22, y - 58, -1, 40, C, '气体 60 m/s');
      MOM.vArrow(ctx, ax + 18, y - 58, 1, 40, C, '人 0.1 m/s');
    }
  }

  function sled(ctx, w, h, t, C, beat) {
    var gy = h * 0.62, x = w * 0.4;
    RCL.ice(ctx, 12, w - 12, gy, C);
    ctx.save(); ctx.fillStyle = C.bar; ctx.strokeStyle = C.graphite; MOM.rr(ctx, x - 34, gy - 12, 68, 12, 4); ctx.fill(); ctx.stroke(); ctx.restore();
    CNS.person(ctx, x, gy - 12, 26, C, '人和冰车 40 kg');
    RCL.box(ctx, x + 70, gy, 24, C, '10 kg');
    MOM.vArrow(ctx, x + 70, gy + 30, 2, 30, C, '2 m/s');
    if (beat >= 1) MOM.vArrow(ctx, x, gy + 30, -0.5, 30, C, '0.5 m/s');
    else txt(ctx, '？', x - 20, gy + 34, { size: 14, color: C.vel });
    txt(ctx, '向东', w - 12, 18, { size: 12, color: C.steel, align: 'right' });
    GRAV.draw.arrow(ctx, w - 60, 30, w - 20, 30, C.steel, 1.2);
  }

  function cannon(ctx, w, h, t, C, beat) {
    var gy = h * 0.66, x = w * 0.36, ang = Math.PI / 3;
    MOM.track(ctx, 12, w - 12, gy, C);
    ctx.save(); ctx.fillStyle = C.card; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.3;
    MOM.rr(ctx, x - 50, gy - 34, 100, 28, 6); ctx.fill(); ctx.stroke();
    ctx.translate(x + 10, gy - 34); ctx.rotate(-ang);
    MOM.rr(ctx, 0, -7, 70, 14, 4); ctx.fillStyle = C.graphite; ctx.fill();
    ctx.restore();
    txt(ctx, '炮车 2.0 t', x, gy - 14, { size: 12, color: C.graphite, align: 'center' });
    var mx = x + 10 + 76 * Math.cos(ang), my = gy - 34 - 76 * Math.sin(ang), sc = 0.16;
    GRAV.draw.arrow(ctx, mx, my, mx + 600 * sc * Math.cos(ang), my - 600 * sc * Math.sin(ang), C.vel, 2);
    txt(ctx, '炮弹 10 kg，600 m/s', mx + 600 * sc * Math.cos(ang) + 6, my - 600 * sc * Math.sin(ang), { size: 12, color: C.vel });
    txt(ctx, '60°', x + 34, gy - 44, { size: 12, color: C.steel });
    if (beat >= 1) {
      ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = MOM.rgba(C.vel, 0.7); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 300 * sc, my); ctx.stroke(); ctx.restore();
      txt(ctx, '水平 300 m/s', mx + 300 * sc / 2, my + 16, { size: 12, color: C.vel, align: 'center' });
      MOM.vArrow(ctx, x - 20, gy + 26, -1.5, 30, C, '1.5 m/s');
      txt(ctx, '竖直方向：地面的支持力在射击瞬间很大，不守恒', 12, h - 12, { size: 12, color: C.steel });
    } else txt(ctx, '炮车：？', x - 70, gy + 30, { size: 12, color: C.vel });
    txt(ctx, '光滑水平轨道', w - 12, 18, { size: 12, color: C.steel, align: 'right' });
  }

  function section(el, label) {
    var d = document.createElement('div');
    d.className = 'ex-sec';
    d.innerHTML = '<div class="ex-l">' + label + '</div>';
    el.appendChild(d);
    return d;
  }
  function stem(el, text) {
    var st = document.createElement('div');
    st.className = 'stem';
    st.textContent = text;
    el.appendChild(st);
  }

  GRAV.act({
    id: 4,
    name: '练习',
    tag: '第 4 幕 · 练习',
    steps: [
      {
        title: '例题：航天员一次喷气回到空间站',
        beats: [
          { say: '先看一道完整的例题，题目在右边。' },
          { say: '策略：选哪个系统？为什么守恒？开始的总动量是多少？' },
          { say: '解答：返回速度至少 30 ÷ 300 = 0.1 m/s。取朝向空间站为正，0 = (120 − Δm) × 0.1 − 60Δm，Δm ≈ 0.20 kg。' },
          { say: '讨论：只要喷 0.2 kg 气体，因为气体喷得快（60 m/s），航天员只要很慢（0.1 m/s）。Δm 比 120 kg 小得多，近似成 12 ÷ 60 = 0.20 kg 也可以。' }
        ],
        gateAt: 1,
        button: '自己做一道',
        tall: true,
        draw: station,
        mount: function (el, api) {
          var s1 = section(el, '情境 · 自编，仿教材练习与应用第 2 题');
          s1.insertAdjacentHTML('beforeend', '<div class="stem">连同装备共 120 kg 的航天员与空间站相对静止，相距 30 m。装备里的气源能以 60 m/s（相对空间站）向后喷气。要在 5 min 内回到空间站，开始时一次至少要喷出多少气体？</div>');
          var s2 = section(el, '策略');
          var box = document.createElement('div');
          s2.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '航天员（连装备）和喷出的气体；太空中不受外力；开始总动量为 0', correct: true, say: '对。和冰面扔背包一样：开始静止，总动量为 0。' },
              { html: '只选航天员；喷气的力是外力，不守恒', say: '把喷出的气体也算进系统，喷气的力就成了内力。' },
              { html: '航天员和空间站；开始总动量为 0', say: '空间站和航天员之间没有相互作用；真正相互作用的是航天员和喷出的气体。' }
            ],
            hints: ['是谁和谁在相互推？', '航天员推气体，气体推航天员。', '选航天员和气体，开始都静止，总动量为 0。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var s3 = section(el, '解答'), w3 = GRAV.ui.work(s3);
          var s4 = section(el, '讨论'), w4 = GRAV.ui.work(s4);
          var shown = 0;
          api.onBeat(function (bt) {
            s2.hidden = bt < 1; s3.hidden = bt < 2; s4.hidden = bt < 3;
            if (bt >= 2 && shown < 1) {
              w3.line(S('v') + ' = 30 ÷ 300 = 0.1 m/s');
              w3.line('0 = (120 − Δ' + S('m') + ') × 0.1 − 60Δ' + S('m'));
              w3.line('Δ' + S('m') + ' = 12 ÷ 60.1 ≈ 0.20 kg');
              shown = 1;
            }
            if (bt >= 3 && shown < 2) { w4.line('气体快（60 m/s），人慢（0.1 m/s），喷一点点就够'); shown = 2; }
          });
        }
      },
      {
        title: '冰面上推出木箱',
        beats: [
          { say: '光滑冰面上，坐在冰车上的小孩（人和冰车共 40 kg）原来静止，把 10 kg 的木箱以 2 m/s 向东推出。小孩和冰车的速度是多少？' },
          { say: '0 = 40v + 10 × 2，v = −0.5 m/s：0.5 m/s，向西。' }
        ],
        gateAt: 0,
        button: '再做一道',
        draw: sled,
        mount: function (el, api) {
          stem(el, '光滑冰面上，坐在冰车上的小孩（人和冰车共 40 kg）原来静止，把 10 kg 的木箱以 2 m/s 向东推出。小孩和冰车的速度是？');
          GRAV.ui.choice(el, {
            options: [
              { html: '0.5 m/s，向西', correct: true, say: '对。0 = 40v + 10 × 2，v = −0.5 m/s。' },
              { html: '0.5 m/s，向东', say: '开始总动量是 0，木箱向东，人和冰车就得向西。' },
              { html: '2 m/s，向西', say: '人和冰车比木箱重，速度要小：40v = 10 × 2。' },
              { html: '0.4 m/s，向西', say: '这是用 50 kg 除的。推出后人和冰车只有 40 kg。' }
            ],
            hints: ['开始总动量是多少？', '0 = 40v + 10 × 2（向东为正）。', 'v = −0.5 m/s。']
          }, api);
        }
      },
      {
        title: '挑战：炮车斜着射出炮弹',
        beats: [
          { say: '光滑水平轨道上，2.0 t 的炮车（不含炮弹）原来静止，以与水平成 60° 的方向射出 10 kg 的炮弹，炮弹出口速度 600 m/s（对地）。炮车后退的速度是多少？' },
          { say: '竖直方向：射击瞬间地面的支持力很大，动量不守恒。水平方向不受外力，水平动量守恒：10 × 600 × cos 60° = 2000v，v = 1.5 m/s。这就是第 3 节的"某一方向守恒"。' }
        ],
        gateAt: 0,
        button: '收束',
        tall: true,
        draw: cannon,
        mount: function (el, api) {
          stem(el, '光滑水平轨道上，2.0 t 的炮车（不含炮弹）原来静止，以与水平成 60° 的方向射出 10 kg 的炮弹，炮弹出口速度 600 m/s（对地）。炮车后退的速度是？');
          GRAV.ui.choice(el, {
            options: [
              { html: '1.5 m/s', correct: true, say: '对。水平方向：10 × 300 = 2000v。' },
              { html: '3 m/s', say: '只有水平方向守恒，要用炮弹速度的水平分量 600 × cos 60° = 300 m/s。' },
              { html: '约 2.6 m/s', say: '分解时用了 sin 60°。和水平成 60°，水平分量是 600 × cos 60°。' },
              { html: '0：斜着射出，炮车不动', say: '炮弹有水平方向的速度，炮车在水平方向一定要后退。' }
            ],
            hints: ['哪个方向不受外力？', '水平方向。炮弹的水平速度是 600 × cos 60°。', '10 × 300 = 2000v。']
          }, api);
        }
      }
    ]
  });
})();
