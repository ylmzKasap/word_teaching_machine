import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './App.css'
import 'bootstrap/dist/css/bootstrap.css';

class NavBar extends React.Component {
  render() {
    return (
      <div className="navbar sticky-top navbar-dark bg-dark">
        <i className="fas fa-arrow-left arrow" onClick={this.props.goBack}></i>
        <i className="fas fa-arrow-right arrow" onClick={this.props.goBack}></i>
        {/** <a className="navbar-brand" href="#">navigasyon çubuğu</a> */}
      </div>
    )
  }
}

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childPage: 0,
      childAnimation: "load-page"
      };
    this.handleClick = this.handleClick.bind(this);
    this.goBack = this.goBack.bind(this);   
  }

  goBack() {
    if (this.state.childPage > 0) {
      this.setState(state => (
        {childPage: 
          state.childPage - 1,
        childAnimation: (
          state.childAnimation === 'load-page') ? 'load-page-2' : 'load-page'}
        )
      )
    };
  }

  handleClick() {
    this.setState((state) => (
      {childAnimation: 
        (state.childAnimation === "load-page") ? 'load-page-2' : 'load-page',
      childPage:
        state.childPage + 1}
      )
    )
  }

  render() {
    return (
      <div className="main-app">
        <NavBar goBack={this.goBack.bind(this)} />
        <App 
          words={words} page={this.state.childPage}
          click={this.handleClick} animation={this.state.childAnimation} />
      </div>
    )
  }
}

var words = [
  'natural', 'coffee table' //, 'curtain', 'carpet', "sock",
  //'skirt', 'pillow', 'blanket', 'ladle', 'strainer', 'roof', 'elevator', 'stair'
]

ReactDOM.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
  document.getElementById('main-app')
);