const AutoRotation = pc.createScript('autoRotation');

AutoRotation.attributes.add('speed', { type: 'number', default: 5 });

// Инициализация
AutoRotation.prototype.initialize = function () {};

// Апдейт цикл
AutoRotation.prototype.update = function (dt) {
    const rotateValue = this.speed * dt;
    this.entity.rotate(rotateValue, rotateValue, 0);
};
