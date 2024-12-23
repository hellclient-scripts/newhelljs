# 场景一览

场景指机器在运行时回触发一定的场景，如果在command变量了做了对应设置，就会发送对应的指令

## 通用场景

### #wait场景

#wait场景 是在需要等待一定时间时触发的，比如ask npc失败的间隔，学习的间隔，等信，等船,等npc反馈等

一般预期是会进行汲取操作，比如

```
#wait jiqu
```

### #prepare场景

#prepare一般是在进行战斗前的准备时触发。比如mq的搜索遍历前，爬塔的进入下一层塔前等，保护的NPC出现前。

特点是不在战斗状态，但马上要战斗，适合使用在战斗时有busy的buff技能。

```
#prepare yun powerup;yun shield;yong cuff.leidong
```

### #stance- #stanceleave-

这两个场景时在切换不同的姿态时触发的。不同的任务会有不同的姿态\(组别\)，连续做同一组的任务不会触发，只有当进入一个新的组别可能要进行一些操作，这就是这两个场景触发的机制。

先有的姿态包括

* mq 师门任务
* qinling 秦岭副本
* lgt 爬塔
* baohu 保护

## 师门任务场景

### #mqbefore

接任务前的场景。一般用来ask修养或者研究学习

```
#mqbefore ask feng about 剑道修养
#mqbefore #yanjiulian
```

### #npcfaint

npc昏过去时的场景，一般用来磨武器

```
#npcfaint #wpoff;#wpon 2
```

### #npcdie

npc死亡时的触发，一般用来下磨的武器和研究练习

```
#npcdie #wpoff 2
#npcdie #yanjiulianxi
```

### #mqpause

在做很远的找npc时，每次遍历前都会停一秒汲取，这是会触发mqpause,可以用来研究练习

```
#mqpause #yanjiulian
```

## 保护任务

### #baohubefore

在NPC出现前几秒触发，这时如果能打坐或者汲取的话，能防止被npc busy

```
#baohubefore jiqu;tuna 200
```