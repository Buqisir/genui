---
title: 生活器具样张
source: 器材样张
demo: true
---

第三批器材：犁、静电喷管、背罩、安全气囊、空调。和已定稿的物块、地面、降落伞、仪器盒放在一起，对照材质是否一致。

## 一、曲辕犁与直辕犁

犁体是喷漆钢，犁铧是深色铁件，把手套橡胶。耕索从返回的 `hitch` 接出。

<Figure title="曲辕犁与直辕犁" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -1.6, xmax: 7.4, ymin: -0.4, ymax: 2.4, equal: true })
    v.ground(m, -1.6, 7.4, 0)
    const a = v.plow(m, 0.6, 0, { kind: 'curved', label: '曲辕犁' })
    v.rope(m, [a.hitch, [a.hitch[0] + 0.5, a.hitch[1] + 1.6]])
    const b = v.plow(m, 3.9, 0, { kind: 'straight', length: 1.9, label: '直辕犁' })
    v.rope(m, [b.hitch, [b.hitch[0] + 1.2, b.hitch[1] + 0.9]])
  },
})
</Figure>

## 二、静电推进：发射极和吸极

发射极是铝管、锥形喷头和毛细针，尾部绝缘盖接引线。液滴从返回的 `tip` 出发。

<Figure title="发射极" height={300}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.4, xmax: 4.4, ymin: -1.6, ymax: 1.8, equal: true })
    const e = v.emitter(m, -1.6, 0, { length: 1.8, label: '发射极' })
    v.block(m, 2.4, 0.25, 0.16, 1.1)
    v.block(m, 2.4, -1.35, 0.16, 1.1)
    v.label(m, 2.75, -0.8, '吸极')
    v.ball(m, e.tip[0] + 0.5, 0, 0.09, { charge: '+' })
    v.emitter(m, -3.2, 1.2, { angle: -30, length: 0.9 })
  },
})
</Figure>

## 三、背罩与降落伞

背罩是向上凸的壳，顶上有吊环接伞绳，探测器挂在罩口下面。

<Figure title="背罩" height={380}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -3.4, xmax: 3.4, ymin: -1.3, ymax: 4.0, equal: true })
    const shell = v.backshell(m, -1.2, 0, 1.6, { label: '背罩' })
    const chute = v.parachute(m, -1.2, 2.1, 1.7)
    v.rope(m, [chute.attach, shell.apex])
    v.box(m, -1.2, -0.75, 1.1, 0.7, { label: '探测器' })
    v.backshell(m, 2.0, 0.6, 1.0, { h: 0.5 })
  },
})
</Figure>

## 四、安全气囊

织物气囊装在深色底板上；`press` 让顶面被头锤压下去，两侧略鼓。

<Figure title="安全气囊" height={320}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.2, xmax: 4.2, ymin: -0.4, ymax: 2.8, equal: true })
    v.ground(m, -4.2, 4.2, 0)
    const bag = v.airbag(m, -1.8, 0, 2.2, { label: '安全气囊' })
    v.ball(m, bag.top[0], bag.top[1] + 0.95, 0.3, { label: '头锤' })
    const hit = v.airbag(m, 2.0, 0, 2.2, { press: 0.35 })
    v.ball(m, hit.top[0], hit.top[1] + 0.3, 0.3)
  },
})
</Figure>

## 五、空调

室内机挂墙，出风口和导风板在下面；室外机站在地上，风扇格栅、侧面百叶、黄铜阀门。

<Figure title="空调室内机和室外机" height={340}>
figure({
  draw(ctx, p, v) {
    const m = v.view({ xmin: -4.6, xmax: 4.6, ymin: -0.4, ymax: 3.2, equal: true })
    v.ground(m, 0.4, 4.6, 0)
    v.wall(m, 0.2, 0, 3.2)
    const inner = v.aircon(m, -2.0, 2.3, { w: 2.6, label: '室内机' })
    const outer = v.aircon(m, 2.5, 0, { kind: 'outdoor', w: 2.4, fan: 20, label: '室外机' })
    const pipeX = outer.ports[1][0] + 0.25
    v.rope(m, [inner.ports[0], [inner.ports[0][0], 1.75], [pipeX, 1.75], [pipeX, outer.ports[1][1]], outer.ports[1]])
  },
})
</Figure>
