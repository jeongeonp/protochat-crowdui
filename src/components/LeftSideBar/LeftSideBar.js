import React, { Component } from 'react';
import { Header, Icon, Modal, Button, Image } from 'semantic-ui-react'
import './LeftSideBar.css';
import instruction from './add-new-response.PNG';
//import { Popup } from "./Popup/Popup";

export class LeftSideBar extends Component {
    num_requirement = 0;

    constructor(props){
        super(props);
        this.state = {
            input: '',
            r_List: [],
            modalOpen: true,
        }
	    this.changeCheckedRequirement = this.changeCheckedRequirement.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.end !== this.props.end){
            if(this.props.end){
                this.setState({
                    r_List: [],
                });
                this.num_requirement = 0
                this.props.initializeRequirementList()
            }
        }

        if (prevProps.requirementList !== this.props.requirementList){
            this.setState({
                r_List: this.props.requirementList
            })
        }
        if (prevProps.requirement !== this.props.requirement){
            this.changeCheckedRequirement()
        }
    }

    changeCheckedRequirement = () => {
        const {r_List} = this.state
        const {requirement} = this.props
        this.num_requirement += 1
        this.setState({
            r_List: r_List.map(r => r.requirement === requirement.requirement
                ? { requirement: requirement.requirement, text: requirement.text, checked: true}
                : r
            )
        })
    }

    handleChangeText = (e) => {
        this.setState({
            input: e.target.value
        });
    }

    handleClose = () => this.setState({ modalOpen: false })

    render() {
        const {r_List, modalOpen} = this.state
        return (
            <div className="leftGrid">
                <div className="protobotLogo">ProtoChat</div>
                <div className="sessionBox">Conversation Session</div>
                <div className="leftInsBox">
                <div className="leftInsBoxText">
                    { r_List.length === 0
                        ?   null
                        :   <div>
                                <span style={{fontSize: '17px', color: '#E8EAF6', fontWeight: 'bold'}}>Sequence of Conversation Topics</span>
                                <Modal
                                    //trigger={<Button onClick={this.handleOpen}>Show Modal</Button>}
                                    open={modalOpen}
                                    onClose={this.handleClose}
                                    basic
                                    size='small'
                                >
                                    <Header icon='info' content='Sequence of Conversation Topics' />
                                    <Modal.Content style={{lineHeight: '1.8', fontSize:"130%",}}>
                                        <p> 
                                        {"<--  The list on the left has the mandatory conversation topics arranged in order. Please refer to your current topic during the conversation by looking at the checkboxes."} 
                                        </p>
                                        {/*<p>During every chatbot's turn, there will be a <u>Add new response</u> button like the below image. Please <b><u>add at least one</u></b> new response throughout the conversation session.</p>
                                        <Image src={instruction} size='medium' centered rounded />*/}
                                    </Modal.Content>
                                    <Modal.Actions>
                                        <Button color='green' onClick={this.handleClose} inverted>
                                            {/*<Icon name='checkmark' /> Yes, I will add at least one response*/}
                                            <Icon name='checkmark' /> Yes, I will refer to the list
                                        </Button>
                                    </Modal.Actions>
                                </Modal>
                        </div>
                    }
                    <div style={{height:'25px'}}></div>
                    {r_List.map((requirement, i) => {
                        return requirement.checked
                            ?   <div key={i}>
                                    <div style={{height:'10px'}}></div>
                                    <div className="ui checkbox">
                                        <input type="checkbox" checked={true} className="hidden" readOnly="" tabIndex={i}/>
                                        <label style={{color:'white'}}>{requirement.requirement}</label>
                                    </div>
                                </div>
                            :   <div key={i}>
                                    <div style={{height:'10px'}}></div>
                                    <div className="ui checkbox">
                                        <input type="checkbox" className="hidden" readOnly="" tabIndex={i}/>
                                        <label style={{color:'white'}}>{requirement.requirement}</label>
                                    </div>
                                </div>
                        })
                    }
                </div>
            </div>
        </div>
        );
    }
}