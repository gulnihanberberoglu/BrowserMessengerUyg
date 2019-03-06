import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

//public klasöründeki index.html dosyasındaki root div'i içerisinin
//react uygulaması tarafından yönetilmesi sağlanıyor.

//BrowserRouter --> react uygulamasındaki sayfa geçişlerini yönetmesi için ekleniyor
ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>, document.getElementById('root'));

//react uygulaması eklendiğide otomatik olarak ekleniyor
registerServiceWorker();
