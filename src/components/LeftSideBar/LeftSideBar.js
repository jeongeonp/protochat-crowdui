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
            tp_List: [],
            tt_List: [],
            modalOpen: true,

            /* For the flowchart */
            nodes: [],
            links: [],
            linkIds: [],
        }
        this.changeCheckedRequirement = this.changeCheckedRequirement.bind(this);
        this.addNodes = this.addNodes.bind(this)
        this.addLinks = this.addLinks.bind(this)
        this.createDiagram = this.createDiagram.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.requirementList !== this.props.requirementList || 
            prevProps.topicPathList !== this.props.topicPathList || 
            prevProps.topicTransitionList !== this.props.topicTransitionList) {
                this.setState({
                    r_List: this.props.requirementList,
                    tp_List: this.props.topicPathList,
                    tt_List: this.props.topicTransitionList,
                })
                this.createDiagram()
            }

        if (prevProps.end !== this.props.end){
            if(this.props.end){
                this.setState({
                    r_List: [],
                });
                this.num_requirement = 0
                this.props.initializeRequirementList()
            }
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
                ? { requirement: requirement.requirement, text: requirement.text, checked: true, topic: requirement.topic}
                : r
            )
        })
        this.createDiagram()
    }


    handleClose = () => this.setState({ modalOpen: false })

    addNodes = (id, label, color = '#dddddd') => {
        var colorString = 'fill: ' + color
        var config = { style: colorString }
        var newNode = { id: id, label: label, labelType: "string", config: config }
        var currNodes = this.state.nodes
        var currNodesId = currNodes.map((c) => c.id)
        if (currNodesId.indexOf(id) < 0 || color !== '#dddddd'){
        currNodes.push(newNode)
        this.setState({
            nodes: currNodes
        })
        }   
    }

    addLinks = (source, target, label, id) => {
        var newLink = { source: source, target: target, label: label, config: {curve: d3.curveLinear}}
        var currLinks = this.state.links
        var currLinkIds = this.state.linkIds

        if (currLinkIds.indexOf(id) < 0) {
        currLinks.push(newLink)
        currLinkIds.push(id)
        this.setState({
            links: currLinks,
            linkIds: currLinkIds,
        })
        }
    }


    /* TODO: Adjust the structure to new database */
    createDiagram = () => {
        const { r_List, tp_List, tt_List } = this.state
        const { addLinks, addNodes } = this

        
        //console.log(tt_List)
        //console.log(tp_List)
        //console.log(r_List)
        r_List.map((requirement) => {
            if (requirement === this.props.requirement) {
                addNodes(requirement.topic, requirement.requirement, '#FFBB00')
            } else if (requirement.checked === true) {
                addNodes(requirement.topic, requirement.requirement, '#6588a7')
            } else {
            addNodes(requirement.topic, requirement.requirement)
            }
            return true;
        })

        //console.log(topicPathList)
        //console.log(topicTransitionList)

        tt_List.map((path) => {
            var correctPath = null;
            tp_List.map((p) => {
                if (p.topic === path.path ) {
                    correctPath = p
                }
            })
            

            if (correctPath) {
                addLinks(path.startNode, path.endNode, correctPath.requirement, correctPath.topic)
            }
        })
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
                                    <span style={{fontSize: '17px', color: '#ffffff', fontWeight: 'bold', marginLeft: "8%"}}>Sequence of Conversation Topics</span>
                                    <Modal
                                        open={modalOpen}
                                        onClose={this.handleClose}
                                        basic
                                        size='small'
                                    >
                                        <Header icon='info' content='Sequence of Conversation Topics' />
                                        <Modal.Content style={{lineHeight: '1.8', fontSize:"130%",}}>
                                            <p> 
                                            {"<--  The graph on the left shows the flow of the mandatory conversation topics. Please refer to your current topic by looking for the yellow node."} 
                                            </p>
                                        </Modal.Content>
                                        <Modal.Actions>
                                            <Button color='green' onClick={this.handleClose} inverted>
                                                <Icon name='checkmark' /> Yes, I will refer to the graph
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