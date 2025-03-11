const Controller = pc.createScript('controller');

Controller.prototype.initialize = function () {
    this.color = new pc.Color(1, 1, 1);

    this.modelEntity = this.entity.findByName('model');

    this.layerUi = this.app.scene.layers.getLayerById(pc.LAYERID_UI);
};

Controller.prototype.swap = function (old) {
    this.color = old.color;

    this.modelEntity = old.modelEntity;
    this.joints = old.joints;

    this.inputSource = old.inputSource;
    this.asset = old.asset;

    this.layerUi = old.layerUi;
};

Controller.prototype.setInputSource = function (inputSource, asset) {
    this.inputSource = inputSource;
    this.inputSource.once('remove', this.onRemove, this);

    this.on('hover', this.onHover, this);
    this.on('blur', this.onBlur, this);

    this.inputSource.on('select', this.onSelect, this);

    if (asset) {
        this.asset = asset;
        // Если у нас есть ассет для контроллера
        asset.ready(function () {
            const glb = asset.resource;
            const blob = new Blob([glb]);

            // Грузим GLB
            this.app.assets.loadFromUrlAndFilename(
                URL.createObjectURL(blob),
                'container.glb',
                'container',
                (err, containerAsset) => {
                    if (err) {
                        console.error(err);
                    } else {
                        // Обновляем модель
                        this.modelEntity.setLocalScale(1, 1, 1);
                        this.modelEntity.model.type = 'asset';
                        this.modelEntity.model.asset =
                            containerAsset.resource.model;
                        // Файорим событие после загрузки
                        this.fire('inputSource:added');
                    }
                },
            );
        }, this);
        // Загружаем модель
        this.app.assets.load(asset);
    }
};

Controller.prototype.onRemove = function () {
    this.fire('inputSource:removed');
    this.entity.destroy();
};

Controller.prototype.update = function (dt) {
    if (this.inputSource && this.inputSource.grip) {
        this.modelEntity.enabled = true;
        this.entity.setPosition(this.inputSource.getPosition());
        this.entity.setRotation(this.inputSource.getRotation());
    }
};
