import React, { Component } from 'react';
import { Modal, Button } from 'semantic-ui-react'
import './Quit.css'

// const databaseURL = "https://protobot-rawdata.firebaseio.com/"

export class Quit extends Component {
    constructor(props){
        super(props)
        this.state = {
            survey: false
        }
    }

    postAnswer = () => {
        this.setState({
            survey: true,
        })
        //TODO: post if necessary
    }

    render() {
        const { survey } = this.state
        const { postAnswer } = this
        return (
            <div>
                <Modal size='small' open={true}>
                    <Modal.Header>End of the conversation session</Modal.Header>
                    <Modal.Content>
                        <div style={{fontSize: '15px'}}>Thank you for your participation!</div>
                        <div style={{fontSize: '15px'}}>Please go back to the MTurk website, and submit the verified code: <b>39dwjlkd17</b></div>
                        <div style={{fontSize: '15px', marginTop:"10px"}}>Thanks!</div>
                    </Modal.Content>
                    <Modal.Actions>
                        {/*<Button positive labelPosition='left' icon='left chevron' content='prev'/>*/}
                    </Modal.Actions>
                </Modal>
            {/*   survey
                ? <Modal size='small' open={true}>
                    <Modal.Header>End the experiment</Modal.Header>
                    <Modal.Content>
                        <div style={{fontSize: '15px'}}>Thank you for your participation!</div>
                        <div style={{fontSize: '15px'}}>Please go back to the MTurk website, and submit the verified code: <b>39dwjlkd17</b></div>
                        <div style={{fontSize: '15px', marginTop:"10px"}}>Thanks!</div>
                    </Modal.Content>
                    <Modal.Actions>
                        
                    </Modal.Actions>
                </Modal>
                : <Modal size='small' open={true}>
                    <Modal.Header>Sample survey</Modal.Header>
                    <Modal.Content>
                    To be implemented
                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive content='Submit' onClick={postAnswer} />
                    </Modal.Actions>
                </Modal>
            */}
            </div>
        );
    }
}