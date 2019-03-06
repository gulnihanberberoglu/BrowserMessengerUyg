import React, { Component } from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';
import { Switch, Route } from 'react-router-dom';
import Login from './Login';
import Chat from './Chat';
import PrivateChat from './PrivateChat';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    //Uygulamanın ana çerçevesi oluşturuluyor.
    //Switch component'i yardımı ile browser'a yazılan url pathinde hangi component'in çalışacağı tanımlanıyor
    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand href="/">Messenger</NavbarBrand>
        </Navbar>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/chat" component={Chat} />
          <Route path="/privateChat" component={PrivateChat} />
        </Switch>
      </div>
    );
  }
}
