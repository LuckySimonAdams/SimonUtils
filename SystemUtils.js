/**
 * 系统或浏览器相关方法
 * @constructor
 */
function SystemUtils() {

}

SystemUtils.getRequest = function () {
    let url = location.search;
    let result = {};

    if (url.indexOf('?') !== -1) {
        let str = url.substr(1);
        let strs = str.split('&');
        for (let i = 0; i < strs.length; ++i) {
            let params = strs[i].split('=');
            result[params[0]] = decodeURI(params[1]);
        }
    }

    return result;
};

SystemUtils.getRequestByName = function (name, defaultVal) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURI(r[2]);
    }
    return defaultVal;
};

/**
 * 获取浏览器类型及版本
 */
SystemUtils.getExplorerInfo = function () {
    let explorer = window.navigator.userAgent.toLowerCase();
    let version;

    if (explorer.indexOf("msie") >= 0) {
        //ie
        version = Number(explorer.match(/msie ([\d]+)/)[1]);
        return {type: "IE", version: version};
    } else if (explorer.indexOf("firefox") >= 0) {
        //firefox
        version = Number(explorer.match(/firefox\/([\d]+)/)[1]);
        return {type: "Firefox", version: version};
    } else if (explorer.indexOf("chrome") >= 0) {
        //Chrome
        version = Number(explorer.match(/chrome\/([\d]+)/)[1]);
        return {type: "Chrome", version: version};
    } else if (explorer.indexOf("opera") >= 0) {
        //Opera
        version = Number(explorer.match(/opera.([\d]+)/)[1]);
        return {type: "Opera", version: version};
    } else if (explorer.indexOf("Safari") >= 0) {
        //Safari
        version = Number(explorer.match(/version\/([\d]+)/)[1]);
        return {type: "Safari", version: version};
    }

    return {type: explorer, version: -1};
};

/**
 * 判断是否为PC浏览器
 */
SystemUtils.isPCBroswer = function () {
    let sUserAgent = navigator.userAgent.toLowerCase();

    let bIsIpad = sUserAgent.match(/ipad/i) === "ipad";
    let bIsIphoneOs = sUserAgent.match(/iphone/i) === "iphone";
    let bIsMidp = sUserAgent.match(/midp/i) === "midp";
    let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) === "rv:1.2.3.4";
    let bIsUc = sUserAgent.match(/ucweb/i) === "ucweb";
    let bIsAndroid = sUserAgent.match(/android/i) === "android";
    let bIsCE = sUserAgent.match(/windows ce/i) === "windows ce";
    let bIsWM = sUserAgent.match(/windows mobile/i) === "windows mobile";
    return !(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
};