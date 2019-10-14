import React, { Component } from 'react';
import Pusher from 'pusher-js';
import './App.scss';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      userMessage: '',
      conversation: [],
    };
  }

  componentDidMount() {
    this.pusher = new Pusher('<app-key>', {
      cluster: '<app-cluster>',
      encrypted: true
    })

    this.channel = this.pusher.subscribe('bot');
    this.channel.bind('bot-response', data => {
      const msg = {
        text: data.message,
        user: 'computer'
      };

      this.setState({
        conversation: [...this.state.conversation, msg],
      });
    });
  }

  componentWillUnmount() {
    this.pusher.unsubscribe('bot');
  }

  handleChange = event => {
    this.setState({
      userMessage: event.target.value
    })
  }

  handleSubmit = event => {
    event.preventDefault();
    if(!this.state.userMessage.trim()) return;

    const msg = {
      text: this.state.userMessage,
      user: 'human'
    }

    this.setState({
      conversation: [...this.state.conversation, msg]
    });

    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: this.state.userMessage
      })
    });

    this.setState({ userMessage: '' });
  }

  render() {
    const ChatSingle = (text, i, className) => {
      return (
        <div key={`${className}-${i}`} className={`${className} chat-single`}>
          <span className="chat-content">{text}</span>
        </div>
      )
    }

    const chat = this.state.conversation.map((e, index) => {
      return ChatSingle(e.text,index,e.user);
    });

    return (
      <div>
        <div className="chat-window">
          <div className="conversation-window">{chat}</div>
          <div className="message-box">
            <form onSubmit={this.handleSubmit}>
              <input
                value={this.state.userMessage}
                onInput={this.handleChange}
                className="input-text"
                type="text"
                autoFocus
                placeholder="Type your message here and hit enter to send"
              />
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
