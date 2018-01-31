import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import LoginView from './LoginView';
import registerServiceWorker from "./registerServiceWorker";
import { Segment, Grid, Card, Image, Button, Form, Comment } from "semantic-ui-react";

// https://medium.com/@coderacademy/you-can-build-an-fb-messenger-style-chat-app-with-reactjs-heres-how-intermediate-211b523838ad


/**
 * The class which handles the entire chat app. 
 */
class ChatApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = { messageList: [], userName:"",avatar:"https://semantic-ui.com/images/avatar/large/daniel.jpg", chatroom:"", loggedin: false};
    this.publishMessage = this.publishMessage.bind(this);
    this.handleLogIn = this.handleLogIn.bind(this);
    this.displayMessage = this.displayMessage.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  /**
   * Publish a message to the mqtt server and broadcast it to other clients
   * @param {string} messageConent: the content of the message
   */
  publishMessage(messageConent) {
    const aMessage = {};
    aMessage.clientTime = Date.now();
    aMessage.message = messageConent;
    aMessage.iconUrl = this.state.avatar;
    const mqttTopic = "root/" + this.state.chatroom + "/"+ this.state.userName;
    this.client.publish(mqttTopic, JSON.stringify(aMessage));
 
  }

  /**
   * display a message 
   * @param {string} username owner of the message
   * @param {string} message content of the message
   */
  displayMessage(username, message) {   
    var self = username.split('/').pop() === this.state.userName? true: false;
    const messages = this.state.messageList;
    messages.push([username,message,self]); 
    this.setState({messageList:messages});
  }

  /**
   * Register the user and connect to the mqtt server
   * @param {string} name the user name created
   * @param {string} avatar the avatar to use
   * @param {string} room the room to join
   */
  handleLogIn(name, avatar, room){
    // register the user
    this.setState({userName:name});
    this.setState({avatar:avatar});
    this.setState({chatroom:room});
    // connect to mqtt server
    var mqtt = require('mqtt')
    var client  = mqtt.connect('ws://mqtt.bucknell.edu:9001')
    var parent = this;
    client.on('connect', function () {
      client.subscribe("root/" + room + "/+");
    })
    client.on('message', function (topic, message) {
    parent.displayMessage(topic, JSON.parse(message.toString()));
  })
    // set the client and register as logged in
    this.client = client;
    this.setState({loggedin:true});
  }

  /**
   * When the client logs out from the chat room
   */
  handleLogOut (){
    this.setState({messageList:[]});
    this.setState({loggedin:false});
    this.client.unsubscribe("root/" + this.state.chatroom + "/+");
  }

  /**
   * Render the view
   */
  render() {
    if (this.state.loggedin === false){
      return (
        <Grid>
        <Grid.Column width={6}>
        </Grid.Column>
        <Grid.Column width={4}>
        <LoginView onLoggedIn = {this.handleLogIn} userName = {this.state.userName} avatar = {this.state.avatar} chatroom = {this.state.chatroom}/>
        </Grid.Column>
          <Grid.Column width={6}>
          </Grid.Column>
          </Grid>
      )
    }
    else{
      return (                  
        <Grid>
         <Grid.Column width={3}>     
        </Grid.Column>
        <Grid.Column width={2}>
          <User icon={this.state.avatar} name = {this.state.userName} chatname={this.state.chatroom} on_logout={this.handleLogOut} />
        </Grid.Column>
        <Grid.Column width={8}>      
          <Messages messages={this.state.messageList} />
          <ChatInput on_send={this.publishMessage} />
          </Grid.Column>
          <Grid.Column width={3}>    
        </Grid.Column>
          </Grid>
         
      );
    }
  }
}

class User extends React.Component{
   render() {
    return (
    <Card>
    <Image src={this.props.icon} />
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
            onClick={this.props.on_logout}
          />
    </Card.Content>
    </Card>
    );
  }
}

// All message
class Messages extends React.Component {
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
          clientTime ={message[1].clientTime}
          message={message[1].message}
          icon={message[1].iconUrl}
          self={message[2]}
        />
      );
    });
    return (
      <Segment>
       <Comment.Group size = "large" id = "messageList">
        {messages}
        </Comment.Group>
        </Segment>
    );
  }
}

Messages.defaultProps = {
  messages: []
};

// A single message
class AMessage extends React.Component {
  render() {
    var moment = require('moment');
    const date = moment(this.props.clientTime).format('MMMM Do YYYY, h:mm:ss a');
    const un = this.props.username.split('/').pop();
    const self = this.props.self? "self":"";
    console.log(this.props.self);
    return (
      <div  className = {self}>
      <Comment>
        <Comment.Avatar src= {this.props.icon} />
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

// The input box
class ChatInput extends React.Component {
  constructor(props) {
    super(props);
    // Set initial state of the message
    this.state = { message: "" };
    // React ES6 does not bind 'this' to event handlers by default
    this.on_submit = this.on_submit.bind(this);
    this.on_type = this.on_type.bind(this);
  }

  // when submit the form
  on_submit(event) {
    event.preventDefault();
    this.props.on_send(this.state.message);
    this.setState({ message: "" });
  }

  // when a user is typing
  on_type(event) {
    this.setState({ message: event.target.value });
  }

  render() {
    return (
      <Form size = "large" onSubmit={this.on_submit}>
          <Form.Input
            placeholder="Type a messenger and press Enter"
            name="message"
            value={this.state.message}
            onChange={this.on_type}
          />
      </Form>
    );
  }
}
ReactDOM.render(<ChatApp />, document.getElementById("root"));
registerServiceWorker();
