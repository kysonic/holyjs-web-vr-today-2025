const AutoRotation = pc.createScript('autoRotation');

AutoRotation.attributes.add('speed', { type: 'number', default: 5 });

// initialize code called once per entity
AutoRotation.prototype.initialize = function() {

};

// update code called every frame
AutoRotation.prototype.update = function(dt) {
    const rotateValue = this.speed * dt;
    this.entity.rotate(rotateValue, rotateValue, 0);
};