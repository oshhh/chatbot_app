import React, { Component } from "react";
import { Graph } from "react-d3-graph";

class KnowledgeGraph extends Component {
  state = {
    data: {
      nodes: [{ id: "Harry" }, { id: "Sally" }, { id: "Alice" }],
      links: [
        { source: "Harry", target: "Sally" },
        { source: "Harry", target: "Alice" },
      ],
    },
  };
  render() {
    return (
      <Graph
        id="kg" // id is mandatory
        data={this.state.data}
        config={{
          nodeHighlightBehavior: true,
          node: {
            color: "lightgreen",
            size: 300,
            highlightStrokeColor: "blue",
          },
          link: {
            highlightColor: "lightblue",
          },
        }}
        onClickNode={this.onClickNode}
        onClickLink={this.onClickLink}
      />
    );
  }

  onClickNode() {
    console.log("node clicked");
  }
  onClickLink() {
    console.log("link clicked");
  }
}

export default KnowledgeGraph;
