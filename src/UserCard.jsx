import React from "react";
import { Card, Image, Button } from "semantic-ui-react";
export default class UserCard extends React.Component {
    render() {
        return (
            <Card>
                <Image src={this.props.avatar} />
                <Card.Content>
                    <Card.Header>
                        {this.props.name}
                    </Card.Header>
                    <Card.Meta>
                        <span className='chatroom'>
                            {this.props.chatname}
                        </span>
                    </Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <Button
                        content='Logout'
                        onClick={this.props.onLogOut}
                    />
                </Card.Content>
            </Card>
        );
    }
}
