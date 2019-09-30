import React, { Component } from 'react';
import { Message } from "./Message/Message.js";

export class MessageList extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { messageList } = this.props;
        
        // render whole messages during conversation
        const messages = messageList.map(
            ({id, type, time, text}, i) => (
                <div key={i}>
                    <Message
                        id={id}
                        type={type}
                        time={time}
                        text={text}
                    />
                </div>
            )
        );

        return (
            <div>
                {messages}
            </div>
        );
    }
}