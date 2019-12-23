import React, { Component } from 'react';
import { Button, Modal, Form, Image } from 'semantic-ui-react'
import './Login.css'

const databaseURL = "https://protobot-rawdata.firebaseio.com/"

const GENDER = {
    M: 'MALE',
    F: 'FEMALE',
    NB: 'Non-binary or third gender',
    P: 'Prefer not to answer'
  }

export class Login extends Component {
    constructor(props){
        super(props)
        this.state = {
            // State
            tutorial: false,

            // ImageSource
            tutorial_list: [
                {source: '[12_23] Crowd Tutorial-1.png'},
                {source: '[12_23] Crowd Tutorial-2.png'},
                {source: '[12_23] Crowd Tutorial-3.png'},
                {source: '[12_23] Crowd Tutorial-4.png'},
                {source: '[12_23] Crowd Tutorial-5.png'},
                {source: '[12_23] Crowd Tutorial-6.png'},
                {source: '[12_23] Crowd Tutorial-7.png'},
                {source: '[12_23] Crowd Tutorial-8.png'},
            ],
            tutorial_num: 0,

            timestamp: null,
            name: null,
            gender: null,
            age: null,
        }
        this.userPost = this.userPost.bind(this)
        this.sendAndPost = this.sendAndPost.bind(this)
        this.changeTutorialState = this.changeTutorialState.bind(this)
        this.addTutorialNum = this.addTutorialNum.bind(this)
        this.reduceTutorialNum = this.reduceTutorialNum.bind(this)
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
        const { name, gender, age} = this.state
        if (name && gender && age){
            const newUser = {timestamp: new Date(), name: name,gender: gender, age: age}
            this.userPost(newUser)
        }
    }

    changeTutorialState = () => {
        this.setState(prevState => ({
          tutorial: !prevState.tutorial,
        }));
    }

    addTutorialNum = () => {
        this.setState(prevState => ({
          tutorial_num: prevState.tutorial_num + 1,
        }));
    }

    reduceTutorialNum = () => {
        this.setState(prevState => ({
          tutorial_num: prevState.tutorial_num - 1,
        }));
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    render() {
        const { name, gender, age, tutorial, tutorial_list, tutorial_num } = this.state
        const { sendAndPost, changeTutorialState, addTutorialNum, reduceTutorialNum } = this
        const options = [
            { key: 'm', text: 'Male', value: GENDER.M },
            { key: 'f', text: 'Female', value: GENDER.F },
            { key: 'nb', text: 'Non-binary or third gender', value: GENDER.NB },
            { key: 'p', text: 'Prefer not to answer', value: GENDER.P },
        ]

        return (
            <div>
                { tutorial
                    ?   <Modal open={true}>
                            <Modal.Header>Tutorial</Modal.Header>
                                <Modal.Content>
                                    {tutorial_list.map((item, id) => {
                                        return id === tutorial_num
                                            ?   <Image src={require('./Tutorial/' + item.source)} />
                                            :   null
                                        })
                                    }
                                </Modal.Content>
                                <Modal.Actions>
                                    {(tutorial_num === (Object.keys(tutorial_list).length) || tutorial_num === 0)
                                        ?   null
                                        :   <Button
                                                onClick={reduceTutorialNum}
                                                positive
                                                labelPosition='left'
                                                icon='checkmark'
                                                content='Prev'
                                            />
                                    }
                                    {tutorial_num === (Object.keys(tutorial_list).length - 1)
                                        ?   <Button
                                                onClick={sendAndPost}
                                                positive
                                                labelPosition='right'
                                                icon='checkmark'
                                                content='Start'
                                            />
                                        :   <Button
                                                onClick={addTutorialNum}
                                                positive
                                                labelPosition='right'
                                                icon='checkmark'
                                                content='Next'
                                            />
                                    }
                                </Modal.Actions>
                        </Modal>
                    :   <Modal open={true}>
                            <Modal.Header>Protobot Data Collecting Experiment</Modal.Header>
                                <Modal.Content>
                                    <p>Please write your information before the experiment</p>
                                    <div style={{height: '10px'}}></div>
                                    <Form>
                                        <Form.Group widths='equal'>
                                            <Form.Input 
                                                fluid label='Crowd ID' 
                                                placeholder='Type your Crowd ID'
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
                                        onClick={changeTutorialState}
                                        positive
                                        labelPosition='right'
                                        icon='checkmark'
                                        content='Go to Tutorial'
                                    />
                                </Modal.Actions>
                        </Modal>
                }
            </div>
        );
    }
}