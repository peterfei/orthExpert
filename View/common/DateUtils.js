let DateUtil = {
    // 获得当前日期,格式:yyyy-MM-dd
    getNow: function() {
        let date = new Date();
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1); // 获取当前月份的日期
        let d = addZero(date.getDate());
        return y + "-" + m + "-" + d;
    },
    // 获得当前日期前X天的日期,格式:yyyy-MM-dd
    getBeforeDate: function(dayCount) {
        let date = new Date();
        date.setDate(date.getDate() - dayCount); //获取dayCount天前的日期
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1);
        let d = addZero(date.getDate());
        return y + "-" + m + "-" + d;
    },
    // 获得当前日期后X天的日期,格式:yyyy-MM-dd
    getAfterDate: function(dayCount) {
        let date = new Date();
        date.setDate(date.getDate() + dayCount); //获取dayCount天后的日期
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1);
        let d = (date.getDate());
        return y + "-" + m + "-" + d;
    },
    // 获得当前月,格式:yyyy-MM
    getNowMonth: function() {
        let date = new Date();
        let y = date.getFullYear();
        let m = addZero(date.getMonth() + 1); // 获取当前月份的日期
        return y + "-" + m;
    },
    // 获得当前月前X月的年月,格式:yyyy-MM
    getBeforeMonth: function(monthCount) {
        let date = new Date();
        date.setMonth(date.getMonth() + 1 - monthCount); //获取dayCount天前的月
        let y = date.getFullYear();
        let m = addZero(date.getMonth());
        return y + "-" + m;
    },
    // 获得当前月后X月的年月,格式:yyyy-MM
    getAfterMonth: function(monthCount) {
        let date = new Date();
        date.setMonth(date.getMonth() + 1 - monthCount); //获取dayCount天后的日期
        let y = date.getFullYear();
        let m = addZero(date.getMonth());
        return y + "-" + m;
    },
    // 根据天数，算出对应的月数或者年数
    getMonthOrYearByDays: function (dayCount) {
        const month = 30
        const year = 365
        if (dayCount % year === 0) {
            return (dayCount / year) >= 99 ? '终身' : (dayCount / year) + '年'
        } else {
            if ((dayCount / year) > 1) {
                if ((dayCount % year) % month === 0) {
                    return parseInt(dayCount / year) + '年' + (dayCount % year) / month + '个月'
                } else {
                    return parseInt(dayCount / year) + '年' + parseInt((dayCount % year) / month) + '个月' + (dayCount % year) % month + '天'
                }
            } else {
                if (dayCount % month === 0) {
                    return dayCount  / month + '个月'
                } else {
                    return parseInt(dayCount % month) + '个月' + dayCount % month + '天'
                }
            }
        }
    }
};
function addZero(number) {
    if (number < 10) {
        number = '0' + number;
    }
    return number;
}

export default DateUtil