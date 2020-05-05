import React, { Component } from 'react';
import { Segment, Button, Input, Image, Modal, Icon, Header } from 'semantic-ui-react';
import './SystemBranchButton.css';

//import bot from './../../Message/images/bot.png';
//import botsTurn from './bots-turn.PNG';

//const databaseURL = "https://protobot-rawdata.firebaseio.com/";
const databaseURL = "https://kixlab-uplb-hci-protobot-v2.firebaseio.com/";

export class SystemBranchButton extends Component {
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
        return fetch(`${databaseURL+'/tree-structure/data/'+this.props.domainId+this.extension}`, {
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
        return fetch(`${databaseURL+'/crowd/lists/domain-utterances/'+userId+'/'+domainId+'/'+num_experiment+'/'+this.extension}`, {
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
        return fetch(`${databaseURL+'/crowd/lists/branches/'+userId+'/'+domainId+'/'+num_experiment+'/'+this.extension}`, {
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
        return fetch(`${databaseURL+'/deployments/data/'+domainId+'/'+deployedVersion+'/branches'+this.extension}`, {
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
        const { domainID } = this.props
        return fetch(`${databaseURL+'/topics/data/'+ domainID + '/' + requirement.topic+'/branch'+this.extension}`, {
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
        return fetch(`${databaseURL+'/tree-structure/data/'+this.props.domainId+'/'+prevBranch+'/children'+this.extension}`, {
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
            if (requirement.bId){
                const branch = Object.keys(requirement.bId)            
                this.patchUserBranch(branch[0], userId, domainId, num_experiment, turn)
                this.sendAnswer(requirement, branch[0], false)
            } else{
                const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[requirement.uId]: true}}
                this.postBranch(newBranch, requirement, false, true)
            }
        } else {
            const newBranch = {domain: domainId, parent: prevBranch, version: deployedVersion, utterances: {[requirement.uId]: true}}
            this.postBranch(newBranch, requirement, true, true)
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
            this.overflowCondition = 'scroll'
        }

        const pathList = ['coke', 'hamburger', 'icecream']

        return (
            <div className="systemBotButtonBox">
                { (prevBranch === null || requirementList.length === 0)
                    ?   null
                    :   <div>
                            <div className="systemBotText">
                                
                            </div>
                        </div>
                }
                <div style={{marginTop:"10px", width:"100%", display:"table"}}>
                
                <div style={{display: "table-cell"}}>
                    
                    <div style={{minHeight: "150px"}}>
                        <Segment.Group>
                            <Segment textAlign='center' color='teal' >
                                <div className="systemBotText" style={{height:"25px"}}>
                                    Choose from the below answers.<br/>You will proceed the conversation with a path of your choice.
                                </div>
                                <div style={{height: '15px'}}></div>
                                <div>
                                {Object.keys(pathList).map(id => {
                                    const answer = pathList[id]
                                    return (
                                        <div key={id}>
                                            <div style={{height: '10px'}}></div>
                                            <Button fluid>{answer}</Button>
                                        </div>
                                    )
                                })}
                                </div>
                            </Segment>
                        </Segment.Group>
                    </div>
                    
                </div>
                </div>
            </div>
        );
    }
}
