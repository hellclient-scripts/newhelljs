# 自创武功

自创武功主要是依靠try任务来实现的，具体来说，任务设置大概是这样
```
pot 150000>>try 2682 #wpoff;#touch;invent unarmed
lgt
qinling
mq
```
或者
```
pot 180000>>try 2682 #wpoff;#touch;create gundum-unarmed
lgt
qinling
mq
```

就是在2672\(储存箱处\),touch保证内力，使用正确的武器，然后开始创建。

一般会搭配min_pot使用

try是一个类似execute的指令，区别是在创建武功和绝招成功后，会触发一个trySuccess场景，可以用来填写武功信息。

在创建武功时，提示和输入大概是

```
对不起，请用：<英文名> <中文名> 的格式输入。
您可以为这个武功添加一段描述！
请给XXX招式起个名字(例如:
注意问题: $N 代表你 $n 代表敌人 $l 代表攻击部位 $w 代表你的武器 
你确定吗？(Y/N)
```

那对应的Command部分大体是
```
#trySuccess gundum 高达军体
#trySuccess .
#trySuccess 火神机关枪
#trySuccess $N眼睛一亮，火神机关枪向着$n一阵扫射。
#trySuccess y
#tryFinish #wpoff
```

* 第一行是 武功的英文名，中文名
* 第二行是武功描述，输入.跳过
* 第三行是第一个招数的中文名
* 第四行是发招的描述
* 第五行确认
* tryFinish是创建武功结束后的指令，一般是切换武器


在创建招式时，提示和输入大概是

```
对不起，您只能选择1-4，按下回车直接选择
对不起，请用：<英文名> <中文名> 的格式输入。
注意问题: $N 代表你 $n 代表敌人 $w 代表你的武器
请输入发招时描述：
输入绝招打中时描述
请输入绝招失误时描述
你确定吗？(Y/N)
```

输入的对应Command部分大体是
```
#trySuccess 1
#trySuccess funnel 浮游炮
#trySuccess $N背后飞出几个浮游炮，向$n发起了攻击。
#trySuccess .
#trySuccess $n发现无处可躲，被$N的浮游炮打个正着。
#trySuccess .
#trySuccess $n发动立场，把$N浮游炮的攻击全部挡下。
#trySuccess .
#trySuccess y
#tryFinish #wpoff
```

* 第一行是选择招式类型,1是连招，2是单招，3是混合招。4是busy
* 第二行是perform的英文id中文名
* 第三行是发动攻击的描述
* 第四行是.,结束描述
* 第五行是命中的 描述
* 第六行是.,结束命中描述
* 第七行是未命中的 描述
* 第八行是.结束未命中描述
* 第九行是y，确认
* tryFinish是结束后切换正确的武器

创建成功关注日志栏，会有相关信息记录。
```
对不起，请用：<英文名> <中文名> 的格式输入
对不起，您只能选择1-4，按下回车直接
```