#!/usr/bin/env python3
# 用法: regen2-done.py <完成的id> "<备注>"   → 记完成、从运行中移除、出队一个并加入运行中，打印新 id
import sys, re
done, note = sys.argv[1], sys.argv[2]
q = 'archive/plans/regen2-queue.txt'
ids = [l.strip() for l in open(q) if l.strip()]
nxt = ids.pop(0) if ids else ''
open(q, 'w').write(''.join(i + '\n' for i in ids))

p = 'archive/plans/regen2-status.md'
s = open(p).read()
s = s.replace('\n## 待续跑', f'- {done}：{note}\n\n## 待续跑', 1)
m = re.search(r'## 运行中\n- (.*)\n?', s)
running = [r for r in m.group(1).split('、') if r.split('（')[0] != done]
if nxt:
    running.append(nxt)
s = s[:m.start()] + '## 运行中\n- ' + '、'.join(running) + '\n' + s[m.end():]
open(p, 'w').write(s)
print(nxt, len(ids))
