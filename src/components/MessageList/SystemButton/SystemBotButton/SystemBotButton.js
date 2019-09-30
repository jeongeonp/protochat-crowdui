import React, { Component } from 'react';
import { Segment, Button, Input, Label, Image } from 'semantic-ui-react';
import './SystemBotButton.css';

import bot from './../../Message/images/bot.png';

const databaseURL = "https://protobot-rawdata.firebaseio.com/";

export class SystemBotButton extends Component {
    extension = '.json'
    addedpath = ''
    overflowCondition: ''

    constructor(props) {
        super(props)
        this.state = { 
            input: '',
            inputState: true,
        }
        this.postUtterance = this.postUtterance.bind(this)
        this.postBranch = this.postBranch.bind(this)
        this.patchUserUtterance = this.patchUserUtterance.bind(this)
        this.patchUserBranch = this.patchUserBranch.bind(this)
        this.patchFirstBranch = this.patchFirstBranch.bind(this)
        this.patchChildren = this.patchChildren.bind(this)
        this.sendAnswer = this.sendAnswer.bind(this)
        this.changeInputState = this.changeInputState.bind(this)
        this.handleChangeText = this.handleChangeText.bind(this)
        this.handleCreate = this.handleCreate.bind(this)
        this.handleSelect = this.handleSelect.bind(this)
        this.handleRequirement = this.handleRequirement.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
    }

    postUtterance(utterance, start) {
        return fetch(`${databaseURL+'/utterances/data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(utterance)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        }).then(data => {
            const { domainId, prevBranch, userId } = this.props
            const newBranch = {domain: domainId, parent: prevBranch, utterances: {[data.name]: true}}
            this.patchUserUtterance(data.name, userId, domainId)
            this.postBranch(newBranch, utterance, start)
        });
    }

    postBranch(branch, utterance, start) {
        return fetch(`${databaseURL+'/tree-structure/data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(branch)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        }).then(data => {
            const { prevBranch, domainId, userId } = this.props
            const branch = {[data.name]: true}
            if (prevBranch){
                this.patchChildren(prevBranch, branch)
            } 
            if (start) {
                this.patchFirstBranch(domainId, branch)
            }
            this.patchUserBranch(data.name, userId, domainId)
            this.sendAnswer(utterance, data.name, true)
        });
    }

    patchUserUtterance(id, userId, domainId) {
        return fetch(`${databaseURL+'/users/lists/domain-utterances/'+userId+'/'+domainId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: true})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchUserBranch(id, userId, domainId) {
        return fetch(`${databaseURL+'/users/lists/branches/'+userId+'/'+domainId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: true})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchFirstBranch(domainId, f_branch) {
        return fetch(`${databaseURL+'/domains/data/'+domainId+'/branches'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(f_branch)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        });
    }

    patchChildren(prevBranch, children) {
        return fetch(`${databaseURL+'/tree-structure/data/'+prevBranch+'/children'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(children)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        })
    }

    // Send the answer which the user is selected to parent component
    sendAnswer = (utterance, branch, state) => {
        const { selectAnswer } = this.props
        selectAnswer(utterance, branch, state)
    }

    changeInputState = () => {
        this.setState(prevState => ({
            inputState: !prevState.inputState
        }))
    }

    handleChangeText = (e) => {
        this.setState({
            input: e.target.value
        })
    }

    // Select origin answer of Bot, state: false
    handleSelect = (answer, branch) => {
        const { userId, domainId } = this.props
        this.patchUserUtterance(answer.uId, userId, domainId)
        this.patchUserBranch(answer.branchId, userId, domainId)
        this.sendAnswer(answer, branch, false)
    }

    // Add New answer of Bot, state: true
    handleCreate = () => {
        const { input } = this.state
        const { domainId } = this.props
        const newUtterance = {bot: true, text: input, domain: domainId}
        
        this.setState({
            input: '',
        })

        // Adding new answer(Bot)
        this.postUtterance(newUtterance, false)
    }

    handleRequirement = (requirement) => {
        const { changeRequirment, domainId, startBranch, prevBranch, hasRequiredBranch, userId } = this.props
        this.patchUserUtterance(requirement.uId, userId, domainId)
        if(startBranch){
            if (hasRequiredBranch){
                this.patchUserBranch(hasRequiredBranch, userId, domainId)
                this.sendAnswer(requirement, hasRequiredBranch, false)
            } else{
                const newBranch = {domain: domainId, parent: prevBranch, utterances: {[requirement.uId]: true}}
                this.postBranch(newBranch, requirement, false)
            }
        } else {
            const newBranch = {domain: domainId, parent: prevBranch, utterances: {[requirement.uId]: true}}
            this.postBranch(newBranch, requirement, true)
        }
        changeRequirment(requirement)
    }

    handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            this.handleCreate()
        }
    }

    render() {
        const { inputState, input } = this.state
        const { answerList, requirementList, num_requirement, prevBranch } = this.props
        const { handleSelect, changeInputState, handleChangeText, handleCreate, handleKeyPress, handleRequirement } = this
        if (Object.keys(answerList).length > 4){
            this.overflowCondition = 'scroll'
        }

        return (
            <div className="systemBotButtonBox">
                <div style={{width: '100%', marginTop:"10px", overflowY:  this.overflowCondition}}>
                    { requirementList.length === 0
                        ?   null
                        :   <div>
                                <Segment.Group>
                                    <Segment textAlign='center'>
                                        <div className="systemBotText">
                                            { prevBranch === null
                                                ?   'Click the first topic'
                                                :   'A. Skip to next topic'
                                            }
                                        </div>
                                        <div style={{height: '15px'}}></div>
                                        {requirementList.map((requirement, id) => {
                                            return id === Object.keys(requirementList).length - num_requirement?
                                                <div key={id}>
                                                    <div style={{height: '5px'}}></div>
                                                    <Button fluid color='teal' onClick={handleRequirement.bind(this, requirement, id)}>{requirement.text}</Button>
                                                </div>
                                                : null
                                            })
                                        }
                                    </Segment>
                                </Segment.Group>
                            </div>
                    }
                    <div style={{height:'10px'}}></div>
                    { prevBranch === null
                        ?   null
                        :   <div>
                                {/* <span className="systemBotText">
                                    { requirementList.length === 0
                                        ?   'Continue this conversation on the current topic'
                                        :   'B. Continue this conversation on the current topic'
                                    }
                                </span> */}
                                <Segment.Group>
                                    <Segment textAlign='center' color='teal'>
                                        {/* <div className="systemBotText">B. Continue this conversation on the current topic</div> */}
                                        <span className="systemBotText">
                                            { requirementList.length === 0
                                                ?   'Continue this conversation on the current topic'
                                                :   'B. Continue this conversation on the current topic'
                                            }
                                        </span>
                                        <div style={{height: '10px'}}></div>
                                        <div className="systemBotText" style={{color: 'red'}}>You can add new response or select another response</div>
                                        <div style={{height: '15px'}}></div>
                                        { inputState
                                            ? <Button fluid positive onClick={changeInputState}>Add new response</Button>
                                            : <Input fluid type='text' placeholder='Type your answer...' action>
                                                <Label color={'green'}>
                                                    <Image avatar spaced='right' src={bot} />
                                                    Bot
                                                </Label>    
                                                <input value={input} onChange={handleChangeText} onKeyPress={handleKeyPress}/>
                                                <Button positive type='submit' onClick={handleCreate}>Add</Button>
                                            </Input>
                                        }
                                        {Object.keys(answerList).map(id => {
                                            const answer = answerList[id]
                                            return (
                                                <div key={id}>
                                                    <div style={{height: '10px'}}></div>
                                                    <Button fluid onClick={handleSelect.bind(this, answer, answer.branchId)}>{answer.text}</Button>
                                                </div>
                                            )
                                        })}
                                    </Segment>
                                </Segment.Group>
                            </div>
                    }
                </div>
            </div>
        );
    }
}
