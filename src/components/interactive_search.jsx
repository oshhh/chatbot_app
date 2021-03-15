import { svg } from "d3";
import React, { Component } from "react";
import { Search, NodePlus } from "react-bootstrap-icons";
import KG from "./kg";
import Node from "./node";

class InteractiveSearch extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getGraph = this.getGraph.bind(this);
    this.getGraphWithNeighbours = this.getGraphWithNeighbours.bind(this);
    this.onClickNode = this.onClickNode.bind(this);
  }
  state = {
    query: "admission",
    graph: {
      nodes: [],
      links: [],
    },
    loading: false,
    selectedNode: null,
  };

  render() {
    this.graph_config = {
      config: {
        height: 0.6 * Math.max(window.innerWidth, window.innerHeight),
        width: 0.6 * Math.max(window.innerWidth, window.innerHeight),
        d3: {
          gravity: (-5000 * 1) / (this.state.graph.nodes.length + 1),
        },
        node: {
          viewGenerator: (node) => {
            return <Node node={node} />;
          },
          renderLabel: false,
          size: 1000,
        },
        link: {
          // renderLabel: true,
          labelProperty: "type",
        },
      },
    };
    return (
      <div>
        <div>
          <input
            type="text"
            value={this.state.query}
            className="messageInputBox margin"
            onChange={this.handleInputChange}
            placeholder="Search"
          />
          <Search
            onClick={() => this.getGraph()}
            type="button"
            className="margin icon"
          />
          <NodePlus
            onClick={() => this.getGraphWithNeighbours()}
            type="button"
            className="margin icon"
          />
        </div>
        <div className="interactiveSearchBody">
          <div className="graph">
            {this.state.graph.nodes.length == 0 ? (
              <div className="kgMessage margin"> Please enter query </div>
            ) : (
              <KG
                graph={this.state.graph}
                config={this.graph_config.config}
                onClickNode={this.onClickNode}
              />
            )}
          </div>
          <div className="infoBox margin">
            <div>
              {this.state.selectedNode ? (
                <div className="infoBoxContent margin">
                  <h4>Selected Node</h4>
                  <Node node={this.state.selectedNode} />
                  <p>
                    <b>Node ID: </b> {this.state.selectedNode.id}
                  </p>
                  <p>
                    <b>Node Type: </b> {this.state.selectedNode.type_}
                  </p>
                  <p>
                    <b>Node Text: </b> {this.state.selectedNode.text}
                  </p>
                  <span>Add its neighbours: </span>
                  <NodePlus
                    onClick={() =>
                      this.getGraphWithNeighbours([this.state.selectedNode])
                    }
                    type="button"
                    className="margin icon"
                  />
                </div>
              ) : (
                <div className="infoBoxContent">Click on a Node</div>
              )}
            </div>
          </div>
          <div className="legend margin">
            <h3>Legend</h3>
            <div className="margin legendRow">
              <Node node={{ text: "Document", type_: "Document" }} />
              <div className="margin">
                This represents a IIITD policy document.
              </div>
            </div>
            <div className="margin legendRow">
              <Node node={{ text: "Topic", type_: "Topic" }} />
              <div className="margin">
                This represents a topic or subtopic present in a IIITD policy
                document.
              </div>
            </div>
            <div className="margin legendRow">
              <Node node={{ text: "Paragraph", type_: "Paragraph" }} />
              <div className="margin">
                This represents a paragraph present in a IIITD policy document.
              </div>
            </div>
            <div className="margin legendRow">
              <Node node={{ text: "Sentence", type_: "Sentence" }} />
              <div className="margin">
                This represents a sentence in a IIITD policy document.
              </div>
            </div>
            <div className="margin legendRow">
              <Node node={{ text: "Token", type_: "ExtEntity" }} />
              <div className="margin">
                This represents a noun phrase in a IIITD policy document.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async getGraph() {
    let requestOptions = {
      method: "POST",
      body: JSON.stringify({
        query: this.state.query,
        threshold: 0,
      }),
    };
    let response = await fetch(
      "http://localhost:8080/get_closest_entities",
      requestOptions
    );
    let data = await response.json();
    this.setState(
      {
        graph: {
          // nodes: this.state.graph.nodes,
          nodes: data["closest_entities"].map((node) => {
            return {
              id: String(node["entity"][0]),
              text: node["entity"][1],
              type_: node["entity"][2],
            };
          }),
          links: [],
        },
      },
      () => console.log(this.state.graph)
    );
    this.getGraphWithNeighbours();
  }

  async getGraphWithNeighbours(nbr_of_nodes = null) {
    if (nbr_of_nodes == null) {
      nbr_of_nodes = this.state.graph.nodes;
    }
    let requestOptions = {
      method: "POST",
      body: JSON.stringify({
        nodes: this.state.graph.nodes.map((node) => parseInt(node.id)),
        nbr_of_nodes: nbr_of_nodes.map((node) => parseInt(node.id)),
      }),
    };
    let response = await fetch(
      "http://localhost:8080/get_graph_with_neighbours",
      requestOptions
    );
    let data = await response.json();
    this.setState(
      {
        graph: {
          nodes: [
            ...new Set(
              data["nodes"].map((node) => {
                return {
                  id: String(node[0]),
                  text: node[1],
                  type_: node[2],
                };
              })
            ),
          ],
          links: data["edges"].map((edge) => {
            return {
              source: String(edge[0]),
              target: String(edge[2]),
              type: edge[1],
            };
          }),
        },
      },
      () => console.log(this.state.graph)
    );
  }

  async onClickNode(node) {
    console.log(node);
    this.setState({ selectedNode: node });
  }

  getLabelOfNode(node) {
    if (node.type == "Paragraph" || node.type == "Sentence") {
      return node.text.slice(0, 15) + "...";
    } else if (node.type == "Extraction") {
      return "Extraction";
    } else {
      return node.text;
    }
  }

  handleInputChange(event) {
    this.setState({ query: event.target.value });
  }
}

export default InteractiveSearch;
