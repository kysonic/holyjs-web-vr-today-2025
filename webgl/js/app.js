import { vertexShaderCode, fragmentShaderCode } from './shaders.js';

// Глобальные переменные (в реальном приложении сделать модульно)
let canvas = null;
let gl = null;
let program = null;
let buffer = null;

// 1. Инициализация контекста WebGL
function initGL() {
    gl = canvas.getContext('webgl');

    if (!gl) {
        throw new Error('WebGL не поддерживается в вашем браузере...');
    }
}

// 2. Инициализация шейдеров
function initShaders() {
    // Шейдер вершин
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    // Шейдер фрагментов (полигонов)
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);
    // Программа
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Не удалось инициализировать программу шейдеров');
    }

    gl.useProgram(program);

    program.positionAttr = gl.getAttribLocation(program, 'positionAttr');
    gl.enableVertexAttribArray(program.positionAttr);

    program.colorAttr = gl.getAttribLocation(program, 'colorAttr');
    gl.enableVertexAttribArray(program.colorAttr);
}
// 3. Инициализация геометрии
function initGeometry() {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Interleave vertex positions and colors
    const vertexData = [
        // X    Y     Z     R     G     B     A
        0.0, 0.5, 0.0, 1.0, 0.5, 0.0, 1.0,
        // X    Y     Z     R     G     B     A
        -0.5, -0.5, 0.0, 1.0, 0.5, 0.0, 1.0,
        // X    Y     Z     R     G     B     A
        0.5, -0.5, 0.0, 1.0, 0.5, 0.0, 1.0,
    ];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertexData),
        gl.STATIC_DRAW,
    );
}
// 4. Очищаем сцену
function clearScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.disable(gl.DEPTH_TEST);
}
// 5. Рисуем сцену
function drawScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const stride = 7 * Float32Array.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(program.positionAttr, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(
        program.colorAttr,
        4,
        gl.FLOAT,
        false,
        stride,
        3 * Float32Array.BYTES_PER_ELEMENT,
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Запускает WebGL сцену
function webGLStart() {
    canvas = document.getElementById('webgl-canvas');

    initGL();
    initShaders();
    initGeometry();
    clearScene();
    drawScene();
}

window.addEventListener('DOMContentLoaded', () => {
    webGLStart();
});
