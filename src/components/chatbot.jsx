import Message from "./message";
import MessageInputBox from "./messageInputBox";
import React, { Component } from "react";
import { ChatLeftDotsFill } from "react-bootstrap-icons";

class Chatbot extends Component {
  constructor(props) {
    super(props);
    this.newUserMessage = this.newUserMessage.bind(this);
    this.handleMessageAfterStart = this.handleMessageAfterStart.bind(this);
    this.handleMessageAfterTopics = this.handleMessageAfterTopics.bind(this);
    this.handleMessageAfterAnswered = this.handleMessageAfterAnswered.bind(
      this
    );
    this.sendAnswer = this.sendAnswer.bind(this);
    this.askAboutTopics = this.askAboutTopics.bind(this);
  }
  state = {
    messages: [
      {
        text: "Hello! Please enter your question!",
        author: "bot",
      },
    ],
    loading: false,
  };
  data = {
    state: "start",
    query: null,
    topics: [],
    sentences: [],
  };
  render() {
    const typing = this.state.loading ? (
      <ChatLeftDotsFill className="m-2" />
    ) : null;
    return (
      <div className="chatbot">
        <div className="chatScreen">
          <div className="topBar">
            <div className="topBarText">@iiitd_policybot</div>
          </div>
          <div className="window">
            <div className="chat">
              <MessageInputBox key="" newUserMessage={this.newUserMessage} />
              {typing}
              {this.state.messages
                .map((message, idx) => (
                  <Message
                    key={idx}
                    message={message}
                    newUserMessage={this.newUserMessage}
                  />
                ))
                .reverse()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  clearData() {
    this.data = {
      state: "start",
      query: null,
      topics: [],
      sentences: [],
    };
  }

  newUserMessage(message) {
    this.setState({ messages: [...this.state.messages, message] }, () => {
      if (this.data.state == "start") {
        this.handleMessageAfterStart(message);
      } else if (this.data.state == "topics") {
        this.handleMessageAfterTopics(message);
      } else if (this.data.state == "answered") {
        this.handleMessageAfterAnswered(message);
      }
    });
  }
  async handleMessageAfterStart(message) {
    this.setState({ loading: true });
    this.data.query = message.text;
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ query: this.data.query }),
    };
    let response = await fetch(
      "http://localhost:8080/shortlist_sentences",
      requestOptions
    );
    let data = await response.json();
    this.data.sentences = data.sentences;
    this.setState({ loading: false });

    if (this.data.sentences.length <= 3) {
      this.sendAnswer(this.data.sentences);
    } else {
      this.askAboutTopics(this.data.sentences);
    }
  }
  async handleMessageAfterTopics(message) {
    let data = message.text.split(",");
    data = new Set(data.map((x) => parseInt(x)));

    let sentences = this.data.sentences.filter((sentence) => {
      return data.has(this.data.topics.indexOf(sentence.topic) + 1);
    });
    this.data.sentences = sentences;
    if (this.data.sentences.length <= 3) {
      this.sendAnswer();
    } else {
      this.setState({ loading: true }, () => console.log("loading"));
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          query: this.data.query,
          sentences: this.data.sentences,
        }),
      };
      let response = await fetch("http://localhost:8080/mrc", requestOptions);
      let data = await response.json();
      this.data.sentences = data.sentences;
      this.setState({ loading: false });
      this.sendAnswer();
    }
  }
  async handleMessageAfterAnswered(message) {
    if (message.text == "2") {
      this.setState({
        messages: [
          ...this.state.messages,
          {
            text: "Happy to help!",
            author: "bot",
          },
        ],
      });
    } else {
      this.setState({
        messages: [
          ...this.state.messages,
          {
            text: "Please contact the admin department for more information!",
            author: "bot",
          },
        ],
      });
    }
    this.clearData();
  }
  sendAnswer() {
    if (this.data.sentences == 0) {
      this.setState({
        messages: [
          ...this.state.messages,
          {
            text: "I'm sorry, I don't know how to respond to that!",
            author: "bot",
          },
        ],
      });
      this.data.state = "start";
    } else {
      this.setState({
        messages: [
          ...this.state.messages,
          ...this.data.sentences.map((sentence) => {
            return {
              text: sentence.sentence,
              author: "bot",
              type: "answer",
              sentence: sentence,
            };
          }),
          {
            text: "Did you find the answer useful?",
            author: "bot",
            type: "msq",
            options: ["no", "yes"],
          },
        ],
      });
      this.data.state = "answered";
    }
  }

  askAboutTopics() {
    let topics = [
      ...new Set(this.data.sentences.map((sentence) => sentence.topic)),
    ];
    this.data.topics = topics;
    if (this.data.topics.length <= 1) {
      this.handleMessageAfterTopics({
        text: "1",
      });
      return;
    }
    let question = `Which of the following is the question related to:`;
    this.setState({
      messages: [
        ...this.state.messages,
        {
          text: question,
          author: "bot",
          type: "msq",
          options: this.data.topics,
        },
      ],
    });
    this.data.state = "topics";
  }
}

export default Chatbot;
