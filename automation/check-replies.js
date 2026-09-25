require('dotenv').config();
const fs = require('fs');
const path = require('path');
const imaps = require('imap-simple');

const DB_FILE = path.join(__dirname, 'trainers-db.json');

const config = {
    imap: {
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASS,
        host: process.env.IMAP_HOST || 'imap.hostinger.com',
        port: parseInt(process.env.IMAP_PORT || '993'),
        tls: true,
        authTimeout: 30000
    }
};

async function checkReplies() {
    if (!fs.existsSync(DB_FILE)) {
        console.error("Veritabani bulunamadi!");
        return;
    }

    let trainers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    let connection;
    try {
        connection = await imaps.connect(config);
        console.log("IMAP baglantisi basarili. INBOX aciliyor...");
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM)']
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        let updated = false;

        const senderEmails = new Set();
        messages.forEach(item => {
            const fromHeader = item.parts[0].body.from[0];
            const match = fromHeader.match(/<([^>]+)>/);
            const email = match ? match[1].toLowerCase().trim() : fromHeader.toLowerCase().trim();
            senderEmails.add(email);
        });

        console.log(`Gelen kutusunda toplam ${senderEmails.size} farkli gonderici bulundu.`);

        for (let trainer of trainers) {
            if (!trainer.replied && trainer.email && senderEmails.has(trainer.email.toLowerCase().trim())) {
                console.log(`[CEVAP ALINDI] ${trainer.name} (${trainer.email}) mailinize yanit vermis! Otomatik olarak 'replied' isaretleniyor.`);
                trainer.replied = true;
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(DB_FILE, JSON.stringify(trainers, null, 2));
            console.log("trainers-db.json guncellendi.");
        } else {
            console.log("Yeni cevap veren hoca bulunamadi.");
        }

    } catch (err) {
        console.error("IMAP Hatasi:", err);
    } finally {
        if (connection) connection.end();
    }
}

checkReplies();
