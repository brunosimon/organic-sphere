export default class Microphone
{
    constructor()
    {
        this.ready = false
        this.volume = 0

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((_stream) =>
            {
                this.stream = _stream

                this.init()
            })
    }

    init()
    {
        this.audioContext = new AudioContext()
        
        this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(this.stream)
        
        this.analyserNode = this.audioContext.createAnalyser()
        this.analyserNode.fftSize = 128
        
        this.mediaStreamSourceNode.connect(this.analyserNode)
        
        this.pcmData = new Float32Array(this.analyserNode.fftSize)
        
        this.ready = true
    }

    update()
    {
        if(!this.ready)
            return

        this.analyserNode.getFloatTimeDomainData(this.pcmData)
        
        let sumSquares = 0.0;
        for(const amplitude of this.pcmData)
        {
            sumSquares += amplitude * amplitude
        }
        this.volume = Math.sqrt(sumSquares / this.pcmData.length)
    }
}