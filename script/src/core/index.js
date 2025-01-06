// 模块主核心加载程序
(function (app) {
    // 定义App.Stop方法
    App.Stop = function () {
        Note("停止继续任务")
        App.RaiseEvent(new App.Event("core.stop"))
    }
    App.Core = {}
    App.Positions = {}
    App.Include("src/core/utils.js")
    App.Include("src/core/fatal.js")
    App.Include("src/core/log.js")
    App.Include("src/core/init.js")
    App.Include("src/core/committee.js")
    App.Include("src/core/commands.js")
    App.Include("src/core/userqueue.js")
    App.Include("src/core/sender.js")
    App.Include("src/core/checker.js")
    App.Include("src/core/connect.js")
    App.Include("src/core/emergency.js")
    App.Include("src/core/player.js")
    App.Include("src/core/room.js")
    App.Include("src/core/move.js")
    App.Include("src/core/item.js")
    App.Include("src/core/mapper.js")
    App.Include("src/core/rideto.js")
    App.Include("src/core/maze.js")
    App.Include("src/core/response.js")
    App.Include("src/core/alias.js")
    App.Include("src/core/prepare.js")
    App.Include("src/core/weapon.js")
    App.Include("src/core/ask.js")
    App.Include("src/core/zone.js")
    App.Include("src/core/quests.js")
    App.Include("src/core/combat.js")
    App.Include("src/core/assets.js")
    App.Include("src/core/goods.js")
    App.Include("src/core/heal.js")
    App.Include("src/core/dispel.js")
    App.Include("src/core/blocker.js")
    App.Include("src/core/variable.js")
    App.Include("src/core/helpfind.js")
    App.Include("src/core/npc.js")
    App.Include("src/core/study.js")
    App.Include("src/core/stage.js")
    App.Include("src/core/medicine.js")
    App.Include("src/core/fuben.js")
    App.Include("src/core/params.js")//需要最后引入最后覆盖设置

})(App)