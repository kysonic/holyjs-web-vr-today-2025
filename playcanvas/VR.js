const VR = pc.createScript('VR');
// Button in UI
VR.attributes.add('button', {
    type: 'entity',
});
// Camera reference
VR.attributes.add('camera', {
    type: 'entity',
});

VR.prototype.initialize = function () {
    // Дизейблим кнопку если вр не поддерживается
    this.button.button.active = this.app.xr.supported;
    // Субскрибимся на клик
    const onVrButtonClickHandler = this.onVrButtonClick.bind(this);
    this.button.element.on('click', onVrButtonClickHandler);
    this.on('destroy', () => {
        this.button.element.on('click', onVrButtonClickHandler);
    });
    // Дизейблим если мы уже в VR
    this.app.xr.on('start', () => {
        this.button.enabled = false;
    });
    // Ну и инейблим если вышли
    this.app.xr.on('end', () => {
        this.button.enabled = true;
    });
};

VR.prototype.onVrButtonClick = async function () {
    // Проверка доступности девайса
    if (this.app.xr.isAvailable(pc.XRTYPE_VR)) {
        // Request permissions if possible
        if (
            window.DeviceOrientationEvent &&
            window.DeviceOrientationEvent.requestPermission
        ) {
            const response = await DeviceOrientationEvent.requestPermission();

            if (response == 'granted') {
                window.addEventListener(
                    'deviceorientation',
                    function (e) {
                        this.enterVR();
                    }.bind(this),
                );
            }
        } else {
            this.enterVR();
        }
    }
};

VR.prototype.enterVR = function () {
    this.camera.camera.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCAL);
};
