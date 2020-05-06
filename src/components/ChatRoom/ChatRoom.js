import React, { Component } from 'react';
import { Button, Input, Label, Image, } from 'semantic-ui-react'
import './ChatRoom.css';

import user from './../MessageList/Message/images/avatar.png';

import { MessageList } from "./../MessageList/MessageList.js";
import { SystemTopicButton } from "./../MessageList/SystemButton/SystemTopicButton/SystemTopicButton.js";
import { SystemBotButton } from "./../MessageList/SystemButton/SystemBotButton/SystemBotButton.js";
import { SystemUserButton } from "./../MessageList/SystemButton/SystemUserButton/SystemUserButton.js";
import { SystemBranchButton } from "./../MessageList/SystemButton/SystemBranchButton/SystemBranchButton.js"

//const databaseURL = "https://protobot-rawdata.firebaseio.com/";
const databaseURL = "https://kixlab-uplb-hci-protobot-v2.firebaseio.com/";

export class ChatRoom extends Component {
    id = 0;
    num_experiment = 1;
    after_require = false;
    turn = 0;

    constructor(props) {
        super(props);
        this.state = {
            // Tree Data
            domains: {},

            // Version Check
            deployedVersion: '',
            domainID: '',
            otherResponse: null,
            task: '',

            // Keeping pre-defined topic
            preTopic: null,

            // Putting Database
            domainId: '',
            prevBranch: null,
            startBranch: null,

            // Save the attributes for messageList
            time: new Date(),
            input: '',
            type: 'user',
            originResponse: '',
            messageList: [
                { id: 0, type: 'system', time: null, text: "Chatroom"},
            ],

            // Data lists for conversation flow
            answerList: [],
            save_requirement: null,
            start_requirement: false,
            r_answerList: [],
            num_requirement: -1,
            requirementList: [],
            otherResponseList: [],
            topicPathList: [],
            topicTransitionList: [],

            currentTopicOnList: [],
            nextTopicOnList: [],

            // Status for controlling chatflow
            inputButtonState: false,
            startSession: true,
            turnNotice: false,
            selectBotStatus: true,
            similarUserStatus: true,
            branchTopicStatus: true,

            instructionPosition: -1,
        };
	    this.getDomains = this.getDomains.bind(this);
	    this.getURLParams = this.getURLParams.bind(this);
	    this.getChildBranches = this.getChildBranches.bind(this);
	    this.getChildUtterance = this.getChildUtterance.bind(this);
	    this.getUtteranceText = this.getUtteranceText.bind(this);
	    this.getR_ChildBranch = this.getR_ChildBranch.bind(this);
	    this.getR_UtteranceText = this.getR_UtteranceText.bind(this);
        this.getRequirements = this.getRequirements.bind(this);
        this.getRequirementsText = this.getRequirementsText.bind(this);
        this.setRequirements = this.setRequirements.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.changeTurnNotice = this.changeTurnNotice.bind(this);
        this.resetMessageList = this.resetMessageList.bind(this);
        this.startConversation = this.startConversation.bind(this);
        this.changeRequirment = this.changeRequirment.bind(this);
        this.updateRenderUntilSysBot = this.updateRenderUntilSysBot.bind(this);
        this.updateRenderUntilUserBot = this.updateRenderUntilUserBot.bind(this);
        this.selectDomain = this.selectDomain.bind(this);
        this.selectAnswer = this.selectAnswer.bind(this);
        this.initializeTopic = this.initializeTopic.bind(this);
        this.similarResponse = this.similarResponse.bind(this);
        this.handleChangeText = this.handleChangeText.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.getTask = this.getTask.bind(this);
        this.getTopicPaths = this.getTopicPaths.bind(this);
        this.getTopicPathsText = this.getTopicPathsText.bind(this);
        this.getTopicTransitions = this.getTopicTransitions.bind(this);
    }
    
    /* A. Lifecycle Function */

    componentDidMount() {
        const deployedVersion = this.getURLParams('deployedVersion')
        const domainID = this.getURLParams('domain')
        const otherResponse = true /*(this.getURLParams('otherResponse') === 'true')*/

        this.setState({
            deployedVersion: deployedVersion,
            domainID: domainID,
            otherResponse: otherResponse
        })

        if (deployedVersion && domainID){
            this.getDomains('/deployments/data/'+ domainID + '/' + deployedVersion);
        } else {
            this.getDomains('/currentEdit/data/');
        }

        this.getTask('/domains/data/' + domainID);

        // for bot-side response walkthrough; will send to SystemBotButton to open instruction on first occurance
        fetch(`${databaseURL + 'deployments/data/' + domainID + '/' + deployedVersion + '/topicList'}.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(result => {
            this.setState({instructionPosition: Object.keys(result).length-1})
        });
    }
    
    componentDidUpdate(prevProps) {
        const { end, start, controlEndStatus, controlStartStatus, } = this.props;
        if ( end === true ) {
            this.resetMessageList();
            this.setState({
                similarUserStatus: true,
                selectBotStatus: true,
                turnNotice: false,
            })
            controlEndStatus();
        }
        if( start === true ) {
            this.startConversation();
            controlStartStatus();
        }
        this.scrollToBottom();

        if (prevProps.nextTopicOnList !== this.props.nextTopicOnList) {
            this.setState({
                nextTopicOnList: this.props.nextTopicOnList
            })  
        }
        if (prevProps.requirement !== this.props.requirement) {
            this.setState({
                currentTopicOnList: this.props.requirement
            })
        } 

        //console.log(this.state.currentTopicOnList)
        //console.log(this.state.nextTopicOnList)
    }

    /* B. Data import  */
    //-----------------------
    // function for tree data import
    // ----------------------
    getDomains(address) {
        fetch(`${databaseURL+address}.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(domains => {
            this.setState({domains: domains})
        });
    }

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

    getTask(address) {
        fetch(`${databaseURL+address}.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(taskName => {
            this.setState({task: taskName})
        });
    }

    // utterance list에 branch까지 같이 저장해서, 다음 branch 바로 넘겨줄 수 있도록
    getChildBranches(branch, type) {
        fetch(`${databaseURL+'/tree-structure/data/'+this.state.domainId+'/'+branch+'/children'}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(children => {
            this.setState({
                otherResponseList: [],
                answerList: []
            })
            if(children !== null){
                const childBranches = Object.keys(children)
                childBranches.map((branch) => {
                    this.getChildUtterance(branch, type, false)
                })
            }
        });
    }

    getChildUtterance(branch, type, required) {
        fetch(`${databaseURL+'/tree-structure/data/'+this.state.domainId+'/'+branch+'/utterances'}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(utterance => {
            const utteranceId = Object.keys(utterance)
            if(required){
                this.getR_UtteranceText(branch, utteranceId)
            } else{
                this.getUtteranceText(branch, utteranceId, type)
            }
        });
    }

    getUtteranceText(branch, utteranceId, type){
        const { domainID } = this.state;
        fetch(`${databaseURL+'/utterances/data/'+ domainID + '/' + utteranceId}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(utterance => {
            if (utterance.required || (utterance.version !== this.state.deployedVersion)){
            } else {
                if (type){
                    this.setState({
                        answerList: this.state.answerList.concat({
                            branchId: branch,
                            text: utterance.text,
                            uId: utteranceId
                        })
                    })
                } else{
                    this.setState({
                        otherResponseList: this.state.otherResponseList.concat({
                            branchId: branch,
                            text: utterance.text,
                            uId: utteranceId
                        })
                    })
                }
            }
        });
    }

    getR_ChildBranch(topic_name){
        const { domainID } = this.state;
        fetch(`${databaseURL+'/topics/data/'+ domainID + '/' + topic_name+'/branch/'}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(branch => {
            if(branch !== null){
                const c_branches = Object.keys(branch)
                c_branches.map((c_branch) => {
                    this.getChildUtterance(c_branch, true, true)
                })
            }
        });
    }

    getR_UtteranceText(branch, utteranceId){
        const { domainID } = this.state;
        fetch(`${databaseURL+'/utterances/data/'+ domainID + '/' + utteranceId}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(utterance => {
            if (utterance.required || (utterance.version !== this.state.deployedVersion)){
            } else {
                this.setState({
                    r_answerList: this.state.r_answerList.concat({
                        branchId: branch,
                        text: utterance.text,
                        uId: utteranceId
                    })
                })
            }
        });
    }

    getRequirements(path, order) {
        const { domainID } = this.state
        fetch(`${databaseURL+'/topics/data/'+ domainID + '/' + path}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(topic => {
            this.getRequirementsText(topic.designUtteranceId, topic.name, topic.branch, path, order)
        });
    }

    getRequirementsText(path, name, branch, topicEmbedded, order){
        const { domainID } = this.state;
        fetch(`${databaseURL+'/utterances/data/'+domainID+'/'+path}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(utterance => {
            this.setState({
                requirementList: this.state.requirementList.concat({
                    checked: false,
                    requirement: name, // topics -> data -> name
                    text: utterance.text, // utterances -> data -> text
                    topic: topicEmbedded, // deployment??
                    topics: utterance.topic, // ???
                    uId: path,
                    bId: branch,
                    required: true,
                    order: parseInt(order, 10),
                }),
                num_requirement: Object.keys(this.state.requirementList).length + 1
            })

            // For sorting of requirmentList by given ordering
            // Because setState is proceeded asynchronously
            this.state.requirementList.sort(function(a, b){
                return a.order < b.order ? -1: a.order > b.order ? 1: 0;
            })

            this.props.requirementListConvey(this.state.requirementList);
        });
    }

    getTopicPaths(path, order) {
        const { domainID } = this.state
        fetch(`${databaseURL+'/topicPath/data/'+ domainID + '/' + path}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(topicPath => {
            this.getTopicPathsText(topicPath.designUtteranceId, topicPath.name, path, order)
        });
    }

    getTopicPathsText(path, name, topicEmbedded, order){
        const { domainID } = this.state;
        fetch(`${databaseURL+'/utterances/data/'+domainID+'/'+path}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(utterance => {
            this.setState({
                topicPathList: this.state.topicPathList.concat({
                    checked: false,
                    requirement: name, // topics -> data -> name
                    text: utterance.text, // utterances -> data -> text
                    topic: topicEmbedded, // deployment??
                    topics: utterance.topic, // ???
                    uId: path,
                    //required: true,
                    order: parseInt(order, 10),
                }),
                //num_requirement: Object.keys(this.state.topicPathList).length + 1
            })
            this.props.topicPathListConvey(this.state.topicPathList);
        });
    }

    getTopicTransitions(order, key) {
        const currState = this.state.topicTransitionList
        currState.push({
            order: parseInt(order, 10),
            startNode: key.start,
            endNode: key.end,
            path: key.transition,
        })
        this.setState({
            topicTransitionList: currState
        })
        this.props.topicTransitionConvey(this.state.topicTransitionList)
    }

    setRequirements(domain) {
        console.log(domain)
        Object.entries(domain.topicList).map(([order, key]) => {
            this.getRequirements(key, order)
        })
        Object.entries(domain.topicPaths).map(([order, key]) => {
            this.getTopicPaths(key, order)
        })
        Object.entries(domain.topicTransitions).map(([order, key]) => {
            this.getTopicTransitions(order, key)
        })
        
    }

    /* C. Controlling Functions */


    // Auto scrolling to bottom
    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    // Notice the turn of user to user
    changeTurnNotice = () => {
        const { blockEndButtonStatus, unblockEndButtonStatus } = this.props;
        if (this.state.num_requirement === 0){
            blockEndButtonStatus();
        }
        setTimeout(() => {
            this.setState(prevState => ({
                turnNotice: !prevState.turnNotice,
                inputButtonState: true,
            }));
            if (this.state.num_requirement === 0){
                unblockEndButtonStatus();
            }
        }, 900);
    }

    // Reset the messageList when the conversation is ended
    resetMessageList = () => {
        if (this.props.numSession === 1){
            this.setState({
                messageList: [
                    { id: 0, type: 'system', time: null, text: 'End the experiment '},
                    { id: 1, type: 'system', time: null, text: 'Click the [End experiment] Button in below'}
                ],
            }) 
        } else {
            this.setState({
                messageList: [
                    { id: 0, type: 'system', time: null, text: 'End the '+ 'conversation ' + this.num_experiment},
                    { id: 1, type: 'system', time: null, text: 'Click the [Next Conversation] Button in below'}
                ],
            })
        }
        this.id = 0
    }

    // Initialize the messageList when a new conversation starts
    startConversation = () => {
        this.num_experiment ++
        this.after_require = false
        this.getDomains('/deployments/data/'+ this.state.domainID + '/' + this.state.deployedVersion)
        this.id = 0
        this.turn = 0
        this.setState({
            messageList: [
                { id: 0, type: 'system', time: null, text: 'Lets start ' + 'conversation ' + + this.num_experiment}
            ],
            startSession: true,
            num_requirement: -1,
            answerList: [],
            otherResponseList: [],
            requirementList: [],
            
            // Initialize Database Variables
            save_requirement: null,
            domainId: '', 
            prevBranch: null,
            startBranch: null,
        })
    }

    // changeRequirment the requirmentList
    changeRequirment = (requirement) => {
        const { requirementList, num_requirement } = this.state;
        const {setStateRequirment} = this.props;

        this.setState({
            save_requirement: requirement,
            selectBotStatus: true,
            start_requirement: true,
            r_answerList: [],
            num_requirement: num_requirement - 1,
            requirementList: requirementList.filter(r => r.requirement !== requirement.requirement)
        })
        const topic_name = Object.keys(requirement.topics)
        this.getR_ChildBranch(topic_name)
        setStateRequirment(requirement)
    }

    // Set interval btw user response and SystemBotButton
    // For preventing the message ordering, block the endbutton during 1000ms through 'controlEndButtonStatus'
    updateRenderUntilSysBot(){
        const { blockEndButtonStatus, unblockEndButtonStatus } = this.props;
        if (this.state.num_requirement === 0){
            blockEndButtonStatus();
        }
        setTimeout(() => {
            this.setState(prevState => ({
                selectBotStatus: !prevState.selectBotStatus
            }));
            if (this.state.num_requirement === 0){
                unblockEndButtonStatus();
            }
        }, 1000);
    }

    // Set interval btw user response and SystemUserButton
    // For preventing the message ordering, block the endbutton during 1000ms through 'controlEndButtonStatus' function
    updateRenderUntilUserBot(){
        const { blockEndButtonStatus, unblockEndButtonStatus } = this.props;
        if (this.state.num_requirement === 0){
            blockEndButtonStatus();
        }
        setTimeout(() => {
            // this.setOtherResponseList();
            this.setState(prevState => ({
                similarUserStatus: !prevState.similarUserStatus,
            }));
            if (this.state.num_requirement === 0){
                unblockEndButtonStatus();
            }
        }, 1000);
    }

    // Putting topic from the SystemTopicButton
    // And start the conversation with user's utterance (selected Topic)
    // Also unblock the endbutton through 'controlEndButtonStatus' function
    selectDomain = (dataFromChild, id) => {
        const { messageList, time } = this.state;
        this.setRequirements(dataFromChild)
        if (dataFromChild.branches) {
            const branches = Object.keys(dataFromChild.branches)
            this.setState({
                startBranch: branches[0],
            })
        }
        this.setState({
            startSession: false,
            deployedVersion: dataFromChild.deployedVersion,
            messageList: messageList.concat({
                id: this.id++,
                type: 'user',
                time: time.toLocaleTimeString(),
                text: dataFromChild.name,
            }),
            domainId: id,
        })
	    // this.setAnswerList(dataFromChild.children);
        this.updateRenderUntilSysBot();
    }

    setOtherResponseList = () => {
        const { prevBranch } = this.state;
        // prevBranch에서 children 찾아서, 각각의 branch id, utterance id 담은 responseList만듦
        this.getChildBranches(prevBranch, false)
    }

    setAnswerList = (branch) => {
        this.getChildBranches(branch, true)
    }

    // Putting selected answer from the SystemBotButton
    selectAnswer = (dataFromChild, branch, newAnswerState) => {
        const { messageList, time, num_requirement, startBranch } = this.state;
        if(startBranch === null){
            this.setState({
                startBranch: branch
            })
        }

        this.turn += 1
        
        if(newAnswerState === true) {
            this.setState({
                messageList: messageList.concat({
                    id: this.id++,
                    type: 'bot',
                    time: time.toLocaleDateString(),
                    text: dataFromChild.text,
                }),
                selectBotStatus: true,
                start_requirement: false,
                prevBranch: branch,
                preTopic: dataFromChild.topics
            })
        } else{
            this.setState({
                messageList: messageList.concat({
                    id: this.id++,
                    type: 'bot',
                    time: time.toLocaleDateString(),
                    text: dataFromChild.text,
                }),
                selectBotStatus: true,
                start_requirement: false,
                prevBranch: branch,
                preTopic: dataFromChild.topics
            })
        }

        if ((num_requirement === 0) && (this.after_requirement === false)){
            this.props.unblockEndButtonStatus();
            this.after_requirement = true;
        }

        this.changeTurnNotice();
    }

    initializeTopic = () => {
        this.setState({
            preTopic: null,
        })
    }

    // Putting similar response which user is selected from the SystemUserButton
    similarResponse = (dataFromChild, branch) => {
        const { messageList, time } = this.state;
        
        this.turn += 1

        this.setState({
            messageList: this.state.messageList.splice(-1, 1)
        })

        this.setState({
            messageList: messageList.concat({
                id: this.id++,
                type: 'user',
                time: time.toLocaleDateString(),
                text: dataFromChild.text,
            }),
            similarUserStatus: true,
            prevBranch: branch,
        })

        this.setAnswerList(branch);
        this.updateRenderUntilSysBot();
    }

    /* D. Event Handler */

    // save the input text of each utterance
    handleChangeText = (e) => {
        this.setState({
            input: e.target.value
        });
    }

    // add the input utterance with text, time, type to messageList 
    handleCreate = () => {
        const { input, type, time, messageList } = this.state;
        this.setState({
            input: '',
            turnNotice: false,
            originResponse: input,
            inputButtonState: false,
            messageList: messageList.concat({
                id: this.id++,
                type: type,
                time: time.toLocaleTimeString(),
                text: input,
            }),
        })
        this.setOtherResponseList();
        this.updateRenderUntilUserBot();
        this.scrollToBottom();
    }

    handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            this.handleCreate();
        }
    }

    render() {
        const { input, time, originResponse, 
            domains, messageList, answerList, r_answerList, requirementList, otherResponse, 
            otherResponseList, inputButtonState, domainID, prevBranch, startBranch, preTopic, save_requirement, start_requirement,
            turnNotice, startSession, selectBotStatus, num_requirement, deployedVersion, 
            similarUserStatus, instructionPosition, task, branchTopicStatus, currentTopicOnList, nextTopicOnList } = this.state;
        const {
            handleChangeText,
            handleCreate,
            handleKeyPress,
            selectDomain,
            selectAnswer,
            similarResponse,
            changeRequirment,
            initializeTopic,
            
        } = this;

        const sysNotice = [
            { id: 0, type: 'system', time: null, text: "Now it's your turn!\n\nPlease enter your response in the input field at the bottom of the page."},
            { id: 2, type: 'loading', time: null, text: "  "},
        ];

        return (
                <div className="chatOuterBox">
                    <div className="chatInnerBox">
                        <main className="chatRoom">
                            <div className="dateSection">
                                <span>{time.toLocaleTimeString()}</span>
                            </div>
                            <div>
                                <MessageList messageList={messageList}/>
                                {startSession ? <SystemTopicButton domains={domains} selectDomain={selectDomain}/> : null}
                                {branchTopicStatus ? null : <SystemBranchButton
                                                            userId={this.props.userId}
                                                            otherResponse={otherResponse}
                                                            selectAnswer={selectAnswer}
                                                            save_requirement={save_requirement}
                                                            answerList={answerList}
                                                            r_answerList={r_answerList}
                                                            start_requirement={start_requirement}
                                                            requirementList={requirementList}
                                                            changeRequirment={changeRequirment}
                                                            num_requirement={num_requirement}
                                                            deployedVersion={deployedVersion}
                                                            domainId={domainID}
                                                            prevBranch={prevBranch}
                                                            startBranch={startBranch}
                                                            num_experiment={this.num_experiment}
                                                            turn={this.turn}
                                                            instructionPosition={instructionPosition}
                                                            />}
                                {similarUserStatus ? null : <SystemUserButton
                                                            userId={this.props.userId}
                                                            otherResponse={otherResponse}
                                                            similarResponse={similarResponse}
                                                            originResponse={originResponse}
                                                            otherResponseList={otherResponseList}
                                                            domainId={domainID}
                                                            deployedVersion={deployedVersion}
                                                            prevBranch={prevBranch}
                                                            preTopic={preTopic}
                                                            initializeTopic={initializeTopic}
                                                            num_experiment={this.num_experiment}
                                                            turn={this.turn}
                                                            />}
                                {selectBotStatus ? null : <SystemBotButton
                                                            userId={this.props.userId}
                                                            otherResponse={otherResponse}
                                                            selectAnswer={selectAnswer}
                                                            save_requirement={save_requirement}
                                                            answerList={answerList}
                                                            r_answerList={r_answerList}
                                                            start_requirement={start_requirement}
                                                            requirementList={requirementList}
                                                            changeRequirment={changeRequirment}
                                                            num_requirement={num_requirement}
                                                            deployedVersion={deployedVersion}
                                                            domainId={domainID}
                                                            prevBranch={prevBranch}
                                                            startBranch={startBranch}
                                                            num_experiment={this.num_experiment}
                                                            turn={this.turn}
                                                            instructionPosition={instructionPosition}
                                                            currentTopicOnList={currentTopicOnList}
                                                            nextTopicOnList={nextTopicOnList}
                                                            />}
                                {turnNotice ? <MessageList messageList={sysNotice}/> : null}
                                </div>
                            <div style={{float:'left', clear:'both', height:'80px'}} ref={(el) => { this.messagesEnd = el; }}></div>
                        </main>
                        <div className="textInputBox">
                            <div className="textInputBoxInput">
                                {inputButtonState
                                    ?   <Input fluid type='text' placeholder='Type...' action>
                                            <Label color={'violet'}>
                                                <Image avatar spaced='right' src={user} />
                                                User
                                            </Label>
                                            <input style={{marginLeft:'3px'}} value={input} onChange={handleChangeText} onKeyPress={handleKeyPress}/>
                                            <Button type='submit' onClick={handleCreate}>Send</Button>
                                        </Input>
                                    :   <Input fluid disabled type='text' placeholder='Type...' action>
                                            <input value={input} onChange={handleChangeText} onKeyPress={handleKeyPress}/>
                                            <Button disabled type='submit' onClick={handleCreate}>Send</Button>
                                        </Input>
                                }
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}
