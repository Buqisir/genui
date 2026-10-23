/* 结论区的条目：何时出现、何时成立。位置写成 [幕号, 第几步, 第几句]，见规格第七节。title 是链上的短标题，under 是收到哪一条下面。 */
(function () {
  'use strict';
  GRAV.board([
    { id: 'ke', under: 'checks', title: '动能不能增加', html: '碰撞后总动能不能比碰前多', at: [1, 2, 1] },
    { id: 'range', under: 'checks', title: '碰后速度有范围', html: 'm 撞静止的 3m：B 的速度在 0.25v（粘住）和 0.5v（弹性）之间', at: [2, 1, 1] },
    { id: 'pass', under: 'checks', title: '后面的不能穿过去', html: '同向运动时，碰后后面的物体不能比前面的快', at: [2, 2, 1] },
    { id: 'checks', title: '三条检查', html: '动量守恒；总动能不增加；速度合理', at: [2, 3, 0],
      mask: '动量 ___；总动能 ___；速度合理' },
    { id: 'e', under: 'checks', title: '恢复系数', html: 'e = 碰后分离速度 ÷ 碰前接近速度；0（粘住）≤ e ≤ 1（弹性）', at: [2, 3, 1] },
    { id: 'share', title: '质量相近，传得最多', html: '弹性正碰中，静止物体得到的动能比例 = 4k/(1 + k)²：质量相等时为 100%', at: [3, 1, 2],
      mask: '弹性正碰中，质量 ___ 时，静止物体得到的动能最多' },
    { id: 'mod', under: 'share', title: '减速剂用轻核', html: '中子减速剂用水（氢）、石墨（碳），不用铅', at: [3, 2, 1] },
    { id: 'chadwick', title: '用碰撞"称"中子', html: '两种靶核的碰后最大速度之比消去入射速度：(M + 14)/(M + 1) = u_H/u_N，M ≈ 1', at: [4, 2, 1] }
  ]);
})();
