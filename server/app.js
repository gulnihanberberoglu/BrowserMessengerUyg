//uniq id 
let guid = require('guid');
let users = [];
let messages = [];
let privateChatRoom = [];
let socket;

//users dizisinde bulunan kullanıcıların en son işlemi ile şuan arasında 15sn 
//üzerinde ise kullanıcının durumunun offline yapan fonksiyon 
function timerAction(arg) {
    if (socket) {
        var currentTime = new Date();
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            if (user.status == "online" && Math.abs(currentTime - new Date(user.lastActivity)) >= 15000) {
                user.status = "offline";
                users[index] = user;
                console.log("offline kullanıcı bulundu", user);
                socket.emit('kullaniciOffline', users);
            }
        }
    }
}

//15sn de bir timerAction methodunu çalıştırması için sayaç ayarlanıyor
setInterval(timerAction, 15000);

//dizideki herhangi bir elemanı silebilmek için Array.prototype'na remove metodu ekleniyor
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

//Kullanıcıların sisteme giriş yapmasını sağlayan fonksiyon
exports.login = function (req, res, io) {
    socket = io;
    let addUser = true;
    if (req.body.nick && req.body.ip && req.body.nick != "" && req.body.ip != "") {
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            //Sisteme daha önceden login olmuş bir kullanıcı login işleminin tekrarlıyor ise
            //kullanıcılar dizisineki bilgisi güncelleniyor
            if (user.nick == req.body.nick) {
                addUser = false;
                users[index] = req.body;
            }
        }

        //Kullanıcı daha önceden login olmamış ise
        if (addUser) {
            //kullanıcılar dizisie ekleniyor
            users.push(req.body);
        }


        console.log("Kullanıcı login oldu.", req.body);
        //Login işleminin başarılı olduğu cevabı dönülüyor
        res.json({
            status: true,
            msg: "İşleminiz başarıyla tamamlandı"
        });

        //Kullanıcı login işlemi sonucu kullanıcılar dizisi güncellendiği için
        //yeni liste socket üzerinden diğer kullanıcılar ile paylaşılıyor
        io.emit('yeniKullanici', users);
    }
    else {
        console.log("Hatalı request geldi", req.body);
        //Hatalı bir request geldiğinde önyüze hata dönülüyor
        res.json({
            status: false,
            msg: "İşleminiz sırasında hata oluştu"
        });
    }
};

//Kullanıcıların sistemden çıkış yapmasını sağlayan fonksiyon
exports.logout = function (req, res, io) {
    socket = io;
    if (req.body.nick && req.body.ip && req.body.nick != "" && req.body.ip != "") {
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            //Çıkış işlemini yapan kullanıcı, kullanıcılar listesinde var ise
            if (user.nick == req.body.nick) {
                //kullanıcı listeden siliniyor
                users.remove(index);
            }
        }
        console.log("Kullanıcı logout oldu.", req.body);
        //Çıkış işleminin başarılı olduğu önülüyor
        res.json({
            status: true,
            msg: "İşleminiz başarıyla tamamlandı"
        });

        //Kullanıcılar dizisi güncellendiği için yeni liste kullanıcılar ile socket üzerinden paylaşılıyor
        io.emit('silKullanici', users);
    }
    else {
        console.log("Hatalı request geldi", req.body);
        //Hatalı bir request geldiğinde önyüze hata dönülüyor
        res.json({
            status: false,
            msg: "İşleminiz sırasında hata oluştu"
        });
    }
}

//Sisteme giriş yapmış olan kullanıcıların listesini dönen fonksiyon
exports.userList = function (req, res, io) {
    socket = io;
    res.json({
        status: true,
        userList: users
    });
};

//Kullanıcıların genel chat odasına mesaj göndermelerini sağlyan fonksyon
exports.sendMessage = function (req, res, io) {
    socket = io;
    console.log("Yeni mesaj geldi.", req.body);

    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        //login olmuş kullanıcılardan biri mesaj göndermiş ise
        if (user.nick == req.body.user.nick) {
            //mesaj gönderen kullanıcının son işlem tarihi o an olarak ayarlanıyor
            //ve statusü online olarak değiştiriliyor
            user.status = "online";
            user.lastActivity = new Date();
            //kullanıcı dizisi güncelleniyor
            users[index] = user;
            req.body.user = user;

            //gelen mesaj genel mesajların tutulduğu diziye yazılıyor
            messages.push(req.body);

            //yeni gelen mesaj socket üzerinden kullanıcılara gönderiliyor
            io.emit('yeniMesaj', req.body);
            //kullanıcının statüsü online olarak değiştirildiği için güncel kullanıcı listesi
            //login olmuş kullanıcılara socket üzerinden gönderiliyor.
            io.emit('kullaniciOnline', users);
        }
    }

    //Mesaj gönderimini servis ile yapan kullanıcıya işleminin başarılı olduğu bilgisi dönülüyor
    res.json({
        status: true,
        msg: "İşleminiz başarıyla tamamlandı"
    });
};

//Mevcut mesajlaşmaları tutan mesaj dizisini dönen fonksyon
exports.messageList = function (req, res, io) {
    socket = io;
    res.json({
        status: true,
        messageList: messages
    });
};

//Kullanıcını seçtiği diğer bir kullanıcıya özel mesajlaşma isteği göndermesini sağlayan fonksiyon
exports.privateMessageRequest = function (req, res, io) {
    socket = io;
    const gonderen = req.body.gonderen;
    const alici = req.body.alici;
    //Gönderen ile alıcı kullanıcının farklı olması durumunda 
    if (gonderen && alici && gonderen.nick != alici.nick) {
        //yeni bir özel chat odası açılıyor
        const chatRoom = {
            id: guid.create().value,
            status: false,
            messageList: [],
            ...req.body
        };
        //Açılan chat odası özel chat odalarının tutulduğu diziye atılıyor
        privateChatRoom.push(chatRoom);
        console.log("Özel chat odası kuruldu", chatRoom);

        //İsteği gönderen kullanıcıya işleminin başarılı olduğu bilgisi dönülüyor
        res.json({
            status: true,
            msg: "İşleminiz başarıyla tamamlandı"
        });

        //İsteğin iletileceği kullanıcıya socket üzerinden bilgi göneriliyor
        io.emit("ozelMesajIstegi", chatRoom);
    }
}

//Özel mesajlaşma isteği gönderilen kullanıcının talebi kabul etmesini sağlayan fonksiyon
exports.privateMessageRequestAccept = function (req, res, io) {
    socket = io;
    for (let index = 0; index < privateChatRoom.length; index++) {
        const chatRoom = privateChatRoom[index];
        //Kullanıcıya gelen özel chat odası talebi bulunursa
        if (chatRoom.gonderen.nick == req.body.gonderen.nick && chatRoom.alici.nick == req.body.alici.nick) {
            console.log("Özel chat odası isteği kabul edildi", chatRoom);
            //İsteği kabul etme işleminin başarılı olduğu bilgisi dönülüyor
            res.json({
                status: true,
                msg: "İşleminiz başarıyla tamamlandı"
            });

            //İsteği gönderen kullanıcıya talebinin kabul edildiği bilgisi socket üzerinden gönderiliyor
            io.emit("ozelMesajIstegiKabul", chatRoom);
        }
    }
}

//Özel mesajlaşma isteği gönderilen kullanıcının talebi reddetmesini sağlayan fonksiyon
exports.privateMessageRequestReject = function (req, res, io) {
    socket = io;
    for (let index = 0; index < privateChatRoom.length; index++) {
        const chatRoom = privateChatRoom[index];
        //Kullanıcıya gelen özel chat odası talebi bulunursa
        if (chatRoom.gonderen.nick == req.body.gonderen.nick && chatRoom.alici.nick == req.body.alici.nick) {
            console.log("Özel chat odası isteği reddedildi", chatRoom);
            //İsteği red etme işleminin başarılı olduğu bilgisi dönülüyor
            res.json({
                status: true,
                msg: "İşleminiz başarıyla tamamlandı"
            });
            
            //İsteği gönderen kullanıcıya talebinin red edildiği bilgisi socket üzerinden gönderiliyor
            io.emit("ozelMesajIstegiRed", req.body);
        }
    }
}

//Özel mesajlaşma odasında yapılan yazışmaları dönen fonksiyon
exports.chatRoomMessageList = function (req, res, io) {
    socket = io;
    for (let index = 0; index < privateChatRoom.length; index++) {
        const chatRoom = privateChatRoom[index];
        //Kullanıcının görüşme yaptığı chat odası bulunur ise
        if (chatRoom.id == req.body.chatRoom.id) {
            //Chat odasındaki mesajlar dönülüyor
            res.json({
                status: true,
                chatRoom: chatRoom
            });
        }
        else{
            //Chat odası bulunamadığı için boş liste gönderiliyor
            res.json({
                status: false,
                chatRoom: []
            });
        }
    }
}

//Özel mesajlaşma odasına yeni mesaj gönderimi sağlayan fonksiyon
exports.chatRoomMessageSend = function (req, res, io) {
    socket = io;
    for (let index = 0; index < privateChatRoom.length; index++) {
        const chatRoom = privateChatRoom[index];
        //Kullanıcının görüşme yaptığı chat odası bulunur ise
        if (chatRoom.id == req.body.chatRoom.id) {
            //Chat odasınadaki mesajları tutan diziye yeni gönderilen mesaj ekleniyor
            chatRoom.messageList.push(req.body.message);
            res.json({
                status: true,
                msg: "İşleminiz başarıyla tamamlandı"
            });

            //Chat odası mesaj dizisi güncellendiği için güncel hali socket üzerinden kullanıcılara gönderiliyor
            io.emit('chatRoomYeniMesaj', chatRoom);
        }
    }
}

//Özel mesajlaşma odasındaki görüşmeyi sonlandıran fonksiyon
exports.chatRoomMessageExit = function (req, res, io) {
    socket = io;
    for (let index = 0; index < privateChatRoom.length; index++) {
        const chatRoom = privateChatRoom[index];
        //Kullanıcının görüşme yaptığı chat odası bulunur ise
        if (chatRoom.id == req.body.chatRoom.id) {
            //Talebi yapan kullanıcıya isteğinin başarı ile tamamlandığı bilgisi dönülüyor
            res.json({
                status: true,
                msg: "İşleminiz başarıyla tamamlandı"
            });

            //Chat odasından çıkış yapıldığı bilgisi socket üzerinden kullanıcılara gönderiliyor
            io.emit('chatRoomExit', chatRoom);
        }
    }
}