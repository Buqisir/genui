/* 第 7 幕 · 总结：动量工具箱 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  GRAV.act({
    id: 7,
    name: '总结',
    tag: '第 7 幕 · 总结',
    steps: [
      {
        title: '动量工具箱',
        layout: 'answer',
        beats: [
          { say: '把这节课收进一个工具箱。' },
          { say: '最容易错的几处，单独记一下。' },
          { say: '方法也记一下：找不变量。先列出几个猜想，再用不同的碰撞把它们一个个淘汰。' }
        ],
        button: '开始小测',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'tk';
          d.innerHTML =
            '<div class="lead"><span class="big">' + S('p') + ' = ' + S('m') + S('v') + '</span>' +
            '<span style="color:var(--c-graphite);font-size:15px">单位 kg·m/s；矢量，方向与速度相同</span></div>' +
            '<div><h3>碰撞中的不变量</h3><p>两物体 ' + S('mv') + ' 的<b>矢量和</b>。' + S('v') + ' 之和、' + S('mv') + '² 之和都不是。</p></div>' +
            '<div><h3>怎么分辨 ' + S('mv') + ' 和 ' + S('mv') + '²</h3><p>看碰后粘在一起的碰撞：' + S('mv') + ' 之和不变，' + S('mv') + '² 之和变小。</p></div>' +
            '<div><h3>动量的变化量</h3><p>Δ' + S('p') + ' = ' + S('p') + '′ − ' + S('p') + '。先规定正方向，再带正负相减。</p></div>' +
            '<div><h3>动量和动能</h3><p>' + S('p') + ' ∝ ' + S('v') + '，矢量；' + S('E') + 'ₖ = ½' + S('mv') + '² ∝ ' + S('v') + '²，标量；' + S('p') + ' = √(2' + S('m') + S('E') + 'ₖ)。</p></div>' +
            '<div class="warn" data-b="1"><h3>易错区</h3><ul>' +
            '<li>小球原速反弹，Δ' + S('p') + ' 不是 0，是 2' + S('mv') + '。</li>' +
            '<li>动量相加要带方向，相向运动时要相减。</li>' +
            '<li>动量变了，动能不一定变，比如匀速圆周运动。</li>' +
            '<li>实验里"不变"指在误差范围内不变，不是数字完全相等。</li></ul></div>' +
            '<div class="warn" data-b="2"><h3>方法</h3><p>找不变量：列出猜想 → 用数据检验 → 淘汰 → 剩下的就是规律。</p></div>';
          el.appendChild(d);
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      }
    ]
  });
})();
