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
    neighbouring_sentences: [],
    document: {
      name: "",
      source: "",
    },
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
    let expand_button = null;
    if (this.props.message.type == "answer") {
      if (this.state.expand) {
        expand_button = (
          <ChevronContract
            onClick={() => this.handleExpand(false)}
            className="margin pull-right"
          />
        );
      } else {
        expand_button = (
          <ChevronExpand
            onClick={() => this.handleExpand(true)}
            className="margin pull-right"
          />
        );
      }
    }
    let message_body = null;
    if (this.props.message.type == "answer" && this.state.expand) {
      message_body = (
        <div>
          <p>
            {this.state.neighbouring_sentences.map((sentence) => {
              if (sentence.s_id == this.props.message.sentence.s_id) {
                return (
                  <span>
                    <b>{sentence.sentence} </b>
                  </span>
                );
              } else {
                return <span>{sentence.sentence} </span>;
              }
            })}
          </p>
          <div className="answerSource">
            <span>Source: </span>
            <a href={this.state.document.source}>{this.state.document.name}</a>
          </div>
        </div>
      );
    } else {
      message_body = (
        <p>
          {this.props.message.type == "answer"
            ? "..." + this.props.message.text + "..."
            : this.props.message.text}
        </p>
      );
    }
    return (
      <React.Fragment>
        <div className={this.props.message.author}>
          <div className={card_class}>
            {expand_button}
            {message_body}
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
    console.log(this.state.neighbouring_sentences);
    if (expand && this.state.neighbouring_sentences.length == 0) {
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          sentence: this.props.message.sentence,
        }),
      };
      let response = await fetch(
        "http://localhost:8080/get_sentence_details",
        requestOptions
      );
      let data = await response.json();
      this.setState({
        neighbouring_sentences: data.neighbouring_sentences,
        document: data.document,
      });
      console.log(data);
    }
  }
}

export default Message;
