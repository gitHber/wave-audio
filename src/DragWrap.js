/**
 * 2019-02-25
 * author: 李坤
 */
import React from "react";
import PropTypes from "prop-types";

class DragWrap extends React.Component {
  container = React.createRef();
  canMove = false;
  dragStart = e => {
    this.canMove = true;
    window.addEventListener("mousemove", this.drag);
    window.addEventListener("mouseup", this.dragEnd);
  };
  drag = e => {
    const container = this.container.current;
    if (this.canMove && this.props.draggable) {
      container.style.top = parseInt(container.style.top) + e.movementY + "px";
      container.style.left =
        parseInt(container.style.left) + e.movementX + "px";
    }
  };
  dragEnd = () => {
    this.canMove = false;
    window.removeEventListener("mousemove", this.drag);
  };
  render() {
    const { draggable, style, children, ...props } = this.props;
    return (
      <div
        {...props}
        ref={this.container}
        style={{
          top: 0,
          left: 0,
          position: "absolute",
          ...style
        }}
        onMouseDown={this.dragStart}
      >
        {children}
      </div>
    );
  }
}
DragWrap.propTypes = {
  draggable: PropTypes.bool
};
DragWrap.defaultProps = {
  draggable: true
};
export default DragWrap;
