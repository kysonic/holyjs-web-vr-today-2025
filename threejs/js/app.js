import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import Controllers from './controllers.js';
import {
    createCamera,
    createLight,
    createCube,
    resizeRendererToDisplaySize,
    setEnvMaps,
} from './lib.js';

let canvas, renderer;
let scene, camera;
let light;
let cubes;
let controllers;

function main() {
    canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Включаем поддержку VR
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    // Сцена
    scene = new THREE.Scene();
    // Инициализация контроллеров
    controllers = new Controllers({
        scene,
        renderer,
        options: {
            modelUrl: '../../assets/models/controllers/scene.gltf',
        },
    });
    // Камера
    camera = createCamera();
    camera.position.set(0, 1.8, 0);
    // Свет
    light = createLight();
    scene.add(light);
    // Создаем кубы
    cubes = [
        createCube(
            { width: 1, height: 1, depth: 1 },
            {
                color: 0xaaccbb,
                metalness: 1,
                roughness: 0,
                envMapIntensity: 1.0,
            },
        ),
        createCube(
            { width: 1, height: 1, depth: 1 },
            {
                color: 0xaaccbb,
                metalness: 1,
                roughness: 0,
                envMapIntensity: 1.0,
            },
        ),
        createCube(
            { width: 1, height: 1, depth: 1 },
            {
                color: 0xaaccbb,
                metalness: 1,
                roughness: 0,
                envMapIntensity: 1.0,
            },
        ),
    ];

    // Позиционируем кубы
    cubes.forEach((cube, index) => {
        cube.position.x = index * 2 - 2;
        cube.position.y = 1.8;
        cube.position.z = -2;
        scene.add(cube);
    });
    // Skybox и отражение в кубиках
    setEnvMaps(
        {
            renderer,
            url: '../../assets/backgrounds/studio/studio.exr',
        },
        (texture) => {
            cubes.forEach((cube, index) => {
                cube.material.envMap = texture;
            });
            scene.background = texture;
        },
    );
    // Запускаем render цикл
    renderer.setAnimationLoop(render);
}

function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    cubes.forEach((cube) => {
        cube.rotation.x = time;
        cube.rotation.y = time;
    });

    controllers.update(cubes, time);

    renderer.render(scene, camera);
}

main();
