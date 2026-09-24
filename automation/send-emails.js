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

Ben Eren Can Güzelsu. Bilgisayar mühendisiyim, normalde Belçika'da yaşıyorum ama kısa süreliğine Türkiye'ye geldim. Ben de yıllardır sporun içindeyim, buradayken antrenmanlar için MacFit'e yazıldım.

{{COMPLIMENT}} teknolojiyi de arkanıza almanız gerektiğini düşündüm. Salonda gözlemlediğim kadarıyla Türkiye'deki antrenörlerin çoğunun kendine ait profesyonel bir web sitesi yok. Oysa Avrupa'da profesyonel PT'ler artık fiyat sorup kaybolanlarla vakit kaybetmiyor, tüm işlerini kendi web siteleri ve asistan araçlarıyla otomatik yönetiyorlar.

Sizin için de tamamen size özel bir sistem hazırlayabileceğimizi düşündüm. Bu sistemle:
- Size sürekli fiyat sorup kaybolanlarla uğraşmazsınız.
- Öğrencilerinize online ödeme ve taksit gibi kolaylıklar sunabilirsiniz.
- Sadece birebir dersten değil, hazır PDF ve program satışlarıyla pasif gelir de elde edebilirsiniz.

Örnek olması için bizzat hazırladığım şu demo siteye bir göz atın isterseniz: https://elifkaya-pt.vercel.app/

Siteyi kurup size gösterdiğimde içinize sinmeyen bir şey olursa zaten hiçbir beklentim yok. Eğer örnek site hoşunuza gittiyse ve detayları konuşmak isterseniz bu maile dönüş yapmanız yeterli.

Bana WhatsApp'tan da ulaşabilirsiniz: +32 494 323 170

İyi çalışmalar dilerim hocam, kolay gelsin.
Eren Can Güzelsu`,
    `Selamlar {{NAME}} Hocam,

Ben Eren. Bilgisayar mühendisiyim, Belçika'da yaşıyorum. Türkiye'ye geldiğimde antrenmanlarım için MacFit'e gidiyorum.

{{COMPLIMENT}} dijital dünyada da çok daha görünür olmanız gerektiğini fark ettim. Avrupa'da PT'lerin işlerini nasıl profesyonelce yürüttüğünü gördükten sonra, buradaki antrenörlerin neden kendi web sitelerini ve dijital sistemlerini kullanmadığını merak ettim. Çoğu hoca DM'den gelen "fiyat nedir" sorularına cevap vermekle büyük vakit kaybediyor.

Sizin için tamamen profesyonel, sadece ciddi danışanları filtreleyen ve hatta sizin adınıza hazır program satışı yapabilen bir sistem kurmayı çok isterim. Bu sayede ders saatlerinizin dışında da gelir elde etmeye devam edebilirsiniz.

Kafanızda canlanması için şu örnek projeye bir göz atabilirsiniz: https://elifkaya-pt.vercel.app/

Detayları ve sistemi konuşmak isterseniz bana bu mailden veya WhatsApp'tan ulaşabilirsiniz: +32 494 323 170

Şimdiden iyi çalışmalar.
Eren Can Güzelsu`,
    `{{NAME}} Hocam merhaba,

Ben Eren Can Güzelsu. Bilgisayar mühendisiyim. Uzun zamandır sporun içindeyim ve şu sıralar MacFit'te antrenman yapıyorum.

{{COMPLIMENT}} aslında çok daha geniş kitlelere ulaşıp işlerinizi otomatikleştirebileceğinizi düşünüyorum. Avrupa'da hocalar artık Instagram DM'lerine yetişmek yerine tüm potansiyel müşterilerini kendi profesyonel web sitelerine yönlendiriyor. Böylece hem daha prestijli duruyorlar hem de vakit kaybetmiyorlar.

Sizin için hazırlayacağım sistem, "fiyat sorup" kaçanları filtreler, hazır program satışı yapmanızı sağlar ve size inanılmaz bir profesyonellik katar.

Örnek olarak şu siteyi inceleyebilirsiniz: https://elifkaya-pt.vercel.app/

Eğer ilginizi çekerse, sizin için de benzer ama tamamen size özgü bir yapı kurabiliriz. İnceledikten sonra bana dönerseniz çok sevinirim.

WhatsApp üzerinden de konuşabiliriz: +32 494 323 170

Kolaylıklar dilerim hocam, görüşmek üzere.
Eren Can Güzelsu`
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
