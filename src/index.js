import { AppContainer } from "react-hot-loader";
import { HashRouter as Router, Route, Link } from "react-router-dom";
import App from "./components/App";
import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(
  <AppContainer>
    <Router basename="/">
      <Route exact path="/" component={App} />
    </Router>
  </AppContainer>,
  document.getElementById("root")
);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept();
}
