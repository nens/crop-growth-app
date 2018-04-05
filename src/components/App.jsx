import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

// 05-04-2018: See comment in imported file
// import { userIsLoggedIn } from "../session.js";
import { AppPrivate } from "./AppPrivate.jsx";

class Main extends Component {
  // constructor () {
  //   super();
  //   this.state = {
  //     isfetchingBootstrapData: true,
  //     isLoggedIn: null,
  //     bootstrapData: null,
  //     login: null,
  //     logout: null,
  //     error: null
  //   };
  // }
  //componentWillMount() {
    // userIsLoggedIn().then(
    //   bootstrap => {
    //     if (bootstrap.authenticated) {
    //       this.setState({
    //         isfetchingBootstrapData: false,
    //         isLoggedIn: true,
    //         bootstrapData: bootstrap,
    //         logout: bootstrap.doLogout.bind(bootstrap)
    //       });
    //     } else {
    //       this.setState({
    //         isfetchingBootstrapData: false,
    //         isLoggedIn: false,
    //         bootstrapData: bootstrap,
    //         login: bootstrap.doLogin.bind(bootstrap)
    //       });
    //     }
    //   },
    //   error => {
    //     this.setState({
    //       isfetchingBootstrapData: false,
    //       isLoggedIn: false,
    //       bootstrapData: bootstrap,
    //       error: error
    //     });
    //   }
    // );
  //}
  render () {
    return <AppPrivate firstName="Anonymous" />;
    // if (this.state.isfetchingBootstrapData) {
    //   return null;
    // } else {
    //   if (this.state.error) {
    //     return <div>There was an error</div>;
    //   } else if (this.state.isLoggedIn) {
    //     return <AppPrivate firstName={this.state.bootstrapData.first_name} />
    //   } else {
    //     // TODO: auto-redirect to SSO when not logged in......
    //     return (<div>Your will be redirected to the SSO soon...</div>);
    //   }
    // }
  }
}

export default Main;
