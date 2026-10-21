/* 第 1 幕 · 冰面上怎样动起来：接住第 4 节的钩子，先锁定预测；扔出背包，人以 0.5 m/s 后退（命名"反冲"）；谁的动能大：背包 90 J，人 7.5 J */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  var GUESS = ['原地跺脚、迈步走', '用力挥动手臂', '把背包往后扔出去', '没办法，只能等别人推'];
  var WHY = [
    '冰面光滑，脚下没有摩擦，迈步只会原地打滑。',
    '手臂挥出去，身子往回动一点；手臂一停，人也停了，总动量还是 0。',
    '对，扔出去的背包带走了向后的动量，人就得到向前的动量。',
    '其实有办法：自己身上带的东西就够用。'
  ];

  function mountGuess(el, api) {
    var box = document.createElement('div');
    box.className = 'opts';
    var btns = GUESS.map(function (g, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt';
      b.innerHTML = '<span class="opt-html">' + g + '</span><span class="mark" aria-hidden="true"></span>';
      b.addEventListener('click', function () {
        if (GRAV.state.r1 != null) return;
        GRAV.state.r1 = i;
        lock();
        api.me('我猜「' + g + '」');
        api.say('记下了。看看实际会怎样。');
        api.open();
      });
      box.appendChild(b);
      return b;
    });
    function lock() {
      btns.forEach(function (b, i) {
        b.disabled = true;
        if (i === GRAV.state.r1) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
      });
    }
    api.onBeat(function (bt) { box.hidden = bt < 1; });
    if (GRAV.state.r1 != null) { lock(); api.open(); }
    el.appendChild(box);
  }

  GRAV.act({
    id: 1,
    name: '冰面上怎样动起来',
    tag: '第 1 幕 · 冰面上怎样动起来',
    steps: [
      {
        title: '冰面上，怎样才能动起来？',
        beats: [
          { say: '上一节最后：两车中间夹着压缩的弹簧，弹开后动量还是 0，动能却增加了。没有"撞"，靠推开也能获得速度。' },
          { say: '现在换成你：站在光滑的冰面上，四周什么都抓不到，背着一个背包。怎样才能动起来？选了就锁定，不判对错。' }
        ],
        gateAt: 1,
        button: '扔出去试试',
        tall: true,
        draw: RCL.throwScene({ go: false, bars: false }),
        mount: mountGuess
      },
      {
        title: '扔出背包，人往哪走、多快？',
        beats: [
          {
            say: function () {
              var i = GRAV.state.r1;
              var head = i == null ? '' : (i === 2 ? '你猜的是「把背包往后扔出去」，猜对了。' : '你猜的是「' + GUESS[i] + '」。' + WHY[i] + ' ');
              return head + '60 kg 的人把 5 kg 的背包以 6 m/s 向后扔出。人的速度多大、朝哪？';
            }
          },
          { say: '扔之前人和背包都静止，总动量是 0。扔出后：0 = 60v + 5 × (−6)，v = 0.5 m/s，向前。看动量柱子：背包 −30，人 +30，和还是 0。' },
          { say: '原来静止的系统，一部分向后抛出，另一部分就向前运动，这叫反冲。炮弹出膛炮身后退、开枪时枪托撞肩、章鱼向后喷水向前游，都是反冲。' }
        ],
        gateAt: 0,
        button: '动能呢',
        play: true,
        tall: true,
        draw: RCL.throwScene({ go: true, bars: 'p' }),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '0.5 m/s，向前', correct: true, say: '对。0 = 60v + 5 × (−6)，v = 0.5 m/s。' },
              { html: '6 m/s，向前', say: '人比背包重得多，速度不会一样大。两者动量等大反向：60 × v = 5 × 6。' },
              { html: '约 0.46 m/s，向前', say: '这是用 65 kg 去除的。扔出后人只剩 60 kg，背包已经不在身上了。' },
              { html: '0：没有外力推人', say: '没有外力，总动量保持 0；可背包带走了向后的动量，人就得到等量的向前动量。' }
            ],
            hints: ['扔之前总动量是多少？', '0。扔出后人和背包的动量加起来也得是 0。', '0 = 60v + 5 × (−6)。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          var ex = document.createElement('div');
          ex.className = 'def';
          ex.innerHTML =
            '<div class="row"><b>反冲</b><span>原来静止的系统，一部分向后抛出，另一部分向前运动；总动量始终为 0</span></div>' +
            '<div class="row"><b>例子</b><span>炮身后退、枪的后坐力、章鱼和乌贼喷水游动、喷灌装置边喷边转</span></div>';
          el.appendChild(ex);
          api.onBeat(function (bt) {
            if (bt >= 1 && !shown) {
              shown = true;
              wk.line('0 = 60' + S('v') + ' + 5 × (−6)', '扔之前总动量为 0');
              wk.line(S('v') + ' = 0.5 m/s，向前');
            }
            ex.hidden = bt < 2;
          });
        }
      },
      {
        title: '扔出后，谁的动能大？',
        beats: [
          { say: '扔之前两者都静止，动能是 0。扔出后，人和背包谁的动能大？' },
          { say: '背包 ½ × 5 × 6² = 90 J，人 ½ × 60 × 0.5² = 7.5 J。动量一样大，动能却差了十几倍：轻的一方分到的动能多。' },
          { say: '总动能从 0 变成 97.5 J，增加了，来自人体肌肉里的化学能；上一节的弹簧，则来自弹性势能。碰撞时动能只减不增，反冲时动能增加。' }
        ],
        gateAt: 0,
        button: '火箭也是这样吗',
        tall: true,
        draw: RCL.throwScene({ go: true, bars: function (bt) { return bt >= 1 ? 'pk' : 'p'; } }),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '一样大：两者动量一样大', say: '动量一样大，动能不一定一样大。动能 = p²/(2m)，质量小的动能大。' },
              { html: '人的大：人更重', say: '人重，可速度只有 0.5 m/s。算一算：½ × 60 × 0.5² = 7.5 J。' },
              { html: '背包的大', correct: true, say: '对。背包 90 J，人只有 7.5 J。' },
              { html: '都是 0：总动量是 0，总动能也是 0', say: '动能没有方向，不会正负抵消。两者都在动，动能都大于 0。' }
            ],
            hints: ['分别算一算两者的动能。', '背包 ½ × 5 × 6²，人 ½ × 60 × 0.5²。', '90 J 对 7.5 J。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      }
    ]
  });
})();
