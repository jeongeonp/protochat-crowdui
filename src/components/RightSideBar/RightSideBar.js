import React, { Component } from 'react'
import { Button, Icon, } from 'semantic-ui-react'
import './RightSideBar.css'

const databaseURL = "https://protobot-rawdata.firebaseio.com/"

export class RightSideBar extends Component {
    extension = '.json'
    constructor(props) {
        super(props)
        this.state = {
            num_experiment: 1,
            colors: [
                'violet',
                'grey',
                'grey',
                'grey',
            ]
        }
        this.patchUserEndTime = this.patchUserEndTime.bind(this)
        this.sendEndStatus = this.sendEndStatus.bind(this)
        this.sendStartStatus = this.sendStartStatus.bind(this)
        this.endExperiment = this.endExperiment.bind(this)
    }

    componentDidMount() {
        
    }

    patchUserEndTime(sessionNum, userId, date) {
        return fetch(`${databaseURL+'/users/data/'+userId+'/'+this.extension}`, {
            method: 'PATCH',
            body: JSON.stringify({[sessionNum]: date})
        }).then(res => {
            if(res.status !== 200) {
                throw new Error(res.statusText)
            }
            return res.json()
        })
    }

    // Convey the endstatus to parent component when each conversation is ended
    sendEndStatus = () => {
        const { controlEndStatus, controlEndButtonStatus, controlNextButtonStatus, userId } = this.props
        const { num_experiment } = this.state
        const sessionNum = num_experiment + 'thEndTime'

        this.patchUserEndTime(sessionNum, userId, new Date())

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
        const { num_experiment, colors } = this.state

        this.setState({
            num_experiment: num_experiment + 1,
            colors: [
                ...colors.slice(0, num_experiment),
                'violet',
                ...colors.slice(num_experiment + 1)
            ]
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
        const { num_experiment, colors } = this.state

        // Control each button's disabled status
        const { endButtonStatus, nextButtonStatus, numSession } = this.props

        return (
            <div className="rightGrid">
                <div className="rightInsBox">
                    <div className="textCenter">
                        { numSession === 1
                            ?   null
                            :   <div>
                                    <div style={{ marginBottom: '20px' }}> Progress </div>
                                    <div style={{ marginBottom: '20px' }}> {num_experiment} / {numSession} </div>
                                    {/* <div>
                                        {colors.map((color, i) => (
                                        <Label key={i} circular color={color}>
                                        </Label>
                                        ))}
                                    </div> */}
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
