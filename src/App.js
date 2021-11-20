import React from 'react';
import * as utils from './functions.js';

var audioMixer = new Audio();

class IntroText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: utils.is_mobile(),
      isAnimated: false,
    };
    this.animateOn = this.animateOn.bind(this);
    this.animateOff = this.animateOff.bind(this);
    this.playSound = this.playSound.bind(this);
  }

  componentDidMount() {
    setTimeout(() => (this.playSound()), 200);
    this.setState({isAnimated: true});
  }

  animateOn() {
    this.setState({isAnimated: true});
  }

  animateOff() {
    this.setState({isAnimated: false});
  }

  playSound() {
    audioMixer.src = `./sounds/${this.props.word}.mp3`;
    audioMixer.load();
    const playPromise = audioMixer.play();
    if (playPromise !== undefined) {
      playPromise
        .catch(() => {
          console.log("Playback prevented by the browser.");
        });
    }
  }

  render() {
  let pageMessage = (this.state.isMobile) ? 'Tap' : 'Click';
  let pageIcon = (this.state.isMobile) ? "fas fa-fingerprint" : "fa fa-mouse-pointer";
  return (
    <label className="text-intro-box" >
      <p className={`intro-text ${(this.state.isAnimated) ? 'emphasize' : ''}`} 
        onClick={() => {this.animateOn(); this.playSound();}} onAnimationEnd={this.animateOff}>{this.props.word}</p>
      <div className="continue"><i className={`continue-icon ${pageIcon}`}></i> {pageMessage} anywhere</div>
    </label>
    )
  }
}


function IntroImage(props) {
  var imgLink = `./images/${props.word}.png`;
  return (
    <div className={`intro-img-box ${props.imageAnimation}`}>
      <img className="intro-img" src={imgLink} alt={props.word} />
    </div>
    )
}


class TextOptionBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      animationClass: "",
      numberStyle: "",
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setState({
      animationClass: "", numberStyle: "",
    });
  }

  handleClick() {
    if (this.props.isCorrect === true) {
      if (this.state.animationClass === "") {
        audioMixer.src = "./sounds/correct.mp3";
        audioMixer.load();
        audioMixer.play();
        this.setState({
          animationClass: "correct-answer",
          numberStyle: "correct-number"});
        setTimeout(() => {
          this.props.animateImg();
          audioMixer.src = `./sounds/${this.props.word}.mp3`;
          audioMixer.load();
          audioMixer.play();
          }, 1000)
        setTimeout(() =>
          this.props.click(), 2000)
      }
    }
    else {
      if (this.state.animationClass === "") {
        this.props.incorrect();
        audioMixer.src = "./sounds/incorrect.mp3";
        audioMixer.load();
        audioMixer.play();
        this.setState({
          animationClass: "incorrect-answer",
          numberStyle: "incorrect-number"});
        }
    };
  }

  render() {
    return (
      <label 
        className={`text-option ${this.state.animationClass}`}
        key={this.props.number} onClick={this.handleClick}>
          <NumberBox number={this.props.number} style={this.state.numberStyle} />
          <div className="option-text">
            {this.props.word}
          </div>
      </label>
    )
  }
}


class TextOptions extends React.Component {
  constructor(props) {
    super(props);
    this.getRandomOptions = this.getRandomOptions.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (nextProps.key !== this.props.key)
  }
  
  getRandomOptions(allOptions, correctOption, number) {
    let allOptionsCopy = [...allOptions];
    let options = [];

    // Maximum four options.
    if (number > 4) {
      number = 4;
    }

    // Push the correct answer.
    options.push(correctOption);
    allOptionsCopy.splice(allOptionsCopy.indexOf(correctOption), 1);

    // Push the incorrect answers.
    for (let i = 0; i < number - 1; i++) {
        let randomIndex = Math.floor(Math.random() * allOptionsCopy.length);
        options.push(allOptionsCopy[randomIndex]);
        allOptionsCopy.splice(randomIndex, 1);
      }
    
    // Shuffle and set the option indexes.
    utils.shuffle(options);
    options = options.map((vocab, index) => {
      return <TextOptionBox 
        isCorrect={vocab === correctOption} word={vocab} number={index + 1}
        key={index + 1} click={this.props.click} incorrect={this.props.incorrect}
        animateImg={this.props.animateImg} />
      }
    )
    return [...options];
  }

  render() {
    let randomOptions = this.getRandomOptions(
      this.props.allWords, this.props.word, this.props.allWords.length);
    return (
      <div className="text-options">
          {randomOptions}
      </div>
    )
  }
}


function NumberBox(props) {
  return (
    <div className={`number-box ${props.style}`}>
      {props.number}
    </div>
  )
}


class IntroduceWord extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      randomLayout: Math.random()
    };
  }
  
  handleClick(elem){
    if (!/^intro-text/.test(elem.target.className)) {
    this.props.click()
    }
  }  

  render() {
    let introImage = <IntroImage word={this.props.word} />;
    let introText = <IntroText word={this.props.word} />;
    return (
      (this.state.randomLayout >= .50 && window.innerWidth > 480) ?
      <div className="intro-word container-fluid" onClick={(elem) => this.handleClick(elem)} >
         {introText}
         {introImage}
      </div>
      :
      <div className="intro-word container-fluid" onClick={(elem) => this.handleClick(elem)} >
         {introImage}
         {introText}
      </div>
    )
  }
}


class AskFromPicture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageAnimation: "",
      randomLayout: Math.random()
    };
  }

  toggleImgAnimation() {
    this.setState({imageAnimation: "emphasize"})
  };

  render() {
    let {word, allWords, click, incorrect} = this.props;
    let introImage = <IntroImage word={word} imageAnimation={this.state.imageAnimation} />
    let textOptions = <TextOptions
      allWords={allWords} word={word} click={click} incorrect={incorrect} animateImg={this.toggleImgAnimation.bind(this)} />
    return (
      (this.state.randomLayout >= .25 && window.innerWidth > 480) ?
        <div className="ask-from-picture container-fluid" >
          {textOptions}
          {introImage}
        </div>
        :
        <div className="ask-from-picture container-fluid" >
          {introImage}
          {textOptions}
        </div> 
    )
  }
}


class MainQuestionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pagesToGo: this.generate_pages(this.props.words),
    };
    this.generate_pages = this.generate_pages.bind(this);
    this.handleIncorrect = this.handleIncorrect.bind(this);     
    }

  generate_pages(words) {
    function disperse_questions(array, self) {
      let copyArray = [...array];
      let randomRange = 0;
      for (let i = 0; i < array.length; i++) {
        randomRange = Math.random();
        randomRange = (randomRange < .05) ? 1 : (randomRange < .20) ? 3 : 2;
        copyArray.splice(
          copyArray.indexOf(array[i]) + randomRange, 0, 
          <AskFromPicture 
            allWords={words} word={words[i]} click={self.props.click}
            key={i + array.length} incorrect={self.handleIncorrect.bind(self) } />
        );
      }
      return copyArray;
    }

    let pages = [];
    for (let i = 0; i < words.length; i++) {
        pages.push(<IntroduceWord word={words[i]} click={this.props.click} key={i} />);
        }
      pages = disperse_questions(pages, this);
    return [...pages];
  }

  handleIncorrect() {
    let restOfArray =  this.state.pagesToGo.slice(this.props.page + 1);
    let currentPage = this.state.pagesToGo[this.props.page];
    for (let i = 0; i < restOfArray.length; i++) {
      if (restOfArray[i].props.word === currentPage.props.word) {
        return null
      }
    }
    let repeatPage = <AskFromPicture 
      allWords={this.props.words} word={currentPage.props.word} click={this.props.click}
      key={this.state.pagesToGo.length + 1} incorrect={this.handleIncorrect.bind(this) } />

    let copyPages = [...this.state.pagesToGo];
    copyPages.splice(copyPages.indexOf(currentPage) + utils.randint(2, 4), 0, repeatPage);
    this.setState({pagesToGo: copyPages});
  }

  render() {
    return (
      <div className={`main-page ${this.props.animation}`}>
        {this.state.pagesToGo[this.props.page]}
      </div>
      )
    }
}

export default MainQuestionPage;
