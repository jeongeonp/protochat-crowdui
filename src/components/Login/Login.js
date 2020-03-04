import React, { Component } from 'react';
import { Button, Modal, Form, Image, Popup } from 'semantic-ui-react'
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
            //gender: null,
            //age: null,
            task: null,

            domainID: null,
            domainName: null,
        }
        this.userPost = this.userPost.bind(this)
        this.sendAndPost = this.sendAndPost.bind(this)
        this.changeTutorialState = this.changeTutorialState.bind(this)
        this.addTutorialNum = this.addTutorialNum.bind(this)
        this.reduceTutorialNum = this.reduceTutorialNum.bind(this)
    }

    componentDidMount() {
        const domainID = this.getURLParams('domain')

        this.setState({
            domainID: domainID,
        })

        this.getDomains('domains/data/'+ domainID + '/name');      
    }

    getDomains(address) {
        fetch(`${databaseURL+address}.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(domainName => {
            this.setState({domainName: domainName})
        });
    }


    getURLParams = (param) => {
        const PageURL = window.location.href;
        const s = '?'
        if (PageURL.indexOf(s) !== -1){
            const f_PageURL = PageURL.split('?');
            const s_PageURL = f_PageURL[1]
            var sURLVariables = s_PageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) 
            {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === param) 
                {
                    return sParameterName[1]
                }
            }
        }
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
        const { name } = this.state
        if (!name){
            
        } else {
            const newUser = {timestamp: new Date(), name: name }
            this.userPost(newUser)
        }
    }

    /*sendAndPost = () => {
        const { name, gender, age} = this.state
        if (name && gender && age){
            const newUser = {timestamp: new Date(), name: name,gender: gender, age: age}
            this.userPost(newUser)
        }
    }*/

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
        const { name, gender, age, tutorial, tutorial_list, tutorial_num, domainName, task } = this.state
        const { sendAndPost, changeTutorialState, addTutorialNum, reduceTutorialNum } = this
        const options = [
            { key: 'm', text: 'Male', value: GENDER.M },
            { key: 'f', text: 'Female', value: GENDER.F },
            { key: 'nb', text: 'Non-binary or third gender', value: GENDER.NB },
            { key: 'p', text: 'Prefer not to answer', value: GENDER.P },
        ]

        return (
            <div>
                { !tutorial
                    ?   <Modal open={true}>
                            <Modal.Header style={{textAlign:"center"}}>Welcome!</Modal.Header>
                                <Modal.Content style={{textAlign:"center", fontSize:"130%", lineHeight:"2"}}>
                                    <p>Your task is to finish <b>{domainName}</b> with the chatbot. </p>
                                    <p>During the conversation, there is a sequence of conversation topics <br/> you need to answer in order to finish your task. </p>
                                    <p>When you wish to elaborate more on the chatbot's conversation, <br/> please do so by clicking <u>A. Insert new conversation</u> to manually add what you want the chatbot to say.</p>
                                    <p style={{fontSize: "80%"}}><br/> <b>We recommend zomming out a little for better screen display!</b></p>
                                    {/*tutorial_list.map((item, id) => {
                                        return id === tutorial_num
                                            ?   <Image src={require('./Tutorial/' + item.source)} />
                                            :   null
                                        })
                                    */}
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button
                                        onClick={changeTutorialState}
                                        positive
                                        labelPosition='right'
                                        icon='checkmark'
                                        content='Next'
                                    />
                                    {/*(tutorial_num === (Object.keys(tutorial_list).length) || tutorial_num === 0)
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
                                    */}
                                </Modal.Actions>
                        </Modal>
                    :   <Modal open={true}>
                            <Modal.Header>Crowd ID</Modal.Header>
                                <Modal.Content>
                                    <p style={{fontSize:"130%", lineHeight:"1.8"}}>Please fill out your <b>Crowd ID</b> and the <b>Task Name</b> to begin the experiment session</p>
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
                                                fluid label='Task Name' 
                                                placeholder='Type your task'
                                                name='task'
                                                value={task}
                                                onChange={this.handleChange}
                                            />
                                            {/*<Form.Input 
                                                fluid label='Age'
                                                placeholder='Type your age'
                                                name='age'
                                                value={age}
                                                onChange={this.handleChange}    
                                            />*/}
                                        </Form.Group>
                                        {/*<Form.Select
                                            options={options}
                                            placeholder='Gender'
                                            name='gender'
                                            value={gender}
                                            onChange={this.handleChange}    
                                        />*/}
                                    </Form>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button
                                        onClick={changeTutorialState}
                                        positive
                                        labelPosition='left'
                                        icon='checkmark'
                                        content='Prev'
                                    />
                                    { name && task && (task.toLowerCase() === domainName.toLowerCase())
                                    ? <Button  
                                        onClick={sendAndPost}
                                        positive
                                        labelPosition='right'
                                        icon='checkmark'
                                        content='Begin Task' 
                                    />
                                    : <Popup
                                        content="Please double-check your Crowd ID and Task Name"
                                        on="click"  
                                        trigger={<Button  
                                            positive
                                            labelPosition='right'
                                            icon='checkmark'
                                            content='Begin Task' />}
                                    />
                                    }
                                    
                                </Modal.Actions>
                        </Modal>
                }
            </div>
        );
    }
}