import React, { Component } from 'react';
import { Button, Modal, Form, Image, Popup } from 'semantic-ui-react'
import './Login.css'

//const databaseURL = "https://protobot-rawdata.firebaseio.com/";
const databaseURL = "https://kixlab-uplb-hci-protobot-v2.firebaseio.com/";

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
            deployedVersion: '',
            domainName: null,
        }
        this.userPost = this.userPost.bind(this)
        this.sendAndPost = this.sendAndPost.bind(this)
        this.changeTutorialState = this.changeTutorialState.bind(this)
        this.addTutorialNum = this.addTutorialNum.bind(this)
        this.reduceTutorialNum = this.reduceTutorialNum.bind(this)
        this.getDomainName = this.getDomainName.bind(this)
        this.getURLParams = this.getURLParams.bind(this)
    }

    componentDidMount() {
        const deployedVersion = this.getURLParams('deployedVersion')
        const domainID = this.getURLParams('domain')

        this.setState({
            deployedVersion: deployedVersion,
            domainID: domainID,
        })

        this.getDomainName(domainID)   
    }

    getDomainName = (domainId) => {
        fetch(`${databaseURL+'/domains/data/'+ domainId}/.json`).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        }).then(domainName => {
            this.setState({
                domainName: domainName.name
            })
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
        const {domainID, deployedVersion} = this.state
        return fetch(`${databaseURL}`+'/crowd/data/'+domainID+'/'+deployedVersion+'.json', {
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
            const newUser = {timestamp: new Date(), name: name, rating: 1 }
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
                            <Modal.Header style={{textAlign:"center"}}>Welcome to ProtoChat!</Modal.Header>
                                <Modal.Content style={{textAlign:"center", fontSize:"130%", lineHeight:"2"}}>
                                <p>You will be completing a task by talking with the chatbot. </p>
                                    <p>During the conversation, keep in mind that there is a sequence of conversation topics <br/> you need to answer in order to finish your task. </p>
                                    <p>Task name: <font color="red"><b>{domainName}</b></font></p>
                                    <p style={{fontSize: "80%"}}><br/> <b>We recommend zooming out a little for better screen display!</b></p>
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
                                                fluid label='Task Name (hint on the previous page)' 
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
                                        labelPosition='left'
                                        icon='chevron left'
                                        color='yellow'
                                        content='Prev'
                                    />
                                    { name && task && (domainName.toLowerCase().includes(task.toLowerCase()))
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