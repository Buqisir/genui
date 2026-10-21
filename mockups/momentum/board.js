/* 结论区的条目：何时以猜想出现、何时出局或成立。位置写成 [幕号, 第几步, 第几句]，见规格第七节。 */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  GRAV.board([
    { id: 'v', hyp: true, html: S('v') + ' 之和不变', at: [1, 2, 3], out: [2, 1, 3] },
    { id: 'mv', hyp: true, html: S('mv') + ' 之和不变', at: [2, 2, 1],
      ok: { at: [4, 1, 4], html: '两物体 ' + S('mv') + ' 的矢量和不变' }, mask: '两物体 ___ 和不变' },
    { id: 'mv2', hyp: true, html: S('mv') + '² 之和不变', at: [2, 2, 1], out: [3, 1, 3] },
    { id: 'stick', html: '碰后粘在一起的碰撞，才分得清 ' + S('mv') + ' 和 ' + S('mv') + '²', at: [3, 1, 4],
      mask: '___ 的碰撞，才分得清 ' + S('mv') + ' 和 ' + S('mv') + '²' },
    { id: 'p', html: S('p') + ' = ' + S('mv') + '，单位 kg·m/s，矢量', at: [4, 2, 0] },
    { id: 'ek', html: '动量相同，动能可以差很多', at: [5, 1, 3] },
    { id: 'dp', html: 'Δ' + S('p') + ' = ' + S('p') + '′ − ' + S('p') + '，带方向相减', at: [6, 1, 2] }
  ]);
})();
