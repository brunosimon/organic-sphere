import Experience from './Experience.js'

export default class Microphone
{
    constructor()
    {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.ready = false
        this.volume = 0
        this.levels = []

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((_stream) =>
            {
                this.stream = _stream

                this.init()

                if(this.debug)
                {
                    this.setSpectrum()
                }
            })
    }

    init()
    {
        this.audioContext = new AudioContext()
        
        this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(this.stream)
        
        this.analyserNode = this.audioContext.createAnalyser()
        this.analyserNode.fftSize = 256
        
        this.mediaStreamSourceNode.connect(this.analyserNode)
        
        this.floatTimeDomainData = new Float32Array(this.analyserNode.fftSize)
        this.byteFrequencyData = new Uint8Array(this.analyserNode.fftSize)
        
        this.ready = true
    }

    setSpectrum()
    {
        this.spectrum = {}

        this.spectrum.width = this.analyserNode.fftSize
        this.spectrum.height = 128
        this.spectrum.halfHeight = Math.round(this.spectrum.height * 0.5)
        
        this.spectrum.canvas = document.createElement('canvas')
        this.spectrum.canvas.width = this.spectrum.width
        this.spectrum.canvas.height = this.spectrum.height
        this.spectrum.canvas.style.position = 'fixed'
        this.spectrum.canvas.style.left = 0
        this.spectrum.canvas.style.bottom = 0
        document.body.append(this.spectrum.canvas)

        this.spectrum.context = this.spectrum.canvas.getContext('2d')
        this.spectrum.context.fillStyle = '#ffffff'

        this.spectrum.update = () =>
        {
            this.spectrum.context.clearRect(0, 0, this.spectrum.width, this.spectrum.height)

            for(let i = 0; i < this.analyserNode.fftSize; i++)
            {
                const floatTimeDomainValue = this.floatTimeDomainData[i]
                const byteFrequencyValue = this.byteFrequencyData[i]
                const normalizeByteFrequencyValue = byteFrequencyValue / 255

                const x = i
                const y = this.spectrum.height - (normalizeByteFrequencyValue * this.spectrum.height)
                const width = 1
                // const height = floatTimeDomainValue * this.spectrum.height
                const height = normalizeByteFrequencyValue * this.spectrum.height

                this.spectrum.context.fillRect(x, y, width, height)
            }
        }
    }

    getLevels()
    {
        const bufferLength = this.analyserNode.fftSize
        const levelCount = 8
        const levelBins = Math.floor(bufferLength / levelCount)

        const levels = []
        let max = 0
        
        for(let i = 0; i < levelCount; i++)
        {
            let sum = 0

            for(let j = 0; j < levelBins; j++)
            {
                sum +=  this.byteFrequencyData[(i * levelBins) + j]
            }

            const value = sum / levelBins / 256
            levels[i] = value

            if(value > max)
                max = value
        }

        return levels
    }

    getVolume()
    {
        let sumSquares = 0.0
        for(const amplitude of this.floatTimeDomainData)
        {
            sumSquares += amplitude * amplitude
        }

        return Math.sqrt(sumSquares / this.floatTimeDomainData.length)
    }

    update()
    {
        if(!this.ready)
            return

        // Retrieve audio data
        this.analyserNode.getByteFrequencyData(this.byteFrequencyData)
        this.analyserNode.getFloatTimeDomainData(this.floatTimeDomainData)
        
        this.volume = this.getVolume()
        this.levels = this.getLevels()

        // Spectrum
        if(this.spectrum)
            this.spectrum.update()
    }
}