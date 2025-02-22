const Scaler = pc.createScript('scaler');

Scaler.prototype.initialize = function() {
    this._targetScale = new pc.Vec3(1, 1, 1);
    this.entity.on('raycaster:start', this.onStart, this);  
    this.entity.on('raycaster:stop', this.onStop, this);  

    this.on('destroy', () => {
        this.entity.off('raycaster:start', this.onStart);  
        this.entity.off('raycaster:stop', this.onStop);  
    });
};

Scaler.prototype.onStart = function() {
    this._targetScale = new pc.Vec3(1.2, 1.2, 1.2);
}

Scaler.prototype.onStop = function() {
    this._targetScale = new pc.Vec3(1, 1, 1);
}

Scaler.prototype.update = function() {
    if (this.entity.getScale().sub(this._targetScale).length() > 0.01) {
        const scaleDelta = this.entity.getScale().length() < this._targetScale.length() ? 0.01 : -0.01;
        this.entity.setLocalScale(this.entity.getLocalScale().addScalar(scaleDelta));
    }
}