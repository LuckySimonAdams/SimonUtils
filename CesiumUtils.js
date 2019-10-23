/**
 * @constructor
 */
function CesiumUtils() {

}

CesiumUtils.EARTH_RADIUS = 6378137.0;

CesiumUtils.flyTo = function (camera, longitude, latitude, height) {
    camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        duration: 2,
    });
};

CesiumUtils.flyToOffset = function (camera, longitude, latitude) {
    camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude - 0.0015, 200),
        orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-45),
            roll: 0
        },
        duration: 1.6,
    });
};

/**
 * 使相机保持一定高度俯视
 */
CesiumUtils.flyToHeight = function (camera, height, pitchAngle) {
    let cartographic = camera.positionCartographic;
    camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height),
        orientation: {
            heading: camera.heading,
            pitch: Cesium.Math.toRadians(pitchAngle),
            roll: 0
        },
        duration: 1.2,
    });
};

/**
 * 获取地图层级
 */
CesiumUtils.getMapLevel = function (scene) {
    let tilesToRender = scene.globe._surface._tilesToRender;
    if (tilesToRender.length === 0) return undefined;
    return tilesToRender[0]._level;
};

CesiumUtils.cartesianToDegreeArr = function (cartesian) {
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let lng = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(5));
    let lat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(5));
    let height = parseFloat(cartographic.height.toFixed(2));
    return [lng, lat, height];
};

CesiumUtils.getPickPosition = function (scene, windowCoord) {
    let pick = scene.pick(windowCoord);
    if (pick) {
        return scene.pickPosition(windowCoord);
    } else {
        return scene.camera.pickEllipsoid(windowCoord);
    }
};

CesiumUtils.logPosition = function (scene, windowCoord) {
    let cartesian = CesiumUtils.getPickPosition(scene, windowCoord);
    if (!cartesian) return;
    let position = CesiumUtils.cartesianToDegreeArr(cartesian);
    console.log(position[0] + ', ' + position[1] + ', ' + position[2]);
};

CesiumUtils.setTilesetHeight = function (tileset, height) {
    let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
    let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
    let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
    let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
};

/*CesiumUtils.setTilesetMatrix = function (tileset, location) {
    let origin = Cesium.Cartesian3.fromDegrees(location[0], location[1], location[2]);
    let mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
    let rotMat3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(location[3]));
    let rotMat4 = Cesium.Matrix4.fromRotationTranslation(rotMat3);
    // tileset._root.transform = Cesium.Matrix4.multiply(mat4, rotMat4, new Cesium.Matrix4());
    Cesium.Matrix4.multiply(mat4, rotMat4, tileset._root.transform);
};*/

/**
 * 设置3dtiles模型位置、角度、大小
 * NOTE: 可以直接传tileset._root.transform
 */
CesiumUtils.setTilesetMatrix = function (modelMatrix, position, orientation, scale) {
    let origin = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    let mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
    let rotateMat3 = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(orientation[0]),
        Cesium.Math.toRadians(orientation[1]),
        Cesium.Math.toRadians(orientation[2])
    ));
    let rotMat4 = Cesium.Matrix4.fromRotationTranslation(rotateMat3);
    Cesium.Matrix4.multiply(mat4, rotMat4, modelMatrix);
    let scaleMat4 = Cesium.Matrix4.fromUniformScale(scale || 1);
    Cesium.Matrix4.multiply(modelMatrix, scaleMat4, modelMatrix);
};

/**
 * 设置gltf模型位置、角度、大小
 * NOTE: 不能传model.modelMatrix
 */
CesiumUtils.setGltfModelMatrix = function (model, location, orientation, scale) {
    // 方法一：
    /*let origin = Cesium.Cartesian3.fromDegrees(location[0], location[1], location[2]);
    let mat4 = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
    let rotateMat3 = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(orientation[0]),
        Cesium.Math.toRadians(orientation[1]),
        Cesium.Math.toRadians(orientation[2])
    ));
    Cesium.Matrix4.multiplyByMatrix3(mat4, rotateMat3, model.modelMatrix);
    let scaleMat4 = Cesium.Matrix4.fromUniformScale(scale || 1);
    Cesium.Matrix4.multiply(model.modelMatrix, scaleMat4, model.modelMatrix);*/

    // 方法二：
    let origin = Cesium.Cartesian3.fromDegrees(location[0], location[1], location[2]);
    let hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(orientation[0]),
        Cesium.Math.toRadians(orientation[1]),
        Cesium.Math.toRadians(orientation[2])
    );
    model.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(origin, hpr);
    let scaleMat4 = Cesium.Matrix4.fromUniformScale(scale || 1);
    Cesium.Matrix4.multiply(model.modelMatrix, scaleMat4, model.modelMatrix);
};

/*CesiumUtils.setGltfEntityOffset = function (gltf, location) {
    let center = Cesium.Cartesian3.fromDegrees(location[0], location[1], location[2]);
    gltf.position = center;
    gltf.orientation = Cesium.Transforms.headingPitchRollQuaternion(center, new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(location[3]), 0, 0));
};*/

/**
 * @param {Array<Cartesian3>} positions. 闭合的坐标点，即第一个点的坐标与最后一个点完全相同
 */
CesiumUtils.getClippingPlanes = function (positions) {
    positions.push(positions[0]);
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(positions[0]);
    let matrix = Cesium.Matrix4.inverse(modelMatrix, new Cesium.Matrix4());

    let point0 = Cesium.Matrix4.multiplyByPoint(matrix, positions[0], new Cesium.Cartesian3());
    let point1 = Cesium.Matrix4.multiplyByPoint(matrix, positions[1], new Cesium.Cartesian3());
    let point2 = Cesium.Matrix4.multiplyByPoint(matrix, positions[2], new Cesium.Cartesian3());
    let subtract01 = Cesium.Cartesian3.subtract(point0, point1, new Cesium.Cartesian3());
    let subtract12 = Cesium.Cartesian3.subtract(point1, point2, new Cesium.Cartesian3());
    let isForward = (subtract01.y * subtract12.x - subtract01.x * subtract12.y) > 0;

    let clippingPlanes = [];

    for (let i = 0, len = positions.length; i < len; i++) {
        let nextIndex = (i + 1) % len;
        if (nextIndex === 0) {
            break;
        }

        let cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        let lon = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let height = cartographic.height - 1000;
        let point0 = Cesium.Matrix4.multiplyByPoint(matrix, Cesium.Cartesian3.fromDegrees(lon, lat, height), new Cesium.Cartesian3());
        let point1 = Cesium.Matrix4.multiplyByPoint(matrix, positions[i], new Cesium.Cartesian3());
        let point2 = Cesium.Matrix4.multiplyByPoint(matrix, positions[nextIndex], new Cesium.Cartesian3());

        let up = Cesium.Cartesian3.subtract(point1, point0, new Cesium.Cartesian3());
        up = Cesium.Cartesian3.normalize(up, up);

        let right = Cesium.Cartesian3.subtract(point2, point1, new Cesium.Cartesian3());
        right = Cesium.Cartesian3.normalize(right, right);

        let normal = Cesium.Cartesian3.cross(up, right, new Cesium.Cartesian3());
        if (!isForward) {
            Cesium.Cartesian3.negate(normal, normal);
        }
        normal = Cesium.Cartesian3.normalize(normal, normal);

        let tangentPlane = Cesium.Plane.fromPointNormal(point1, normal);
        clippingPlanes.push(tangentPlane);
    }

    return new Cesium.ClippingPlaneCollection({
        planes: clippingPlanes,
        modelMatrix: modelMatrix,
        edgeWidth: 1.0,
        enabled: true,
        edgeColor: Cesium.Color.WHITE
    });
};

/**
 * 根据中心点和距离计算四个顶点
 * @param {Cartesian3} point
 * @param {Number} distance
 * @result {Array}
 */
CesiumUtils.getBoundingPoints = function (point, distance) {
    let cartographic = Cesium.Cartographic.fromCartesian(point);
    let lng = cartographic.longitude;
    let lat = cartographic.latitude;

    let offsetLng = 2 * Math.asin(Math.sin(distance / (2 * CesiumUtils.EARTH_RADIUS)) / Math.cos(lng));
    // offsetLng = Cesium.Math.toDegrees(offsetLng);

    let offsetLat = distance / CesiumUtils.EARTH_RADIUS;
    // offsetLat = Cesium.Math.toDegrees(offsetLat);

    return [
        Cesium.Cartesian3.fromRadians(lng - offsetLng, lat + offsetLat),    // leftTop
        Cesium.Cartesian3.fromRadians(lng + offsetLng, lat + offsetLat),    // rightTop
        Cesium.Cartesian3.fromRadians(lng + offsetLng, lat - offsetLat),    // rightBottom,
        Cesium.Cartesian3.fromRadians(lng - offsetLng, lat - offsetLat),    // leftBottom
    ];
};

export {CesiumUtils}