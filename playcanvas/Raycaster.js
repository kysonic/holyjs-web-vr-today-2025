const Raycaster = pc.createScript('raycaster');

Raycaster.attributes.add('tagName', {
    type: 'string',
    default: 'Rayable',
});

Raycaster.attributes.add('range', {
    type: 'number',
    default: 100,
});

Raycaster.attributes.add('visualise', {
    type: 'boolean',
    default: false,
});

Raycaster.attributes.add('rayColor', {
    type: 'rgba',
});

Raycaster.FORWARD = 1000;

Raycaster.prototype.initialize = function () {
    this._entities = this.app.root.findByTag(this.tagName);
    this._vecA = new pc.Vec3();
    this._vecB = new pc.Vec3();
    this._ray = new pc.Ray();
    this._current = null;
    this.intersectionPoint = new pc.Vec3();
    this.controller = this.entity.script.controller;
    this.inputSource = null;
    this.controller.on(
        'inputSource:added',
        function () {
            this.inputSource = this.controller.inputSource;
        },
        this,
    );
    this.controller.on(
        'inputSource:removed',
        function () {
            this.inputSource = null;
        },
        this,
    );
};

Raycaster.prototype.update = function (dt) {
    if (this.inputSource) {
        // Рейкастер
        this._ray.origin.copy(this.inputSource.getOrigin());
        this._ray.direction
            .copy(this.inputSource.getDirection())
            .scale(this.range);
        // Визуализация рекйкастера
        if (this.visualise) {
            this.renderRay();
        }
        // Проверка пересечений
        this._entities.forEach(function (entity) {
            var aabb = this.getEntityAABB(entity);
            if (aabb.intersectsRay(this._ray, this.intersectionPoint)) {
                if (this._current !== entity) {
                    this._current = entity;
                    this.app.fire(
                        'raycaster:start',
                        entity,
                        this.entity,
                        this.intersectionPoint,
                    );
                    this._current.fire(
                        'raycaster:start',
                        this.entity,
                        this.intersectionPoint,
                    );
                } else if (this._current) {
                    this.app.fire(
                        'raycaster:continue',
                        entity,
                        this.entity,
                        this.intersectionPoint,
                    );
                    this._current.fire(
                        'raycaster:continue',
                        this.entity,
                        this.intersectionPoint,
                        dt,
                    );
                }
            } else {
                if (this._current === entity) {
                    this.app.fire('raycaster:stop', this._current, this.entity);
                    this._current.fire('raycaster:stop', this.entity);
                    this._current = null;
                }
            }
        }, this);
    }
};

Raycaster.prototype.renderRay = function () {
    if (this.inputSource) {
        this._vecA.copy(this.inputSource.getOrigin());
        this._vecB.copy(this.inputSource.getDirection());
        this._vecB.scale(Raycaster.FORWARD).add(this._vecA);

        this.app.renderLine(this._vecA, this._vecB, this.rayColor);
    }
};

Raycaster.prototype.getEntityAABB = function (entity) {
    // Для моделей
    if (entity.model) {
        return this.getModelAABB(entity);
    }
    // Иначе создаем куб для проверки пересечения
    return this.getCoubAABB(entity);
};

Raycaster.prototype.getCoubAABB = function (entity) {
    return new pc.BoundingBox(
        entity.getPosition(),
        entity.getLocalScale().clone().scale(0.5),
    );
};

Raycaster.prototype.getModelAABB = function (entity) {
    const aabb = new pc.BoundingBox();
    const meshes = entity.model.meshInstances;
    if (meshes.length) {
        aabb.copy(meshes[0].aabb);
        for (let i = 1; i < meshes.length; i++) {
            aabb.add(meshes[i].aabb);
        }
    }
    return aabb;
};
