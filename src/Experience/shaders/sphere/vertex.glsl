#define M_PI 3.1415926535897932384626433832795

uniform vec3 uLightAColor;
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;
uniform vec3 uLightBColor;
uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

uniform float uTime;

varying vec3 vNormal;
varying float vPerlinStrength;
varying vec3 vColor;

#pragma glslify: perlin4d = require('../partials/perlin4d.glsl')
#pragma glslify: perlin3d = require('../partials/perlin3d.glsl')

vec4 getDisplacedPosition(vec3 _position)
{
    vec3 displacementPosition = _position;
    displacementPosition += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime)) * uDistortionStrength;

    float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime));
    
    vec3 displacedPosition = _position;
    displacedPosition += normalize(_position) * perlinStrength * uDisplacementStrength;

    return vec4(displacedPosition, perlinStrength);
}

void main()
{
    // Position
    vec4 displacedPosition = getDisplacedPosition(position);
    vec4 viewPosition = viewMatrix * vec4(displacedPosition.xyz, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    // Bi tangents
    float neighbourTangentDistance = (M_PI * 2.0) / 512.0;
    float neighbourBiTangentDistance = M_PI / 512.0;

    vec3 biTangent = cross(normal, tangent.xyz);

    vec3 tangentNeighbour = position + tangent.xyz * neighbourTangentDistance;
    tangentNeighbour = getDisplacedPosition(tangentNeighbour).xyz;

    vec3 biTangentNeightbour = position + biTangent.xyz * neighbourBiTangentDistance;
    biTangentNeightbour = getDisplacedPosition(biTangentNeightbour).xyz;

    vec3 computedNormal = cross(tangentNeighbour, biTangentNeightbour);
    computedNormal = normalize(computedNormal);

    // Color
    float lightAIntensity = max(0.0, - dot(normal.xyz, normalize(- uLightAPosition))) * uLightAIntensity;
    float lightBIntensity = max(0.0, - dot(normal.xyz, normalize(- uLightBPosition))) * uLightBIntensity;

    vec3 color = vec3(0.0);
    color = mix(color, uLightAColor, lightAIntensity);
    color = mix(color, uLightBColor, lightBIntensity);

    // Varying
    vNormal = normal;
    vPerlinStrength = displacedPosition.a;
    vColor = color;
}