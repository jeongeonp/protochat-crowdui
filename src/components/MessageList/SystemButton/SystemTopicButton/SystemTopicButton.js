import React, { Component } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import './SystemTopicButton.css';

const databaseURL = "https://kixlab-uplb-hci-protobot-v2.firebaseio.com/";

export class SystemTopicButton extends Component {
    overflowCondition = ''

    constructor(props) {
        super(props);
        this.state = {
            domainId: '',
            domainName: '',
        };
        this.handleCreate = this.handleCreate.bind(this);
    }

    componentDidMount() {
        const domainId = this.getURLParams('domain')

        this.setState({
            domainId: domainId,
        })

        this.getDomainName(domainId)

    }

    handleCreate = (domain, id) => {
        const { selectDomain } = this.props
        const { domainName } = this.state
        selectDomain(domain, domainName, id);
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

    render() {
        const { handleCreate } = this
        const { domains } = this.props
        const { domainName } = this.state

        return (
            <div className="systemTopicButtonBox">
                <span className="systemTopicText">Start conversation with the domain below</span>
                <div style={{height:'15px'}}></div>
                <div style={{width: '100%', maxHeight: '200px', overflowY: this.overflowCondition}}>
                    <Segment.Group>
                        <Segment textAlign='center'>
                            <div>
                                <Button fluid onClick={handleCreate.bind(this, domains, 0)}>{domainName}</Button>
                            </div>
                            {/* {Object.keys(this.props.domains).map(id => {
                                const domain = this.props.domains[id];
                                return (
                                    <div key={id}>
                                    { id === '0'
                                        ?   null
                                        :   <div style={{height: '10px'}}></div>
                                    } 
                                    <Button fluid onClick={handleCreate.bind(this, domain, id)}>{domain.name}</Button>
                                    </div>
                                );
                            })} */}
                        </Segment>
                    </Segment.Group>
                </div>
            </div>
        );
    }
}
