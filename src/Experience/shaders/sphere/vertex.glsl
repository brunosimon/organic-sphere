uniform float uTime;

varying vec3 vNormal;
varying float vPerlinStrength;

#pragma glslify: perlin4d = require('../partials/perlin4d.glsl')
#pragma glslify: perlin3d = require('../partials/perlin3d.glsl')

void main()
{
    float uDistortionFrequency = 2.0;
    float uDistortionStrength = 1.0;
    float uDisplacementFrequency = 2.0;
    float uDisplacementStrength = 0.2;

    vec3 displacementPosition = position;
    displacementPosition += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime * 0.00012)) * uDistortionStrength;

    float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime * 0.0001)) * uDisplacementStrength;
    
    vec3 newPosition = position;
    newPosition += normal * perlinStrength;

    vec4 viewPosition = viewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    vNormal = normal;
    vPerlinStrength = perlinStrength;
}