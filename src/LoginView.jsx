import React from "react";
import {Image, Message, Button, Form} from "semantic-ui-react";

export default class LoginView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { userName: this.props.userName, avatar: "", chatroom: this.props.chatroom, message: true };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value })

  handleSubmit() {
    if (this.state.userName === "") {
      this.setState({ message: false });
      return;
    }
    else if (this.state.chatroom === "") {
      this.setState({ message: false });
      return;
    }
    else if (this.state.avatar === "") {
      this.props.onLoggedIn(this.state.userName, this.props.avatar, this.state.chatroom);
    }
    else {
      this.props.onLoggedIn(this.state.userName, this.state.avatar, this.state.chatroom);
    }
  }

  render() {
    const { userName, avatar, chatroom } = this.state;
    return (
      <div class="ui middle aligned center aligned grid">
        <div class="column">
          <h2 class="ui teal image header">
            <div class="content">
              Create your useruserName and avatar
        </div>
          </h2>
          <Form id="loginscreen" onSubmit={this.handleSubmit} >
            <Form.Field>
              <input placeholder='userName' name='userName' value={userName} onChange={this.handleChange} />
            </Form.Field>
            <Form.Field>
              <input placeholder='Paste a link to your avatar. Otherwise will use the default' name='avatar' value={avatar} onChange={this.handleChange} />
            </Form.Field>
            <Image src={this.state.avatar} />
            <Form.Field>
              <input placeholder='Enter the chatroom' name='chatroom' value={chatroom} onChange={this.handleChange} />
            </Form.Field>
            <Button large type='submit'  >Submit</Button>
          </Form>
          <Message hidden={this.state.message}>
            One or more of your fields is empty. Please check again!
    </Message>
        </div>
      </div>
    )
  }
}

