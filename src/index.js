import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

// https://medium.com/@coderacademy/you-can-build-an-fb-messenger-style-chat-app-with-reactjs-heres-how-intermediate-211b523838ad

class ChatRoom extends React.Component{
    on_send(message){

    }
    render() {
        return (
          <div className="container">
            {/* <Messages messages={this.state.messages} /> */}
            <ChatInput/>   
            {/* <Members members={this.state.members} />          */}
          </div>
        );
      }
}

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        // Set initial state of the message
        this.state = { message: '' };
        // React ES6 does not bind 'this' to event handlers by default
        this.on_submit = this.on_submit.bind(this);
        this.on_type = this.on_type.bind(this);
      }
      
    // when submit the form
    on_submit(event){
        event.preventDefault();
        this.setState({message:""});
    }

    // when a user is typing
    on_type(event){
        this.setState({message:event.target.value});
    }

    render() {
      return (
        <section id="message_box">
        <form className = "chat-input" onSubmit = {this.on_submit}>
          <input type= "text" 
            onChange = {this.on_type}
            id="message_sender" 
            value = {this.state.message}
            placeholder = "Your message..."
          />
        <button>Send</button>
        </form>
      </section>
      );
    }
  }
ReactDOM.render(<ChatRoom/>, document.getElementById('root'));
registerServiceWorker();
