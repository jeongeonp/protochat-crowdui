import React, { Component } from 'react'
import { Button, Icon, } from 'semantic-ui-react'
import './RightSideBar.css'

//const databaseURL = "https://protobot-rawdata.firebaseio.com/";
const databaseURL = "https://kixlab-uplb-hci-protobot-v2.firebaseio.com/";

export class RightSideBar extends Component {
    extension = '.json'
    constructor(props) {
        super(props)
        this.state = {
            num_experiment: 1,
            numSession: null,
        }
        this.getURLParams = this.getURLParams.bind(this)
        this.patchUserEndTime = this.patchUserEndTime.bind(this)
        this.patchUserSetId = this.patchUserSetId.bind(this)
        this.sendEndStatus = this.sendEndStatus.bind(this)
        this.sendStartStatus = this.sendStartStatus.bind(this)
        this.endExperiment = this.endExperiment.bind(this)
    }

    componentDidMount() {
        const numSession = 1

        this.setState({
            numSession: numSession,
        })
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

    patchUserEndTime(sessionNum, userId, date) {
        return fetch(`${databaseURL+'/crowd/data/'+userId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[sessionNum]: date})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        })
    }

    patchUserSetId(domainId, userId, deployedVersion, checkSessionObject) {
        return fetch(`${databaseURL+'/crowd/lists/domains/'+domainId + '/' + deployedVersion + '/' + userId + '/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify(checkSessionObject)
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        })
    }

    // Convey the endstatus to parent component when each conversation is ended
    sendEndStatus = () => {
        const { controlEndStatus, controlEndButtonStatus, controlNextButtonStatus, userId, domainId, deployedVersion } = this.props
        const { num_experiment } = this.state
        const sessionNum = num_experiment + 'thEndTime'
        const checkSession = num_experiment
        const checkSessionObject = {[checkSession]: true}

        this.patchUserEndTime(sessionNum, userId, new Date())
        this.patchUserSetId(domainId, userId, deployedVersion, checkSessionObject)

        // block the 'endbutton'
        controlEndButtonStatus()

        // unblock the 'nextbutton'
        controlNextButtonStatus()

        //change the status
        controlEndStatus()
    }

    // Convey the startstatus to parent component when each conversation starts
    sendStartStatus = () => {
        const { controlStartStatus, controlNextButtonStatus } = this.props
        const { num_experiment } = this.state

        this.setState({
            num_experiment: num_experiment + 1,
        })

        //change the status
        controlStartStatus()

        // block the 'nextbutton'
        controlNextButtonStatus()
    }

    // End the whole experiment
    endExperiment = () => {
        this.patchUserEndTime('LastEndTime', this.props.userId, new Date())
        this.props.controlQuitStatus()
    }

    render() {
        const { num_experiment, numSession } = this.state

        // Control each button's disabled status
        const { endButtonStatus, nextButtonStatus } = this.props


        return (
            <div className="rightGrid">
                
                <div className="rightInsBox">
                    <div className="textBoxFormat">
                        <h2>Instruction</h2>
                        <p>** the designer's custom instruction will go in here **</p>
                    </div>
                    <div className="textCenter">
                        { numSession === 1
                            ?   null
                            :   <div>
                                    <div style={{ marginBottom: '20px' }}> Progress </div>
                                    <div style={{ marginBottom: '20px' }}> {num_experiment} / {numSession} </div>
                                </div>
                        }
                    </div>
                </div>
                <div className="rightinfoBox">
                    <div className="textCenter">
                        {  endButtonStatus
                            ?   <Button fluid icon labelPosition='left' onClick={() => this.sendEndStatus()}>
                                    <Icon name='pause' />
                                    End current session
                                </Button>
                            :   <Button disabled fluid icon labelPosition='left' onClick={() => this.sendEndStatus()}>
                                    <Icon name='pause' />
                                    End current session
                                </Button>
                        }
                        <div style={{height: '20px'}}></div>
                        { nextButtonStatus
                            ?   <Button fluid icon labelPosition='right' onClick={() => { (num_experiment === numSession) ? this.endExperiment() : this.sendStartStatus()}}>
                                    { (num_experiment === numSession)
                                        ? 'End experiment'
                                        : 'Move on to next session'
                                    }
                                    <Icon name='right arrow' />
                                </Button>
                            :   <Button disabled fluid icon labelPosition='right' onClick={() => this.sendStartStatus()}>
                                    { numSession === 1
                                        ? 'Move on to next session'
                                        : 'End experiment'
                                    }
                                    <Icon name='right arrow' />
                                </Button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
