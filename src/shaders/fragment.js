export default `
    precision mediump float;
    varying float v_time;
    varying vec2 v_uv;

    void main(){
        gl_FragColor = vec4(v_uv.x,v_uv.y,sin(v_time),1.0);
    }
`;