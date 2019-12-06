import React, { Component } from 'react';
import { Segment, Button } from 'semantic-ui-react';
import './SystemTopicButton.css';

export class SystemTopicButton extends Component {
    overflowCondition = ''

    constructor(props) {
        super(props);
        this.state = {
        };
        this.handleCreate = this.handleCreate.bind(this);
    }

    handleCreate = (domain, id) => {
        const { selectDomain } = this.props;
        selectDomain(domain, id);
    }

    render() {
        const { handleCreate } = this;
        const { domains } = this.props

        return (
            <div className="systemTopicButtonBox">
                <span className="systemTopicText">Start conversation with the domain below</span>
                <div style={{height:'15px'}}></div>
                <div style={{width: '100%', maxHeight: '200px', overflowY: this.overflowCondition}}>
                    <Segment.Group>
                        <Segment textAlign='center'>
                            <div >
                                <Button fluid onClick={handleCreate.bind(this, domains, 0)}>{domains.name}</Button>
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
