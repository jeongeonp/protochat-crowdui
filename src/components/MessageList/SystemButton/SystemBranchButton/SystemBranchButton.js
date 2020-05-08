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
        };
        this.postUtterance = this.postUtterance.bind(this);
        this.postBranch = this.postBranch.bind(this);
        this.patchUserUtterance = this.patchUserUtterance.bind(this);
        this.patchUserBranch = this.patchUserBranch.bind(this);
        this.patchChildren = this.patchChildren.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleNotapplicable = this.handleNotapplicable.bind(this);
    }

    postUtterance(utterance) {
        return fetch(`${databaseURL+'/utterances/data/'+this.props.domainId + '/' + this.extension}`, {
            method: 'POST',
            body: JSON.stringify(utterance)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            const { domainId, prevBranch, userId, num_experiment, turn, deployedVersion } = this.props;
            const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[data.name]: true}}
            this.patchUserUtterance(data.name, userId, domainId, num_experiment, turn)
            this.postBranch(newBranch, utterance);
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
            this.handleCreate(utterance, data.name, false);
        });
    }

    patchUserUtterance(id, userId, domainId, num_experiment, turn) {
        return fetch(`${databaseURL+'/crowd/lists/domain-utterances/'+domainId+'/'+this.props.deployedVersion+'/'+userId+'/'+this.extension}`, {
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
        return fetch(`${databaseURL+'/crowd/lists/branches/'+domainId+'/'+this.props.deployedVersion+'/'+userId+'/'+this.extension}`, {
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

    handleCreate = (response, id, selected) => {
        const { similarResponse, userId, domainId, num_experiment, turn } = this.props
        if (selected){
            this.patchUserUtterance(response.uId, userId, domainId, num_experiment, turn)
            this.patchUserBranch(response.branchId, userId, domainId, num_experiment, turn)
        }
        similarResponse(response, id);
    }

    handleNotapplicable = () => {
        const { originResponse, domainId, userId, deployedVersion, preTopic, initializeTopic, numSession } = this.props;
        const newUtterance = {bot: false, text: originResponse, domain: domainId, userId: userId, version: deployedVersion, topics: preTopic, numSession: numSession}
        
        this.setState({
            inputButtonState: true,
        })

        initializeTopic();
        this.postUtterance(newUtterance);
    }

    render() {
        const { otherResponseList, possibleNextTopics } = this.props;
        const { handleCreate, handleNotapplicable } = this;

        return (
            <div className="systemUserButtonBox">
                <span className="systemUserText">
                    If you can find a message with the same meaning, select it.
                </span>
                <div style={{width: '100%', marginTop: "10px", maxHeight: '250px', overflowY: this.overflowCondition}}>
                    <Segment.Group>
                        <Segment textAlign='center' style={{height: '200px', overflowY: "scroll"}}>
                            { (possibleNextTopics).map((topics, id) => {
                                var text = ""
                                console.log(id)
                                this.props.topicTransitionList.map((t) => {
                                    console.log(this.props.topicTransitionList)
                                    if (t.endNode === topics.topic) {
                                        this.props.topicPathList.map((p)=> {
                                            if (t.path === p.topic) {
                                                text = p.text
                                                console.log(p)
                                            }
                                        })
                                    }
                                })
                                return (
                                    <div key={id}>
                                        <div style={{height: '10px'}}></div>
                                        <Button fluid onClick={handleCreate.bind(this, topics, topics.bId, true)}>{text}</Button>
                                    </div>
                                );
                            })}
                        </Segment>
                        <Segment textAlign='center'>
                            { this.state.inputButtonState
                                ?   <Button fluid disabled>
                                        Nothing to select
                                    </Button>
                                :   <Button fluid negative onClick={handleNotapplicable}>
                                        Nothing to select
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
                            <Segment textAlign='center' color='teal' >
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