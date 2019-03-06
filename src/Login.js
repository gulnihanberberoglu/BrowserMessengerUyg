import React, { Component } from 'react';
import {
    Jumbotron,
    Button,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap';
import { Container, Col } from 'reactstrap';
import { Media } from 'reactstrap';
import axios from 'axios';

import Session from './Session';

//Giriş yapma ekranı
export default class Login extends Component {
    constructor(props) {
        super(props);

        //Giriş sayfasında kullanıcıdan alınacak bilgiler state de yönetileceği için 
        //default değerleri set ediliyor
        this.state = {
            image: "",
            nick: "",
            status: "online",
            lastActivity: new Date(),
            ip: "127.0.0.1"
        };

        //component içerisinde kullanılacak fonksiyonların scope'u ayarlanıyor
        this._onGirisYap = this._onGirisYap.bind(this);
        this.getRealMimeType = this.getRealMimeType.bind(this);
        this._onFileSelected = this._onFileSelected.bind(this);
    }

    //Giriş Yap buttonuna basıldığında çalışacak fonksiyon
    _onGirisYap() {
        //Axis kütüphanesi ile servise post request'i ile giriş yapma isteği gönderiliyor
        axios.post('http://localhost:3001/api/user', this.state)
            .then(response => {
                //Giriş işlemi başarılı olarak yapılırsa,
                if (response.data.status) {
                    //Kullanıcı bilgileri session'a yazılıyor.
                    Session.instance.user = this.state;
                    //Chat sayfasına yönlendiriliyor.
                    this.props.history.push('/chat');
                }
            });
    }

    //Kullanıcı giriş sayfasında profil resmini seçtiğinde resmin base64 string'ine çevrilerek
    //state üzerinde bulunan image parametresine yazan fonksiyon
    //StackOverflow üzerinden alıntı yapılmıştır.
    _onFileSelected(event) {
        var reader = new FileReader();
        var readerBase64 = new FileReader();
        var image = event.target.files[0];
        var self = this;
        var fileName = event.target.value;
        reader.onloadend = function () {
            var realMimeType = self.getRealMimeType(reader);
            if (realMimeType !== 'unknown') {
                readerBase64.readAsDataURL(image);
            } else {
                alert("Please upload a valid image file");
            }
        };

        reader.readAsArrayBuffer(image);
        readerBase64.onloadend = function () {
            self.setState({
                image: this.result
            });
        };
    }

    //Kullanıcı giriş sayfasında profil resmini seçtiğinde resmin base64 string'ine çevrilerek
    //state üzerinde bulunan image parametresine yazan fonksiyon
    //StackOverflow üzerinden alıntı yapılmıştır.
    getRealMimeType(reader) {
        var arr = (new Uint8Array(reader.result)).subarray(0, 4);
        var header = '';
        var realMimeType;

        for (var i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
        }

        // magic numbers: http://www.garykessler.net/library/file_sigs.html
        switch (header) {
            case "89504e47":
                realMimeType = "image/png";
                break;
            case "47494638":
                realMimeType = "image/gif";
                break;
            case "ffd8ffDB":
            case "ffd8ffe0":
            case "ffd8ffe1":
            case "ffd8ffe2":
            case "ffd8ffe3":
            case "ffd8ffe8":
                realMimeType = "image/jpeg";
                break;
            default:
                realMimeType = "unknown"; // Or you can use the blob.type as fallback
                break;
        }

        return realMimeType;
    }

    //Login component'inin görselini dönen fonksiyondur.s
    render() {
        return (
            <Container style={{ width: 700, marginTop: 20 }}>
                <Jumbotron>
                    <h1 className="display-3">Hoşgeldiniz</h1>
                    <p className="lead">Uygulamaya giriş yapmak için aşağıdaki formu doldurup, giriş yap buttonuna basınız.</p>
                    <hr className="my-2" />
                    <Form>
                        <Media style={{ margin: 10, marginLeft: "30%" }} object src={this.state.image} />
                        <Input style={{ margin: 10, marginLeft: "33%" }}
                            type="file"
                            id="files"
                            name="files[]"
                            onChange={this._onFileSelected} />
                        <FormGroup row>
                            <Label sm={2}>Nick</Label>
                            <Col sm={10}>
                                <Input type="text" placeholder="Nick'inizi giriniz"
                                    value={this.state.nick}
                                    onChange={(event) => this.setState({ nick: event.target.value })} />
                            </Col>
                        </FormGroup>
                        <FormGroup row style={{ display: "none" }}>
                            <Label sm={2}>Ip</Label>
                            <Col sm={10}>
                                <Input type="text" placeholder="Ip adresinizi giriniz"
                                    value={this.state.ip}
                                    onChange={(event) => this.setState({ ip: event.target.value })} />
                            </Col>
                        </FormGroup>
                        <Button color="primary" block onClick={this._onGirisYap}>Giriş Yap</Button>
                    </Form>
                </Jumbotron>
            </Container>
        );
    }
}
