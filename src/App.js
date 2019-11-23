import React, { Component } from 'react';
import './App.css';
import { fire } from './shared/Firebase';

import { Login } from "./components/Login/Login.js";
import { Quit } from "./components/Quit/Quit.js";
import { ChatRoom } from "./components/ChatRoom/ChatRoom.js";
import { LeftSideBar } from "./components/LeftSideBar/LeftSideBar.js";
import { RightSideBar } from "./components/RightSideBar/RightSideBar.js";

class App extends Component{
  extension = '.json';

  constructor(props) {
    super(props);
    fire();
    this.state = {
      // Login State
      login: false,
      userId: null,
      repeat: null,

      // Check the conversation status
      end: false,
      start: false,
      quit: false,
      topicPath: '',
      
      // Control the requirementList
      requirementList: [],
      requirement: [],

      // Control each button's disabled status
      endButtonStatus: false,
      nextButtonStatus: false,
    };
    this.changeLoginState = this.changeLoginState.bind(this);
    this.setStateRequirment = this.setStateRequirment.bind(this);
    this.requirementListConvey = this.requirementListConvey.bind(this);
    this.initializeRequirementList = this.initializeRequirementList.bind(this);
    this.controlEndButtonStatus = this.controlEndButtonStatus.bind(this);
    this.controlNextButtonStatus = this.controlNextButtonStatus.bind(this);
    this.controlEndStatus = this.controlEndStatus.bind(this);
    this.controlStartStatus = this.controlStartStatus.bind(this);
    this.controlQuitStatus = this.controlQuitStatus.bind(this);
  }

  // Control the login state
  changeLoginState = (userId, repeat) => {
    this.setState({
      login: true,
      userId: userId,
      repeat: repeat,
    })
  }

  // Contorl the requirement
  setStateRequirment = (requirement) => {
    this.setState({
        requirement: requirement
    })
  }

  requirementListConvey = (requirementList) => {
    this.setState({
      requirementList: requirementList
    })
  }

  initializeRequirementList = () => {
    this.setState({
      requirementList: [],
    })
  }

  // Control the 'endButtonStatus'
  controlEndButtonStatus = () => {
    this.setState(prevState => ({
      endButtonStatus: !prevState.endButtonStatus,
    }));
  }

  // Control the 'endButtonStatus'
  blockEndButtonStatus = () => {
    this.setState({
      endButtonStatus: false,
    })
  }

  // Control the 'endButtonStatus'
  unblockEndButtonStatus = () => {
    this.setState({
      endButtonStatus: true,
    })
  }

  // Control the 'nextButtonStatus'
  controlNextButtonStatus = () => {
    this.setState(prevState => ({
      nextButtonStatus: !prevState.nextButtonStatus,
    }));
  }

  // When each conversation is ended, this function can check the status
  controlEndStatus = () => {
    this.setState(prevState => ({
      end: !prevState.end,
    }));
  }

  // When each conversation is started, this function can check the status
  controlStartStatus = () => {
    this.setState(prevState => ({
      start: !prevState.start
    }));
  }

  // When each conversation is started, this function can check the status
  controlQuitStatus = () => {
    this.setState({
      quit: true,
    })
  }

  render(){
    const { login, quit, end, start, endButtonStatus, nextButtonStatus, requirement, requirementList, userId, repeat } = this.state;
    const { changeLoginState, controlEndButtonStatus, initializeRequirementList, blockEndButtonStatus, unblockEndButtonStatus,
      controlNextButtonStatus, controlEndStatus, controlStartStatus, setStateRequirment, requirementListConvey, controlQuitStatus } = this;
    
    return (
      <div className="backGround">
        { login ? null : <Login changeLoginState={changeLoginState}/>}
        { quit ? <Quit/> : null }
        <div className="leftSideBar">
          <LeftSideBar 
            requirement={requirement}
            initializeRequirementList={initializeRequirementList}
            end={end}
            start={start}
            requirementList={requirementList}
          />
        </div>
        <main className="chatGrid chatStyle">
          <ChatRoom
            userId={userId}
            repeat={repeat}
            end={end}
            start={start}
            requirementListConvey={requirementListConvey}
            blockEndButtonStatus={blockEndButtonStatus}
            unblockEndButtonStatus={unblockEndButtonStatus}
            controlEndButtonStatus={controlEndButtonStatus}
            controlEndStatus={controlEndStatus}
            controlStartStatus={controlStartStatus}
            setStateRequirment={setStateRequirment}
            controlNextButtonStatus={controlNextButtonStatus}
          />
        </main>
        <div className="rightSideBar">
          <RightSideBar
            userId={userId}
            repeat={repeat}
            endButtonStatus={endButtonStatus}
            nextButtonStatus={nextButtonStatus}
            controlEndButtonStatus={controlEndButtonStatus}
            controlNextButtonStatus={controlNextButtonStatus}
            controlEndStatus={controlEndStatus} 
            controlStartStatus={controlStartStatus}
            controlQuitStatus={controlQuitStatus}
          />
        </div>
      </div>
    );
  }
}

export default App;
