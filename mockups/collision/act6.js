/* 第 6 幕 · 收束：结论区盖住关键词、学生补全；两车被压缩的弹簧弹开（动量仍为 0，动能增加），留下一节（反冲与火箭）的钩子 */
(function () {
  'use strict';
  var f = MOM.f;

  // 两车静止、中间夹压缩的弹簧，细线拴住；第 2 句起烧断细线，A 以 0.30 m/s 向左、B 以 0.60 m/s 向右
  function spring(ctx, w, h, t, C, beat) {
    var x0 = 8, x1 = w - 8, y = h * 0.42, cw = Math.max(64, Math.min(100, w * 0.14)), ch = Math.max(30, Math.min(38, cw * 0.36));
    var go = beat >= 1, tt = go ? Math.min(t, 2.2) : 0;
    var cx = (x0 + x1) / 2, sp = 40;
    var vA = -0.3, vB = 0.6, k = Math.max(20, (x1 - cx - sp / 2 - cw * 0.9 - 70) / (vB * 2.2));
    var xa = cx - sp / 2 - cw * 1.12 + (go ? vA * k * tt : 0), xb = cx + sp / 2 + (go ? vB * k * tt : 0);
    xa = Math.max(x0 + 2, xa); xb = Math.min(x1 - 2 - cw * 0.9, xb);
    MOM.track(ctx, x0, x1, y, C);
    MOM.cart(ctx, xa, y, cw * 1.12, ch, C, { name: 'A', label: '0.4 kg', heavy: true });
    MOM.cart(ctx, xb, y, cw * 0.9, ch, C, { name: 'B', label: '0.2 kg' });
    // 弹簧：没烧断时压在两车之间；烧断后留在 A 车上，自然长度
    var sy = y - ch / 2 - 3, sx0 = xa + cw * 1.12, sx1 = go ? Math.min(sx0 + 46, xb) : xb, n = 8;
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sx0, sy);
    for (var i = 1; i < 2 * n; i++) ctx.lineTo(sx0 + (sx1 - sx0) * i / (2 * n), sy + (i % 2 ? -6 : 6));
    ctx.lineTo(sx1, sy); ctx.stroke();
    if (!go) {
      ctx.setLineDash([2, 3]); ctx.strokeStyle = C.steel; ctx.beginPath(); ctx.moveTo(sx0 - 10, y - ch - 6); ctx.lineTo(xb + 10, y - ch - 6); ctx.stroke();
    }
    ctx.restore();
    if (!go) GRAV.draw.text(ctx, '细线', cx, y - ch - 14, { size: 12, color: C.steel, align: 'center' });
    var sc = 90, ay = y + 30;
    if (go && tt > 0.15) {
      MOM.vArrow(ctx, xa + cw * 0.56, ay, vA, sc, C, '0.30 m/s');
      MOM.vArrow(ctx, Math.min(xb + cw * 0.45, x1 - 4 - vB * sc), ay, vB, sc, C, '0.60 m/s');
    } else {
      MOM.vArrow(ctx, xa + cw * 0.56, ay, 0, sc, C);
      MOM.vArrow(ctx, xb + cw * 0.45, ay, 0, sc, C);
    }
    GRAV.draw.text(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
    if (go && tt > 0.15) {
      var ty = y + 80;
      GRAV.draw.text(ctx, '动量：0 → −0.12 + 0.12 = 0', x0 + 8, ty, { font: 'num', size: 14, color: C.ink });
      GRAV.draw.text(ctx, '动能：0 → ' + f(0.5 * 0.4 * 0.09, 3) + ' + ' + f(0.5 * 0.2 * 0.36, 3) + ' = ' + f(0.054, 3) + ' J', x0 + 8, ty + 26, { font: 'num', size: 14, color: C.ink });
    }
  }

  GRAV.act({
    id: 6,
    name: '收束',
    tag: '第 6 幕 · 收束',
    steps: [
      {
        title: '补全结论区',
        layout: 'answer',
        beats: [
          { say: '结论区里有几处关键词被盖住了。不往回翻，你能补全吗？' },
          { say: '补全了。判断碰撞类型看总动能：不变是弹性，减少是非弹性，粘在一起减少最多。三种碰撞，动量都守恒。' }
        ],
        gateAt: 0,
        button: '换个方向想',
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">弹性碰撞：碰撞前后 ___ 不变。</div>';
          b2.innerHTML = '<div class="stem">碰后粘在一起的碰撞叫 ___ 碰撞，动能损失 ___。</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: '总动能', correct: true, say: '对。磁体那次，总动能几乎没变。' },
              { html: '每个物体的动能', say: '每个物体的动能会变：A 把动能给了 B。不变的是总动能。' },
              { html: '每个物体的速度', say: '速度都变了：一样重时还交换了速度。' }
            ],
            hints: ['想想磁体那次的动能柱子。', 'A 的柱子降、B 的柱子升，和不变。', '总动能不变。'],
            onCorrect: function () { b2.hidden = false; }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '完全非弹性，最多', correct: true, say: '对。最多，但一般不是全部：总动量不为 0，两物体还要一起动。' },
              { html: '完全非弹性，全部', say: '想想粘扣那次：两车还以 0.40 m/s 一起走，动能还剩 0.047 J。' },
              { html: '弹性，为零', say: '粘扣那次动能少了 35%，不是弹性碰撞。' }
            ],
            hints: ['想想粘扣那次。', '动能少了 35%，两车还一起走。', '完全非弹性，损失最多。'],
            onCorrect: function () { api.boardMask([]); }
          }, api);
          var sum = document.createElement('div');
          sum.className = 'def';
          sum.innerHTML =
            '<div class="row"><b>弹性</b><span>总动能不变；一样重时交换速度</span></div>' +
            '<div class="row"><b>非弹性</b><span>总动能减少，碰后可以分开</span></div>' +
            '<div class="row"><b>完全非弹性</b><span>碰后粘在一起，动能减少最多，一般不是全部</span></div>' +
            '<div class="row"><b>三种都</b><span>动量守恒</span></div>';
          Array.prototype.forEach.call(sum.querySelectorAll('.row b'), function (b) { b.style.width = '80px'; });
          el.appendChild(sum);
          api.boardMask(['bounce', 'stick']);
          api.onBeat(function (bt) {
            q.hidden = bt > 0;
            sum.hidden = bt < 1;
            if (bt > 0) api.boardMask([]);
          });
        }
      },
      {
        title: '把粘住倒过来：被弹簧弹开',
        beats: [
          { say: '光滑导轨上，两车静止，中间夹一根压缩的轻弹簧，用细线拴住。烧断细线后两车被弹开。和弹开前相比，两车的总动量、总动能怎样？' },
          { say: '动量：开始是 0，弹开后一正一负，加起来还是 0，守恒。动能：从 0 变成 0.054 J，增加了，来自弹簧的弹性势能。' },
          { say: '这不是"撞"，是"推开"，像把粘住的碰撞倒着放。火箭向后喷气、自己向前飞，也是这样。下一节：反冲与火箭。' }
        ],
        gateAt: 0,
        button: '开始小测',
        play: true,
        playAt: 1,
        tall: true,
        draw: spring,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '动量守恒（仍为 0），动能增加', correct: true, say: '对。增加的动能来自弹簧的弹性势能。' },
              { html: '动量守恒，动能也不变', say: '开始两车静止，动能是 0；弹开后都在动，动能变大了。' },
              { html: '动量增加：两车都动起来了', say: '两车一个向左、一个向右，动量一正一负，加起来还是 0。' }
            ],
            hints: ['开始的总动量、总动能各是多少？', '都是 0。弹开后两车速度方向相反。', '动量一正一负抵消；动能都是正的，加起来变大。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
