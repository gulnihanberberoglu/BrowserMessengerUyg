//express kütüphanesi ile servis uygulaması oluşturuluyor
const express = require('express');
const app = express();

//express uygulamasının çalıştığı server nesnesine soket açılıyor
var server = require('http').Server(app);
var io = require('socket.io')(server);

//httml requestlerinin bodysinde bulunan json verisi okunabilmesi için
var bodyParser = require('body-parser');

//uygulamanın servis fonk bulunduğu modül getiriliyor
var controller = require('./app');

//servera diğer domainlerde çalışan browser uyglarından çağrı gelebilmesi için
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);

//json bodyParser express uyg ekleniyor
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serverın /api'sine gelen devamında gidilecek adreslerin controllerının hangi fonk düşeceğinin belirlendiği kısım
var router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});
//controllerın içindeki fonk io paremetresini clientlara soket üzerinden mesaj göndermek için kullanıyoruz
router.get('/user', (req, res) => controller.userList(req, res, io));
router.post('/user', (req, res) => controller.login(req, res, io));
router.post('/user/logout', (req, res) => controller.logout(req, res, io));

router.post('/user/privateMessageRequest', (req, res) => controller.privateMessageRequest(req, res, io));
router.post('/user/privateMessageRequestAccept', (req, res) => controller.privateMessageRequestAccept(req, res, io));
router.post('/user/privateMessageRequestReject', (req, res) => controller.privateMessageRequestReject(req, res, io));

router.get('/message', (req, res) => controller.messageList(req, res, io));
router.post('/message', (req, res) => controller.sendMessage(req, res, io));

router.post('/chatroom/login', (req, res) => controller.chatRoomMessageList(req, res, io));
router.post('/chatroom/sendMessage', (req, res) => controller.chatRoomMessageSend(req, res, io));
router.post('/chatroom/exit', (req, res) => controller.chatRoomMessageExit(req, res, io));

// express uygulamasının /api adresine routterı bağlıyor
app.use('/api', router);

//3001 porttundan uygulamayı ayağa kaldırıyoruz
server.listen(3001, () => console.log('Example app listening on port 3001!'));