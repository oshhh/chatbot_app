import React, { Component } from "react";
import { ChevronExpand, ChevronContract } from "react-bootstrap-icons";
import "../index.css";

class Message extends Component {
  constructor(props) {
    super(props);
    this.sendOptions = this.sendOptions.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
  }
  state = {
    allowOptionSelect: true,
    expand: false,
    nbrText: "",
  };

  data = {
    options: new Set([]),
  };

  render() {
    let card_class = "messageCard margin " + this.props.message.author;

    let msq = null;
    if (this.props.message.type == "msq") {
      msq = (
        <div>
          <div>
            {this.props.message.options.map((option, index) => (
              <div>
                <input
                  className="margin"
                  type="checkbox"
                  value=""
                  key={`option_${index}`}
                  onChange={() => {
                    this.data.options.has(index + 1)
                      ? this.data.options.delete(index + 1)
                      : this.data.options.add(index + 1);
                  }}
                />
                {index + 1}: {option}
              </div>
            ))}
          </div>
          <div>
            <button
              onClick={this.sendOptions}
              type="button"
              className="btn btn-secondary margin "
              disabled={!this.state.allowOptionSelect}
            >
              Submit
            </button>
          </div>
        </div>
      );
    }
    let expand = null;
    if (this.props.message.type == "answer") {
      if (this.state.expand) {
        expand = (
          <ChevronContract
            onClick={() => this.handleExpand(false)}
            className="margin pull-right"
          />
        );
      } else {
        expand = (
          <ChevronExpand
            onClick={() => this.handleExpand(true)}
            className="margin pull-right"
          />
        );
      }
    }
    return (
      <React.Fragment>
        <div className={this.props.message.author}>
          <div className={card_class}>
            {expand}
            {/* <span className="card-title">{this.props.message.author}:</span> */}
            <span className="card-text">
              {this.props.message.type == "answer"
                ? this.state.expand
                  ? this.state.nbrText
                  : "..." + this.props.message.text + "..."
                : this.props.message.text}
            </span>
            {msq}
          </div>
        </div>
      </React.Fragment>
    );
  }

  sendOptions() {
    this.props.newUserMessage({
      text: `${[...this.data.options]}`,
      author: `user`,
    });
    this.data.options = new Set([]);
    this.setState({ allowOptionSelect: false });
  }

  async handleExpand(expand) {
    this.setState({ expand: expand });
    if (expand && this.state.nbrText == "") {
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          sentence: this.props.message.sentence,
        }),
      };
      let response = await fetch(
        "http://localhost:8080/get_neighbouring_sentences",
        requestOptions
      );
      let data = await response.json();
      this.setState({
        nbrText: data.neighbouring_sentences
          .map((sentence) => sentence.sentence)
          .join("\n"),
      });
    }
  }
}

export default Message;
