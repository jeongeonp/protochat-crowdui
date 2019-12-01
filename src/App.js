import React, { Component } from 'react';
import './App.css';
import { fire } from './shared/Firebase';

import { Login } from "./components/Login/Login.js";
import { ChatRoom } from "./components/ChatRoom/ChatRoom.js";
import { LeftSideBar } from "./components/LeftSideBar/LeftSideBar.js";
import { RightSideBar } from "./components/RightSideBar/RightSideBar.js";

class App extends Component{
  extension = '.json';

  constructor(props) {
    super(props);
    fire();
    this.state = {
      // Experiment Condition
      otherResponse: true,
      numSession: 1,

      // Login State
      login: false,
      userId: null,
      condition: null,

      // Check the conversation status
      end: false,
      start: false,
      topicPath: '',
      
      // Control the requirementList
      requirementList: [],
      requirement: [],

      // Control each button's disabled status
      endButtonStatus: false,
      nextButtonStatus: false,
    };
    this.getURLParams = this.getURLParams.bind(this);
    this.changeLoginState = this.changeLoginState.bind(this);
    this.setStateRequirment = this.setStateRequirment.bind(this);
    this.requirementListConvey = this.requirementListConvey.bind(this);
    this.initializeRequirementList = this.initializeRequirementList.bind(this);
    this.controlEndButtonStatus = this.controlEndButtonStatus.bind(this);
    this.controlNextButtonStatus = this.controlNextButtonStatus.bind(this);
    this.controlEndStatus = this.controlEndStatus.bind(this);
    this.controlStartStatus = this.controlStartStatus.bind(this);
  }

  componentDidMount() {
    const otherResponse = Boolean(this.getURLParams('otherResponse'));
    const numSession = parseInt(this.getURLParams('numSession'));
    console.log(otherResponse, numSession)
    this.setState({
      otherResponse: otherResponse,
      numSession: numSession,
    })
  }

  // Get parameters from URL
  getURLParams = (param) => {
    const PageURL = window.location.href;
    const f_PageURL = PageURL.split('?');
    const s_PageURL = f_PageURL[1]
    var sURLVariables = s_PageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == param) 
      {
        return sParameterName[1]
      }
    }
  }

  // Control the login state
  changeLoginState = (userId, condition) => {
    this.setState({
      login: true,
      userId: userId,
      condition: condition,
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

  render(){
    const { login, end, start, endButtonStatus, nextButtonStatus, requirement, requirementList, userId } = this.state;
    const { changeLoginState, controlEndButtonStatus, initializeRequirementList, blockEndButtonStatus, unblockEndButtonStatus,
      controlNextButtonStatus, controlEndStatus, controlStartStatus, setStateRequirment, requirementListConvey } = this;
    
    return (
      <div className="backGround">
        { login ? null : <Login changeLoginState={changeLoginState}/>}
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
            endButtonStatus={endButtonStatus}
            nextButtonStatus={nextButtonStatus}
            controlEndButtonStatus={controlEndButtonStatus}
            controlNextButtonStatus={controlNextButtonStatus}
            controlEndStatus={controlEndStatus} 
            controlStartStatus={controlStartStatus}
          />
        </div>
      </div>
    );
  }
}

export default App;
