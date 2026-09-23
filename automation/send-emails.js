require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const DB_FILE = path.join(__dirname, 'trainers-db.json');
const MAX_EMAILS_PER_RUN = process.env.LIMIT ? parseInt(process.env.LIMIT) : 50; // Her calismada maksimum kac kisiye atilacak

// Sabit mail sablonu. NOT: {{NAME}} parametresi kod tarafindan gercek isimle degistirilecek.
const EMAIL_SUBJECT = "{{NAME}} hocam - sizinle çalışmayı çok isterim.";
const EMAIL_BODY = `Merhaba {{NAME}} Hocam,

Ben Eren Can Güzelsu. Bilgisayar mühendisiyim, normalde Belçika'da yaşıyorum ama kısa süreliğine Türkiye'ye geldim. Ben de yıllardır sporun içindeyim, haliyle buradayken antrenmanlar için MacFit'e yazıldım.

Salonda birkaç hoca arkadaşla sohbet ederken dikkatimi çekti; Türkiye'deki antrenörlerin çoğunun kendine ait profesyonel bir web sitesi veya sistemi yok. Oysa Avrupa'da profesyonel PT'ler artık "fiyat nedir" diye sorup kaybolanlarla vakit kaybetmiyor. Bütün süreci kendi web siteleri ve yapay zeka araçlarıyla otomatik yönetiyorlar.

Sizin gibi bu işi profesyonel yapan birinin de teknolojiyi arkasına alması gerektiğini düşündüm ve tamamen bu ihtiyaca yönelik bir sistem tasarladım. Maksimum 48 saat içinde yayına alabileceğim bu siteyle şu büyük problemleri çözüyoruz:

- Zaman Kaybını Önleme
Problem: Hocalara sürekli fiyat sorup kaybolan "ölü" potansiyel müşteriler gelir. Bu büyük vakit kaybıdır.
Çözüm: Sitenize kuracağım yapay zeka asistanı sıradan robotik cevaplar vermez. Tamamen sizin tarzınızda konuşacak, sizin belirlediğiniz sorulara sizin istediğiniz şekilde cevap verecek şekilde kurgulanır. Fiyat sorup kaybolanları sizin yerinize eler, sadece bütçesi uyan ciddi müşterileri takviminize yönlendirir.

- Kredi Kartı ile Ödeme Alma
Problem: PT fiyatları yüksek (30-40 bin TL). Öğrenciler bunu nakit vermek istemez.
Çözüm: Web sitenize entegre edeceğim sanal pos altyapısı sayesinde, öğrencilerinize kredi kartıyla ödeme imkanı sunabilirsiniz (müşteri dilerse bankasıyla görüşüp taksit yaptırabilir). Nakit veremediği için kaybettiğiniz birçok müşteriyi anında kazanırsınız.

- Pasif Gelir (Uyurken Para Kazanma)
Problem: PT'nin geliri sadece birebir ders verdiği saate bağlıdır.
Çözüm: Sitenize bir 'Mağaza' bölümü ekleyelim. Önceden hazırladığınız 4 haftalık antrenman programları, beslenme PDF'leri gibi çeşitlendirilebilir birçok seçenek ekleyerek bunları otomatik satın alınabilir hale getirelim. Siz dersteyken veya uyurken bile web siteniz size para kazandırsın.

- Prestij ve "Premium" Fiyatlandırma
Problem: Öğrenciler fiyatı yüksek bulur. Hocanın kendi değerini kanıtlaması zordur.
Çözüm: Öğrenciler sıradan bir Instagram sayfasına yüksek ücret ödemekten çekinir. Ancak Premium bir web sayfası, profesyonelliğinizi doğrudan gösterecek bir profil oluşturur. Bu prestijli duruş ders ücretlerinizi haklı çıkarır ve fiyat pazarlığı yapan müşteri sayısını düşürür.

- Tüm Kanallarda (WhatsApp/Instagram) Otomasyon
Problem: Instagram DM veya WhatsApp'tan gelen yüzlerce mesaja tek tek yetişmek saatlerinizi alır.
Çözüm: Sizin tarzınızla ve sizin belirlediğiniz şekilde konuşan yapay zekayı WhatsApp, Instagram ve Telegram'ınıza da bağlayabiliriz. Gelen mesajlara sıradan değil, sizin gibi ikna edici cevaplar verip potansiyel danışanları web sitenize (satın almaya) yönlendirir. Mesajlara yetişme derdinden kurtulur ve büyük vakit kazanırsınız.

Örnek olması için bizzat hazırladığım şu demo siteye bir göz atın isterseniz: https://elifkaya-pt.vercel.app/

MacFit hocalarına özel olarak bu sistemi tüm kurulum dahil tek seferlik 199 Euro'ya kuruyorum. İşime o kadar güveniyorum ki; siteyi kurup size gösterdiğimde içinize sinmeyen bir şey olursa hiçbir ücret talep etmiyorum. Tüm risk bende.

Eğer örnek site hoşunuza gittiyse ve detayları konuşmak isterseniz bu maile sadece "ilgileniyorum" yazmanız yeterli, geri kalan her şeyi ben hallediyorum.

Bana her zaman WhatsApp'tan da ulaşabilirsiniz: +32 494 323 170

Şimdiden iyi çalışmalar, kolay gelsin hocam.
Eren Can Güzelsu`;

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

        const subject = EMAIL_SUBJECT.replace(/{{NAME}}/g, firstName);
        const text = EMAIL_BODY.replace(/{{NAME}}/g, firstName);

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
