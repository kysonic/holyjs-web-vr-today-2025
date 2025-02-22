// Сразу инициализируют шейдеры для вершин и фрагментов
export const shaderCode = `
@vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
    return vec4f(pos, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(1, 0.5, 0, 1); // Оранжевый цвет
}
`;
