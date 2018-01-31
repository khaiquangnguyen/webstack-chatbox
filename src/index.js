import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import LoginView from './LoginView';
import UserCard from './UserCard';
import MessagesView from './MessagesView';
import ChatInput from './ChatInput';
import registerServiceWorker from "./registerServiceWorker";
import {  Grid } from "semantic-ui-react";

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
 
    if (this.state.chatroom !== "+"){
      const mqttTopic = "root/" + this.state.chatroom + "/"+ this.state.userName;
      this.client.publish(mqttTopic, JSON.stringify(aMessage));
    }
    else{
      const mqttTopic = "root/"+ this.state.userName;
      this.client.publish(mqttTopic, JSON.stringify(aMessage));
    }
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
      if (room !== "+"){
        client.subscribe("root/" + room + "/+");
      }
      else{
        client.subscribe("root/#");
      }
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
    if (this.state.chatroom !== "+"){
      this.client.unsubscribe( "root/" + this.state.chatroom + "/+");
    }
    else{
      this.client.unsubscribe("root/#");
    }

  }

  /**
   * Render the view
   */
  render() {
    if (this.state.loggedin === false){
      return (
        <Grid>
        <Grid.Column width={6}></Grid.Column>
        <Grid.Column width={4}>
        <LoginView onLoggedIn = {this.handleLogIn} userName = {this.state.userName} avatar = {this.state.avatar} chatroom = {this.state.chatroom}/>
        </Grid.Column>
          <Grid.Column width={6}></Grid.Column>
          </Grid>
      )
    }
    else{
      return (                  
        <Grid>
         <Grid.Column width={3}></Grid.Column>
        <Grid.Column width={2}>
          <UserCard avatar={this.state.avatar} name = {this.state.userName} chatname={this.state.chatroom} onLogOut={this.handleLogOut} />
        </Grid.Column>
        <Grid.Column width={8}>      
          <MessagesView messages={this.state.messageList} />
          <ChatInput on_send={this.publishMessage} />
          </Grid.Column>
          <Grid.Column width={3}></Grid.Column>
          </Grid>         
      );
    }
  }
}
ReactDOM.render(<ChatApp />, document.getElementById("root"));
registerServiceWorker();
