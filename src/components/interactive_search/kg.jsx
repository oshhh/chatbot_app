import React, { Component } from "react";
import { Graph } from "react-d3-graph";

class KG extends Component {
  state = {};
  shouldComponentUpdate(nextProps) {
    // return nextProps.graph !== this.props.graph;
  }
  render() {
    return (
      <Graph
        id="graph-id"
        // data={this.props.graph}
        data={{ nodes: [{ id: "1" }, { id: "2" }], links: [] }}
        config={this.props.config}
        onClickNode={(id, node) => {
          this.props.onClickNode(node);
        }}
      />
    );
  }
}

export default KG;
