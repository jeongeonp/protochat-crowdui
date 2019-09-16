import React, { Component } from 'react';
import './App.css';
import { fire } from './shared/Firebase';

import { ChatRoom } from "./components/ChatRoom/ChatRoom.js";
import { LeftSideBar } from "./components/LeftSideBar/LeftSideBar.js";
import { RightSideBar } from "./components/RightSideBar/RightSideBar.js";

const databaseURL = "https://protobot-rawdata.firebaseio.com/";

const GENDER = {
  M: 'MALE',
  F: 'FEMALE',
  NB: 'NON_BINARY',
  null: 'NULL'
}

class App extends Component{
  extension = '.json';

  constructor(props) {
    super(props);
    fire();
    this.state = {
      // User State
      userId: '',

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
    this.setStateRequirment = this.setStateRequirment.bind(this);
    this.requirementListConvey = this.requirementListConvey.bind(this);
    this.initializeRequirementList = this.initializeRequirementList.bind(this);
    this.controlEndButtonStatus = this.controlEndButtonStatus.bind(this);
    this.controlNextButtonStatus = this.controlNextButtonStatus.bind(this);
    this.controlEndStatus = this.controlEndStatus.bind(this);
    this.controlStartStatus = this.controlStartStatus.bind(this);
  }

  componentDidMount() {
    const newUser = {timestamp: new Date(), name: 'Nyoungwoo',gender: GENDER.M, age: '25'}
    this._userPost(newUser);
  }

  _userPost(user) {
    return fetch(`${databaseURL}`+'/users/data.json', {
        method: 'POST',
        body: JSON.stringify(user)
    }).then(res => {
        if(res.status !== 200) {
            throw new Error(res.statusText);
        }
        return res.json();
    }).then(data => {
      this.setState({
        userId: data.name
      })
    });
  }

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
    const { end, start, endButtonStatus, nextButtonStatus, requirement, requirementList } = this.state;
    const { controlEndButtonStatus, initializeRequirementList, blockEndButtonStatus, unblockEndButtonStatus,
      controlNextButtonStatus, controlEndStatus, controlStartStatus, setStateRequirment, requirementListConvey } = this;
    
    return (
      <div class="backGround">
        <div class="leftSideBar">
          <LeftSideBar 
            requirement={requirement}
            initializeRequirementList={initializeRequirementList}
            end={end}
            start={start}
            requirementList={requirementList}
          />
        </div>
        <main class="chatGrid chatStyle">
          <ChatRoom 
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
        <div class="rightSideBar">
          <RightSideBar 
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
