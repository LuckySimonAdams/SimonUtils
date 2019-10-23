const tdtKey = '5f5ced578c88ac399b0691415c56a9d7';

let ImageryProviderUtils = {
    // 天地图影像地图
    tdtImagery: new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t1.tianditu.com/img_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=img&style=default&tilerow={TileRow}&tilecol={TileCol}&tilematrixset=c&format=tiles&tk=' + tdtKey,
        layer: 'img',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        maximumLevel: 17,
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']
    }),

    // 天地图矢量地图
    tdtVector: new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.com/vec_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=vec&style=default&tilerow={TileRow}&tilecol={TileCol}&tilematrixset=c&format=tiles&tk=' + tdtKey,
        layer: 'vec',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'c',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
        tilingScheme: new Cesium.GeographicTilingScheme(),
        maximumLevel: 17,
    }),

    // 天地图注记服务
    tdtMark: new Cesium.WebMapTileServiceImageryProvider({
        // url: 'http://t0.tianditu.com/cia_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=cia&style=default&tilerow={TileRow}&tilecol={TileCol}&tilematrixset=c&format=tiles&tk=' + tdtKey,   // 矢量注记(球面墨卡托投影)
        // url: 'http://t0.tianditu.com/cia_c/wmts?tk=' + tdtKey,
        url: 'http://t0.tianditu.com/cva_c/wmts?tk=' + tdtKey,
        // layer: 'cia',
        layer: 'cva',
        style: 'default',
        format: 'tiles',
        // tileMatrixSetID: 'w',
        tileMatrixSetID: 'c',
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
        tilingScheme: new Cesium.GeographicTilingScheme(),
        maximumLevel: 17
    }),

    // 高德影像地图
    gdImagery: new Cesium.UrlTemplateImageryProvider({
        url: "http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",   // 影像地图(国测局偏移坐标)
        subdomains: ["1", "2", "3", "4"],
        maximumLevel: 18,
    }),

    // 高德矢量地图
    gdVector: new Cesium.UrlTemplateImageryProvider({
        // url: "http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8", // 注记服务
        url: "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}", // 矢量地图(小字体)
        // url: "http://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}", // 矢量地图(大字体)
        subdomains: ["1", "2", "3", "4"],
        maximumLevel: 18,
    }),
};

