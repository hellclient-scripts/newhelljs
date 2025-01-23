//天机十算任务模块
$.Module(function (App) {
    let TJSS = {}
    TJSS.Finished = false

    let matcher = /^某数，除(\d+)余(\d+)，除(\d+)余(\d+)，除(\d+)余(\d+)，除(\d+)余(\d+)$/
    //计算的计划
    let PlanThink = new App.Plan(
        App.Positions["Response"],
        (task) => {
            task.AddTrigger(matcher, function (tri, result) {
                let nums = {
                    0: { num: result[1] - 0, left: result[2] - 0 },
                    1: { num: result[3] - 0, left: result[4] - 0 },
                    2: { num: result[5] - 0, left: result[6] - 0 },
                    3: { num: result[7] - 0, left: result[8] - 0 },
                }
                let results = []
                let current = nums[3].num + nums[3].left
                while (current < 10000) {//暴力尝试
                    if (current % nums[0].num == nums[0].left && current % nums[1].num == nums[1].left && current % nums[0].num == nums[0].left && current % nums[2].num == nums[2].left) {
                        results.push(current)
                    }
                    current = current + nums[3].num
                }
                task.Data = results
                return true
            })
            App.Send("think bei")
            App.Sync()
        },
        (result) => {
            if (result.Task.Data != null) {
                result.Task.Data.forEach(answer => {
                    App.Send(`answer ${answer}`)
                });
            } else {
                Note("解密失败")
            }
            TJSS.Finished = true
        }
    )

    TJSS.Start = () => {
        $.PushCommands(
            $.To("2796"),
            $.Plan(PlanThink),
        )
        $.Next()
    }
    let Quest = App.Quests.NewQuest("tjss")
    Quest.GetReady = function (q, data) {
        if (!TJSS.Finished) {
            return () => { Quest.Start(data) }
        }
        return null
    }

    Quest.Name = "解天机十算，加臂力"
    Quest.Desc = "解天机十算，加臂力,需要先过天机阵"
    Quest.Intro = ""
    Quest.Help = ""
    Quest.Start = function (data) {
        TJSS.Start()
    }
    App.Quests.Register(Quest)
    App.Quests.TJSS = TJSS
})
