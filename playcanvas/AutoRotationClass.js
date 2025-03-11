class AutoRotation extends pc.ScriptType {
    static addAttributes() {
        this.attributes.add('speed', { type: 'number', title: 'Speed' });
    }

    constructor(...args) {
        super(...args);
    }

    initialize() {
        console.log(this.speed);
    }

    update(dt) {
        const rotateValue = this.speed * dt;
        this.entity.rotate(rotateValue, rotateValue, 0);
    }
}

pc.registerScript(AutoRotation, 'autoRotation');
pc.AutoRotation = AutoRotation;
pc.AutoRotation.addAttributes();
