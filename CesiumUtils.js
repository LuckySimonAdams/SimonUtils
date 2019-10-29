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
 * 计算两点之间的距离。与Cesium.Cartesian3.distance()计算结果偏差较大
 * @param {Cartesian3} point1
 * @param {Cartesian3} point2
 */
CesiumUtils.getDistance = function (point1, point2) {
    let cartographic1 = Cesium.Cartographic.fromCartesian(point1);
    let cartographic2 = Cesium.Cartographic.fromCartesian(point2);
    let offsetLng = cartographic1.longitude - cartographic2.longitude;
    let offsetLat = cartographic1.latitude - cartographic2.latitude;

    let result = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(offsetLng / 2), 2) +
        Math.cos(cartographic1.latitude) * Math.cos(cartographic2.latitude) * Math.pow(Math.sin(offsetLat / 2), 2)
    ));
    result *= GeoMath.EARTH_RADIUS;
    return result;
};

/**
 * google算法计算距离。比较接近Cesium.Cartesian3.distance()
 * @param {Cartesian3} point1
 * @param {Cartesian3} point2
 */
CesiumUtils.getDistance2 = function (point1, point2) {
    let cartographic1 = Cesium.Cartographic.fromCartesian(point1);
    let cartographic2 = Cesium.Cartographic.fromCartesian(point2);
    let lng1 = cartographic1.longitude;
    let lat1 = cartographic1.latitude;
    let lng2 = cartographic2.longitude;
    let lat2 = cartographic2.latitude;

    // Math.Acos(Math.Cos(radLat1) * Math.Cos(radLat2) * Math.Cos(radLng1 - radLng2) + Math.Sin(radLat1) * Math.Sin(radLat2));
    let result = Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2) + Math.sin(lat1) * Math.sin(lat2));
    result *= GeoMath.EARTH_RADIUS;
    return result;
};

/**
 * 计算多个点的包围盒
 * @param {Array<Cartesian3>} positions
 */
CesiumUtils.getBoundingBox = function (positions) {
    let cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions);
    let bbox = [Infinity, Infinity, -Infinity, -Infinity];    // minX, minY, maxX, maxY

    for (let i = 0; i < cartographics.length; i++) {
        let cartographic = cartographics[i];
        if (bbox[0] > cartographic.longitude) {
            bbox[0] = cartographic.longitude;
        }
        if (bbox[1] > cartographic.latitude) {
            bbox[1] = cartographic.latitude;
        }
        if (bbox[2] < cartographic.longitude) {
            bbox[2] = cartographic.longitude;
        }
        if (bbox[3] < cartographic.latitude) {
            bbox[3] = cartographic.latitude;
        }
    }

    return bbox;
};

/**
 * 计算多个点的中心点
 * @param {Array<Cartesian3>} positions
 */
CesiumUtils.getCenter = function (positions) {
    let result = new Cesium.Cartesian3();
    for (let i = 0, len = positions.length; i < len; ++i) {
        Cesium.Cartesian3.add(positions[i], result, result);
    }
    Cesium.Cartesian3.multiplyByScalar(result, 1 / len, result);
    return result;
};

/**
 * 计算多个点的中心点
 * @param {Array<Cartesian3>} positions
 */
CesiumUtils.getCenter2 = function (positions) {
    let x = [], y = [];

    positions.forEach(function (position) {
        let cartographic = Cesium.Cartographic.fromCartesian(position);
        x.push(cartographic.longitude);
        y.push(cartographic.latitude);
    });

    let x0 = 0, y0 = 0,
        x1 = 0, y1 = 0,
        centerX = 0, centerY = 0,
        area = 0,
        a = 0;

    for (let i = 0; i < positions.length; i++) {
        x0 = x[i];
        y0 = y[i];

        if (i === positions.length - 1) {
            x1 = x[0];
            y1 = y[0];
        } else {
            x1 = x[i + 1];
            y1 = y[i + 1];
        }

        a = x0 * y1 - x1 * y0;
        area += a;
        centerX += (x0 + x1) * a;
        centerY += (y0 + y1) * a;
    }

    area /= 2;
    centerX /= (area * 6);
    centerY /= (area * 6);

    return Cesium.Cartesian3.fromRadians(centerX, centerY);
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

/**
 * 获取裁剪面
 * @param {Array<Cartesian3>} positions.
 */
CesiumUtils.getClippingPlanes = function (positions) {
    // NOTE：闭合的坐标点，即第一个点的坐标与最后一个点完全相同
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
 * 计算当前视角的矩形范围。比camera.computeViewRectangle()计算的范围要小
 * @param {Viewer} viewer
 * @return {Rectangle|undefined}
 */
CesiumUtils.getCurrentViewRect = function (viewer) {
    let scene = viewer.scene;
    let camera = scene.camera;
    let canvas = scene.canvas;
    let topLeft=  camera.pickEllipsoid(new Cesium.Cartesian2(0, 0));
    let bottomRight = camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height));

    if (!topLeft && !bottomRight) return;

    let cartographic1, cartographic2;
    if (topLeft && bottomRight) {
        // canvas的左上角和右下角都在地球上
        cartographic1 = Cesium.Cartographic.fromCartesian(topLeft);
        cartographic2 = Cesium.Cartographic.fromCartesian(bottomRight);
    } else if (!topLeft && bottomRight) {
        // canvas的左上角不在地球上，但右下角在地球上
        let topLeft2 = undefined;
        let yIndex = 0;
        do {
            // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
            yIndex <= canvas.height ? yIndex += 10 : canvas.height;
            topLeft2 = camera.pickEllipsoid(new Cesium.Cartesian2(0, yIndex));
        } while (!topLeft2);
        cartographic1 = Cesium.Cartographic.fromCartesian(topLeft2);
        cartographic2 = Cesium.Cartographic.fromCartesian(bottomRight);
    }

    return new Cesium.Rectangle(cartographic1.longitude, cartographic2.latitude, cartographic2.longitude, cartographic1.latitude);
};

export {CesiumUtils}