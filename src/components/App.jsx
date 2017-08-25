import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import { userIsLoggedIn } from "../session.js";

class Main extends Component {
  constructor () {
    super();
    this.state = {
      isfetchingBootstrapData: true,
      isLoggedIn: null,
      bootstrapData: null,
      login: null,
      logout: null,
      error: null
    };
  }
  componentWillMount() {
    userIsLoggedIn().then(
      bootstrap => {
        if (bootstrap.authenticated) {
          this.setState({
            isfetchingBootstrapData: false,
            isLoggedIn: true,
            bootstrapData: bootstrap,
            logout: bootstrap.doLogout.bind(bootstrap)
          });
        } else {
          this.setState({
            isfetchingBootstrapData: false,
            isLoggedIn: false,
            bootstrapData: bootstrap,
            login: bootstrap.doLogin.bind(bootstrap)
          });
        }
      },
      error => {
        this.setState({
          isfetchingBootstrapData: false,
          isLoggedIn: false,
          bootstrapData: bootstrap,
          error: error
        });
      }
    );
  }
  render () {


    if (this.state.isfetchingBootstrapData) {
      return null;
    } else {

      if (this.state.error) {
        return (<div>There was an error</div>);

      } else if (this.state.isLoggedIn) {
        return (
          <div>Hello
            <b>{this.state.bootstrapData.first_name}</b>
            , you are logged in!
          </div>
        );

      } else {
        setTimeout(this.state.login, 2000);
        return (<div>Your will be redirected to the SSO soon...</div>);
      }
    }
  }
}

export default Main;
