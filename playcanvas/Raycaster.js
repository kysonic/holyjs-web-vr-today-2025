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

// initialize code called once per entity
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

// update code called every frame
Raycaster.prototype.update = function (dt) {
  if (this.inputSource) {
    // Setup raycaster
    this._ray.origin.copy(this.inputSource.getOrigin());
    this._ray.direction.copy(this.inputSource.getDirection()).scale(this.range);
    // Visualise raycaster
    if (this.visualise) {
      this.renderRay();
    }
    // Check intersections
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
  // For models
  if (entity.model) {
    return this.getModelAABB(entity);
  }
  // Otherwise create a coub as half extents
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
