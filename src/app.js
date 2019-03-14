import React from "react";
import ReactDOM from "react-dom";
import WaveAudio from "./WaveAudio";
import demo from '../public/demo.mp3'

ReactDOM.render(
  <WaveAudio src={demo} />,
  document.getElementById("app")
);
