varying vec3 vNormal;
varying float vPerlinStrength;

void main()
{
    float temp = vPerlinStrength + 0.05;
    temp *= 2.0;
    gl_FragColor = vec4(temp, temp, temp, 1.0);
}