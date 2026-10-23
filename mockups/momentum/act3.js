/* 第 3 幕 · 第 2 轮：学生自己设计实验，找出能区分 mv 和 mv² 的碰撞（碰后粘在一起） */
(function () {
  'use strict';

  var S = GRAV.h.sym;

  var MASSES = [
    { name: '重车撞轻车', note: '0.4 / 0.2 kg', mA: 0.4, mB: 0.2 },
    { name: '一样重', note: '0.2 / 0.2 kg', mA: 0.2, mB: 0.2 },
    { name: '轻车撞重车', note: '0.2 / 0.4 kg', mA: 0.2, mB: 0.4 }
  ];
  var SIDES = [
    { name: '磁体', note: '碰后弹开', side: 'mag', e: 1 },
    { name: '粘扣', note: '碰后粘住', side: 'velcro', e: 0 }
  ];
  // 一次"实测"：理想碰撞的碰后速度乘 0.99，模拟一点损耗和测量误差
  function design(mi, si) {
    var M = MASSES[mi], Sd = SIDES[si];
    var v = MOM.collide(M.mA, M.mB, 0.6, 0, Sd.e);
    return {
      mA: M.mA, mB: M.mB, vA: 0.6, vB: 0, side: Sd.side,
      a: Math.round(v[0] * 0.99 * 1000) / 1000, b: Math.round(v[1] * 0.99 * 1000) / 1000
    };
  }
  var LAB = { mi: 0, si: 0, cur: null, ch: null };

  function mountLab(el, api) {
    LAB.cur = design(LAB.mi, LAB.si);
    LAB.cur.idle = true;
    var tries = 0, done = !!LAB.ch;
    var panel = document.createElement('div');
    function group(title, list, key, one) {
      var g = document.createElement('div');
      g.className = 'lab-g';
      g.innerHTML = '<div class="lab-t">' + title + '</div>';
      var row = document.createElement('div');
      row.className = 'chips' + (one ? ' one' : '');
      list.forEach(function (it, k) {
        var c = document.createElement('button');
        c.type = 'button'; c.className = 'chip pick' + (LAB[key] === k ? ' on' : '');
        c.innerHTML = '<span>' + it.name + '</span><span class="u">' + it.note + '</span>';
        c.addEventListener('click', function () {
          LAB[key] = k;
          Array.prototype.forEach.call(row.children, function (x, n) { x.classList.toggle('on', n === k); });
          LAB.cur = design(LAB.mi, LAB.si); LAB.cur.idle = true;
        });
        row.appendChild(c);
      });
      g.appendChild(row);
      return g;
    }
    panel.appendChild(group('两车的质量', MASSES, 'mi', true));
    panel.appendChild(group('碰撞面', SIDES, 'si'));
    var run = document.createElement('button');
    run.type = 'button'; run.className = 'run';
    run.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>做一次';
    panel.appendChild(run);
    var log = document.createElement('table');
    log.className = 'dt dt-gap';
    log.innerHTML = '<tr><th>你的设计</th><th>' + S('mv') + ' 之和</th><th>' + S('mv') + '² 之和</th></tr>';
    log.hidden = true;
    panel.appendChild(log);
    el.appendChild(panel);

    run.addEventListener('click', function () {
      var d = design(LAB.mi, LAB.si);
      LAB.cur = d;
      api.replay();
      tries++;
      // 窄屏上画布在面板上方，点完滚回去看碰撞
      var cv = document.getElementById('canvas-wrap');
      if (cv && cv.getBoundingClientRect().top < 0) cv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var m = MASSES[LAB.mi], sd = SIDES[LAB.si];
      api.me('我试：' + m.name + '，' + sd.name);
      var a = RD.sums(d, 'mv'), b = RD.sums(d, 'mv2');
      var ka = MOM.kept(a.pre, a.post), kb = MOM.kept(b.pre, b.post);
      var tr = document.createElement('tr');
      tr.className = 'in';
      tr.innerHTML = '<td>' + m.name + '，' + sd.name + '</td><td>' + RD.vd(ka) + '</td><td>' + RD.vd(kb) + '</td>';
      log.appendChild(tr); log.hidden = false;
      if (ka && !kb) {
        api.say('分出来了：mv 之和没变，mv² 之和' + RD.pctTxt(b) + '。');
        if (!done) { done = true; LAB.ch = d; api.win(true); api.open(); }
        return;
      }
      api.say('这次 mv 和 mv² 都没变，还是分不出谁对。换个设计试试。');
      if (!done && tries === 2) api.say('提示：前几次都是碰后弹开。想想有没有别的碰撞方式？');
      if (!done && tries === 3) api.say('再提示：把碰撞面换成粘扣，让两车碰后粘在一起。');
    });
    if (done) api.open();
    // 讲解往下走以后，画面固定放学生找到的那次实验，下面出数据表
    var sp = document.createElement('div'), ct = RD.candTable(), shown = 0;
    el.appendChild(sp); el.appendChild(ct.el); ct.el.hidden = true;
    api.onBeat(function (bt) {
      panel.hidden = bt > 0;
      if (bt >= 1 && LAB.ch) {
        if (!sp.innerHTML) sp.innerHTML = RD.speedTable(LAB.ch);
        if (LAB.cur !== LAB.ch) { LAB.cur = LAB.ch; api.replay(); }
      }
      sp.hidden = bt < 1;
      var rows = [[2, 'mv'], [3, 'mv2']];
      while (shown < rows.length && rows[shown][0] <= bt && LAB.ch) { ct.row(LAB.ch, rows[shown][1]); shown++; }
      ct.el.hidden = shown === 0;
    });
  }

  GRAV.act({
    id: 3,
    name: '你来设计',
    tag: '第 3 幕 · 第 2 轮',
    steps: [
      {
        title: '第 2 轮：你来设计',
        beats: [
          { say: '第 1 轮里 mv 和 mv² 都过关了。现在你来设计：做什么样的碰撞，才能让它们一个变、一个不变？选好就点"做一次"，可以试很多次。' },
          { say: function () { return 'v–t 图上，碰后两条线并成了一条：两车的共同速度是 ' + RD.d3(LAB.ch.a) + ' m/s。'; } },
          { say: function () { return RD.say(LAB.ch, 'mv') + '，还是没变。'; } },
          { say: function () { return RD.say(LAB.ch, 'mv2') + '，远远超出误差。mv² 出局。'; } },
          { say: '这就是关键：弹开的碰撞里，mv 和 mv² 都不变，分不出谁对；只有粘在一起的碰撞，才把它们分开。' }
        ],
        gateAt: 0,
        button: '开始第 3 轮',
        play: true,
        tall: true,
        draw: RD.scene(function () { return LAB.cur; }, function () { return LAB.cur.side === 'velcro' ? '碰撞面装粘扣：碰后粘在一起' : '碰撞面装磁体：碰后弹开'; }),
        mount: mountLab
      }
    ]
  });
})();
