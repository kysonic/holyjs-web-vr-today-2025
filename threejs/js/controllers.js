import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Controllers {
    constructor({ scene, renderer, options }) {
        this.scene = scene;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.objectToColorMap = new Map();
        this.controllerToObjectMap = new Map();
        this.tempMatrix = new THREE.Matrix4();
        this.options = options;

        const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1),
        ]);

        this.controllers = [];
        for (let i = 0; i < 2; i++) {
            const controller = renderer.xr.getController(i);
            if (controller) {
                scene.add(controller);
                const line = new THREE.Line(pointerGeometry);
                line.scale.z = 5;
                controller.add(line);
                this.controllers.push({ controller, line });
            }
        }

        this.loadControllerVisuals();
    }

    loadControllerVisuals() {
        const loader = new GLTFLoader();
        const _self = this;

        loader.load(this.options.modelUrl, function (gltf) {
            const scale = 0.55;

            const leftController = gltf.scene.clone(true);
            leftController.scale.set(scale, scale, -scale);

            const rightController = gltf.scene.clone(true);
            rightController.scale.set(-scale, scale, -scale);

            const visuals = [leftController, rightController];
            _self.controllers.forEach(({ controller }, i) => {
                controller.add(visuals[i]);
            });
        });
    }

    update(objects, time) {
        this.reset();
        for (const { controller, line } of this.controllers) {
            this.tempMatrix.identity().extractRotation(controller.matrixWorld);
            this.raycaster.ray.origin.setFromMatrixPosition(
                controller.matrixWorld,
            );
            this.raycaster.ray.direction
                .set(0, 0, -1)
                .applyMatrix4(this.tempMatrix);

            const intersections = this.raycaster.intersectObjects(objects);

            if (intersections.length) {
                const intersection = intersections[0];
                // делаем так чтобы линия касалась объекта
                line.scale.z = intersection.distance;
                // берем первый
                const pickedObject = intersection.object;
                // сохраняем какой обьект уже взят
                this.controllerToObjectMap.set(controller, pickedObject);
                // подсвечивает если еще не подсвечен
                if (this.objectToColorMap.get(pickedObject) === undefined) {
                    // сохраняем цвет
                    this.objectToColorMap.set(
                        pickedObject,
                        pickedObject.material.emissive.getHex(),
                    );
                    
                    pickedObject.material.emissive.setHex(
                        (time * 8) % 2 > 1 ? 0xff2000 : 0xff0000,
                    );
                }
            } else {
                line.scale.z = 5;
            }
        }
    }

    reset() {
        this.objectToColorMap.forEach((color, object) => {
            object.material.emissive.setHex(color);
        });
        this.objectToColorMap.clear();
        this.controllerToObjectMap.clear();
    }
}

export default Controllers;
