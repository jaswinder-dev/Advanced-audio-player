export default `
    attribute float a_modulus;
    varying vec2 v_uv;
    uniform float u_time;
    uniform float u_frequency;
    varying float v_time;

    void main(){
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        modelPosition.x *= a_modulus + (0.0015 * u_frequency);
        modelPosition.y *= a_modulus + (0.0015 * u_frequency);
        modelPosition.z *= a_modulus + (0.0015 * u_frequency);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;
        v_uv = uv;
        v_time = u_time;
    }
`;