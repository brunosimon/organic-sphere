import * as THREE from 'three'
import Experience from './Experience'
import vertexShader from './shaders/sphere/vertex.glsl'
import fragmentShader from './shaders/sphere/fragment.glsl'

export default class Sphere
{
    constructor()
    {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time

        this.timeFrequency = 0.0003

        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: 'sphere',
                expanded: true
            })

            this.debugFolder.addInput(
                this,
                'timeFrequency',
                { min: 0, max: 0.001, step: 0.000001 }
            )
        }
        
        this.setGeometry()
        this.setLights()
        this.setMaterial()
        this.setMesh()
    }

    setLights()
    {
        this.lights = {}

        // Light A
        this.lights.a = {}

        this.lights.a.intensity = 4.5

        this.lights.a.color = {}
        this.lights.a.color.value = '#ff3e00'
        this.lights.a.color.instance = new THREE.Color(this.lights.a.color.value)

        this.lights.a.spherical = new THREE.Spherical(1, 0.615, 2.049)

        // Light B
        this.lights.b = {}

        this.lights.b.intensity = 2

        this.lights.b.color = {}
        this.lights.b.color.value = '#0063ff'
        this.lights.b.color.instance = new THREE.Color(this.lights.b.color.value)

        this.lights.b.spherical = new THREE.Spherical(1, 2.561, - 1.844)

        // Debug
        if(this.debug)
        {
            for(const _lightName in this.lights)
            {
                const light = this.lights[_lightName]
                
                const debugFolder = this.debugFolder.addFolder({
                    title: _lightName,
                    expanded: true
                })

                debugFolder
                    .addInput(
                        light.color,
                        'value',
                        { view: 'color', label: 'color' }
                    )
                    .on('change', () =>
                    {
                        light.color.instance.set(light.color.value)
                    })

                debugFolder
                    .addInput(
                        light,
                        'intensity',
                        { min: 0, max: 10 }
                    )
                    .on('change', () =>
                    {
                        this.material.uniforms[`uLight${_lightName.toUpperCase()}Intensity`].value = light.intensity
                    })

                debugFolder
                    .addInput(
                        light.spherical,
                        'phi',
                        { label: 'phi', min: 0, max: Math.PI, step: 0.001 }
                    )
                    .on('change', () =>
                    {
                        this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
                    })

                debugFolder
                    .addInput(
                        light.spherical,
                        'theta',
                        { label: 'theta', min: - Math.PI, max: Math.PI, step: 0.001 }
                    )
                    .on('change', () =>
                    {
                        this.material.uniforms.uLightAPosition.value.setFromSpherical(light.spherical)
                    })
            }
        }
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(1, 512, 512)
        this.geometry.computeTangents()
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uLightAColor: { value: this.lights.a.color.instance },
                uLightAPosition: { value: new THREE.Vector3(1, 1, 0) },
                uLightAIntensity: { value: 1 },

                uLightBColor: { value: this.lights.b.color.instance },
                uLightBPosition: { value: new THREE.Vector3(- 1, - 1, 0) },
                uLightBIntensity: { value: 1 },

                uSubdivision: { value: new THREE.Vector2(this.geometry.parameters.widthSegments, this.geometry.parameters.heightSegments) },

                uDistortionFrequency: { value: 1.5 },
                uDistortionStrength: { value: 0.65 },
                uDisplacementFrequency: { value: 2.120 },
                uDisplacementStrength: { value: 0.152 },

                uFresnelOffset: { value: -1.609 },
                uFresnelMultiplier: { value: 3.587 },
                uFresnelPower: { value: 1.793 },

                uTime: { value: 0 }
            },
            defines:
            {
                USE_TANGENT: ''
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.material.uniforms.uLightAPosition.value.setFromSpherical(this.lights.a.spherical)
        this.material.uniforms.uLightBPosition.value.setFromSpherical(this.lights.b.spherical)
        
        if(this.debug)
        {
            this.debugFolder.addInput(
                this.material.uniforms.uDistortionFrequency,
                'value',
                { label: 'uDistortionFrequency', min: 0, max: 10, step: 0.001 }
            )
            
            this.debugFolder.addInput(
                this.material.uniforms.uDistortionStrength,
                'value',
                { label: 'uDistortionStrength', min: 0, max: 10, step: 0.001 }
            )
            
            this.debugFolder.addInput(
                this.material.uniforms.uDisplacementFrequency,
                'value',
                { label: 'uDisplacementFrequency', min: 0, max: 5, step: 0.001 }
            )
            
            this.debugFolder.addInput(
                this.material.uniforms.uDisplacementStrength,
                'value',
                { label: 'uDisplacementStrength', min: 0, max: 1, step: 0.001 }
            )
            
            this.debugFolder.addInput(
                this.material.uniforms.uFresnelOffset,
                'value',
                { label: 'uFresnelOffset', min: - 2, max: 2, step: 0.001 }
            )
            
            this.debugFolder.addInput(
                this.material.uniforms.uFresnelMultiplier,
                'value',
                { label: 'uFresnelMultiplier', min: 0, max: 5, step: 0.001 }
            )
            
            this.debugFolder.addInput(
                this.material.uniforms.uFresnelPower,
                'value',
                { label: 'uFresnelPower', min: 0, max: 5, step: 0.001 }
            )
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)
    }

    update()
    {
        this.material.uniforms.uTime.value += this.time.delta * this.timeFrequency
    }
}