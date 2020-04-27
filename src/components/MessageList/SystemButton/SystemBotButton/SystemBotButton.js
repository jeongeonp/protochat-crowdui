import React, { Component } from 'react';
import { Segment, Button, Input, Label, Image, Modal, Icon, Header } from 'semantic-ui-react';
import './SystemBotButton.css';

import bot from './../../Message/images/bot.png';
import botsTurn from './bots-turn.PNG';
/*import A1 from './add-new-response-button.PNG';
import A2 from './show-others-responses-button.PNG';
import B from './next-sequence-button.PNG'*/

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
            buttonState: true,
            modalOpen: true,
        }
        this.postUtterance = this.postUtterance.bind(this)
        this.postBranch = this.postBranch.bind(this)
        this.patchUserUtterance = this.patchUserUtterance.bind(this)
        this.patchUserBranch = this.patchUserBranch.bind(this)
        this.patchFirstBranch = this.patchFirstBranch.bind(this)
        this.patchBranchRequired = this.patchBranchRequired.bind(this)
        this.patchChildren = this.patchChildren.bind(this)
        this.sendAnswer = this.sendAnswer.bind(this)
        this.changeInputState = this.changeInputState.bind(this)
        this.handleChangeText = this.handleChangeText.bind(this)
        this.handleCreate = this.handleCreate.bind(this)
        this.handleSelect = this.handleSelect.bind(this)
        this.handleRequirement = this.handleRequirement.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.postNewUtterance = this.postNewUtterance.bind(this)
    }

    postUtterance(utterance, start, require) {
        return fetch(`${databaseURL+'/utterances/data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(utterance)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        }).then(data => {
            const { domainId, prevBranch, userId, num_experiment, turn, deployedVersion } = this.props
            const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[data.name]: true}}
            this.patchUserUtterance(data.name, userId, domainId, num_experiment, turn)
            this.postBranch(newBranch, utterance, start, require)
        });
    }

    postNewUtterance(utterance) {
        return fetch(`${databaseURL+'/utterances/new-data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(utterance)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        })
    }

    postBranch(branch, utterance, start, addRequired) {
        return fetch(`${databaseURL+'/tree-structure/data'+this.extension}`, {
            method: 'POST',
            body: JSON.stringify(branch)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        }).then(data => {
            const { prevBranch, domainId, userId, num_experiment, turn, save_requirement, deployedVersion } = this.props
            const branch = {[data.name]: true}
            if (prevBranch){
                this.patchChildren(prevBranch, branch)
            }
            if (start) {
                this.patchFirstBranch(domainId, deployedVersion, branch)
            }
            if (addRequired) {
                if(save_requirement && !utterance.required){
                    this.patchBranchRequired(save_requirement, data.name)
                } else{
                    this.patchBranchRequired(utterance, data.name)
                }
            }
            this.patchUserBranch(data.name, userId, domainId, num_experiment, turn)
            this.sendAnswer(utterance, data.name, true)
        });
    }

    patchUserUtterance(id, userId, domainId, num_experiment, turn) {
        return fetch(`${databaseURL+'/users/lists/domain-utterances/'+userId+'/'+domainId+'/'+num_experiment+'/'+this.extension}`, {
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
        return fetch(`${databaseURL+'/users/lists/branches/'+userId+'/'+domainId+'/'+num_experiment+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[id]: turn})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    patchFirstBranch(domainId, deployedVersion, f_branch) {
        // return fetch(`${databaseURL+'/last-deployed/data/'+domainId+'/branches'+this.extension}`, {
        return fetch(`${databaseURL+'/deployed-history/data/'+domainId+'/'+deployedVersion+'/branches'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(f_branch)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        });
    }

    patchBranchRequired(requirement, bId) {
        return fetch(`${databaseURL+'/labels/data/'+requirement.topic+'/branch'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[bId]: true})
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

    changeButtonState = () => {

        this.setState(prevState => ({
            buttonState: !prevState.buttonState
        }))
    }

    handleChangeText = (e) => {
        this.setState({
            input: e.target.value
        })
    }

    // Select origin answer of Bot, state: false
    handleSelect = (answer, branch) => {
        const { userId, domainId, num_experiment, turn } = this.props


        this.patchUserUtterance(answer.uId, userId, domainId, num_experiment, turn)
        this.patchUserBranch(answer.branchId, userId, domainId, num_experiment, turn)
        this.sendAnswer(answer, branch, false)
    }

    // Add New answer of Bot, state: true
    handleCreate = () => {
        const { input } = this.state
        const { domainId, userId, deployedVersion, numSession } = this.props
        const newUtterance = {bot: true, text: input, domain: domainId, userId: userId, version: deployedVersion, numSession: numSession}
        const newlyAddedUtterance = {time: new Date(),text: input, domain: domainId, userId: userId, version: deployedVersion, numSession: numSession}
        this.setState({
            input: '',
        })

        // Adding new answer(Bot)
        this.postUtterance(newUtterance, false, true)
        this.postNewUtterance(newlyAddedUtterance)
    }

    handleRequirement = (requirement) => {
        const { changeRequirment, domainId, startBranch, prevBranch, userId, num_experiment, turn, deployedVersion } = this.props
        this.patchUserUtterance(requirement.uId, userId, domainId, num_experiment, turn)
        if(startBranch){
            // FIXME: console.log(requirement)
            // FIXME: console.log(requirement.bId)
            if (requirement.bId){
                const branch = Object.keys(requirement.bId)            
                this.patchUserBranch(branch[0], userId, domainId, num_experiment, turn)
                this.sendAnswer(requirement, branch[0], false)
                // FIXME: console.log(branch)
            } else{
                const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[requirement.uId]: true}}
                this.postBranch(newBranch, requirement, false, true)
                // FIXME: console.log(newBranch)
            }
        } else {
            const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[requirement.uId]: true}}
            this.postBranch(newBranch, requirement, true, true)
            // FIXME: console.log(newBranch)
        }
        changeRequirment(requirement)
    }

    handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            this.handleCreate()
        }
    }

    handleClose = () => this.setState({ modalOpen: false, })

    render() {
        const { inputState, input, buttonState, modalOpen, } = this.state
        const { answerList, requirementList, num_requirement, prevBranch, start_requirement, r_answerList, otherResponse, instructionPosition } = this.props
        const { handleSelect, changeInputState, handleChangeText, handleCreate, handleKeyPress, handleRequirement, changeButtonState } = this
        

        if (Object.keys(answerList + r_answerList).length > 3){
            /*console.log("answerlist: ")
            console.log(answerList)
            console.log("r_answerlist: ")
            console.log(r_answerList)*/
            this.overflowCondition = 'scroll'
        }

        return (
            <div className="systemBotButtonBox">
                { (prevBranch === null || requirementList.length === 0)
                    ?   null
                    :   <div>
                            <div className="systemBotText">
                                It's <Image avatar spaced='right' src={bot} />Bot's turn!
                            </div>
                            { (requirementList.length === instructionPosition)
                                ?   <Modal
                                    open={modalOpen}
                                    onClose={this.handleClose}
                                    basic
                                    size='small'
                                    >
                                        <Header icon='info' content="On every chatbot's turn" />
                                        <Modal.Content style={{lineHeight: '1.8', fontSize:"130%",}}>
                                            <p>After you finish your turn, you will be choosing from different options as the below image.</p>
                                            <Image src={botsTurn} size='large' centered rounded />
                                            <p> </p>
                                            <p>On the left side, there is the <i><u>Add new response button</u></i> and the <u><i>Show others' responses button</i></u> to elaborate on the current conversation topic.</p>
                                            <p>If there is no need to add new responses, please continue by clicking on the right-side <u><i>next conversation topic button</i></u> to continue.</p>
                                            
                                        </Modal.Content>
                                        <Modal.Actions>
                                            <Button color='green' onClick={this.handleClose} inverted>
                                                <Icon name='checkmark' /> Okay, I understand
                                            </Button>
                                        </Modal.Actions>
                                    </Modal>
                                :   null
                            }
                        </div>
                }
                {/*  FIXME: more depth
                <div style={{minHeight: "150px"}}>
                    <Segment.Group>
                        <Segment textAlign='center' color='teal' >
                            <div>
                            {requirementList.map((requirement, id) => {
                                return id === Object.keys(requirementList).length - num_requirement?
                                    <div key={id}>
                                        <Button fluid color='teal'>{requirement.text}</Button>
                                    </div>
                                    : null
                                })
                            }
                            </div>
                        </Segment>
                        <Segment textAlign='center' color='teal' >
                            <div>
                            {requirementList.map((requirement, id) => {
                                return id === Object.keys(requirementList).length - num_requirement?
                                    <div key={id}>
                                        <div>Do you think this message is appropriate?</div>
                                    </div>
                                    : null
                                })
                            }
                            </div>
                        </Segment>
                    </Segment.Group>
                </div>
                        */}
                <div style={{marginTop:"10px", width:"100%", display:"table"}}>
                <div style={{marginTop:"10px", display: "table-cell", width: "50%"}}>
                    { prevBranch === null
                        ?   null
                        :   <div>
                                <Segment.Group>
                                    <Segment textAlign='center' color='teal'>
                                        <span className="systemBotText" style={{height:"25px"}}>
                                            { requirementList.length === 0
                                                ?   "If you wish to elaborate more, insert new bot's conversation"
                                                :   "A: If you wish to elaborate more, insert new bot's conversation before moving on"
                                            }
                                        </span>
                                        <div style={{height: '10px'}}></div>
                                        <div className="systemBotText" style={{color: 'red'}}>
                                            { otherResponse
                                                ?   "You can (1) insert new bot's response or (2) select from what other people suggested"
                                                :   "You can insert new bot's response"
                                            }
                                        </div>
                                        <div style={{height: '15px'}}></div>
                                        { inputState
                                            ? <Button fluid color='teal' onClick={changeInputState}>Add new response</Button>
                                            : <Input fluid type='text' placeholder='Type your answer...' action>
                                                {/*<Label color='teal'>
                                                    <Image avatar spaced='right' src={bot} />
                                                    
                                                </Label>    */}
                                                <Image avatar verticalAlign='middle' spaced='right' src={bot} />
                                                <input value={input} onChange={handleChangeText} onKeyPress={handleKeyPress}/>
                                                <Button type='submit' color='teal' onClick={handleCreate}>Add</Button>
                                            </Input>
                                        }
                                        <div style={{height: '8px'}}></div>
                                        { buttonState
                                            ? <Button fluid color='teal' onClick={changeButtonState}>Show others' responses</Button>
                                            : <div>
                                                <Button fluid color='red' onClick={changeButtonState}>Hide others' responses</Button>
                                                <div style={{maxHeight: '150px', overflowY: 'scroll', overflowX: 'hidden'}}>
                                                { otherResponse
                                                    ?   start_requirement === true
                                                            ?   Object.keys(r_answerList).map(id => {
                                                                    const r_answer = r_answerList[id]
                                                                    return (
                                                                        <div key={id}>
                                                                            <div style={{height: '10px'}}></div>
                                                                            <Button fluid onClick={handleSelect.bind(this, r_answer, r_answer.branchId)}>{r_answer.text}</Button>
                                                                        </div>
                                                                    )
                                                                })
                                                            :   null
                                                    : null
                                                }
                                                { otherResponse
                                                    ?   Object.keys(answerList).map(id => {
                                                            const answer = answerList[id]
                                                            return (
                                                                <div key={id}>
                                                                    <div style={{height: '10px'}}></div>
                                                                    <Button fluid onClick={handleSelect.bind(this, answer, answer.branchId)}>{answer.text}</Button>
                                                                </div>
                                                            )
                                                        })
                                                    :   null
                                                }
                                                </div>
                                            </div>
                                        }
                                    </Segment>
                                </Segment.Group>
                            </div>
                        }
                </div>
                <div style={{display: "table-cell"}}>
                    { requirementList.length === 0
                        ?   null
                        :   <div style={{minHeight: "150px"}}>
                                <Segment.Group>
                                    <Segment textAlign='center' color='teal' >
                                        <div className="systemBotText" style={{height:"25px"}}>
                                            { prevBranch === null
                                                ?   'Begin the conversation with first topic'
                                                :   'B: Just continue with next conversation topic'
                                            }
                                        </div>
                                        <div style={{height: '15px'}}></div>
                                        <div>
                                        {requirementList.map((requirement, id) => {
                                            return id === Object.keys(requirementList).length - num_requirement?
                                                <div key={id}>
                                                    <div style={{height: '5px'}}></div>
                                                    <Button fluid color='teal' onClick={handleRequirement.bind(this, requirement, id)}>{requirement.text}</Button>
                                                </div>
                                                : null
                                            })
                                        }
                                        </div>
                                    </Segment>
                                </Segment.Group>
                            </div>
                    }
                    {/*<div style={{height:'10px'}}></div>*/}
                    
                </div>
                </div>
            </div>
        );
    }
}
