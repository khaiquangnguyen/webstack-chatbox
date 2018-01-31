import React from "react";
import { Form } from "semantic-ui-react";

export default class ChatInput extends React.Component {
    constructor(props) {
      super(props);
      // Set initial state of the message
      this.state = { message: "" };
      // React ES6 does not bind 'this' to event handlers by default
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }
  
    // when submit the form
    handleSubmit(event) {
      event.preventDefault();
      this.props.on_send(this.state.message);
      this.setState({ message: "" });
    }
  
    // when a user is typing
    handleChange(event) {
      this.setState({ message: event.target.value });
    }
  
    render() {
      return (
        <Form size = "large" onSubmit={this.handleSubmit}>
            <Form.Input
              placeholder="Type a messenger and press Enter"
              name="message"
              value={this.state.message}
              onChange={this.handleChange}
            />
        </Form>
      );
    }
  }