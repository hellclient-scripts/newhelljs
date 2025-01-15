//判断NPC是否在指定城市
(function () {
    let incity = (coor, cy, Cities) => {
        if (Trim(coor) == "")
            return false;

        if (cy == "很远") {
            for (var key in Cities) {
                if (incity(coor, key, Cities)) {
                    return true;
                }
            }
            return false
        }


        if (cy == "长安" && ((coor >= 244 && coor <= 381) || coor == 20 || coor == 709 || coor == 909
            || coor == 1010 || coor == 1139))
            return true;

        if (cy == "成都" && ((coor >= 659 && coor <= 708) || coor == 1610 || coor == 1611))
            return true;

        if (cy == "大理" && ((coor >= 423 && coor <= 647) || coor == 1608))
            return true;

        if (cy == "佛山" && ((coor >= 388 && coor <= 422) || coor == 1467 || coor == 1468))
            return true;

        if (cy == "福州" && ((coor >= 198 && coor <= 243) || coor == 1464))
            return true;

        if (cy == "关外" && (coor >= 1211 && coor <= 1248))

            return true;

        if (cy == "杭州" && ((coor >= 190 && coor <= 194) || (coor >= 785 && coor <= 891) || coor == 911
            || coor == 986 || coor == 1573 || coor == 1672 || coor == 1673))
            return true;

        if (cy == "华山" && ((coor >= 248 && coor <= 251) || (coor >= 987 && coor <= 1005)
            || (coor >= 1025 && coor <= 1065) || coor == 1712))
            return true;

        if (cy == "灵州" && ((coor >= 1175 && coor <= 1207) || coor == 1659 || coor == 1660))
            return true;

        if (cy == "南海" && ((coor >= 390 && coor <= 421) || coor == 1468))
            return true;

        if (cy == "泉州" && ((coor >= 207 && coor <= 216) || (coor >= 411 && coor <= 413)))
            return true;

        if (cy == "汝州" && ((coor >= 1068 && coor <= 1127) || (coor >= 2499 && coor <= 2503)))
            return true;

        if (cy == "嵩山" && (coor >= 1068 && coor <= 1138) || (coor >= 2499 && coor <= 2503))
            return true;

        if (cy == "苏州" && ((coor >= 190 && coor <= 194) || (coor >= 785 && coor <= 787)
            || (coor >= 911 && coor <= 986) || coor == 68 || coor == 69 || coor == 1564
            || coor == 1573 || coor == 1574 || coor == 1577 || coor == 1681))
            return true;

        if (cy == "天山" && ((coor >= 1157 && coor <= 1167) || coor == 1150))
            return true;

        if (cy == "武功" && ((coor >= 276 && coor <= 279) || (coor >= 709 && coor <= 728)
            || (coor >= 892 && coor <= 909)))
            return true;

        if (cy == "西域" && ((coor >= 700 && coor <= 707) || (coor >= 1139 && coor <= 1172)
            || (coor >= 1632 && coor <= 1654) || (coor >= 1753 && coor <= 1786)
            || (coor >= 1808 && coor <= 1811) || coor == 301 || coor == 666 || coor == 1797 || coor == 2764))
            return true;

        if (cy == "襄阳" && ((coor >= 77 && coor <= 189) || coor == 19 || coor == 20 || coor == 244
            || coor == 1566 || coor == 1567))
            return true;

        if (cy == "星宿" && (coor >= 1140 && coor <= 1172))
            return true;

        if (cy == "扬州" && ((coor >= 0 && coor <= 78) || (coor >= 190 && coor <= 193)
            || (coor >= 244 && coor <= 247) || (coor >= 1025 && coor <= 1039)
            || (coor >= 1454 && coor <= 1459) || (coor >= 1558 && coor <= 1565)
            || (coor >= 1681 && coor <= 1686) || (coor >= 1733 && coor <= 1739)
            || (coor >= 2490 && coor <= 2496) || coor == 147 || coor == 382 || coor == 785
            || coor == 786 || coor == 1143 || coor == 1713))
            return true;

        if (cy == "终南" && ((coor >= 276 && coor <= 279) || (coor >= 709 && coor <= 784)
            || (coor >= 892 && coor <= 909)))
            return true;

        return false;
    }
    return incity
})()