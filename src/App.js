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
      // Experiment Condition
      otherResponse: null,
      deployedVersion: null,
      domainId: null,

      // Login State
      login: false,
      userId: null,

      // Check the conversation status
      end: false,
      start: false,
      quit: false,
      topicPath: '',

      // Control the requirementList
      requirementList: [],
      requirement: [],
      topicPathList: [],
      topicTransitionList: [],
      nextTopicOnList: [],
      possibleNextTopics: [],

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
    this.controlQuitStatus = this.controlQuitStatus.bind(this);
    this.topicPathListConvey = this.topicPathListConvey.bind(this);
    this.initializeTopicPathList = this.initializeTopicPathList.bind(this);
    this.topicTransitionConvey = this.topicTransitionConvey.bind(this);
    this.getNextTopicOnList = this.getNextTopicOnList.bind(this);
    this.setNextTopicOnList = this.setNextTopicOnList.bind(this);
    this.setPossibleNextTopics = this.setPossibleNextTopics.bind(this);
  }

  componentDidMount() {
    const otherResponse = true /*(this.getURLParams('otherResponse') === 'true')*/
    const deployedVersion = this.getURLParams('deployedVersion')
    const domainId = this.getURLParams('domain')

    if(otherResponse && deployedVersion && domainId){
      this.setState({
        otherResponse: otherResponse,
        deployedVersion: deployedVersion,
        domainId: domainId,
      })
    }

    //Enable to see a list of newly added Utterances
    /*
    fetch(`${'https://protobot-rawdata.firebaseio.com/utterances/new-data'}.json`).then(res => {
      if(res.status !== 200) {
        throw new Error(res.statusText);
      }
      return res.json();
      
    }).then((newData) => {
      //this.setState({new_utterances: newData})
      const filtered_utterance = [];
      for (const i in newData) {
        if (newData[i].version === this.state.deployedVersion) {
          filtered_utterance.push({
            utteranceID: i,
            utterance: newData[i].text
          })
        }
      }
      console.log(filtered_utterance)
      
    });
    */
  }

  // Get parameters from URL
  getURLParams = (param) => {
    const PageURL = window.location.href;
    const s = '?'
    if (PageURL.indexOf(s) !== -1){
      const f_PageURL = PageURL.split('?');
      const s_PageURL = f_PageURL[1]
      var sURLVariables = s_PageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++)
      {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === param)
        {
          return sParameterName[1]
        }
      }
    }
  }

  // Control the login state
  changeLoginState = ( userId ) => {
    this.setState({
      login: true,
      userId: userId,
    })
  }

  // Control the requirement
  setStateRequirment = (requirement) => {
    this.setState({
        requirement: requirement
    })
    this.getNextTopicOnList(requirement)
  }

  getNextTopicOnList = (requirement) => {
    //console.log(this.state.requirementList)
    //console.log(requirement)
    this.setNextTopicOnList([])
    var allEndNodes = []
    this.state.topicTransitionList.map((transition) => {
      if (transition.startNode === requirement.topic) {
        // FIXME: get choice from userBranchButton and set nextTopicOnList
        var endNodes = this.state.requirementList.filter((re)=>(transition.endNode === re.topic))
        allEndNodes.push(endNodes[0])
        //console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$")
        //console.log(endNodes[0])
        this.setNextTopicOnList(endNodes[0])
      }
    })
    //console.log(allEndNodes)
    this.setPossibleNextTopics(allEndNodes)
  }

  setPossibleNextTopics = (topics) => {
    this.setState({
      possibleNextTopics: topics
    })
    
  }

  setNextTopicOnList = (selected) => {
    //TODO: Get requirement from requirement.text
    this.setState({
        nextTopicOnList: selected
    })
  }

  requirementListConvey = (requirementList) => {
    this.setState({
      requirementList: requirementList
    })
  }

  topicPathListConvey = (topicPathList) => {
    this.setState({
      topicPathList: topicPathList
    })
  }

  topicTransitionConvey = (topicTransitionList) => {
    this.setState({
      topicTransitionList: topicTransitionList
    })
  }

  initializeRequirementList = () => {
    this.setState({
      requirementList: [],
    })
    console.log("initializing requirementList")
  }

  initializeTopicPathList = () => {
    this.setState({
      topicPathList: [],
    })
    console.log("initializing topicPathList")
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
    const { login, quit, end, start, endButtonStatus, nextButtonStatus,
      requirement, requirementList, userId, otherResponse, deployedVersion, domainId,
      topicPathList, topicTransitionList, nextTopicOnList, possibleNextTopics } = this.state;
    const { changeLoginState, controlEndButtonStatus, initializeRequirementList, blockEndButtonStatus, unblockEndButtonStatus,
      controlNextButtonStatus, controlEndStatus, controlStartStatus, setStateRequirment, requirementListConvey, controlQuitStatus, 
      topicPathListConvey, topicTransitionConvey } = this;

    return (
      <div className="backGround">
        {/* FIXME: put it back later to enable login & tutorial*/}
        {/*login ? null : <Login changeLoginState={changeLoginState}/>*/}
        
        { quit ? <Quit/> : null }
        <div className="leftSideBar">
          <LeftSideBar
            requirement={requirement}
            initializeRequirementList={initializeRequirementList}
            end={end}
            start={start}
            requirementList={requirementList}
            topicPathList={topicPathList}
            topicTransitionList={topicTransitionList}
          />
        </div>
        <main className="chatGrid chatStyle">
          <ChatRoom
            userId={userId}
            otherResponse={otherResponse}
            deployedVersion={deployedVersion}
            domainId={domainId}
            end={end}
            start={start}
            requirementListConvey={requirementListConvey}
            requirement={requirement}
            nextTopicOnList={nextTopicOnList}
            possibleNextTopics={possibleNextTopics}
            topicPathListConvey={topicPathListConvey}
            topicTransitionConvey={topicTransitionConvey}
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
            domainId={domainId}
            deployedVersion={deployedVersion}
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
