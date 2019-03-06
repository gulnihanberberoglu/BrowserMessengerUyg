<p><strong><u>BROWSER MESSENGER UYGULAMASI</u></strong></p>
<p style="text-align: justify;">&Ouml;zet:</p>
<p><em>Bu projede sunucu-istemci mimarisini kullanarak, istemciler arasında anlık mesajlaşma işleminin yapılması hedeflemektedir.</em></p>
<p><strong>Genel Yapı</strong></p>
<p>Eğer proje ilk kez &ccedil;alıştırılacak ise şu adımların ger&ccedil;ekleştirilmesi gerekir;</p>
<p>1-Yeni bir cmd a&ccedil;ılır ve cd proje dosya uzantısı (cd C:\Users\Admin\Desktop\Messenger)</p>
<p>2-npm install -g nodemon</p>
<p>3-npm install</p>
<p>4-npm run start-server</p>
<p>5-Yeni cmd a&ccedil; ve cd proje dosya uzantısı (cd C:\Users\Admin\Desktop\Messenger)</p>
<p>6-Yeni cmd&rsquo;de npm run start-client</p>
<p>işlemleri ger&ccedil;ekleştirilir.</p>
<p>Ancak sonraki &ccedil;alıştırmalar i&ccedil;in sadece 1, 4, 5 ve 6 &lsquo;ıncı maddeleri ger&ccedil;ekleştirmek yeterli olacaktır.</p>
<p>**Console&rsquo;daki &ccedil;alışan işlemi bitirmek i&ccedil;in; Ctrl+C sonrasında ise Y enter yapmak yeterlidir.</p>
<p>Gerekli işlemler ger&ccedil;ekleştirildikten sonra localhost:3000&rsquo; den projenin ana ekranı a&ccedil;ılır.</p>
<p>Kullanıcı nick ve avatar resmini girerek sisteme kayıt olur.</p>
<p>Kullanıcı giriş yaptıktan sonra <a href="http://localhost:3000/chat">http://localhost:3000/chat</a> sayfasına y&ouml;nlendirilir ve kullanıcı listesinde yer alır ayrıca kullanıcı diğer kullanıcılar ile mesajlaşabilir. Mesajlaşma durumuna g&ouml;re de 15sn periyotlarla online offline olma durumları listede g&ouml;sterilir.</p>
<p>&Ouml;zel mesajlaşmak istediği kullanıcıya bir kullanıcı &ouml;zel mesaj yollama isteğinde bulunabilir.</p>
<p>Kullanıcı istekte bulunan kullanıcının &ouml;zel mesajlaşma isteğini red ederse chat ekranında kalırlar, kabul ederse <a href="http://localhost:3000/privatechat">http://localhost:3000/privatechat</a> sayfasına her iki tarafta y&ouml;nlendirilir. B&ouml;ylece &ouml;zel mesajlaşma işlemlerini ger&ccedil;ekleştirebilirler.</p>
<p>Kullanıcının biri konuşmayı bitir buttonunda basarsa diğeri de konuşmayı bitirmiş kabul edilir ve ikisi de chat ekranına y&ouml;nlendirilir.</p>
<p>&nbsp;Kullanıcı chat ekranında oturumu kapat buttonuna basarsa login sayfasına y&ouml;nlendirilir ve kullanıcı listesinden silinir.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
