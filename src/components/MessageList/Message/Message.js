import React, { Component } from 'react';
import './Message.css';

import user from './images/avatar.png';
import bot from './images/bot.png';
import loading from './images/loading.gif';

export class Message extends Component {

    render() {
        const { type, time, text } = this.props;
        return (
            <div>
                {
                    (() => {
                        if (type === 'system') 
                            return (<div className="messageSectionSystem">
                                        <span style={{fontWeight: "bold", whiteSpace: 'pre-wrap'}}>{text}</span>
                                    </div>);
                        if (type === 'bot')
                            return  (<div className="messageSection messageSectionBot">
                                        <img src={bot} alt="Bot"/>
                                        <span className="messageSectionBody">{text}</span>
                                        <span className="messageSectionTime">{time}</span>
                                    </div>);
                        if (type === 'user')
                            return (<div className="messageSection messageSectionUser">
                                        <span className="messageSectionTime">{time}</span>
                                        <div className="messageSectionCenter">
                                            <span className="messageSectionBody">{text}</span>
                                        </div>
                                        <img src={user} alt="User"/>
                                    </div>);
                        if (type === 'loading')
                            return (<div className="messageSection messageSectionUser">
                                        <div className="messageSectionCenter">
                                            <span className="messageSectionBody"><img src={loading} alt="Bot"/></span>
                                        </div>
                                        <img src={user} alt="User"/>
                                    </div>);
                    })()
                }
            </div>
        );
    }
}