import React, { Component } from 'react';
import { Modal } from 'semantic-ui-react'
import './Quit.css'

// const databaseURL = "https://protobot-rawdata.firebaseio.com/"

export class Quit extends Component {
    constructor(props){
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <Modal size={'small'} open={true}>
                <Modal.Header>End the experiment</Modal.Header>
                    <Modal.Content>
                        <p>Thank you for your participation</p>
                    </Modal.Content>
            </Modal>
        );
    }
}