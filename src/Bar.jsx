/**
 * 2019-02-25
 * author: 李坤
 */
import React from "react";
import PropTypes from "prop-types";
import "./Bar.css";

const getRound = num => {
  if (num < 0) num = 0;
  if (num > 1) num = 1;
  return num;
};

class Bar extends React.Component {
  circle = React.createRef();
  bar = React.createRef();
  selectedBar = React.createRef();
  canMove = false;

  state = {
    percent: 0
  };
  shouldComponentUpdate(nextProps, nextState) {
    // 如果相等，说明是拖动，不更新
    if (nextProps.percent === this.state.percent) {
      return false;
    }
    // 非拖动
    nextState.percent = nextProps.percent;
    return true;
  }
  componentDidUpdate() {
    // 根据percent更新
    const circle = this.circle.current;
    const selectedBar = this.selectedBar.current;
    const bar = this.bar.current;
    let barPos = bar.getBoundingClientRect();
    let circlePos = circle.getBoundingClientRect();
    const { percent } = this.state;
    const { type } = this.props;
    const isHorizon = type === "horizon";
    const BAR_WIDTH = barPos.width;
    const BAR_HEIGHT = barPos.height;
    const CIRCLE_WIDTH = circlePos.width;

    let length = 0;
    if (isHorizon) {
      let circlePercent = CIRCLE_WIDTH / BAR_WIDTH;
      length =
        percent > 1 - circlePercent
          ? BAR_WIDTH - CIRCLE_WIDTH
          : BAR_WIDTH * percent;
      circle.style.left = length + "px";
      selectedBar.style.width = length + "px";
    } else {
      let circlePercent = CIRCLE_WIDTH / BAR_HEIGHT;
      length =
        percent > 1 - circlePercent
          ? BAR_HEIGHT - CIRCLE_WIDTH
          : BAR_HEIGHT * percent;
      circle.style.top = length + "px";
      selectedBar.style.height = length + "px";
    }
  }
  // mouseDown
  dragStart = e => {
    this.canMove = true;
    window.addEventListener("mousemove", this.drag);
    window.addEventListener("mouseup", this.dragEnd);
  };
  // move
  drag = e => {
    const { onChange, type } = this.props;
    const circle = this.circle.current;
    const selectedBar = this.selectedBar.current;
    const isHorizon = type === "horizon";
    if (this.canMove) {
      let { length, percent } = this.getLength(e);
      if (isHorizon) {
        circle.style.left = length + "px";
        selectedBar.style.width = length + "px";
      } else {
        circle.style.top = length + "px";
        selectedBar.style.height = length + "px";
      }
      // 避免拖动触发两次更新
      this.state.percent = percent;
      onChange && onChange(this.state.percent);
    }
  };
  // mouseUp
  dragEnd = () => {
    this.canMove = false;
    window.removeEventListener("mousemove", this.drag);
  };
  getLength = e => {
    const { type } = this.props;
    const circle = this.circle.current;
    const bar = this.bar.current;
    let barPos = bar.getBoundingClientRect();
    let circlePos = circle.getBoundingClientRect();

    const BAR_WIDTH = barPos.width;
    const BAR_HEIGHT = barPos.height;
    const CIRCLE_WIDTH = circlePos.width;
    const BAR_LEFT = barPos.left;
    const BAR_TOP = barPos.top;
    const BAR_BOTTOM = barPos.bottom;

    const isHorizon = type === "horizon";
    if (isHorizon) {
      let length = e.clientX - BAR_LEFT;
      if (length < CIRCLE_WIDTH / 2) {
        length = 0;
      } else if (length > BAR_WIDTH - CIRCLE_WIDTH / 2) {
        length = BAR_WIDTH - CIRCLE_WIDTH;
      } else {
        length = length - CIRCLE_WIDTH / 2;
      }
      return { length, percent: getRound((e.clientX - BAR_LEFT) / BAR_WIDTH) };
    } else {
      let length = 0;
      if (e.clientY <= BAR_TOP + CIRCLE_WIDTH / 2) {
        length = BAR_HEIGHT - CIRCLE_WIDTH;
      } else if (
        e.clientY > BAR_TOP + CIRCLE_WIDTH / 2 &&
        e.clientY < BAR_BOTTOM - CIRCLE_WIDTH / 2
      ) {
        length = BAR_BOTTOM - e.clientY - CIRCLE_WIDTH / 2;
      }
      return {
        length,
        percent: 1 - getRound((e.clientY - BAR_TOP) / BAR_HEIGHT)
      };
    }
  };

  render() {
    const { type, className, ...props } = this.props;
    const isHorizon = type === "horizon";
    return (
      <span
        {...props}
        className={`${
          isHorizon ? "wave-time-bar" : "wave-time-bar-vertical"
        } ${className}`}
        ref={this.bar}
        onClick={e => {
          this.canMove = true;
          this.drag(e);
        }}
        onMouseUp={this.dragEnd}
      >
        <span
          className={
            isHorizon ? "wave-progress-bar" : "wave-progress-bar-vertical"
          }
          ref={this.selectedBar}
        />
        <i
          className="wave-time-circle"
          ref={this.circle}
          onMouseDown={this.dragStart}
        />
      </span>
    );
  }
}
Bar.propTypes = {
  type: PropTypes.oneOf(["vertical", "horizon"]),
  onChange: PropTypes.func
};
Bar.defaultProps = {
  type: "horizon"
};
export default Bar;
