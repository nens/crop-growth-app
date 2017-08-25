const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("./webpack.config");
const express = require("express");
const request = require("request");

const app = new express();
const port = 9000; // Same as lizard-client uses, for SSO server redirects in dev.

var proxy_server;
var headers;

// If we use sso_user and sso_pass environment variables, then proxy to Lizard staging
// where we are always authenticated using those. If not, then proxy to a local Lizard
// running on port 8000, where we have to login.

if (process.env.sso_user) {
  console.log("[*] Got SSO credentials via environment variables:");
  proxy_server = "https://nxt.staging.lizard.net";
  headers = {
    username: process.env.sso_user,
    password: process.env.sso_pass
  };
} else {
  console.log("[*] Did not get SSO credentials...");
  proxy_server = "http://localhost:8000";
  headers = {};
}

console.log("[*] Using proxy server:", proxy_server);

const compiler = webpack(config);
app.use(
  webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  })
);
app.use(
  webpackHotMiddleware(compiler, {
    heartbeat: 10 * 1000
  })
);
app.use(express.static(`${__dirname}/`));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/media", (req, res) => {
  const url = `${proxy_server}/media` + req.url;
  req
    .pipe(
      request({
        url,
        headers
      })
    )
    .pipe(res);
});

app.use("/api", (req, res) => {
  const url = `${proxy_server}/api` + req.url;
  req
    .pipe(
      request({
        url,
        headers
      })
    )
    .pipe(res);
});

app.use("/proxy", (req, res) => {
  // So I heard you like proxies...
  const url = `${proxy_server}/proxy` + req.url;

  // Doesn't need authentication, no headers
  req.pipe(request({ url })).pipe(res);
});

app.use("/bootstrap", (req, res) => {
  // To check user info, whether we are authenticated, etc.
  const url = `${proxy_server}/bootstrap` + req.url;

  req.pipe(request({ url, headers })).pipe(res);
});

// For lizard-auth-client
app.use("/accounts", (req, res) => {
  const url = `${proxy_server}/accounts` + req.url;
  req.pipe(request({ url, headers })).pipe(res);
});
app.use("/sso", (req, res) => {
  const url = `${proxy_server}/sso` + req.url;
  req.pipe(request({ url, headers })).pipe(res);
});

app.listen(port, error => {
  if (error) {
    console.error(error);
  } else {
    console.info(
      "==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.",
      port,
      port
    );
  }
});
