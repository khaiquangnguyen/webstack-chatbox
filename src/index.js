import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";
import { Segment, Grid, Card, Image, Message, Button, Form, Comment } from "semantic-ui-react";

// https://medium.com/@coderacademy/you-can-build-an-fb-messenger-style-chat-app-with-reactjs-heres-how-intermediate-211b523838ad


class Login extends React.Component{
  constructor(props) {
    super(props);
    this.state = {name:this.props.name,icon:"",chatname:this.props.chatname, message:true};
    this.on_login = this.on_login.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange = (e) => this.setState({ [e.target.name]: e.target.value })
  on_login(){  
    if (this.state.name=== ""){
      this.setState({message:false});
      return;
    }   
    else if (this.state.chatname === ""){    
      this.setState({message:false});
      return; 
    }   
    else if (this.state.icon === ""){        
      this.props.on_login(this.state.name, this.props.icon, this.state.chatname);
    }
    else{
      this.props.on_login(this.state.name, this.state.icon, this.state.chatname);
    }    
  }
  render(){
    const { name, icon, chatname } = this.state;
    return (
      <div class="ui middle aligned center aligned grid">
      <div class="column">
      <h2 class="ui teal image header">
      <div class="content">
        Create your username and avatar
      </div>
    </h2>
      <Form id ="loginscreen" onSubmit={this.on_login} >
    <Form.Field>
      <input placeholder='Name' name='name' value={name} onChange={this.handleChange} />
    </Form.Field>
    <Form.Field>
      <input placeholder='Paste a link to your avatar. Otherwise will use the default' name='icon' value={icon} onChange={this.handleChange}/>
    </Form.Field>
    <Image src={this.state.icon} />
    <Form.Field>
      <input placeholder='Enter the chatname' name='chatname' value={chatname} onChange={this.handleChange}/>
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

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [], name:"",icon:"https://semantic-ui.com/images/avatar/large/daniel.jpg", chatname:"", loggedin: false};
    this.send_message = this.send_message.bind(this);
    this.login = this.login.bind(this);
    this.add_message = this.add_message.bind(this);
    this.logout = this.logout.bind(this);
  }

  // send a message to the server
  send_message(message) {
    const a_message = {};
    a_message.clientTime = Date.now();
    a_message.message = message;
    a_message.iconUrl = this.state.icon;
    const topic_to_send = "root/" + this.state.chatname + "/"+ this.state.name;
    this.client.publish(topic_to_send, JSON.stringify(a_message));
 
  }

  // add a message to the list of message
  add_message(username, message) {   
    if (username.split('/').pop() === this.state.name){
      const messages = this.state.messages;
      messages.push([username,message,true]); 
      this.setState({messages:messages});
    }
    else{
      const messages = this.state.messages;
       messages.push([username,message,false]); 
       this.setState({messages:messages});
    }
  }

  // Upon user login, connect to the mqtt client
  login(yourname, youricon, yourchatname){
    this.setState({name:yourname});
    this.setState({icon:youricon});
    this.setState({chatname:yourchatname});
    var mqtt = require('mqtt')
    var client  = mqtt.connect('ws://mqtt.bucknell.edu:9001')
    var parent = this;
    client.on('connect', function () {
      client.subscribe("root/" + yourchatname + "/+");
      console.log("root/" + yourchatname);
    })
    client.on('message', function (topic, message) {
    // message is Buffer
    const a_mess = message.toString();
    parent.add_message(topic, JSON.parse(a_mess));
  })
    this.client = client;
    this.setState({loggedin:true});
    this.forceUpdate();
  }

  logout (){
    console.log("out");
    this.setState({messages:[]});
    this.setState({loggedin:false});
    this.client.unsubscribe("root/" + this.state.chatname + "/+");
    this.forceUpdate();
  }

  // The render function
  render() {
    if (this.state.loggedin === false){
      return (
        <Grid>
        <Grid.Column width={6}>
        </Grid.Column>
        <Grid.Column width={4}>
        <Login on_login = {this.login} name = {this.state.name} icon = {this.state.icon} chatname = {this.state.chatname}/>
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
          <User icon={this.state.icon} name = {this.state.name} chatname={this.state.chatname} on_logout={this.logout} />
        </Grid.Column>
        <Grid.Column width={8}>      
          <Messages messages={this.state.messages} />
          <ChatInput on_send={this.send_message} />
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
ReactDOM.render(<ChatRoom />, document.getElementById("root"));
registerServiceWorker();
