# Initial requirements

### Technology
- Client: barcode scanner, chrome, react, redux
- Server: koa, bookshell, postgre, docker, aws
- Source control: github

### Task description

Logistic software require knowledge about barcode scanner and label printer integrated with different 
backend technologies such as web services and databases.

- The user will be using chrome and a barcode code scanner to scan a phone number in code-128, 
via serial port com, to lookup the contact info such as person name

- A web service will be calling to retrieve the contact info from a database packaged in a Docker image hosted on AWS

- The contact should be displayed on the screen and allow user to print directly to a default printer without prompting the printer dialog

# Implementation

App is based on Rangle React-Redux starter
[https://github.com/rangle/react-redux-example](https://github.com/rangle/react-redux-example)

## npm scripts

### Dev
```bash
$ npm install
$ npm run dev
```

This runs a development mode server with live reload etc.

Open `http://localhost:8080` in your browser.

### Production

```bash
npm run build
npm start
```

This runs a production-ready express server that serves up a bundled and
minified version of the client.

Open `http://localhost:8080` in your browser.
