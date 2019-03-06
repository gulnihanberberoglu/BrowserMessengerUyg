import React, { Component } from 'react';
import { Container, Row, Col, ListGroup, ListGroupItem, ListGroupItemText, Media, Button } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { ThemeProvider, MessageList, MessageGroup, Message, MessageText } from '@livechat/ui-kit';
import { TextComposer, Fill, Fit, TextInput, SendButton, Avatar } from '@livechat/ui-kit';
import axios from 'axios';
import openSocket from 'socket.io-client';

import Session from './Session';

//Genel mesajlaşma ekranı
export default class Chat extends Component {
    constructor(props) {
        super(props);

        //modal => özel mesajlaşma isteği ile ilgili bilgileri tutar
        //userList => chat odasında olan kullanıcıların dizisi
        //messageList => genel chat odasında yapılan yazışmaların tutulduğu dizi
        this.state = {
            modal: {
                show: false,
                header: "",
                content: "",
                chatRoom: undefined
            },
            userList: [],
            messageList: []
        };

        //Sayfanın kullanıcı listesi ve mesajlarını backendden getiren fonksiyonun scopu ayarlanıyor
        this._onLoad = this._onLoad.bind(this);
        //Gelen özel mesajlaşma isteğini kabul edillmesini sağlayan fonksiyonun scopu ayarlanıyor
        this._onModalEvet = this._onModalEvet.bind(this);
        //Gelen özel mesajlaşma isteğini red edillmesini sağlayan fonksiyonun scopu ayarlanıyor
        this._onModalHayir = this._onModalHayir.bind(this);
        //Belirli bir kullanıcıya özel mesajlaşma isteği göndermeyi sağlayan fonksiyonun scopu ayarlanıyor
        this._onOzelMesajIstegiGonder = this._onOzelMesajIstegiGonder.bind(this);
        //Genel chat odasına mesaj göndermesini sağlayan fonksiyonun scopu ayarlanıyor
        this._onSendMessage = this._onSendMessage.bind(this);
        //Uygulamada oturum kapatma isteğini backend de gönderen fonksiyonun scopu ayarlanıyor
        this._onOturumuKapat = this._onOturumuKapat.bind(this);
    }

    //Component yüklendiğinde çalışan fonksiyon
    componentDidMount() {
        //Eğer kullanıcı login olmuş ise
        if (Session.instance && Session.instance.user) {
            //Backend'den giriş yapan kullanıcı ve mesajlar getiriliyor
            this._onLoad();

            
            //Socket üzerinden gelen dataları component'in state'ine yazmak için this değişkeni
            //self'e atanıyor.(socket içerisinde this => component olmuyor)
            let self = this;
            //Serverdaki socket e bağlanılıyor
            const socket = openSocket('http://localhost:3001');

            //Serverdan yeni mesaj geldiği bilgisi socket üzerinden geldiğinde
            socket.on('yeniMesaj', function (message) {
                //yeni mesaj statedeki listeye ekleniyor
                self.state.messageList.push(message);
                //Ekrana yeniden çizim yapılması için state güncelleniyor
                self.setState({ messageList: self.state.messageList });
            });

            //Serverdan yeni kullanıcı geldiği bilgisi socket üzerinden geldiğinde
            socket.on('yeniKullanici', function (newUserList) {
                //Ekranda yeniden çizim yapılması ve kullanıcı listesi güncellenmesi için state güncelleniyor
                self.setState({ userList: newUserList });
            });

            //Serverdan kullanıcı çıkış yaptığı bilgisi socket üzerinden geldiğinde
            socket.on('silKullanici', function (newUserList) {
                //Ekranda yeniden çizim yapılması ve kullanıcı listesi güncellenmesi için state güncelleniyor
                self.setState({ userList: newUserList });
            });

            //Serverdan kullanıcı online oldu bilgisi socket üzerinden geldiğinde
            socket.on('kullaniciOnline', function (newUserList) {
                //Ekranda yeniden çizim yapılması ve kullanıcı listesi güncellenmesi için state güncelleniyor
                self.setState({ userList: newUserList });
            });

            //Serverdan kullanıcı offline oldu bilgisi socket üzerinden geldiğinde
            socket.on('kullaniciOffline', function (newUserList) {
                //Ekranda yeniden çizim yapılması ve kullanıcı listesi güncellenmesi için state güncelleniyor
                self.setState({ userList: newUserList });
            });

            //Serverdan özel mesajlaşma talebi bilgisi socket üzerinden geldiğinde
            socket.on('ozelMesajIstegi', function (chat) {
                //Özel mesaj isteğini alan kullanıcı ben isem;
                if (chat.alici.nick == Session.instance.user.nick) {
                    //Ekranda modal göstermek için state aşağıdaki gibi güncelleniyor
                    self.setState({
                        modal: {
                            show: true,
                            header: "Özel Mesaj İsteği",
                            content: chat.gonderen.nick + " isimli kullanıcı özel olarak sizinle görüşmek istiyor",
                            chatRoom: chat
                        }
                    });
                }
            });

            //Serverdan özel mesajlaşma talebi kabul edildiği bilgisi socket üzerinden geldiğinde
            socket.on('ozelMesajIstegiKabul', function (chat) {
                //Özel mesaj isteğini gönderen yada alan kişiysem;
                if (chat.gonderen.nick == Session.instance.user.nick || chat.alici.nick == Session.instance.user.nick) {
                    //Özel chat odası nesnesi sessiona yazılıyor
                    Session.instance.chat = chat;
                    //özel chat sayfasına yönlendiriliyor
                    self.props.history.push('/privatechat');
                }
            });

            //Serverdan özel mesajlaşma talebi red edildiği bilgisi socket üzerinden geldiğinde
            socket.on('ozelMesajIstegiRed', function (chat) {
                //Özel mesaj isteğini gönderen yada alan kişiysem;
                if (chat.gonderen.nick == Session.instance.user.nick || chat.alici.nick == Session.instance.user.nick) {
                    //Özel chat odası nesnesi undefined olarak yazılıyor
                    Session.instance.chat = undefined;
                }
            });
        }
        else {
            //Login olunmadığı için anasayfaya yönlendiriliyor
            this.props.history.push('/');
        }
    }

    //Backend'den giriş yapan kullanıcı ve mesajlar getiriliyor
    _onLoad() {
        //Giriş yapan kullanıcıların listesi get request i ile getiriliyor
        axios.get('http://localhost:3001/api/user', this.state)
            .then(response => {
                if (response.data.status) {
                    this.setState({ userList: response.data.userList });
                }
            });

        //Giriş yapan kullanıcıların mesajlaşmalarını get request i ile getiriliyor
        axios.get('http://localhost:3001/api/message', this.state)
            .then(response => {
                if (response.data.status) {
                    this.setState({ messageList: response.data.messageList });
                }
            });
    }

    //Mesaj gönder buttonuna basıldığında çalışan fonksiyon
    _onSendMessage(message) {
        //Backend servisine yeni eklenen mesaj gönderiliyor
        axios.post('http://localhost:3001/api/message', {
            user: Session.instance.user,
            date: new Date(),
            content: message
        });
    }

    //Oturumu kapat buttonuna basıldığında çalışan fonksiyon
    _onOturumuKapat() {
        //Backend servisine oturum kapatma isteği gönderiliyor.
        axios.post('http://localhost:3001/api/user/logout', Session.instance.user);
        //Kullanıcı anasayfaya yönlendiriliyor
        this.props.history.push('/');
    }

    //Kullanıcıya tıklandığında özel mesajlaşma isteği gönderimi yapmayı sağlayan fonksiyon
    _onOzelMesajIstegiGonder(user) {
        //Backend servisine hangi kullanıcıya özel mesaj gönderimi kimin tarafından yapılacağı bilgisi gönderiliyor
        axios.post('http://localhost:3001/api/user/privateMessageRequest', {
            gonderen: Session.instance.user,
            alici: user
        });
    }

    //Açılan modal da evet buttonuna basıldığında çalışan fonksiyon
    _onModalEvet() {
        //Gelen özel mesajlaşma isteğine evet cevabı verildiği bilgisi backend servisine gönderiliyor
        axios.post('http://localhost:3001/api/user/privateMessageRequestAccept', this.state.modal.chatRoom).then((response) => {
            //Ekranda görünen modal'ın kapatılması için state aşağıdaki gibi güncelleniyor
            this.setState({
                modal: {
                    show: false,
                    header: "",
                    content: "",
                    chatRoom: undefined
                }
            });
        });
    }

    //Açılan modal da hayır buttonuna basıldığında çalışan fonksiyon
    _onModalHayir() {
        //Gelen özel mesajlaşma isteğine hayır cevabı verildiği bilgisi backend servisine gönderiliyor
        axios.post('http://localhost:3001/api/user/privateMessageRequestReject', this.state.modal.chatRoom).then((response) => {
            //Ekranda görünen modal'ın kapatılması için state aşağıdaki gibi güncelleniyor
            this.setState({
                modal: {
                    show: false,
                    header: "",
                    content: "",
                    chatRoom: undefined
                }
            });
        });
    }

    render() {
        //this.state.messageList => dizideki her mesaj nesnesi görsel componente çeviriliyor
        //this.state.userList => dizideki her kullanıcı nesnesi görsel componente çeviriliyor
        //Modal => ekranda popup çıkarmak için kullanılan component
        return (
            <Container>
                <Row style={{ height: "700px" }}>
                    <Col xs="9" style={{ margin: 5, border: 1, borderColor: "black", borderStyle: "solid", borderRadius: 5 }}>
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
                    <Col cs="3" style={{ margin: 5, border: 1, borderColor: "black", borderStyle: "solid", borderRadius: 5 }}>
                        <ListGroup>
                            {
                                this.state.userList.map((user, index) => {
                                    return (
                                        <Row key={index} tag="a" href="#" onClick={() => this._onOzelMesajIstegiGonder(user)}>
                                            <Media style={{ width: 48, height: 48 }} object src={user.image} />
                                            <ListGroupItemText>{user.nick}</ListGroupItemText>
                                            {
                                                user.status == "online" ?
                                                    <Media style={{ width: 16, height: 16 }} object src="http://rollinblackjacks.weebly.com/uploads/1/1/3/7/11379249/3217690_orig.png" /> :
                                                    <Media style={{ width: 16, height: 16 }} object src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFYnzmtKzIbFhTmV6kWG9D0I5Dpj5lYRuRsMgS9F4wf136GwxE" />
                                            }
                                        </Row>
                                    );
                                })
                            }
                        </ListGroup>
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
                    <Button color="primary" block onClick={this._onOturumuKapat}>Oturumu Kapat</Button>
                </Row>
                <Modal isOpen={this.state.modal.show}>
                    <ModalHeader>{this.state.modal.header}</ModalHeader>
                    <ModalBody>{this.state.modal.content}</ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this._onModalEvet}>Evet</Button>
                        <Button color="secondary" onClick={this._onModalHayir}>Hayır</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        );
    }
}
