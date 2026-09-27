require('dotenv').config();
const fs = require('fs');
const path = require('path');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const nodemailer = require('nodemailer');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const NEGATIVE_REPLY_TEMPLATE = `Hocam guzel sozleriniz ve vaktinizi ayirip donus yaptiginiz icin cok tesekkur ederim.

Aslinda bahsettiginiz 'online tarafta aktif olmamak' durumu tam da bu sistemi tasarlama amacimiz. Sizin asil isiniz sahada ve online islere ayiracak vaktinizin olmamasi cok dogal. Bu yapinin amaci da, siz online tarafa hic vakit ayirmadan butun dijital is yukunun arka planda kendi kendine yurumesidir.

Ornegin, sistemde standart olarak sundugumuz Bolgesel Gorunurluk (Ozel SEO Calismasi) sayesinde; siz hicbir efor sarf etmeseniz bile, yasadiginiz bolgede Google'da 'spor' veya 'antrenor' arayan kisilerin karsisina ilk sirada cikiyorsunuz. Ardindan yapay zeka asistaniniz o kisilerle sizin adiniza iletisime gecip, fiyati sorup kacacaklari degil, sadece vizyonu size uygun hazir danisanlari saptayip size yonlendiriyor. 

Yine de vaktinizi daha fazla almayayim hocam. Eger ileride fikriniz degisir veya bu yapiyi sadece pasif bir gelir kapisi olarak denemek isterseniz numaram sizde var, istediginiz zaman yazabilirsiniz.

Basarilarinizin devamini dilerim, kolay gelsin.`;

async function analyzeEmail(subject, text) {
    const prompt = `
Sen bir satis asistanisin. Bir kisisel antrenore (Personal Trainer) web sitesi ve yapay zeka asistani hizmeti satmak icin mail attik.
Musteriden gelen yaniti analiz et.

Gelen Mail Basligi: "${subject}"
Gelen Mail Icerigi: "${text}"

Gorevin:
Eger musteri kibarca reddediyorsa, "su an ihtiyacim yok", "online aktif degilim", "dusummuyorum", "tesekkurler" vs diyorsa sadece "NEGATIVE" yaz.
Eger musteri detay istiyorsa, soru soruyorsa, ilgili gorunuyorsa, numara birakmissa veya gorusmek istiyorsa sadece "POSITIVE" yaz.
Emin olamiyorsan veya mail karisiksa "POSITIVE" yaz ki manuel kontrol edelim.

SADECE TEK BIR KELIME YAZ: NEGATIVE veya POSITIVE. Baska hicbir sey yazma.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const result = response.text.trim().toUpperCase();
        return result.includes('NEGATIVE') ? 'NEGATIVE' : 'POSITIVE';
    } catch (e) {
        console.error("Gemini API Error:", e);
        return 'POSITIVE'; // Fallback to manual review
    }
}

async function run() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

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

    let connection;
    try {
        connection = await imaps.connect(imapConfig);
        console.log("IMAP'e baglanildi. Okunmamis mailler kontrol ediliyor...");
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN', 'UNFLAGGED'];
        const fetchOptions = { bodies: [''], markSeen: false };
        
        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`${messages.length} adet okunmamis mesaj bulundu.`);

        for (let item of messages) {
            const all = item.parts.find(p => p.which === '');
            const id = item.attributes.uid;
            const idHeader = "Imap-Id: "+id+"\r\n";
            const parsed = await simpleParser(idHeader + all.body);

            const sender = parsed.from.value[0].address;
            const subject = parsed.subject || "";
            const text = parsed.text || "";

            // Kendi gonderdigimiz mailleri goz ardi et
            if (sender.includes(process.env.SMTP_USER)) {
                continue;
            }

            console.log(`\nYeni mail inceleniyor: Kimden: ${sender}, Konu: ${subject}`);
            
            const decision = await analyzeEmail(subject, text);
            console.log(`Yapay Zeka Karari: ${decision}`);

            if (decision === 'NEGATIVE') {
                // Otomatik olumsuz yanit sablonunu gonder
                await transporter.sendMail({
                    from: `"Eren Can" <${process.env.SMTP_USER}>`,
                    to: sender,
                    subject: `Re: ${subject}`,
                    text: NEGATIVE_REPLY_TEMPLATE
                });
                console.log(`[NEGATIVE] Hocaya otomatik ikna/acik kapi maili gonderildi.`);
                
                // Mesaji okundu olarak isaretle
                await connection.addFlags(id, '\\Seen');
                
            } else {
                // Olumlu - Kullaniciya alarm maili at
                await transporter.sendMail({
                    from: `"AI Asistan" <${process.env.SMTP_USER}>`,
                    to: process.env.SMTP_USER,
                    subject: `[DIKKAT: OLUMLU DONUS!] ${sender} firmasindan!`,
                    text: `HOCAM DIKKAT!\n\nBir musteri (PT) olumlu bir donus yapti veya detay istiyor!\nLutfen hemen mail kutunuzu acip kontrol edin.\n\nKimden: ${sender}\n\nMesaj:\n${text}`
                });
                console.log(`[POSITIVE] Patron icin alarm maili atildi!`);
                // Mesaji okundu isaretlemiyoruz, kullanici telefonda okundugunu gormesin, koyu kalsin!
                // Ama tekrar isleme girmemesi icin Flagged yapiyoruz.
                await connection.addFlags(id, '\\Flagged');
                
                // Eger okunmamis kalmasini istiyorsak zaten UNSEEN kalacak. Sadece Flagged ekliyoruz ki bi daha islenmesin.
                // Wait, search criteria 'UNSEEN' will pick it up again if it's UNSEEN.
                // To avoid reprocessing, we must mark as \Seen, or search for UNSEEN UNFLAGGED.
            }
        }

    } catch (err) {
        console.error("Hata:", err);
    } finally {
        if (connection) connection.end();
    }
}

run();
