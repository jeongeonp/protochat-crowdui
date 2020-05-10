import React, { Component } from 'react';
import { Segment, Button, Input, Image, Modal, Icon, Header } from 'semantic-ui-react';
import './SystemBranchButton.css';

//import bot from './../../Message/images/bot.png';
//import botsTurn from './bots-turn.PNG';

//const databaseURL = "https://protobot-rawdata.firebaseio.com/";
const databaseURL = "https://kixlab-uplb-hci-protobot-v2.firebaseio.com/";

export class SystemBranchButton extends Component {
    extension = '.json';
    overflowCondition = '';

    constructor(props) {
        super(props);
        this.state = {
            inputButtonState: false,

            number: 0,

            /* Since passing via prop was not working */
            deployedVersion: '',
            domainId: '',
        };
        this.postUtterance = this.postUtterance.bind(this);
        this.postBranch = this.postBranch.bind(this);
        this.patchUserUtterance = this.patchUserUtterance.bind(this);
        this.patchUserBranch = this.patchUserBranch.bind(this);
        this.patchChildren = this.patchChildren.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.getURLParams = this.getURLParams.bind(this);
        this.handleNotapplicable = this.handleNotapplicable.bind(this);
    }

    componentDidMount() {
        const deployedVersion = this.getURLParams('deployedVersion')
        const domainId = this.getURLParams('domain')

        this.setState({
            deployedVersion: deployedVersion,
            domainId: domainId,
        })

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

    postUtterance(utterance, existingPath) {
        return fetch(`${databaseURL+'/utterances/data/'+this.props.domainId + '/' + this.extension}`, {
            method: 'POST',
            body: JSON.stringify(utterance)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            const { prevBranch, userId, num_experiment, turn } = this.props;
            const { deployedVersion, domainId } = this.state
            const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[data.name]: true}}
            this.patchUserUtterance(data.name, userId, domainId, num_experiment, turn)
            this.postBranch(newBranch, utterance);
            console.log(newBranch)
            if (existingPath) {
                this.patchTopicPathId(data.name, domainId, utterance.topicPathId)
            }
        });
    }

    patchTopicPathId(id, domainId, topicPathId) {
        const { number } = this.state
        return fetch(`${databaseURL+'/topicPath/lists/utterances/'+domainId+'/'+topicPathId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[number]:id})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(() => {
            this.setState({ number: number+1 })
        });
        
    }

    postBranch(branch, utterance) {
        return fetch(`${databaseURL+'/tree-structure/data/'+this.props.domainId+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(branch)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            const { prevBranch, userId, domainId, num_experiment, turn } = this.props;
            const children = {[data.name]: true}
            this.patchChildren(prevBranch, children)
            this.patchUserBranch(data.name, userId, domainId, num_experiment, turn)
            
            //this.handleCreate(utterance, data.name, false); TODO: Got rid of this because we don't need similarResponse method
        });
    }

    patchUserUtterance(id, userId, domainId, num_experiment, turn) {
        return fetch(`${databaseURL+'/crowd/lists/domain-utterances/'+domainId+'/'+this.state.deployedVersion+'/'+userId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: turn})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchUserBranch(id, userId, domainId, num_experiment, turn) {
        return fetch(`${databaseURL+'/crowd/lists/branches/'+domainId+'/'+this.state.deployedVersion+'/'+userId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: turn})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchChildren(prevBranch, children) {
        return fetch(`${databaseURL+'/tree-structure/data/'+this.props.domainId+'/'+prevBranch+'/children/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(children)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchTopicPath(prevBranch, children) {
        return fetch(`${databaseURL+'/tree-structure/data/'+this.props.domainId+'/'+prevBranch+'/children/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(children)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    /* When crowd selects existing path */
    handleCreate = (topics, path) => {
        console.log("**** in handleCreate ****")
        const { deployedVersion, domainId } = this.state
        const { userId, initializeTopic, conveySelectedPath, preTopic } = this.props;
        
        const newUtterance = {bot: false, text: path.requirement, domain: domainId, userId: userId, version: deployedVersion, topicPathId: path.topic, topic: preTopic }
        this.setState({
            inputButtonState: true,
        })
        //initializeTopic();
        this.postUtterance(newUtterance, true);

        conveySelectedPath(topics, path.requirement)
    }

    /* When crowd selects non existing path */
    handleNotapplicable = () => {
        console.log("**** in handleNotapplicable ****")
        const { deployedVersion, domainId } = this.state
        const { originResponse, userId, initializeTopic, conveyNewPath, preTopic } = this.props;
        
        const newUtterance = {bot: false, text: originResponse, domain: domainId, userId: userId, version: deployedVersion, topicPathId: "New Path", topic: preTopic }
        this.setState({
            inputButtonState: true,
        })
        initializeTopic();
        this.postUtterance(newUtterance, false);
        conveyNewPath(originResponse)
    }

    render() {
        const { otherResponseList, possibleNextTopics, conveySelectedPath, currentTopicOnList } = this.props;
        const { handleCreate, handleNotapplicable } = this;

        var nextButtons = []
        var nextButtonPaths = []
        var path = null
        this.props.topicTransitionList.map((t) => {
            if (t.startNode === currentTopicOnList.topic) {
                this.props.topicPathList.map((p)=> {
                    if (t.path === p.topic) {
                        //console.log(topics) // nexttopic이 되어야함
                        nextButtons.push(this.props.possibleNextTopics.filter((pnt)=> {return pnt.topic === t.endNode})[0])
                        nextButtonPaths.push(p)
                    }
                })
            }
        })

        return (
            <div className="systemUserButtonBox">
                <span className="systemUserText">
                    If your answer was one of the below choices, click it. <br/> If not, please click the <i>None resembles my answer</i> button
                </span>
                <div style={{width: '100%', marginTop: "10px", maxHeight: '250px', overflowY: this.overflowCondition}}>
                    <Segment.Group>
                        <Segment textAlign='center' /*style={{height: '200px', overflowY: "scroll"}}*/>
                            { (nextButtons).map((topics, id) => {
                                
                                return (
                                    <div key={id}>
                                        <div style={{height: '10px'}}></div>
                                        <Button  color='blue' fluid onClick={handleCreate.bind(this, topics, nextButtonPaths[id])}>{nextButtonPaths[id].requirement}</Button>
                                    </div>
                                );
                            })}
                        </Segment>
                        <Segment textAlign='center'>
                            { this.state.inputButtonState
                                ?   <Button fluid disabled>
                                        None resembles my answer
                                    </Button>
                                :   <Button fluid  onClick={handleNotapplicable}>
                                        None resembles my answer
                                    </Button>
                            }
                        </Segment>
                    </Segment.Group>
                </div>
            </div>
            
        );
    }
}


/*<div className="systemBotButtonBox">
                <div style={{marginTop:"10px", width:"100%", display:"table"}}>
                <div style={{display: "table-cell"}}>
                    <div style={{minHeight: "150px"}}>
                        <Segment.Group>
                            <Segment textAlign='center' color='blue' >
                                <div className="systemBotText" >
                                    Choose from below answers.<br/>You will proceed the conversation with a path of your choice.
                                </div>
                                <div style={{height: '15px'}}></div>
                                <div>
                                {(this.props.possibleNextTopics).map((topics) => {
                                    var text = ""
                                    this.props.topicTransitionList.map((t) => {
                                        if (t.endNode === topics.topic) {
                                            this.props.topicPathList.map((p)=> {
                                                if (t.path === p.topic) {
                                                    text = p.text
                                                }
                                            })
                                        }
                                    })
                                    console.log(this.props.topicList)
                                    return (
                                        <div>
                                            <div style={{height: '10px'}}></div>
                                            <Button fluid onClick={handleCreate.bind(this, topics, topics.bId, true)}>{text}</Button>
                                        </div>
                                    )
                                })}
                                </div>
                            </Segment>
                        </Segment.Group>
                    </div>
                    
                </div>
                </div>
            </div>*/