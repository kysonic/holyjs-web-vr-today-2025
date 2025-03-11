export const vertexShaderCode = `
attribute vec3 positionAttr;
attribute vec4 colorAttr;

varying vec4 vColor;

void main(void) {
    gl_Position = vec4(positionAttr, 1.0);
    vColor = colorAttr;
}
`;

export const fragmentShaderCode = `
precision mediump float;

varying vec4 vColor;
void main(void) {
    gl_FragColor = vColor;
}
`;
