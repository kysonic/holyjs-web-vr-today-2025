import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

export function createCamera() {
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;

    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

export function createLight() {
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);

    return light;
}

export function createCube(
    geometryOptions = { width: 1, height: 1, depth: 1 },
    materialOptions = { color: 0x44aa88 },
) {
    const geometry = new THREE.BoxGeometry(...Object.values(geometryOptions));
    const material = new THREE.MeshStandardMaterial(materialOptions);

    const cube = new THREE.Mesh(geometry, material);

    return cube;
}

export function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

export function setEnvMaps({ renderer, url }, cb) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    THREE.DefaultLoadingManager.onLoad = function () {
        pmremGenerator.dispose();
    };

    new EXRLoader().load(url, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        cb?.(texture);
    });
}
