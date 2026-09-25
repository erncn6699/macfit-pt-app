require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const imaps = require('imap-simple');

const DB_FILE = path.join(__dirname, 'trainers-db.json');
const MAX_EMAILS_PER_RUN = process.env.LIMIT ? parseInt(process.env.LIMIT) : 50; // Her calismada maksimum kac kisiye atilacak

const EMAIL_SUBJECTS = [
    "{{NAME}} Hocam, sizi ileriye taşıyacak bir fikrimi paylaşmak isterim",
    "Selamlar {{NAME}} Hocam, yapay zeka ile işlerinizi otomatikleştirelim",
    "MacFit'ten Eren Can - {{NAME}} Hocam merhaba"
];

const EMAIL_BODIES = [
    `Merhaba {{NAME}} Hocam,

Ben Eren Can. Almanya Duisburg Üniversitesi'nde Bilgisayar Mühendisliği, Yazılım Geliştirme ve Yapay Zeka üzerine lisans eğitimimi tamamladım. Şu anda yazılım üzerine profesyonel projeler hazırlıyorum. Kendim de antrenmanlarımı MacFit'te yaptığım için siz değerli hocalara ulaşma imkanı buldum.

{{COMPLIMENT}} Bu yüzden, teknolojiyi de arkanıza almanız gerektiğini düşündüm. Avrupa'da profesyonel PT'ler artık DM'den "fiyat nedir" diye sorup kaybolanlarla vakit kaybetmiyor, tüm işlerini kendi web siteleri ve yapay zeka asistanlarıyla otomatik yönetiyorlar.

Sizin için tamamen size özel bir sistem hazırlayabileceğimizi düşündüm. Bu sistemle elde edeceğiniz bazı avantajlar:

- 7/24 Özel Yapay Zeka Asistanı
Tamamen size özel eğitilmiş ve geliştirilmiş yapay zeka asistanınızı tarafınıza atıyoruz. İster web sayfanızdan, ister Instagram veya WhatsApp gibi sosyal medya kanallarından gelen mesajlarda; asistanınız sizin adınıza görüşmeler sağlayıp, sizinle gerçekten çalışmak isteyen ciddi kişileri belirliyor ve sizin onayınızla randevu oluşturuyor.

- Bölgesel Görünürlük (Özel SEO Çalışması)
Size özel yapacağımız SEO çalışmasıyla, bulunduğunuz bölgede Google'a sadece 'spor' dahi yazılsa en üst sıralarda çıkmanızı sağlıyoruz. Birçok spor salonundan bile önce isminizin görünmesiyle potansiyel danışanlarınızın size ulaşması çok daha kolaylaşacak.

- Zaman Kaybını Önleme ve Filtreleme
Fiyat sorup kaybolan "ölü" potansiyel müşterilere tek tek laf anlatmakla vakit kaybetmezsiniz. Asistanınız sadece bütçesi ve amacı uyan ciddi danışanları size yönlendirir.

- Pasif Gelir (Uyurken Para Kazanma)
Sisteme ekleyeceğimiz 'Mağaza' bölümüyle 4 haftalık antrenman programları, beslenme planları gibi hazır kaynaklar satarak siz dersteyken bile gelir elde edebilirsiniz.

- Otomatik Müşteri Takibi (Yeniden Pazarlama)
Sizin için oluşturduğumuz veritabanıyla; fiyat sorup kararını erteleyen veya sadece adres soran kişileri belirliyoruz. Yapay zeka asistanınız belirli aralıklarla bu kişilerle tekrar iletişime geçerek (mail veya numaranızdan mesaj yoluyla) onları satışa dönüştürüyor.

Örnek olması için bizzat hazırladığım şu demo siteye bir göz atın isterseniz: https://ornekptsitem.erencanintelligenz.com/?ref={{EMAIL}}

Eğer örnek site hoşunuza gittiyse ve detayları konuşmak isterseniz bu maile dönüş yapmanız yeterli.

Bana doğrudan WhatsApp'tan da ulaşabilirsiniz: 0540 336 66 99

İyi çalışmalar dilerim hocam, kolay gelsin.
Eren Can`,
    
    `Selamlar {{NAME}} Hocam,

Ben Eren Can. Almanya Duisburg Üniversitesi'nde Bilgisayar Mühendisliği, Yazılım Geliştirme ve Yapay Zeka üzerine lisans eğitimimi tamamladım. Şu anda aktif olarak yazılım projeleri hazırlıyorum. Kendi antrenmanlarımı da MacFit'te yaptığım için sizin gibi değerli profesyonellere doğrudan ulaşma fırsatı buldum.

{{COMPLIMENT}} Bu profesyonel altyapınızla, dijital dünyada da çok daha görünür olup iş yükünüzü hafifletmeniz gerektiğini fark ettim. Çoğu hoca DM'den gelen "fiyat nedir" sorularına cevap vermekle büyük vakit kaybediyor.

Sizin için kuracağımız yapay zeka destekli profesyonel sistemin size sağlayacağı kolaylıklar:

- 7/24 Özel Yapay Zeka Asistanı
Tamamen size özel eğitilmiş yapay zeka asistanınız; web sayfanız, Instagram veya WhatsApp üzerinden sizin adınıza 7/24 görüşmeler sağlar. Sizinle gerçekten çalışmak isteyenleri belirler ve sizin onayınızla randevu oluşturur.

- Bölgesel Görünürlük (Özel SEO Çalışması)
Size özel yapacağımız SEO çalışmasıyla, bulunduğunuz bölgede Google'a sadece 'spor' dahi yazılsa en üst sıralarda çıkmanızı sağlıyoruz. Birçok spor salonundan bile önce isminizin görünmesiyle potansiyel danışanlarınızın size ulaşması çok daha kolaylaşacak.

- Otomatik Müşteri Takibi ve Veri Havuzu
Size sadece fiyat sorup kararını erteleyen potansiyel müşteriler için bir veri havuzu oluşturuyoruz. Asistanınız belirli aralıklarla bu kişilerle otomatik olarak (mail/mesaj) tekrar iletişime geçerek onları kazanmanızı sağlıyor.

- Prestij, Markalaşma ve Pasif Gelir
Size özel hazırlanan premium web siteniz, vizyonunuzu doğrudan kanıtlar. Ayrıca mağaza bölümünden hazır PDF programlarınızı satarak uyurken bile gelir elde etmenizi sağlar.

Kafanızda canlanması için şu örnek projeye bir göz atabilirsiniz: https://ornekptsitem.erencanintelligenz.com/?ref={{EMAIL}}

Detayları ve sistemi konuşmak isterseniz bana bu mailden veya WhatsApp'tan ulaşabilirsiniz: 0540 336 66 99

Şimdiden iyi çalışmalar.
Eren Can`,

    `{{NAME}} Hocam merhaba,

Ben Eren Can. Almanya Duisburg Üniversitesi'nde Bilgisayar Mühendisliği, Yazılım Geliştirme ve Yapay Zeka üzerine lisans eğitimimi tamamladım. Şu an yazılım projeleri geliştiriyorum ve kendi antrenmanlarımı da MacFit'te yaptığım için siz değerli eğitmenlere ulaşma şansım oldu.

{{COMPLIMENT}} Bu vizyonla, aslında çok daha geniş kitlelere ulaşıp işlerinizi yapay zeka ile otomatikleştirebileceğinizi düşünüyorum. Avrupa'da hocalar artık Instagram DM'lerine yetişmek yerine tüm potansiyel müşterilerini kendi yapay zeka asistanlarına yönlendiriyor.

Sizin için kuracağımız sistemle şu büyük kolaylıkları sağlıyoruz:

- 7/24 Sosyal Medya & Web Asistanı
Tamamen size özel eğitilmiş asistanınız; web siteniz, Instagram ve WhatsApp'ınızda sizin adınıza görüşmeler yapar. Sadece fiyat soranları eler, gerçekten çalışmak isteyen ciddi danışanları belirleyip randevularınızı oluşturur.

- Bölgesel Görünürlük (Özel SEO Çalışması)
Size özel yapacağımız SEO çalışmasıyla, bulunduğunuz bölgede Google'a sadece 'spor' dahi yazılsa en üst sıralarda çıkmanızı sağlıyoruz. Birçok spor salonundan bile önce isminizin görünmesiyle potansiyel danışanlarınızın size ulaşması çok daha kolaylaşacak.

- Akıllı Müşteri Takibi
Sadece bilgi alıp kararını erteleyen kişiler için özel veriler oluşturuyoruz. Asistanınız belli aralıklarla bu kişilere otomatik olarak kendini hatırlatarak (mesaj veya mail ile) satış oranınızı artırır.

- Kesintisiz Pasif Gelir
Sitenize bir 'Mağaza' bölümü ekleyerek, sizin daha önce hazırladığınız programları PDF olarak satıp zahmetsizce pasif gelir elde etmenizi sağlayabiliriz.

Örnek olarak şu demo siteyi inceleyebilirsiniz: https://ornekptsitem.erencanintelligenz.com/?ref={{EMAIL}}

Eğer ilginizi çekerse, sizin için de benzer ama tamamen size özgü bir yapı kurabiliriz. İnceledikten sonra bana dönerseniz çok sevinirim.

WhatsApp üzerinden de konuşabiliriz: 0540 336 66 99

Kolaylıklar dilerim hocam, görüşmek üzere.
Eren Can`
];

async function run() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Lutfen .env dosyasinda SMTP_USER ve SMTP_PASS tanimlayin.");
        process.exit(1);
    }

    if (!fs.existsSync(DB_FILE)) {
        console.error("Veritabani bulunamadi! Once extract-data.js calistirin.");
        process.exit(1);
    }

    const trainers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const pendingTrainers = trainers.filter(t => !t.sent);

    if (pendingTrainers.length === 0) {
        console.log("Gonderilecek bekleyen email bulunamadi. Tum liste tamamlanmis.");
        return;
    }

    const batch = pendingTrainers.slice(0, MAX_EMAILS_PER_RUN);
    console.log(`Toplam ${pendingTrainers.length} bekleyen mail var. Bu sefer ${batch.length} kisiye gonderiliyor...`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        await transporter.verify();
        console.log("SMTP baglantisi basarili.");
    } catch (err) {
        console.error("SMTP baglanti hatasi:", err.message);
        process.exit(1);
    }

    let imapConnection;
    try {
        const imapConfig = {
            imap: {
                user: process.env.SMTP_USER,
                password: process.env.SMTP_PASS,
                host: process.env.SMTP_HOST.replace('smtp', 'imap'),
                port: 993,
                tls: true,
                authTimeout: 5000
            }
        };
        imapConnection = await imaps.connect(imapConfig);
        console.log("IMAP baglantisi basarili (Giden Kutusu senkronizasyonu icin).");
    } catch (err) {
        console.error("IMAP baglanti hatasi (mailler kopyalanamayacak):", err.message);
    }

    for (let i = 0; i < batch.length; i++) {
        const trainer = batch[i];
        
        let firstName = trainer.name.trim().split(' ').slice(0, -1).join(' ');
        if (!firstName) firstName = trainer.name.trim();

        const randomSubject = EMAIL_SUBJECTS[Math.floor(Math.random() * EMAIL_SUBJECTS.length)];
        const randomBody = EMAIL_BODIES[Math.floor(Math.random() * EMAIL_BODIES.length)];

        const fallbackCompliment = "Profilinizi detaylı inceleme fırsatım oldu; alanınızdaki profesyonel duruşunuz, sahip olduğunuz değerli sertifikalarınız, uzmanlık alanlarınız ve bugüne kadarki başarılarınız gerçekten çok dikkatimi çekti. Sizin gibi vizyoner bir antrenörün profilini incelemek bana ilham verdi.";
        const complimentText = trainer.compliment ? trainer.compliment : fallbackCompliment;

        const subject = randomSubject.replace(/{{NAME}}/g, firstName);
        let text = randomBody.replace(/{{NAME}}/g, firstName);
        text = text.replace(/{{COMPLIMENT}}/g, complimentText);
        text = text.replace(/{{EMAIL}}/g, encodeURIComponent(trainer.email));

        try {
            console.log(`[${i+1}/${batch.length}] Gonderiliyor: ${trainer.name} <${trainer.email}>`);
            
            await transporter.sendMail({
                from: `"Eren Can" <${process.env.SMTP_USER}>`,
                to: trainer.email,
                subject: subject,
                text: text
            });

            // Update DB
            trainer.sent = true;
            trainer.sentAt = new Date().toISOString();
            fs.writeFileSync(DB_FILE, JSON.stringify(trainers, null, 2));
            
            // Kopyayi Giden Kutusuna kaydet
            if (imapConnection) {
                const rawMessage = `From: "Eren Can" <${process.env.SMTP_USER}>\r\nTo: ${trainer.email}\r\nSubject: ${subject}\r\nDate: ${new Date().toUTCString()}\r\n\r\n${text}`;
                try {
                    await imapConnection.append(rawMessage, { mailbox: 'INBOX.Sent', flags: ['\\Seen'] });
                } catch (e) {
                    console.error("  --> IMAP kopyalama hatasi:", e.message);
                }
            }
            
            console.log(`  --> Basarili.`);
            
            // 5 seconds delay to prevent spam limits
            await new Promise(r => setTimeout(r, 5000));
        } catch (err) {
            console.error(`  --> Hata: ${err.message}`);
        }
    }
    
    if (imapConnection) {
        imapConnection.end();
    }
    console.log("\nBu seferlik gonderim tamamlandi.");
}

run();
