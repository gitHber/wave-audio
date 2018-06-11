import React from 'react'
import PropTypes from 'prop-types'
import './Audio.css'

export default class Audio extends React.Component {
  initData = () => {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.canvasContext = this.canvas.getContext('2d')

    this.WIDTH = this.canvas.width
    this.HEIGHT = this.canvas.height
    // 清除canvas
    this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT)
    this.canvasContext.fillStyle = 'rgba(255,255,255,1)'
    this.canvasContext.fillRect(0, 0, this.WIDTH, this.HEIGHT)
    // 设置analysiser 分析数据
    // audio -> analysiser -> speaker
    this.analyser = this.audioContext.createAnalyser()
    this.source = this.audioContext.createMediaElementSource(this.audio)
    this.source.connect(this.analyser)
    // let the audio pass through to the speaker
    this.analyser.connect(this.audioContext.destination)
    // set up the data
    this.analyser.fftSize = 1024
    this.bufferLength = this.analyser.fftSize
    this.dataArray = new Float32Array(this.bufferLength)
    this.frame = 0
  }
  initEvent = () => {
    this.audio.onplay = this.props.onplay
    this.audio.onpause = this.props.onpause
    this.audio.onplaying = this.props.onplaying
    this.audio.onended = this.props.onended
    this.audio.onvolumechange = this.props.onvolumechange
  }
  componentDidMount () {
    this.initData()
    this.initEvent()
    this.draw()
  }
  // 显示波形
  renderWave = (data, len, context, WIDTH, HEIGHT) => {
    // clear canvas
    context.fillStyle = 'rgba(255,255,255,1)'
    context.fillRect(0, 0, WIDTH, HEIGHT)
    let lineWidth = 2
    // configure the stroke
    context.lineWidth = lineWidth
    // configure the linear-gradient stroke color
    let gradient = context.createLinearGradient(0, 0, 170, 0)
    gradient.addColorStop('0', 'magenta')
    gradient.addColorStop('0.5', 'blue')
    gradient.addColorStop('1.0', 'red')

    context.strokeStyle = gradient
    // begin path
    context.beginPath()
    if (this.props.type === 'wave') {
      // draw wave
      let x = 0
      let sliceWidth = WIDTH * 1 / len
      context.moveTo(0, data[0] * HEIGHT / 2 + HEIGHT / 2)
      for (let i = 0; i < len; i++) {
        let y = HEIGHT / 2 + data[i] * HEIGHT / 2
        context.lineTo(x, y)
        x += sliceWidth
      }
    } else if (this.props.type === 'bar') {
      for (let i = 0; i < len; i++) {
        let d = (data[i] * HEIGHT / 2) > 0.5 ? (data[i] * HEIGHT / 2) : 0.5
        context.moveTo(i * (lineWidth + 1), HEIGHT / 2 + d)
        context.lineTo(i * (lineWidth + 1), HEIGHT / 2 - d)
      }
    }
    // show
    context.stroke()
  }
  draw = () => {
    if (!this.audio.paused) {
      // update
      this.analyser.getFloatTimeDomainData(this.dataArray)
      // draw canvas
      this.renderWave(this.dataArray, this.bufferLength, this.canvasContext,
        this.WIDTH, this.HEIGHT)
    } else {
      let data = new Float32Array(this.bufferLength)
      this.renderWave(data, this.bufferLength, this.canvasContext,
        this.WIDTH, this.HEIGHT)
    }
    let self = this
    this.frame = requestAnimationFrame(function () {
      self.draw()
    })
  }
  render () {
    return <div className='audio' {...this.props}>
      <canvas ref={canvas => { this.canvas = canvas }} className='waves' />
      <audio ref={audio => { this.audio = audio }} src={this.props.src} className='audio-source' controls>
        <source src={this.props.src} type='audio/mp3' />
        <embed height='100' width='100' src={this.props.src} />
      </audio>
    </div>
  }
}
Audio.propTypes = {
  src: PropTypes.object,
  type: PropTypes.oneOf(['wave', 'bar']),
  onplay: PropTypes.func,
  onpause: PropTypes.func,
  onplaying: PropTypes.func,
  onended: PropTypes.func,
  onvolumechange: PropTypes.func
}
Audio.defaultProps = {
  type: 'bar'
}
