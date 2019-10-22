/**
 * @constructor
 */
function FileUtils() {

}

/**
 * 获取url的后缀名
 */
FileUtils.getSuffixName = function (url) {
    return url.substring(url.lastIndexOf('.') + 1);
};

/**
 * 获取文件名
 */
FileUtils.getFileName = function (str) {
    return str.substring(0, str.indexOf('.'));
};

/**
 * 获取指定js的加载路径
 */
FileUtils.retrieveUrl = function (filename) {
    let scripts = document.getElementsByTagName('script');
    if (!scripts || scripts.length === 0) return;

    for (let i = 0; i < scripts.length; i++) {
        let script = scripts[i];
        if (script.src && script.src.match(new RegExp(filename + '\\.js$'))) {
            return script.src.replace(new RegExp('(.*)' + filename + '\\.js$'), '$1');
        }
    }
};

///////////////////////////////////////////////////////////

function download(fileName, blob) {
    let a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function base64ImgToBlob(code) {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

FileUtils.downloadFile = function (fileName, string) {
    let blob = new Blob([string]);
    download(fileName, blob);
};

FileUtils.downloadImage = function (name, canvas) {
    let base64 = canvas.toDataURL('image/png'); // 默认格式为png
    let blob = base64ImgToBlob(base64);
    download(name + '.png', blob);
};

