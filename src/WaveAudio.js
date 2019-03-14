import React from "react";
import PropTypes from "prop-types";
import DragWrap from "./DragWrap";
import "./WaveAudio.css";

class WaveAudio extends React.Component {
  audioObj = React.createRef();
  connected = false;
  initData = () => {
    this.canvasContext = this.canvas.getContext("2d");

    this.WIDTH = this.canvas.width;
    this.HEIGHT = this.canvas.height;
    // 清除canvas
    this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    this.canvasContext.fillStyle = "rgba(255,255,255,1)";
    this.canvasContext.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    // 设置analysiser 分析数据
    // audio -> analysiser -> speaker
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    // let the audio pass through to the speaker
    this.analyser.connect(this.audioContext.destination);
    // set up the data
    this.analyser.fftSize = 1024;
    this.bufferLength = this.analyser.fftSize;
    this.dataArray = new Float32Array(this.bufferLength);
    this.frame = 0;
  };
  componentDidMount() {
    this.audio = this.audioObj.current;
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }
  onPlay = () => {
    if (!this.connected) {
      this.audioContext.resume().then(() => {
        this.initData();
        this.draw();
        this.connected = true;
      });
    }
  };
  // 显示波形
  renderWave = (data, len, context, WIDTH, HEIGHT) => {
    // clear canvas
    context.fillStyle = "rgba(255,255,255,1)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    let lineWidth = 2;
    // configure the stroke
    context.lineWidth = lineWidth;
    // configure the linear-gradient stroke color
    let gradient = context.createLinearGradient(0, 0, 170, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");

    context.strokeStyle = gradient;
    // begin path
    context.beginPath();
    if (this.props.type === "wave") {
      // draw wave
      let x = 0;
      let sliceWidth = (WIDTH * 1) / len;
      context.moveTo(0, (data[0] * HEIGHT) / 2 + HEIGHT / 2);
      for (let i = 0; i < len; i++) {
        let y = HEIGHT / 2 + (data[i] * HEIGHT) / 2;
        context.lineTo(x, y);
        x += sliceWidth;
      }
    } else if (this.props.type === "bar") {
      for (let i = 0; i < len; i++) {
        let d = (data[i] * HEIGHT) / 2 > 0.5 ? (data[i] * HEIGHT) / 2 : 0.5;
        context.moveTo(i * (lineWidth + 1), HEIGHT / 2 + d);
        context.lineTo(i * (lineWidth + 1), HEIGHT / 2 - d);
      }
    }
    // show
    context.stroke();
  };
  draw = () => {
    if (!this.audio.paused) {
      // update
      this.analyser.getFloatTimeDomainData(this.dataArray);
      // draw canvas
      this.renderWave(
        this.dataArray,
        this.bufferLength,
        this.canvasContext,
        this.WIDTH,
        this.HEIGHT
      );
    } else {
      let data = new Float32Array(this.bufferLength);
      this.renderWave(
        data,
        this.bufferLength,
        this.canvasContext,
        this.WIDTH,
        this.HEIGHT
      );
    }
    let self = this;
    this.frame = requestAnimationFrame(function() {
      self.draw();
    });
  };
  render() {
    const { className, draggable, src, ...props } = this.props;
    return (
      <DragWrap
        className={`wave-audio ${className || ""}`}
        draggable={draggable}
      >
        <canvas
          ref={canvas => {
            this.canvas = canvas;
          }}
          className="waves"
        />
        <audio
          ref={this.audioObj}
          src={src}
          className="audio-source"
          onPlay={this.onPlay}
          controls
          {...props}
        >
          Your browser does not support the audio element.
        </audio>
      </DragWrap>
    );
  }
}
WaveAudio.propTypes = {
  src: PropTypes.string,
  type: PropTypes.oneOf(["wave", "bar"]),
  onplay: PropTypes.func,
  onpause: PropTypes.func,
  onplaying: PropTypes.func,
  onended: PropTypes.func,
  onvolumechange: PropTypes.func
};
WaveAudio.defaultProps = {
  type: "bar"
};

export default WaveAudio;
