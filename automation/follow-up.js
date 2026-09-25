require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const DB_FILE = path.join(__dirname, 'trainers-db.json');
const FIREBASE_URL = "https://firestore.googleapis.com/v1/projects/macfit-pt-app/databases/(default)/documents/clicks";

// Email Templates
const REMINDER_SUBJECT = "Web siteniz hakkında (Tekrar)";
const REMINDER_BODY = `Merhaba {{NAME}},

Geçtiğimiz günlerde size kişisel web sitenizin demosunu içeren bir e-posta göndermiştim, ancak henüz inceleme fırsatı bulamadığınızı görüyorum.

Tekrar etmek isterim ki; sizin gibi donanımlı bir profesyonelin sadece Instagram ile yetinmesi, potansiyel danışanları kaçırmak demek. Demo siteye hiçbir ücret ödemeden şu linkten göz atabilirsiniz:
https://ornekptsitem.erencanintelligenz.com/?ref={{EMAIL}}

Eğer sistemi kurmak isterseniz bana bu mail üzerinden dönüş yapmanız yeterli.

İyi çalışmalar dilerim.`;

const CAMPAIGN_SUBJECT = "Özel Fırsat: Kişisel Antrenör Siteniz İçin İndirim";
const CAMPAIGN_BODY = `Merhaba {{NAME}},

Geçtiğimiz günlerde demo sitemizi incelediğinizi gördüm, ancak sanırım aklınıza takılan bazı şeyler oldu.

Sistemin sizin için ne kadar faydalı olacağını bildiğimden, ilk aya özel %30 indirim veya ekstra SEO paketi hediye etmek isterim. Siteniz uyurken bile size danışan bulmaya devam edecek bir makineye dönüşecek.

Detayları konuşmak isterseniz lütfen çekinmeyin, bu e-postayı yanıtlamanız veya 0540 336 66 99 numarasından WhatsApp'tan ulaşmanız yeterlidir.

Görüşmek üzere!`;

async function getClicks() {
    try {
        const res = await fetch(FIREBASE_URL);
        const data = await res.json();
        if (!data.documents) return [];
        return data.documents.map(doc => {
            return {
                email: doc.fields.email.stringValue,
                timestamp: doc.fields.timestamp.timestampValue
            };
        });
    } catch (err) {
        console.error("Firebase'den veriler alinamadi:", err);
        return [];
    }
}

async function runFollowUp() {
    if (!fs.existsSync(DB_FILE)) {
        console.error("Veritabani bulunamadi!");
        return;
    }

    let trainers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const clicks = await getClicks();

    // Tıklamaları haritalandır
    const clickMap = {};
    clicks.forEach(c => {
        clickMap[c.email] = c.timestamp;
    });

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true, // 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    let emailsSent = 0;
    const now = new Date();

    for (let trainer of trainers) {
        // Mail henüz atılmadıysa VEYA hoca bize zaten cevap verdiyse atla.
        if (!trainer.sent || trainer.replied) continue;

        const firstName = trainer.name.split(' ')[0];
        const sentAt = new Date(trainer.sentAt);
        const hoursSinceSent = (now - sentAt) / (1000 * 60 * 60);
        
        let shouldUpdateDb = false;

        if (clickMap[trainer.email]) {
            // KATEGORİ B: TIKLAMIŞ (Ama cevap vermemiş) -> 48 Saat sonra kampanya!
            const clickTime = new Date(clickMap[trainer.email]);
            const hoursSinceClick = (now - clickTime) / (1000 * 60 * 60);

            if (hoursSinceClick >= 48 && !trainer.campaignSent) {
                console.log(`[KAMPANYA] Gönderiliyor: ${trainer.name} (Tıklayalı ${hoursSinceClick.toFixed(1)} saat oldu)`);
                let text = CAMPAIGN_BODY.replace(/{{NAME}}/g, firstName);
                text = text.replace(/{{EMAIL}}/g, encodeURIComponent(trainer.email));

                let htmlText = text.replace(/\n/g, '<br>');
                htmlText = htmlText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #0066cc; text-decoration: underline;">$1</a>');

                try {
                    await transporter.sendMail({
                        from: `"Eren Can" <${process.env.SMTP_USER}>`,
                        to: trainer.email,
                        subject: CAMPAIGN_SUBJECT.replace(/{{NAME}}/g, firstName),
                        text: text,
                        html: htmlText
                    });
                    trainer.campaignSent = true;
                    trainer.campaignSentAt = new Date().toISOString();
                    shouldUpdateDb = true;
                    emailsSent++;
                } catch (e) {
                    console.error(`Hata (${trainer.email}):`, e.message);
                }
            }
        } else {
            // KATEGORİ A: HİÇ TIKLAMAMIŞ -> 72 Saat sonra hatırlatıcı!
            if (hoursSinceSent >= 72 && !trainer.reminderSent) {
                console.log(`[HATIRLATICI] Gönderiliyor: ${trainer.name} (Gönderileli ${hoursSinceSent.toFixed(1)} saat oldu)`);
                let text = REMINDER_BODY.replace(/{{NAME}}/g, firstName);
                text = text.replace(/{{EMAIL}}/g, encodeURIComponent(trainer.email));

                let htmlText = text.replace(/\n/g, '<br>');
                htmlText = htmlText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #0066cc; text-decoration: underline;">$1</a>');

                try {
                    await transporter.sendMail({
                        from: `"Eren Can" <${process.env.SMTP_USER}>`,
                        to: trainer.email,
                        subject: REMINDER_SUBJECT.replace(/{{NAME}}/g, firstName),
                        text: text,
                        html: htmlText
                    });
                    trainer.reminderSent = true;
                    trainer.reminderSentAt = new Date().toISOString();
                    shouldUpdateDb = true;
                    emailsSent++;
                } catch (e) {
                    console.error(`Hata (${trainer.email}):`, e.message);
                }
            }
        }

        if (shouldUpdateDb) {
            fs.writeFileSync(DB_FILE, JSON.stringify(trainers, null, 2));
            // Spama düşmemek için mailler arası bekle (5 sn)
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    console.log(`\nIslem tamamlandi! Toplam ${emailsSent} follow-up maili gonderildi.`);
}

runFollowUp();
