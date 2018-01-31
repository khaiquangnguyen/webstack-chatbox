import React from "react";
import { Segment, Comment } from "semantic-ui-react";

/**
 * The component which shows all of the messages
 */
export default class MessagesView extends React.Component {
    componentDidUpdate() {
        // There is a new message in the state, scroll to bottom of list
        const objDiv = document.getElementById("messageList");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    render() {
        const messages = this.props.messages.map((message, i) => {
            return (
                <AMessage
                    key={i}
                    username={message[0]}
                    clientTime={message[1].clientTime}
                    message={message[1].message.replace(/<(?:.|\n)*?>/gm, '')}
                    icon={message[1].iconUrl}
                    self={message[2]}
                />
            );
        });
        return (
            <Segment>
                <Comment.Group size="large" id="messageList">
                    {messages}
                </Comment.Group>
            </Segment>
        );
    }
}


class AMessage extends React.Component {
    render() {
        var moment = require('moment');
        const date = moment(this.props.clientTime).format('MM/DD/YY, h:mm:ss a');
        const un = this.props.username.split('/').pop();
        const self = this.props.self ? "self" : "other";
        console.log(this.props.self);
        return (
            <div className={self}>
                <Comment>
                    <Comment.Avatar src={this.props.icon} />
                    <Comment.Content>
                        <Comment.Author as="a">{un}</Comment.Author>
                        <Comment.Metadata>
                            <div>{date}</div>
                        </Comment.Metadata>
                        <Comment.Text>{this.props.message}</Comment.Text>
                    </Comment.Content>
                </Comment>
            </div>
        );
    }
}