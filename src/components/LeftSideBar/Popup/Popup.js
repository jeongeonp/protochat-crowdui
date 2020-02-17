import React, { Component } from 'react';
import { Message } from 'semantic-ui-react'
import './Popup.css'

const databaseURL = "https://protobot-rawdata.firebaseio.com/"



export class Popup extends Component {
    constructor(props){
        super(props)
        this.state = {
            visible: true,

        }
        // bind the functions
        this.handleDismiss = this.handleChange.bind(this)
    }

    // insert functions
    handleDismiss = () => {
        this.setState({ visible: false })
        console.log(this.state.visible);
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    render() {
        const { visible } = this.state
        //const { sendAndPost, changeTutorialState, addTutorialNum, reduceTutorialNum } = this
        
        return (
            visible === true
            ?   <Message
                    floating
                    header='Welcome back!'
                    content='This is a special notification which you can dismiss.'
                />
            : null
        );
    }
}