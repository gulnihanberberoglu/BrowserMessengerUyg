
//Uygulama çalıştığı sürece componentler arasında veri taşıma amacı ile yazılmış
//sınıftır

//Uyuglama refresh olana kadar tek nesne olmasını sağlayan değişken
let instance = null;

export default class Session {
    //tek nesne yaratılmasını sağlıyor
    constructor() {
        if (!instance) {
            instance = this;
        }
    }

    //Yaratılan nesneyi dönen static fonksiyon
    static get instance() {
        if (!instance) {
            instance = new Session();
        }
        return instance;
    }

    //Session'da tutulan kullanıcı değerinin okunmasını sağlayan method
    get user() {
        return this._user;
    }

    //Session'da tutulan kullanıcı değerinin yazılmasını sağlayan method
    set user(user) {
        this._user = user;
    }

    //Session'da tutulan özel chat değerinin okunmasını sağlayan method
    get chat() {
        return this._chat;
    }

    //Session'da tutulan özel chat değerinin yazılmasını sağlayan method
    set chat(chat) {
        this._chat = chat;
    }
}