/* 第 4 幕 · 中子的发现：查德威克用未知射线分别撞氢核、氮核，只取碰后最大速度（正碰）；两式相除消去未知速度，M ≈ 1.16（原文 1.15） */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  function chadwick(ctx, w, h, t, C, beat) {
    var narrow = w < 520, x0 = 12, y1 = h * 0.3, y2 = h * 0.68, sx = narrow ? 70 : 110;
    // 源：钋放出 α 粒子打铍，铍放出未知射线
    ctx.save(); ctx.fillStyle = C.bar; ctx.strokeStyle = C.graphite;
    MOM.rr(ctx, x0, h * 0.49 - 22, sx - 14, 44, 6); ctx.fill(); ctx.stroke(); ctx.restore();
    txt(ctx, '钋 + 铍', x0 + (sx - 14) / 2, h * 0.49 + 5, { size: 12, color: C.graphite, align: 'center' });
    txt(ctx, '未知射线', x0, h * 0.49 - 32, { size: 12, color: C.steel });
    var tx = narrow ? w * 0.48 : w * 0.45;
    [[y1, '石蜡（含氢）', '氢核', '3.3×10⁷ m/s', 1], [y2, '含氮物质', '氮核', '4.7×10⁶ m/s', 0.14]].forEach(function (r) {
      ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = C.steel; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x0 + sx - 14, h * 0.49); ctx.lineTo(tx - 6, r[0]); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.fillStyle = MOM.rgba(C.steel, 0.18); ctx.strokeStyle = C.graphite;
      MOM.rr(ctx, tx, r[0] - 24, 34, 48, 4); ctx.fill(); ctx.stroke(); ctx.restore();
      txt(ctx, r[1], tx + 17, r[0] + 40, { size: 12, color: C.graphite, align: 'center' });
      ctx.save(); ctx.beginPath(); ctx.arc(tx + 48, r[0], r[4] > 0.5 ? 5 : 9, 0, Math.PI * 2); ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
      if (beat >= 1) {
        var len = Math.max(18, (w - tx - 80) * r[4]);
        GRAV.draw.arrow(ctx, tx + 58, r[0], tx + 58 + len, r[0], C.vel, 2);
        txt(ctx, r[2] + '最大 ' + r[3], tx + 58, r[0] - 12, { size: 12, color: C.vel });
      } else txt(ctx, r[2], tx + 58, r[0] - 12, { size: 12, color: C.graphite });
    });
    txt(ctx, '1932 年，查德威克', x0, 18, { size: 12, color: C.steel });
  }

  GRAV.act({
    id: 4,
    name: '中子的发现',
    tag: '第 4 幕 · 中子的发现',
    steps: [
      {
        title: '查德威克为什么只用最大速度？',
        beats: [
          { say: '1932 年以前，人们发现用钋放出的 α 粒子打铍，会放出一种穿透力很强、不带电的射线，它能把石蜡里的氢核打出来。有人以为它是 γ 射线。查德威克猜它是一种质量和质子差不多、不带电的粒子。' },
          { say: '他让这种射线分别去撞石蜡里的氢核和含氮物质里的氮核，测被撞核的速度。被撞核的速度有大有小，他只用最大值。为什么？' },
          { say: '正碰时被撞核得到的速度最大，斜着碰得到的都小；也只有正碰，才能用一维弹性碰撞的公式。未知粒子的质量 M、速度 V 都不知道，所以要两种靶核：u_H = 2M/(M + 1)·V，u_N = 2M/(M + 14)·V。这就是查德威克原文的写法，和第 4 节的 v₂′ = 2m₁v₁/(m₁ + m₂) 是同一个式子。' }
        ],
        gateAt: 1,
        button: '算出它的质量',
        tall: true,
        draw: chadwick,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '正碰时被撞核得到的速度最大，只有正碰才能用一维弹性碰撞公式', correct: true, say: '对。最大速度对应正碰。' },
              { html: '最大速度最容易测', say: '和测量难易无关。想想：什么样的碰撞让被撞核最快？' },
              { html: '速度越大，粒子越容易被看见', say: '和看不看得见无关。最大速度对应的是哪一种碰撞？' }
            ],
            hints: ['正碰和斜着碰，哪种让被撞核更快？', '正碰。', '正碰时才能用一维弹性碰撞公式。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            box.hidden = bt < 1;
            if (bt >= 2 && !shown) {
              shown = true;
              wk.line(S('u') + '_H = 2' + S('M') + ' / (' + S('M') + ' + 1) · ' + S('V'), '氢核质量记作 1');
              wk.line(S('u') + '_N = 2' + S('M') + ' / (' + S('M') + ' + 14) · ' + S('V'), '氮核质量 14');
            }
          });
        }
      },
      {
        title: '两个式子，两个未知数',
        beats: [
          { say: '查德威克测得：氢核最大约 3.3×10⁷ m/s，氮核最大约 4.7×10⁶ m/s。未知粒子的质量约是氢核的几倍？' },
          { say: '两式相除，未知的 V 消掉：(M + 14)/(M + 1) = 3.3×10⁷ ÷ 4.7×10⁶ ≈ 7.0，解得 M ≈ 1.16。查德威克原文写 M = 1.15，并说氮核速度的误差"可能有 10% 左右"，所以这种粒子的质量非常接近质子。它就是中子。' },
          { say: '一个看不见、不带电的粒子，就这样被两次碰撞"称"出了质量。教材第 5 节练习第 4 题用的氮核速度是 4.4×10⁶ m/s，算出来正好是 1，留作作业。' }
        ],
        gateAt: 0,
        button: '做一道例题',
        tall: true,
        draw: chadwick,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '约 1 倍：和氢核差不多', correct: true, say: '对。(M + 14)/(M + 1) ≈ 7.0，M ≈ 1.16。' },
              { html: '约 7 倍', say: '7.0 是两个速度之比，不是质量。还要解 (M + 14)/(M + 1) = 7.0。' },
              { html: '约 14 倍：和氮核一样', say: '如果和氮核一样重，氮核会被撞得和入射粒子一样快，比氢核快才对。' },
              { html: '约 1/7', say: '比值用反了：氢核比氮核快，(M + 14)/(M + 1) 应该等于 u_H/u_N ≈ 7.0。' }
            ],
            hints: ['两式相除，V 会消掉。', '(M + 14)/(M + 1) = u_H/u_N ≈ 7.0。', 'M + 14 = 7.0M + 7.0，M ≈ 1.16。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            if (bt >= 1 && !shown) {
              shown = true;
              wk.line('(' + S('M') + ' + 14) / (' + S('M') + ' + 1) = ' + S('u') + '_H / ' + S('u') + '_N ≈ 7.0', '两式相除，' + S('V') + ' 消去');
              wk.line(S('M') + ' ≈ 1.16（原文 1.15）');
            }
          });
        }
      }
    ]
  });
})();
