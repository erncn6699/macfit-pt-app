require('dotenv').config();
const nodemailer = require('nodemailer');

async function run() {
    console.log("Test maili hazirlaniyor...");
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("HATA: .env dosyasinda SMTP_USER veya SMTP_PASS eksik!");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const body = `Merhaba Eren Hocam,\n\nBu, yeni profesyonel mail adresinizden (info@erencanintelligenz.com) atılan bir test e-postasıdır.\n\nEğer bu maili alıyorsanız, Github'a girdiğiniz SMTP ayarları tamamen doğru demektir ve yarın sabahki otomasyon kusursuz çalışacaktır!\n\nÖrnek demo site linki de güncellendi: https://ornekptsitem.erencanintelligenz.com/\n\nKolay gelsin,\nYapay Zeka Asistanınız`;

    try {
        await transporter.verify();
        console.log("SMTP Sunucusuna basariyla baglanildi.");
        
        await transporter.sendMail({
            from: `"Eren Can" <${process.env.SMTP_USER}>`,
            to: "erencanguzelsu@gmail.com",
            subject: "Test: Yeni Kurumsal E-posta Sisteminiz Hazır!",
            text: body
        });
        console.log("Test maili basariyla gonderildi! Lutfen erencanguzelsu@gmail.com adresini kontrol edin.");
    } catch (err) {
        console.error("HATA:", err.message);
    }
}

run();
