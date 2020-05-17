import React, { Component } from 'react';

class App extends Component {
  
  componentWillMount() {
    fetch('/api/greeting')
    .then(resp => resp.json())
    .then(data => console.log(data));
  }
  
  render() {
    return (
      <div>
        <div>Hello</div>
      </div>
    );
  }
}

export default App;