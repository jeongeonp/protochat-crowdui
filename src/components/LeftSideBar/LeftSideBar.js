import React, { Component } from 'react';
import { Message } from 'semantic-ui-react'
import './LeftSideBar.css';

export class LeftSideBar extends Component {
    num_requirement = 0;

    constructor(props){
        super(props);
        this.state = {
            input: '',
            r_List: [],
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

    render() {
        const {r_List} = this.state
        const {addrequirement} = this.props
        return (
            <div className="leftGrid">
                <div className="protobotLogo">Protobot</div>
                <div className="sessionBox">Conversation Session</div>
                <div className="leftInsBox">
                <div className="leftInsBoxText">
                    { r_List.length === 0
                        ?   null
                        :   <span style={{fontSize: '17px', color: '#E8EAF6', fontWeight: 'bold'}}>Sequence of Conversation</span>
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
                                    { (i === this.num_requirement || i === this.num_requirement + 1)
                                        ? <div className="leftInsBoxMessageText">
                                            <Message size='tiny'>{requirement.text}</Message>
                                        </div>
                                        : null
                                    }
                                    { addrequirement
                                        ?   <div>
                                                <div style={{height:'10px'}}></div>
                                                <div className="ui checkbox">
                                                    <label style={{color:'white'}}> (...) </label>
                                                </div>
                                            </div>
                                        : null
                                    }
                                </div>
                            :   <div key={i}>
                                    <div style={{height:'10px'}}></div>
                                    <div className="ui checkbox">
                                        <input type="checkbox" className="hidden" readOnly="" tabIndex={i}/>
                                        <label style={{color:'white'}}>{requirement.requirement}</label>
                                    </div>
                                    { (i === this.num_requirement || i === this.num_requirement + 1)
                                        ? <div className="leftInsBoxMessageText">
                                            <Message size='tiny'>{requirement.text}</Message>
                                        </div>
                                        : null
                                    }
                                </div>
                        })
                    }
                </div>
            </div>
        </div>
        );
    }
}