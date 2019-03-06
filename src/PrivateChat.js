import React, { Component } from 'react';
import { Container, Row, Col, ListGroup, ListGroupItem, ListGroupItemText, Media, Button } from 'reactstrap';
import { ThemeProvider, MessageList, MessageGroup, Message, MessageText } from '@livechat/ui-kit';
import { TextComposer, Fill, Fit, TextInput, SendButton, Avatar } from '@livechat/ui-kit';
import axios from 'axios';
import openSocket from 'socket.io-client';

import Session from './Session';

//Özel mesajlaşma ekranı
export default class PrivateChat extends Component {
    constructor(props) {
        super(props);

        //Ekrandaki mesajları tutan değişken
        this.state = {
            messageList: []
        }

        //Mesaj Gönder butonuna basıldığında çalışacak fonksiyonun scopu ayarlanıyor
        this._onSendMessage = this._onSendMessage.bind(this);
        //Çıkış butonuna basıldığında çalışacak fonksiyonun scopu ayarlanıyor
        this._onChatRoomExit = this._onChatRoomExit.bind(this);
    }

    //Component ekrana geldiğinde çalışan fonksiyon
    componentDidMount() {
        //Eğer kullanıcı giriş yapmışsa ve özel chat isteği gelmiş ise
        if (Session.instance && Session.instance.user && Session.instance.chat) {
            //Chat odasına giriş yapmak ve önceki mesajları almak için post çağrısı yapılıyor
            axios.post('http://localhost:3001/api/chatroom/login', {
                chatRoom: Session.instance.chat
            })
                .then(response => {
                    //Eğer işlem başarılıysa
                    if (response.data.status) {
                        //Sessiondaki chat odsı güncelleniyor
                        Session.instance.chat = response.data.chatRoom;
                        //Serverdan gelen mesaj listesi eknrana basılıyor
                        this.setState({ messageList: response.data.chatRoom.messageList });
                    }
                });

            
            //Socket üzerinden gelen dataları component'in state'ine yazmak için this değişkeni
            //self'e atanıyor.(socket içerisinde this => component olmuyor)
            let self = this;
            //Serverdaki socket e bağlanılıyor
            const socket = openSocket('http://localhost:3001');

            //Serverdan chat odasına yeni mesaj geldiyse;
            socket.on('chatRoomYeniMesaj', function (chatRoom) {
                if (Session.instance.chat.id == chatRoom.id) {
                    //Sessiondaki chat odası güncelleniyor
                    Session.instance.chat = chatRoom;
                    //Chat odasındaki mesajlar ekrana basılıyor
                    self.setState({ messageList: chatRoom.messageList });
                }
            });

            //Serverdan chat odasından çıkış yapıldığı bilgisi geldiyse;
            socket.on('chatRoomExit', function (chatRoom) {
                if (Session.instance.chat.id == chatRoom.id) {
                    //Bir önceki ekrana dönülüyor
                    self.props.history.push('/chat');
                }
            });
        }
        else {
            //Ana ekrana dönülüyor
            this.props.history.push('/');
        }
    }


    //Yeni mesaj göndermek için button a basıldığında
    _onSendMessage(message) {
        //Server üzerindeki servise post requesti ile yeni yazılan mesaj gönderiliyor
        axios.post('http://localhost:3001/api/chatroom/sendMessage', {
            chatRoom: Session.instance.chat,
            message: {
                user: Session.instance.user,
                date: new Date(),
                content: message
            }
        });
    }

    //Oturumu kapat buttonuna basıldığında
    _onChatRoomExit() {
        //Kullanıcının chat odasından çıktığı bilgisi server üzerindeki servise post requesti ile gönderiliyor
        axios.post('http://localhost:3001/api/chatroom/exit', {
            chatRoom: Session.instance.chat
        });
    }

    render() {
        //this.state.messageList.map => mesaj listesindeki her bir obje görsele döndürülüyor
        return (
            <Container>
                <Row style={{ height: "700px" }}>
                    <Col style={{ margin: 5, border: 1, borderColor: "black", borderStyle: "solid", borderRadius: 5 }}>
                        <ThemeProvider>
                            <MessageList active>
                                {
                                    this.state.messageList.map((message, index) => {
                                        return (
                                            <Row key={index}>
                                                <Avatar imgUrl={message.user.image} />
                                                <Message
                                                    isOwn={Session.instance.user.nick == message.user.nick}
                                                    authorName={message.user.nick}
                                                    date={message.date}>
                                                    <MessageText>{message.content}</MessageText>
                                                </Message>
                                            </Row>
                                        );
                                    })
                                }
                            </MessageList>
                        </ThemeProvider>
                    </Col>
                </Row>
                <Row style={{ height: "100px", border: 1, borderColor: "black", borderStyle: "solid", borderRadius: 5 }}>
                    <ThemeProvider>
                        <TextComposer style={{ width: "100%", margin: 10 }} onSend={this._onSendMessage}>
                            <Row align="center">
                                <Fill>
                                    <TextInput />
                                </Fill>
                                <Fit>
                                    <SendButton />
                                </Fit>
                            </Row>
                        </TextComposer>
                    </ThemeProvider>
                </Row>
                <Row style={{ marginTop: 5 }}>
                    <Button color="primary" block onClick={this._onChatRoomExit}>Konuşmayı Bitir</Button>
                </Row>
            </Container>
        );
    }
}
