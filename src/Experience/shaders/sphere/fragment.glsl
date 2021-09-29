varying vec3 vNormal;
varying float vPerlinStrength;

void main()
{
    float temp = vPerlinStrength + 0.5;
    temp *= 0.5;
    gl_FragColor = vec4(temp, temp, temp, 1.0);
}