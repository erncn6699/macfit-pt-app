require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const DB_FILE = path.join(__dirname, 'trainers-db.json');
const MAX_EMAILS_PER_RUN = process.env.LIMIT ? parseInt(process.env.LIMIT) : 50; // Her calismada maksimum kac kisiye atilacak

// Sabit mail sablonu. NOT: {{NAME}} parametresi kod tarafindan gercek isimle degistirilecek.
const EMAIL_SUBJECTS = [
    "{{NAME}} hocam - sizinle çalışmayı çok isterim",
    "Selamlar {{NAME}} hocam, bir önerim var",
    "MacFit'ten Eren Can - {{NAME}} hocam selamlar"
];

const EMAIL_BODIES = [
    `Merhaba {{NAME}} Hocam,

Ben Eren Can. Normalde Belçika'da yaşıyorum ama kısa süreliğine Türkiye'ye gelmiştim. Ben de yıllardır sporun içindeyim, buradayken antrenmanlar için MacFit'e yazıldım.

{{COMPLIMENT}} teknolojiyi de arkanıza almanız gerektiğini düşündüm. Salonda gözlemlediğim kadarıyla Türkiye'deki antrenörlerin çoğunun kendine ait profesyonel bir web sitesi yok. Oysa Avrupa'da profesyonel PT'ler artık "fiyat nedir" diye sorup kaybolanlarla vakit kaybetmiyor, tüm işlerini kendi web siteleri ve asistan araçlarıyla otomatik yönetiyorlar.

Sizin için tamamen size özel bir sistem hazırlayabileceğimizi düşündüm. Bu sistemle elde edeceğiniz bazı avantajlar:

- Zaman Kaybını Önleme
Kuracağımız yapay zeka asistanı Instagram DM ve WhatsApp'ınıza entegre çalışır. Fiyat sorup kaybolan "ölü" potansiyel müşterileri eler, sadece bütçesi uyan ciddi danışanları size yönlendirir.

- Pasif Gelir (Uyurken Para Kazanma)
Sisteme ekleyeceğimiz 'Mağaza' bölümüyle 4 haftalık antrenman programları, beslenme PDF'leri gibi hazır kaynaklar satarak siz dersteyken bile gelir elde edebilirsiniz.

- 7/24 Profesyonel Asistan
Sizin tarzınızda eğitilmiş yapay zeka, gece yarısı bile gelse tüm soruları anında yanıtlar ve danışanları doğrudan paketinizi satın almaya yönlendirir.

Örnek olması için bizzat hazırladığım şu demo siteye bir göz atın isterseniz: https://demo.erencanintelligenz.com/?ref={{EMAIL}}

Siteyi kurup size gösterdiğimde içinize sinmeyen bir şey olursa zaten hiçbir beklentim yok. Eğer örnek site hoşunuza gittiyse ve detayları konuşmak isterseniz bu maile dönüş yapmanız yeterli.

Bana WhatsApp'tan da ulaşabilirsiniz: +32 494 323 170

İyi çalışmalar dilerim hocam, kolay gelsin.
Eren Can`,
    `Selamlar {{NAME}} Hocam,

Ben Eren Can. Belçika'da yaşıyorum, kısa süreliğine Türkiye'ye geldim ve geldiğimde antrenmanlarım için MacFit'e gidiyorum.

{{COMPLIMENT}} dijital dünyada da çok daha görünür olmanız gerektiğini fark ettim. Avrupa'da PT'lerin işlerini nasıl profesyonelce yürüttüğünü gördükten sonra, buradaki antrenörlerin neden kendi web sitelerini kullanmadığını merak ettim. Çoğu hoca DM'den gelen "fiyat nedir" sorularına cevap vermekle büyük vakit kaybediyor.

Sizin için tamamen profesyonel, sadece ciddi danışanları filtreleyen bir sistem kurmayı çok isterim. Bu sistemin size sağlayacağı kolaylıklar:

- Tüm Kanallarda Otomasyon
Instagram DM veya WhatsApp'tan gelen yüzlerce mesaja tek tek yetişmek yerine, yapay zeka asistanınızı bu kanallara bağlayarak tüm süreci otomatikleştirebilirsiniz.

- Prestij ve Markalaşma
Size özel hazırlanan premium web siteniz, vizyonunuzu ve profesyonelliğinizi doğrudan kanıtlar. Fiyat/değer pazarlığını ortadan kaldırır.

- Uyurken Bile Satış
Derste olduğunuzda veya uyurken bile web sitenizdeki mağaza üzerinden hazır programlarınız satılmaya ve pasif gelir getirmeye devam eder.

Kafanızda canlanması için şu örnek projeye bir göz atabilirsiniz: https://demo.erencanintelligenz.com/?ref={{EMAIL}}

Detayları ve sistemi konuşmak isterseniz bana bu mailden veya WhatsApp'tan ulaşabilirsiniz: +32 494 323 170

Şimdiden iyi çalışmalar.
Eren Can`,
    `{{NAME}} Hocam merhaba,

Ben Eren Can. Belçika'da yaşıyorum ama kısa süreliğine Türkiye'ye gelmiştim, bu süre zarfında da antrenmanlarıma MacFit'te devam ediyorum.

{{COMPLIMENT}} aslında çok daha geniş kitlelere ulaşıp işlerinizi otomatikleştirebileceğinizi düşünüyorum. Avrupa'da hocalar artık Instagram DM'lerine yetişmek yerine tüm potansiyel müşterilerini kendi profesyonel web sitelerine yönlendiriyor. Böylece hem daha prestijli duruyorlar hem de vakit kaybetmiyorlar.

Sizin için kuracağımız sistemle şu büyük kolaylıkları sağlıyoruz:

- Zaman Kaybını Önleme
Kuracağımız yapay zeka asistanı sıradan robotik cevaplar vermez. Sizin dilinizden konuşarak fiyat sorup kaybolanları eler ve sadece gerçek müşterileri takviminize yönlendirir.

- Pasif Gelir Kapısı
Sitenize bir 'Mağaza' bölümü ekleyerek, sizin daha önce hazırladığınız 4 haftalık programları PDF olarak satıp zahmetsizce pasif gelir elde etmenizi sağlayabiliriz.

- Kesintisiz Sosyal Medya Yönetimi
Yapay zeka asistanı Instagram ve WhatsApp hesaplarınıza entegre olarak sizin adınıza 7/24 iletişim kurar ve tüm potansiyel satışları gerçeğe dönüştürür.

Örnek olarak şu siteyi inceleyebilirsiniz: https://demo.erencanintelligenz.com/?ref={{EMAIL}}

Eğer ilginizi çekerse, sizin için de benzer ama tamamen size özgü bir yapı kurabiliriz. İnceledikten sonra bana dönerseniz çok sevinirim.

WhatsApp üzerinden de konuşabiliriz: +32 494 323 170

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

    for (let i = 0; i < batch.length; i++) {
        const trainer = batch[i];
        
        let firstName = trainer.name.trim().split(' ').slice(0, -1).join(' ');
        if (!firstName) firstName = trainer.name.trim();

        const randomSubject = EMAIL_SUBJECTS[Math.floor(Math.random() * EMAIL_SUBJECTS.length)];
        const randomBody = EMAIL_BODIES[Math.floor(Math.random() * EMAIL_BODIES.length)];

        const fallbackCompliment = "Profilinizi ve çalışmalarınızı incelediğimde alanınızdaki profesyonel duruşunuz çok dikkatimi çekti. Sizin gibi vizyoner bir antrenörün";
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
            
            console.log(`  --> Basarili.`);
            
            // 5 seconds delay to prevent spam limits
            await new Promise(r => setTimeout(r, 5000));
        } catch (err) {
            console.error(`  --> Hata: ${err.message}`);
        }
    }
    
    console.log("\nBu seferlik gonderim tamamlandi.");
}

run();
