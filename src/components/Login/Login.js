import React, { Component } from 'react';
import { Button, Header, Modal, Form } from 'semantic-ui-react'
import './Login.css'

const databaseURL = "https://protobot-rawdata.firebaseio.com/"

const GENDER = {
    M: 'MALE',
    F: 'FEMALE',
    O: 'OTHER',
  }

export class Login extends Component {
    constructor(props){
        super(props)
        this.state = {
            timestamp: null,
            name: null,
            gender: null,
            age: null,
        }
        this.userPost = this.userPost.bind(this)
        this.sendAndPost = this.sendAndPost.bind(this)
    }

    userPost(user) {
        return fetch(`${databaseURL}`+'/users/data.json', {
            method: 'POST',
            body: JSON.stringify(user)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(data => {
            const { changeLoginState } = this.props
            changeLoginState(data.name)
        })
    }

    sendAndPost = () => {
        const { name, gender, age } = this.state
        const newUser = {timestamp: new Date(), name: name,gender: gender, age: age}
        this.userPost(newUser)
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    render() {
        const { name, gender, age } = this.state
        const { sendAndPost } = this
        const options = [
            { key: 'm', text: 'Male', value: GENDER.M },
            { key: 'f', text: 'Female', value: GENDER.F },
            { key: 'o', text: 'Other', value: GENDER.O },
        ]
        return (
            <Modal open={true}>
                <Modal.Header>Protobot Data Collecting Experiment</Modal.Header>
                    <Modal.Content>
                        <p>Please write your information before the experiment</p>
                        <div style={{height: '10px'}}></div>
                        <Form>
                            <Form.Group widths='equal'>
                            <Form.Input 
                                fluid label='Name' 
                                placeholder='Type your name'
                                name='name'
                                value={name}
                                onChange={this.handleChange}
                            />
                            <Form.Input 
                                fluid label='Age'
                                placeholder='Type your age'
                                name='age'
                                value={age}
                                onChange={this.handleChange}    
                            />
                            </Form.Group>
                            <Form.Select
                                options={options}
                                placeholder='Gender'
                                name='gender'
                                value={gender}
                                onChange={this.handleChange}    
                            />
                        </Form>
                        <div style={{height: '10px'}}></div>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            onClick={sendAndPost}
                            positive
                            labelPosition='right'
                            icon='checkmark'
                            content='Start'
                        />
                    </Modal.Actions>
            </Modal>
        );
    }
}