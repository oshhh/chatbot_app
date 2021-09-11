import React, { Component } from "react";
import Chatbot from "./chatbot/chatbot";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import "../stylesheets/app.css";
import InteractiveSearch from "./interactive_search/interactiveSearch";
import { Route, Switch, Redirect, BrowserRouter } from 'react-router-dom';

class App extends Component {
  state = {};
  render() {
    return (
      <div>
        <header>
          <div>Policy Chatbot of IIITD</div>
        </header>
        <BrowserRouter>
          <Switch>
            <Route exact path="/chatbot" component={Chatbot} />
            <Route exact path="/">
              <Redirect to="/chatbot" />
            </Route>
            <Route exact path="/interactivesearch" component={InteractiveSearch} />
          </Switch>
        </BrowserRouter>
      </div>
      
    );
  }
}

export default App;
