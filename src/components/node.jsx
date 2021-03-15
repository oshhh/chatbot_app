import React, { Component } from "react";

class Node extends Component {
  state = {};
  render() {
    return (
      <div>
        <div className={this.props.node.type_}>
          <div className="nodeText">{this.props.node.text}</div>
        </div>
      </div>
    );
  }
}

export default Node;
