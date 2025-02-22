const Controllers = pc.createScript('controllers');

Controllers.attributes.add('controllerTemplate', {
  type: 'asset',
  assetType: 'template',
  title: 'Controller Template',
});

Controllers.attributes.add('cameraParent', {
  type: 'entity',
  title: 'Camera Parent',
});

Controllers.prototype.initialize = function () {
  this.controllerAssets = this.app.assets.findByTag('controller');
  this.controllerAssetsIndex = {};

  for (let i = 0; i < this.controllerAssets.length; i++) {
    const name = this.controllerAssets[i].name.replace(/\.[a-z]+$/i, '');
    this.controllerAssetsIndex[name] = this.controllerAssets[i];
  }

  // when controller is added
  this.app.xr.input.on(
    'add',
    function (inputSource) {
      // clone controller entity template
      const entity = this.controllerTemplate.resource.instantiate();

      // find related model asset
      let asset = null;
      for (let i = 0; i < inputSource.profiles.length; i++) {
        const name = inputSource.profiles[i] + '-' + inputSource.handedness;
        asset = this.controllerAssetsIndex[name];
        if (asset) {
          break;
        }
      }

      // default to generic-trigger
      if (!asset) {
        asset =
          this.controllerAssetsIndex[
            'generic-trigger-' + inputSource.handedness
          ];
      }

      if (inputSource.hand && !asset.tags.has('hand')) {
        asset = null;
      }

      // set input source
      entity.script.controller.setInputSource(inputSource, asset);
      // reparent to camera parent entity
      entity.reparent(this.cameraParent);
      entity.enabled = true;
    },
    this,
  );
};
