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
                    width='100%'
                    height='500'
                    animate={0}
                    shape='rect'
                    fitBoundaries
                    zoomable
                    onNodeClick={e => console.log(e)}
                    onRelationshipClick={e => console.log(e)}
                />
            </div>
        )
    }
}