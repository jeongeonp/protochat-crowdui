import React, { Component } from 'react';
import './FlowChart.css';

import DagreGraph from 'dagre-d3-react'
//import * as d3 from 'd3'



export class Flowchart extends Component {

    constructor(props) {
        super(props);
        
        this.state = {

        }
    }

    /*
    createDiagram = () => {
        this.addNodes("1", "topic1", '#333333')
        this.addNodes("2", "topic2")
        this.addNodes("p1", "path1")
        this.addNodes("p2", "path2")
        this.addNodes("p3", "path3")
        this.addNodes('p3-2', "path3-2")
        this.addNodes('4', 'topic4')
        this.addNodes('5', 'topic5')
        
        this.addLinks('1', '2')
        this.addLinks('2', 'p1', 'choice1')
        this.addLinks('2', 'p2', 'choice2')
        this.addLinks('2', 'p3', 'choice3')
        this.addLinks('p3', 'p3-2')
        this.addLinks('p1', '4')
        this.addLinks('p2', '4')
        this.addLinks('p3-2', '4')
        this.addLinks('4', '5')
        console.log(this.state.nodes)
        console.log(this.state.links)
    }
    */

    render() {
       
        return (
            <div>
                <DagreGraph
                    nodes={this.props.nodes}
                    links={this.props.links}
                    options={{
                        rankdir: 'TB',
                        align: 'UL',
                        ranker: 'tight-tree',
                        
                    }}
                    width='250'
                    height='440'
                    animate={0}
                    shape='rect'
                    fitBoundaries
                    //zoomable
                    onNodeClick={e => console.log(e)}
                    onRelationshipClick={e => console.log(e)}
                />
            </div>
        )
    }
}