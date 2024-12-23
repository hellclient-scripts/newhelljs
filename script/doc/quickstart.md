# NEWHELLJS 快速上手
## 开始使用

机器最基础的设置是ID和PASSW变量，也就是账号和密码的设置。设置完账号和密码后，就可以通过#login指令快速登陆，也能在机器需要时进行重连。

## 战斗设置

战斗设置主要分为两个部分，武器\(weapon\)设置和战斗(combat)设置

### 武器设置

weapon变量中设置武器和修理

武器通过
```
#wield sworda
#wear strikeb
```
方式设置
第一位的武器时最重要的，遇到很多情况后会通过#wpon和#unwield直接在机器里调用。
第二位开始的武器可以通过#wpon 2和#unwield 2等设置
也可以通过
```
#wield.mysword sworda
```
的格式，定义别名，用#wpon mysword的形式使用。具体可以查看加载变量时的提示

也可以通过#unwield指令解除所有的装备

修理则通过
```
#repair long sword
#repair strikea * 30
```
的格式设置。

变量中 星号后的数字代表修理费用，单位为黄金，修理钱会去取足够的钱

### 战斗设置

combat指令是战斗设置，有很复杂的一套系统。目前由于还未制作副本模块，战斗形式比较单一

比如一个典型的华山剑宗设置

```
#before $wpon
#start perform sword.kuang twice
yun recover
perform sword.kuang twice
```

从上向下，一行一个指令。

指令由#开始，有#before,#start,#send(或不加默认)三种形式
#before是下kill钱使用的。
#start是紧接着kill使用的，会尽量与kill在一个心跳发出
#send就是战斗中每秒发送的指令

一个典型的shot id设置是这样的
```
#before yun regenerate;hand bow;$wpon
#start shot $1 with arrow
yun recover
shot $1 with arrow
```

其中$1指战斗目标,$wpon和$unwield指主武器的装备和接触指令(直接使用#wpon和#unwield由于机制会使得同一心跳发送失效)

目前暂时是这样。

这个战斗系统还有策略和条件模块没有使用，会随后开发实装，使用不同场景的战斗。

高级战斗[参考](./combat.md)

## 道具设置

item变量是道具设置，一般除非shot id或者剑宗id不需要设置

典型的剑宗shot id设置为
```
fire
long sword
long bow
arrow * 30
```
一行一个/data/items.txt文件里注册过的道具。

星号后面代表最少持有数量

## 指令设置
command变量是指令设置

机器是全功能机器，所以不可能每个指令一个变量，需要在一个变量做统一设置。

游戏中会在能发送指令的地方文字提示，如
```
触发场景:#mqbefore
```

一般来说，最常用的设置是战斗准备，比如
```
#prepare special power;yun ziqi;#unwield;yong cuff.leidong
```

## 学习设置
study是学习设置变量
学习是一行一个技能，如
```
sword||yanjiu
zixia-shengong||yanjiu
force||yanjiu
dodge||yanjiu
parry||yanjiu
cuff||yanjiu
!zuoyou-hubo|360|xue|zhou botong|779
#teacher gao laozhe@2183
#lowest
```
或
```
literate||xue|yideng dashi|534||
yunv-xinfa|125|xue
force|125|xue
strike|125|xue
dodge|125|xue
parry|125|xue
literate|125|xue
sword|125|xue
yunv-shenfa|125|xue
yunv-jian|125|xue|||#wp1on
quanzhen-jian|125|xue|||#wp1on
yunv-xinjing |200|xue
zuoyou-hubo|250|xue
#teacher long nv@1956
#lowest
```
\#teacher 是设置默认老师，可以通过助理按钮设置，这样只要指定 技能id|技能限制|学习类型就可以了
\#lowest指优先学习等级最低的，还可以设置\#ordered按顺序或者\#randow 随机。默认是\#lowest

带!开头的是优先学习

在min_pot和max_pot符合条件时，会自动去学习

## 练习指令
练习指令和学习指令的格式一样，如
```
diyang-chufan|80|lian|strike||#unwield|
feilong-zaitian|80|lian|strike||#unwield|
hongjian-yulu|80|lian|strike||#unwield|
huoyue-zaiyuan|80|lian|strike||#unwield|
jianlong-zaitian|80|lian|strike||#unwield|
kanglong-youhui|80|lian|strike||#unwield|
lishe-dachuan|80|lian|strike||#unwield|
longzhan-yuye|80|lian|strike||#unwield|
lvshuang-bingzhi|80|lian|strike||#unwield|
miyun-buyu|80|lian|strike||#unwield|
qianlong-wuyong|80|lian|strike||#unwield|
shenlong-baiwei|80|lian|strike||#unwield|
shicheng-liulong|80|lian|strike||#unwield|
shuanglong-qushui|80|lian|strike||#unwield|
sunze-youfu|80|lian|strike||#unwield|
turu-qilai|80|lian|strike||#unwield|
yuyue-yuyuan|80|lian|strike||#unwield|
zhenjing-baili|80|lian|strike||#unwield|
```
需要在设置了jifa变量后，通过lianskill任务来练习

## 任务设置

任务设置是设置 quest变量，然后使用#start指令，就会自动执行了。
#start指令也可以直接跟药执行的任务队列，此时用||代替换行

任务的执行顺序时一行一个任务，同时可以用>>表示条件
如
新人一条龙2就是
```
maxexp 2000>>tiejiang
maxexp 10000>>peiyao
!yueli 20>>beiqi
maxexp 29999>>letter
!yueli 2000>>beiqi
fish
```
具体的条件和任务还在开发中，以后会有详细的说明。

现有的可以参考脚本别名里的现有变名做参考

## 自动运行

设置autorun会自动运行

当断线或者打开游戏时，会尝试连线登陆并发送改指令。

比如炼丹大米可以设置为
```
#liandan
```

## 指令队列

脚本别名中queue的别名可以启动一写特殊指令的队列

比如
```
#prepare||#to 1927||yun regererate||#wpon||yong jue||yong jue||yong jue||yong jue||yong jue||#loop
```
能做简单的yong jue队列。

有兴趣可以研究下，以后再完善相关文档