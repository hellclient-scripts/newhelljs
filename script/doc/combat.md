# 高级战斗设置

高级战斗设置，实际上是

* 将战斗分类三个阶段,#before #start 和普通指令。#before和#start会在战斗开始前后分别执行一次，普通指令会每秒发送一次
* 有$1 $wpon和$wpoff 三个变量，分别对应kill对象，装备主武器指令和下主武器指令。$wpon和$wpoff主要用于$start 阶段
* 每个指令可以在指令前加入判断条件，以>结束，可以用逗号,分割多个条件，多个条件要都符合才使用这个指令。
* 对于需要对应大量条件的场合，加入#block 指令，#block后的算一个完整的指令组和，通过条件#apply指令，统一切换，适用各个副本场合(具体看参考)

## 范例

### shot id

```
#before yun regenerate;hand bow;$wpon
#start shot $1 with arrow
yun recover
shot $1 with arrow
```

解释：kill前吸气，拿弓，装备武器

下kill后尝试立刻射一剑

每秒射1剑

### 普通任务id

```
#before $wpon
#start perform sword.kuang twice
yun recover
perform sword.kuang twice
```

解释:kill前吸气，装备武器

下kill后立刻发一个狂风

每秒吸气发狂风

### 复杂副本设置
```
#before yun recover;yun regenerate;#wpon
#start perform finger.chao and strike.qimen
yun recover
perform finger.chao and strike.qimen

#block mq
ctype mq>#apply
#before yun recover;yun regenerate;#wpon
#start perform finger.ding twice
#start perform finger.chao and strike.qimen
yun recover
perform finger.ding twice
perform finger.chao and strike.qimen

#block 巫妖
ctype xuemo,ctag sklich>#apply
#before yun recover;yun regenerate;#wpon
#start perform finger.ding skeleton lich twice
yun recover
#start perform finger.ding skeleton lich twice
perform finger.ding skeleton lich twice
perform finger.chao and finger.ding skeleton lich
perform finger.chao and strike.qimen

#block 丁一
ctype xuemo,ctag boss>#apply
#before yun recover;yun regenerate;#wpon;
#start perform finger.ding ding yi twice
yun recover
perform finger.chao and finger.ding ding yi
perform finger.chao and strike.qimen

#block qinling
ctype qinling>#apply
#start perform finger.ding qin shihuang twice;perform finger.chao and finger.ding qin shihuang
```

解释：

普通战斗，一个chao+qimen解决

战斗类别为mq(也就是师门任务)，使用mq block
具体就是先buy一下，然后chao+qimen,相对安全点

战斗类型为xuemo,战斗标签为sklick的，使用 巫妖 block
优先busy,优先攻击skeleton lich

战斗类型为xuemo,战斗标签为boss的，使用 丁一 block
优先攻击丁一

战斗类型为qinling的
busy+输出秦始皇
然后只有攻击的一次pfm