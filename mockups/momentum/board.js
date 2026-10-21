/* 结论区的条目：何时以猜想出现、何时出局或成立。位置写成 [幕号, 第几步, 第几句]，见规格第七节。title 是链上的短标题，under 是收到哪一条下面。 */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  GRAV.board([
    { id: 'v', hyp: true, title: S('v') + ' 之和不变', html: S('v') + ' 之和不变', at: [1, 2, 3], out: [2, 1, 3] },
    { id: 'mv', hyp: true, title: S('mv') + ' 之和不变', html: S('mv') + ' 之和不变', at: [2, 2, 1],
      ok: { at: [4, 1, 4], title: S('mv') + ' 的矢量和不变', html: '两物体 ' + S('mv') + ' 的矢量和不变' }, mask: '两物体 ___ 和不变' },
    { id: 'mv2', hyp: true, title: S('mv') + '² 之和不变', html: S('mv') + '² 之和不变', at: [2, 2, 1], out: [3, 1, 3] },
    { id: 'stick', under: 'mv2', title: '粘住才分得清', html: '碰后粘在一起的碰撞，才分得清 ' + S('mv') + ' 和 ' + S('mv') + '²', at: [3, 1, 4],
      mask: '___ 的碰撞，才分得清 ' + S('mv') + ' 和 ' + S('mv') + '²' },
    { id: 'p', title: '动量 ' + S('p') + ' = ' + S('mv'), html: S('p') + ' = ' + S('mv') + '，单位 kg·m/s，矢量', at: [4, 2, 0] },
    { id: 'ek', under: 'p', title: '动量 ≠ 动能', html: '动量相同，动能可以差很多', at: [5, 1, 3] },
    { id: 'dp', under: 'p', title: 'Δ' + S('p') + ' 带方向', html: 'Δ' + S('p') + ' = ' + S('p') + '′ − ' + S('p') + '，带方向相减', at: [6, 1, 2] }
  ]);
})();
