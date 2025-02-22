import { shaderCode } from './shaders.js';

// Глобальные переменные (в реальном приложении сделать модульно)
let canvas = null;
let gpu = null;
let adapter = null;
let device = null;
let format = null;
let pipeline = null;
let buffer = null;
let commandEncoder = null;
let renderPass = null;

// 1. Инициализация контекста WebGPU
function initGPU() {
    gpu = canvas.getContext('webgpu');

    if (!navigator.gpu || !gpu) {
        throw new Error('WebGPU не поддерживается в вашем браузере...');
    }
}
// 2. Инициализация адаптера и устройства
async function initDevice() {
    adapter = await navigator.gpu.requestAdapter({ xrCompatible: true });
    device = await adapter.requestDevice();
}
// 3. Настройка формата вывода
function configureOutput() {
    format = navigator.gpu.getPreferredCanvasFormat();
    gpu.configure({
        device,
        format: format,
        alphaMode: 'opaque',
    });
}
// 4. Создание пайплайна
function createPipeline() {
    pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({ code: shaderCode }),
            entryPoint: 'vertexMain',
            buffers: [
                {
                    arrayStride: 2 * 4, // 2 float32 (8 байт)
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x2',
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: device.createShaderModule({ code: shaderCode }),
            entryPoint: 'fragmentMain',
            targets: [{ format: format }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });
}
// 5. Геометрия
function initGeometry() {
    const vertices = new Float32Array([
        0.0,
        0.5, // Верхняя вершина
        -0.5,
        -0.5, // Левая нижняя
        0.5,
        -0.5, // Правая нижняя
    ]);

    buffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(vertices);
    buffer.unmap();
}
// 6. Отрисовка
function drawScene() {
    commandEncoder = device.createCommandEncoder();
    renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
            {
                view: gpu.getCurrentTexture().createView(),
                loadOp: 'clear',
                clearValue: [0.1, 0.1, 0.1, 1], // Темно-серый фон
                storeOp: 'store',
            },
        ],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, buffer);
    renderPass.draw(3);
    renderPass.end();
}
// 7. Отправляем рендеринг на GPU
function sendToGPU() {
    device.queue.submit([commandEncoder.finish()]);
}

async function makeXRSession() {
    const xrSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['webgpu'],
    });
}

async function webGPUStart() {
    canvas = document.getElementById('webgpu-canvas');

    initGPU();
    await initDevice();
    configureOutput();
    createPipeline();
    initGeometry();
    drawScene();
    sendToGPU();
    await makeXRSession();
}

window.addEventListener('DOMContentLoaded', () => {
    webGPUStart().catch(console.error);
});
