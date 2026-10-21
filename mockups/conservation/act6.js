/* 第 6 幕 · 练习：示范例题（滑雪者拎起背包，改编自河北 2021 第 13 题情景，L2）→ 冰面两人互推（L2）→ 小车对撞的速度变化（改编自河南 2025 第 7 题情景，L2～L3） */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  function skier(ctx, w, h, t, C) {
    var gy = h * 0.6, x0 = 16;
    IMP.ground(ctx, x0, w - x0, gy, C);
    var px = Math.min(w * 0.25, 120), bx = Math.min(w * 0.65, px + 200);
    CNS.person(ctx, px, gy, 34, C, '滑雪者 48 kg');
    ctx.save(); MOM.rr(ctx, bx - 12, gy - 22, 24, 22, 4); ctx.fillStyle = C.charge; ctx.globalAlpha = 0.6; ctx.fill(); ctx.restore();
    GRAV.draw.text(ctx, '背包 2 kg', bx, gy - 30, { size: 12, color: C.graphite, align: 'center' });
    MOM.vArrow(ctx, px - 10, gy + 30, 7.5, 10, C, '7.5 m/s');
    MOM.vArrow(ctx, bx - 10, gy + 30, 3, 10, C, '3 m/s');
    GRAV.draw.text(ctx, '同向滑行，追上后一把拎起', x0, 20, { size: 12, color: C.steel });
  }

  function skaters(ctx, w, h, t, C) {
    var gy = h * 0.6, cx = w / 2, T = 1.6, u = Math.min(t / T, 1);
    ctx.save(); ctx.fillStyle = MOM.rgba(C.vel, 0.05); MOM.rr(ctx, 12, gy - 4, w - 24, 22, 8); ctx.fill(); ctx.restore();
    GRAV.draw.text(ctx, '光滑冰面', w - 16, gy + 34, { size: 12, color: C.steel, align: 'right' });
    var d1 = 2 * 34 * u, d2 = 2.5 * 34 * u;
    CNS.person(ctx, cx - 24 - d1, gy, 36, C, '50 kg');
    CNS.person(ctx, cx + 24 + d2, gy, 32, C, '40 kg');
    if (u >= 1) {
      MOM.vArrow(ctx, cx - 24 - d1, gy + 26, -2, 18, C, '2 m/s');
      GRAV.draw.text(ctx, '？', cx + 24 + d2 + 30, gy + 30, { size: 14, color: C.vel });
    }
  }

  function vtcarts(ctx, w, h, t, C) {
    CNS.vt(ctx, { x: 8, y: 30, w: Math.min(w - 16, 520), h: h - 50 }, [
      { name: 'A', v0: 3, v1: 1 },
      { name: 'B', v0: -1, v1: 2, dash: [6, 4] }
    ], C, { vmin: -1.6, vmax: 3.6, ticks: [-1, 0, 1, 2, 3] });
  }

  function section(el, label) {
    var d = document.createElement('div');
    d.className = 'ex-sec';
    d.innerHTML = '<div class="ex-l">' + label + '</div>';
    el.appendChild(d);
    return d;
  }

  GRAV.act({
    id: 6,
    name: '练习',
    tag: '第 6 幕 · 练习',
    steps: [
      {
        title: '例题：滑雪者拎起背包',
        beats: [
          { say: '先看一道完整的例题，题目在右边。' },
          { say: '策略：拎起的那一瞬间，能不能用动量守恒？为什么？' },
          { say: '解答：取滑行方向为正。拎起前后，48 × 7.5 + 2 × 3 = (48 + 2)v，v = 7.32 m/s。' },
          { say: '讨论：拎起后比滑雪者原来略慢，合理。选系统、判断能不能守恒、规定正方向、列式，四步缺一不可。' }
        ],
        gateAt: 1,
        button: '自己做一道',
        draw: skier,
        mount: function (el, api) {
          var s1 = section(el, '情境 · 改编自 2021 年河北卷第 13 题');
          s1.insertAdjacentHTML('beforeend', '<div class="stem">滑雪者（48 kg）以 7.5 m/s 在雪道上滑行，追上前方同向滑动的背包（2 kg，3 m/s），一把拎起。拎起后两者的共同速度多大？</div>');
          var s2 = section(el, '策略');
          var box = document.createElement('div');
          s2.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '能：时间极短，雪道摩擦等外力远小于手和背包之间的内力', correct: true, say: '对。这和冰壶碰撞是同一个道理：近似守恒。' },
              { html: '不能：雪道有摩擦', say: '拎起只是一瞬间，摩擦的冲量很小，可以忽略。' },
              { html: '能：滑雪者比背包重得多', say: '能用守恒和谁重无关，要看外力的冲量能不能忽略。' }
            ],
            hints: ['拎起的过程用了多长时间？', '一瞬间：外力的冲量和内力相比怎样？', '外力冲量可以忽略：近似守恒。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var s3 = section(el, '解答'), w3 = GRAV.ui.work(s3);
          var s4 = section(el, '讨论'), w4 = GRAV.ui.work(s4);
          var shown = 0;
          api.onBeat(function (bt) {
            s2.hidden = bt < 1; s3.hidden = bt < 2; s4.hidden = bt < 3;
            if (bt >= 2 && shown < 1) { w3.line('48 × 7.5 + 2 × 3 = 50' + S('v')); w3.line(S('v') + ' = 7.32 m/s'); shown = 1; }
            if (bt >= 3 && shown < 2) { w4.line('选系统 → 判断守恒 → 规定正方向 → 列式'); shown = 2; }
          });
        }
      },
      {
        title: '冰面上两人互推',
        beats: [{ say: '光滑冰面上，50 kg 和 40 kg 的两人原来静止，互推后 50 kg 的人以 2 m/s 后退。40 kg 的人速度多大、朝哪？' }],
        gateAt: 0,
        button: '再做一道',
        play: true,
        draw: skaters,
        mount: function (el, api) {
          var st = document.createElement('div');
          st.className = 'stem';
          st.textContent = '光滑冰面上，50 kg 和 40 kg 的两人原来静止，互推后 50 kg 的人以 2 m/s 后退。40 kg 的人速度多大、朝哪？';
          el.appendChild(st);
          GRAV.ui.choice(el, {
            options: [
              { html: '2.5 m/s，与 50 kg 的人反向', correct: true, say: '对。开始总动量为 0：0 = 50 × (−2) + 40v，v = 2.5 m/s。' },
              { html: '2.5 m/s，与 50 kg 的人同向', say: '开始总动量是 0，两人必须一正一负。' },
              { html: '2 m/s，反向', say: '速度大小不一定相等，要乘上质量。' },
              { html: '1.6 m/s，反向', say: '质量比用反了：轻的人速度更大。' }
            ],
            hints: ['开始两人静止，总动量是多少？', '0 = 50 × (−2) + 40v。', 'v = 2.5 m/s，方向和 50 kg 的人相反。']
          }, api);
        }
      },
      {
        title: '从速度变化求质量比',
        beats: [{ say: '光滑轨道上 A、B 两车相碰。v–t 图上，A 的速度从 3 m/s 变成 1 m/s，B 的速度从 −1 m/s 变成 2 m/s。两车质量之比 m_A : m_B 是多少？' }],
        gateAt: 0,
        button: '收束',
        draw: vtcarts,
        mount: function (el, api) {
          var st = document.createElement('div');
          st.className = 'stem';
          st.textContent = '改编自 2025 年河南卷第 7 题情景：光滑轨道上 A、B 两车相碰，A 的速度从 3 m/s 变成 1 m/s，B 的速度从 −1 m/s 变成 2 m/s。两车质量之比 mA : mB 是多少？';
          el.appendChild(st);
          GRAV.ui.choice(el, {
            options: [
              { html: '3 : 2', correct: true, say: '对。mA × (1 − 3) + mB × (2 − (−1)) = 0，2mA = 3mB。' },
              { html: '2 : 3', say: '比例用反了：速度变化小的那辆更重。' },
              { html: '1 : 1', say: '两车速度变化不一样大（2 和 3），质量就不相等。' },
              { html: '3 : 1', say: 'B 的速度变化是 2 − (−1) = 3，不是 2 − 1。' }
            ],
            hints: ['两车动量变化等大反向。', 'mA × (−2) + mB × 3 = 0。', 'mA : mB = 3 : 2。']
          }, api);
        }
      }
    ]
  });
})();
