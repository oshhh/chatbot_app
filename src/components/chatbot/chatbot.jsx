import Message from "./message";
import MessageInputBox from "./messageInputBox";
import React, { Component } from "react";
import { ChatLeftDotsFill } from "react-bootstrap-icons";
import "../../stylesheets/chatbot.css";

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
    answerChosen: 0,
    topics: [],
    sentences: [],
  };
  render() {
    let typing = this.state.loading ? (
      <ChatLeftDotsFill className="m-2" />
    ) : null;
    // console.log(this.state.loading);
    // console.log(typing);
    // console.log(this.state.messages);
    let inputBox = (<MessageInputBox key = "" newUserMessage={this.newUserMessage} />);
    if(this.state.messages[this.state.messages.length - 1].type == "msq"){
      inputBox = null;
    }else{
      inputBox = (<MessageInputBox key = "" newUserMessage={this.newUserMessage} />);
    }
    return (
      <div className="chatbot">
        <div className="chatScreen">
          <div className="topBar">
            <div className="topBarText">@iiitd_policybot</div>
          </div>
          <div className="window">
            <div className="chat">
              {inputBox}
              {/* {console.log(this.state.messages)} */}
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
      answerChosen: 0,
      topics: [],
      sentences: [],
    };
  }

  removeAnswerFromData() {
    if (this.data.topics.length > 0){
      this.data.topics.splice(this.data.answerChosen, 1);
    }
    this.data.sentences.splice(this.data.answerChosen, 1);
    console.log(this.data);
    
  }

  newUserMessage(message) {
    this.setState({ messages: [...this.state.messages, message] }, () => {
      if (this.data.state === "start") {
        this.handleMessageAfterStart(message);
      } else if (this.data.state === "topics") {
        this.handleMessageAfterTopics(message);
      } else if (this.data.state === "answered") {
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
      "http://localhost:8080/get_answer",
      requestOptions
    );
    let data = await response.json();
    this.data.sentences = data.sentences;
    this.setState({ loading: false });

    // if (this.data.sentences.length <= 3) {
    this.sendAnswer(this.data.sentences);
    // this.askAboutTopics(this.data.sentences);
    // } else {
    //   this.askAboutTopics(this.data.sentences);
    // }
  }
  handleMessageAfterTopics(message) {
    let data = message.text.split(",");
    data = new Set(data.map((x) => parseInt(x)));
    
    this.data.answerChosen = data.values().next().value-1;
    this.sendAnswer();
    // this.data.sentences = sentences;
    // if (this.data.sentences.length <= 3) {
    //   this.sendAnswer();
    // } else {
    //   this.setState({ loading: true }, () => console.log("loading"));
    //   const requestOptions = {
    //     method: "POST",
    //     body: JSON.stringify({
    //       query: this.data.query,
    //       sentences: this.data.sentences,
    //     }),
    //   };
    //   let response = await fetch("http://localhost:8080/mrc", requestOptions);
    //   let data = await response.json();
    //   this.data.sentences = data.sentences;
    //   this.setState({ loading: false });
    //   this.sendAnswer();
    // }
  }

  displayAllAnswers(){
    this.setState({
      messages: [
        ...this.state.messages,
        ...this.data.sentences.map((sentence) => {
          return {
            text: sentence.sentence,
            author: 'bot',
            type: 'answer',
            sentence: sentence,
          };
        }),
      ]
    },);
  }

  async handleMessageAfterAnswered(message) {
    this.state.messages.pop();
    console.log(this.state.messages);
    if (message.text == "Yes") {
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
      if (this.data.sentences.length > 0){
        this.displayAllAnswers();
      }else{
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
    }
    this.clearData();
  }

  sendAnswer() {
    console.log(this.data.sentences)
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
      // console.log(this.data.sentences)
      this.setState({
        messages: [
          ...this.state.messages,          
            {
              text: this.data.sentences[this.data.answerChosen].sentence,
              author: "bot",
              type: "answer",
              sentence: this.data.sentences[this.data.answerChosen],
            },
          {
            text: "Did you find the answer useful?",
            author: "bot",
            type: "msq",
            options: ["No", "Yes"],
          },
        ],
      });
      console.log("Reached and answer removed hopefully!");
      this.removeAnswerFromData();
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
