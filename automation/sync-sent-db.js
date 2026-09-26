require('dotenv').config();
const fs = require('fs');
const path = require('path');
const imaps = require('imap-simple');

const DB_FILE = path.join(__dirname, 'trainers-db.json');

async function run() {
    if (!fs.existsSync(DB_FILE)) {
        console.error("Veritabani bulunamadi!");
        process.exit(1);
    }

    let trainers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

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
        console.log("IMAP baglantisi basarili. Giden Kutusu kontrol ediliyor...");
        await connection.openBox('INBOX.Sent');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (TO)'],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`Giden kutusunda toplam ${messages.length} mesaj bulundu.`);

        let sentEmailsCount = 0;
        
        messages.forEach(item => {
            const header = item.parts.find(p => p.which === 'HEADER.FIELDS (TO)');
            if (header && header.body && header.body.to) {
                const toField = header.body.to[0]; // e.g. "Name <email@example.com>" or "email@example.com"
                
                // Extract email using regex
                const match = toField.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                if (match) {
                    const email = match[1].toLowerCase().trim();
                    // Find trainer in DB
                    const trainer = trainers.find(t => t.email.toLowerCase() === email);
                    if (trainer && !trainer.sent) {
                        trainer.sent = true;
                        trainer.sentAt = new Date().toISOString();
                        console.log(`[DUZELTILDI] Zaten gonderilmis: ${trainer.email}`);
                        sentEmailsCount++;
                    }
                }
            }
        });

        if (sentEmailsCount > 0) {
            fs.writeFileSync(DB_FILE, JSON.stringify(trainers, null, 2));
            console.log(`\nIslem tamam. Toplam ${sentEmailsCount} kisinin 'sent' durumu true yapildi!`);
        } else {
            console.log("\nHicbir eksik kayit bulunamadi, veritabani zaten guncel.");
        }

    } catch (err) {
        console.error("IMAP Hatasi:", err);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

run();
