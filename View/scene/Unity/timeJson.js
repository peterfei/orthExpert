export function getAcuWithData(timeData) {
    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();
    let seconds = time.getSeconds();
    // console.log(`hour=${hour}min=${min}seconds=${seconds}`);
    let acuName = '足厥阴肝经';

    let result = {
        isUpdateState: false,
        app_id: '',
        title: '',
    };
    timeData.some(item => {
        let startHour = parseInt(item.hours.slice(0, 2));
        let endHour = startHour + 2;
        endHour = endHour > 24 ? endHour-24 : endHour;
        if (hour >= startHour && hour < endHour) {
            result.app_id = item.app_id;
            result.title = item.title;
            return true;
        }
    })

    let canUpdateState = false;// 默认不更新, 遇到整点的时候再更新, 避免大量setState
    if (min == 0 && seconds == 0) {
        canUpdateState = true;
    }
    result.isUpdateState = canUpdateState;

    return result;
}

