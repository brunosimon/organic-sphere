varying vec3 vNormal;
varying float vPerlinStrength;
varying vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);

    // float temp = vPerlinStrength + 0.5;
    // temp *= 0.5;
    // gl_FragColor = vec4(temp, temp, temp, 1.0);
}