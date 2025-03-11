const xrButton = document.getElementById('xrButton');
let xrSession = null;
let gl = null;
let shaderProgram = null;
let vertexBuffer = null;
let modelMatrix = new Float32Array(16);
let rotation = 0;

function checkXRSupport() {
    if (!navigator.xr) {
        xrButton.textContent = 'WebXR не поддерживается';
        xrButton.disabled = true;
        return false;
    }
    return true;
}

function initGL() {
    const canvas = document.querySelector('canvas');

    gl = canvas.getContext('webgl', {
        antialias: true,
        xrCompatible: true,
    });

    const vertices = new Float32Array([
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5,
        0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
        0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
        -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
        0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5,
        0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
    ]);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vs = `attribute vec3 position;
    uniform mat4 modelViewProjection;
    void main() { gl_Position = modelViewProjection * vec4(position, 1.0); }`;

    const fs = `precision mediump float;
    void main() { gl_FragColor = vec4(0.0, 0.7, 0.9, 1.0); }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(fragmentShader);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(shaderProgram);
}

async function startSession() {
    try {
        xrSession = await navigator.xr.requestSession('immersive-vr');
        const layer = new XRWebGLLayer(xrSession, gl);
        xrSession.updateRenderState({ layers: [layer] });
        xrSession.requestAnimationFrame(onXRFrame);
        xrButton.textContent = 'Exit VR';
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

function onXRFrame(time, frame) {
    const session = frame.session;
    const pose = frame.getViewerPose(xrSession.space);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (pose) {
        rotation += 0.01;
        modelMatrix = new Float32Array([
            Math.cos(rotation),
            0,
            Math.sin(rotation),
            0,
            0,
            1,
            0,
            0,
            -Math.sin(rotation),
            0,
            Math.cos(rotation),
            0,
            0,
            0,
            -2,
            1,
        ]);

        const positionLoc = gl.getAttribLocation(shaderProgram, 'position');
        gl.enableVertexAttribArray(positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

        for (const view of pose.views) {
            const viewport = xrSession.renderState.baseLayer.getViewport(view);
            gl.viewport(
                viewport.x,
                viewport.y,
                viewport.width,
                viewport.height,
            );

            const projectionMatrix = view.projectionMatrix;
            const viewMatrix = view.transform.inverse.matrix;
            const mvp = new Float32Array(16);
            multiplyMatrix(mvp, projectionMatrix, viewMatrix);
            multiplyMatrix(mvp, mvp, modelMatrix);

            const mvpLoc = gl.getUniformLocation(
                shaderProgram,
                'modelViewProjection',
            );
            gl.uniformMatrix4fv(mvpLoc, false, mvp);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
    }
    session.requestAnimationFrame(onXRFrame);
}

function multiplyMatrix(out, a, b) {
    const a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    const a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    const a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    const a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];

    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return out;
}

xrButton.addEventListener('click', async () => {
    if (!xrSession) {
        if (checkXRSupport()) {
            initGL();
            await startSession();
        }
    } else {
        await xrSession.end();
        xrSession = null;
        xrButton.textContent = 'Start VR';
    }
});

checkXRSupport();
