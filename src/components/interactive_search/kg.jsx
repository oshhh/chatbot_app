import React, { Component } from "react";
import { Graph } from "react-d3-graph";

class KG extends Component {
  state = {};
  shouldComponentUpdate(nextProps) {
    return nextProps.graph !== this.props.graph;
  }
  render() {
    return (
      <div>
      <Graph
        id="graph-id"
        data={this.props.graph}
        config={this.props.config}
        onClickNode={this.props.onClickNode}
      />
      </div>
    );
  }
}

export default KG;
