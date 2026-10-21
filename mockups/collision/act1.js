/* 第 1 幕 · 弹开的碰撞，动能都不变吗：接住第 3 节的钩子，先锁定预测；再用第 1 节的小车换三种碰撞面做实验，橡皮那次弹开了，动能却少了 26% */
(function () {
  'use strict';
  var S = GRAV.h.sym, f = MOM.f, D = COL.D;

  // 上一节的钩子：上面一排粘在一起，下面一排 A 停住、B 滑走
  function hook(ctx, w, h, t, C) {
    var r = Math.max(18, Math.min(26, w * 0.04)), x0 = 16, narrow = w < 520;
    var rows = [
      { y: h * 0.3, title: '假如碰后粘在一起', ke: '动能 ½mv² → ¼mv²，少了一半', stick: true },
      { y: h * 0.7, title: '第 1 节的冰壶：A 停住，B 滑走', ke: '动能几乎没少', stick: false }
    ];
    rows.forEach(function (R) {
      MOM.sheet(ctx, x0, w - x0, R.y, C, 0, r * 2.2);
      txt(ctx, R.title, x0 + 8, R.y - r * 2.2 - 8, { size: 12, color: C.steel });
      var cx = narrow ? w * 0.3 : w * 0.28;
      if (R.stick) {
        MOM.stone(ctx, cx, R.y, r, C, 'A');
        MOM.stone(ctx, cx + 2 * r, R.y, r, C, 'B');
        MOM.vArrow(ctx, cx + 3 * r + 8, R.y, 0.5, 70, C, 'v/2');
      } else {
        MOM.stone(ctx, cx, R.y, r, C, 'A');
        MOM.stone(ctx, cx + 2 * r + 60, R.y, r, C, 'B');
        MOM.vArrow(ctx, cx + 3 * r + 68, R.y, 1, 70, C, 'v');
      }
      txt(ctx, R.ke, x0 + 8, R.y + r * 2.2 + 18, { size: 14, color: C.graphite });
    });
    GRAV.draw.note(ctx, '俯视图，两只一样重；A 都以 v 撞静止的 B', w, h, C);
  }
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  var GUESS = ['都不变：弹开说明没有损失', '不一定', '都会减少一半'];
  function mountGuess(el, api) {
    var box = document.createElement('div');
    box.className = 'opts';
    var btns = GUESS.map(function (g) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt';
      b.innerHTML = '<span class="opt-html">' + g + '</span><span class="mark" aria-hidden="true"></span>';
      b.addEventListener('click', function () {
        if (GRAV.state.g1) return;
        GRAV.state.g1 = g;
        lock();
        api.me('我猜「' + g + '」');
        api.say('记下了，不能再改。用第 1 节的小车测一测。');
        api.open();
      });
      box.appendChild(b);
      return b;
    });
    function lock() {
      btns.forEach(function (b, i) {
        b.disabled = true;
        if (GUESS[i] === GRAV.state.g1) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
      });
    }
    api.onBeat(function (bt) { box.hidden = bt < 1; });
    if (GRAV.state.g1) { lock(); api.open(); }
    el.appendChild(box);
  }

  // ---------- 数据表：碰前一行，之后每做一次加一行 ----------
  COL.table = function () {
    var t = document.createElement('table');
    t.className = 'dt';
    t.innerHTML = '<tr><th>碰撞面</th><th>动量和</th><th>动能和</th><th>动能</th></tr>' +
      '<tr><td>碰前</td><td>' + f(COL.p(D.mag, false), 3) + '</td><td>' + f(COL.ke(D.mag, false), 3) + '</td><td>—</td></tr>';
    return {
      el: t,
      row: function (r) {
        var tr = document.createElement('tr');
        tr.className = 'in';
        tr.innerHTML = '<td>' + r.name + '（' + r.note.slice(2) + '）</td><td>' + f(COL.p(r, true), 3) + '</td><td>' + f(COL.ke(r, true), 3) + '</td><td>' + COL.lossTxt(r) + '</td>';
        t.appendChild(tr);
      }
    };
  };
  COL.unitNote = '动量和单位 kg·m/s，动能和单位 J';

  var KEYS = ['mag', 'rub', 'vel'];
  var LAB = { k: 'mag', cur: Object.assign({ idle: true }, D.mag), tried: [] };

  function mountLab(el, api) {
    var panel = document.createElement('div');
    var g = document.createElement('div');
    g.className = 'lab-g';
    g.innerHTML = '<div class="lab-t">碰撞面</div>';
    var row = document.createElement('div');
    row.className = 'chips';
    KEYS.forEach(function (k) {
      var c = document.createElement('button');
      c.type = 'button'; c.className = 'chip pick' + (LAB.k === k ? ' on' : '');
      c.innerHTML = '<span>' + D[k].name + '</span><span class="u">' + D[k].note + '</span>';
      c.addEventListener('click', function () {
        LAB.k = k;
        Array.prototype.forEach.call(row.children, function (x, n) { x.classList.toggle('on', KEYS[n] === k); });
        LAB.cur = Object.assign({ idle: true }, D[k]);
      });
      row.appendChild(c);
    });
    g.appendChild(row);
    panel.appendChild(g);
    var run = document.createElement('button');
    run.type = 'button'; run.className = 'run';
    run.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>做一次';
    panel.appendChild(run);
    var tb = COL.table();
    tb.el.classList.add('dt-gap');
    var unit = document.createElement('div');
    unit.className = 'score-sub';
    unit.textContent = COL.unitNote;
    panel.appendChild(tb.el); panel.appendChild(unit);
    LAB.tried.forEach(function (k) { tb.row(D[k]); });
    el.appendChild(panel);

    function check() {
      if (LAB.tried.length === KEYS.length) { api.win(false); api.open(); return true; }
      return false;
    }
    run.addEventListener('click', function () {
      var r = D[LAB.k];
      LAB.cur = r;
      api.replay();
      var cv = document.getElementById('canvas-wrap');
      if (cv && cv.getBoundingClientRect().top < 0) cv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      api.me('我试：' + r.name);
      if (LAB.tried.indexOf(LAB.k) < 0) { LAB.tried.push(LAB.k); tb.row(r); }
      api.say(r.name + '：动量和 ' + f(COL.p(r, false), 3) + ' → ' + f(COL.p(r, true), 3) + '，动能和 ' + f(COL.ke(r, false), 3) + ' → ' + f(COL.ke(r, true), 3) + ' J，' + COL.lossTxt(r) + '。');
      if (!check()) {
        var left = KEYS.filter(function (k) { return LAB.tried.indexOf(k) < 0; }).map(function (k) { return D[k].name; });
        api.say('还有' + left.join('、') + '没做。');
      }
    });
    check();
  }

  GRAV.act({
    id: 1,
    name: '弹开的碰撞，动能都不变吗',
    tag: '第 1 幕 · 弹开的碰撞，动能都不变吗',
    steps: [
      {
        title: '粘住时，动能少了一半',
        beats: [
          { say: '上一节最后：两只一样重的冰壶，假如碰后粘在一起，动量守恒，动能却少了一半。第 1 节真实的冰壶 A 停住、B 滑走，动能几乎没少。' },
          { say: '那么，碰后弹开的碰撞，动能都不变吗？凭直觉选一个。选了就不能改，也不判对错。' }
        ],
        gateAt: 1,
        button: '去测数据',
        tall: true,
        draw: hook,
        mount: mountGuess
      },
      {
        title: '三种碰撞面，各做一次',
        beats: [
          { say: '还是第 1 节的两辆车：0.4 kg 的 A 以 0.60 m/s 撞静止的 0.2 kg 的 B。碰撞面有三种：磁体、橡皮碰后都弹开，粘扣碰后粘住。三种都做一次。' },
          { say: '三次的动量和都约 0.24 kg·m/s，动量守恒。可动能和不一样，看表的最后一列。' }
        ],
        gateAt: 0,
        button: '细看橡皮那次',
        play: true,
        tall: true,
        draw: COL.scene(function () { return LAB.cur; }, {
          label: function () { return '碰撞面：' + LAB.cur.name + '，' + LAB.cur.note; }
        }),
        mount: mountLab
      },
      {
        title: '橡皮那次，动能少了多少？',
        beats: [
          { say: '看橡皮那次：碰后两车也弹开了。动能和从 0.072 J 变成了多少？少了多少？' },
          { say: '0.072 → 0.053 J，少了 26%。碰后弹开了，动能也可能少很多。橡皮看着挺有弹性，动能却少了四分之一，这个反差下一幕再说。' },
          {
            say: function () {
              var g = GRAV.state.g1;
              if (!g) return '弹开的碰撞，动能不一定不变。';
              return g === GUESS[1] ? '你一开始猜「不一定」，猜对了。' : '你一开始猜「' + g + '」，和数据不一样。没关系，数据说了算。';
            }
          },
          { say: '磁体那次几乎没少，橡皮少了约四分之一，粘扣少了 35%。按动能的结局，碰撞可以分成三类。' }
        ],
        gateAt: 0,
        button: '给碰撞分类',
        play: true,
        tall: true,
        draw: COL.scene(D.rub, { label: '碰撞面：橡皮，碰后弹开' }),
        mount: function (el, api) {
          var tb = COL.table();
          KEYS.forEach(function (k) { tb.row(D[k]); });
          el.appendChild(tb.el);
          var unit = document.createElement('div');
          unit.className = 'score-sub';
          unit.textContent = COL.unitNote;
          el.appendChild(unit);
          var box = document.createElement('div');
          box.className = 'q-gap';
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '几乎没变', say: '那是磁体那次。看橡皮那一行：0.072 → 0.053。' },
              { html: '约 26%', correct: true, say: '对。(0.072 − 0.053) ÷ 0.072 ≈ 26%。' },
              { html: '约 35%', say: '那是粘扣那次，碰后粘在一起。橡皮那次两车是弹开的。' },
              { html: '增加了', say: '0.053 比 0.072 小，是减少了。' }
            ],
            hints: ['找到表里橡皮那一行。', '动能和 0.072 J → 0.053 J。', '(0.072 − 0.053) ÷ 0.072 ≈ 26%。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
