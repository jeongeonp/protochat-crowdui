import React, { Component } from 'react';
import { Header, Icon, Modal, Button } from 'semantic-ui-react'
import './LeftSideBar.css';
import { Flowchart } from './FlowChart.js';

import * as d3 from 'd3'

export class LeftSideBar extends Component {
    num_requirement = 0;

    constructor(props){
        super(props);
        this.state = {
            input: '',
            r_List: [],
            modalOpen: true,

            /* For the flowchart */
            nodes: [],
            links: [],
        }
        this.changeCheckedRequirement = this.changeCheckedRequirement.bind(this);
        this.addNodes = this.addNodes.bind(this)
        this.addLinks = this.addLinks.bind(this)
        this.createDiagram = this.createDiagram.bind(this)
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
            this.createDiagram()

        }
        if (prevProps.requirement !== this.props.requirement){
            this.changeCheckedRequirement()
            console.log(prevProps.requirement)
            console.log(this.props.requirement)
            console.log(this.props.requirementList)
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
        this.createDiagram()
    }


    handleClose = () => this.setState({ modalOpen: false })

    addNodes = (id, label, color = '#afcbff') => {
        var colorString = 'fill: ' + color
        var config = { style: colorString }
        var newNode = { id: id, label: label, labelType: "string", config: config }
        var currNodes = this.state.nodes
        currNodes.push(newNode)
        this.setState({
            nodes: currNodes
        })
    }

    addLinks = (source, target, label = '') => {
        var newLink = { source: source, target: target, label: label, config: {curve: d3.curveLinear} }
        var currLinks = this.state.links
        currLinks.push(newLink)
        this.setState({
            links: currLinks
        })
    }


    /* TODO: Adjust the structure to new database */
    createDiagram = () => {
        const { r_List } = this.state
        const { addLinks, addNodes } = this
        console.log(this.props.requirement)
        r_List.map((requirement, i) => {
            if (requirement === this.props.requirement) {
                addNodes(i, requirement.requirement, '#FFBB00')
            } else if (requirement.checked === true) {
                addNodes(i, requirement.requirement, '#FFFFFF')
            } else {
            addNodes(i, requirement.requirement)
            }
            //addLinks(i, i+1)
            return true;
        })
        for (var i=0; i<r_List.length-1; i++) {
            addLinks(i, i+1)
        }
        //addNodes(r_List.length, 'end')
    }



    render() {
        const { r_List, modalOpen, nodes, links } = this.state

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
                                        open={modalOpen}
                                        onClose={this.handleClose}
                                        basic
                                        size='small'
                                    >
                                        <Header icon='info' content='Sequence of Conversation Topics' />
                                        <Modal.Content style={{lineHeight: '1.8', fontSize:"130%",}}>
                                            <p> 
                                            {"<--  The graph on the left shows the mandatory conversation topics. Please refer to your current topic by looking for the yellow node."} 
                                            </p>
                                        </Modal.Content>
                                        <Modal.Actions>
                                            <Button color='green' onClick={this.handleClose} inverted>
                                                <Icon name='checkmark' /> Yes, I will refer to the list
                                            </Button>
                                        </Modal.Actions>
                                    </Modal>
                            </div>
                        }
                        <div style={{height:'5px'}}></div>
                        <Flowchart 
                            nodes={nodes}
                            links={links}
                        />
                    </div>
                </div>
            </div>
        );
    }
}