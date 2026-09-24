require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(__dirname, 'trainers-db.json');

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractDataFromImage(imagePath) {
    try {
        const imagePart = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
                mimeType: "image/jpeg"
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                "Extract the trainer's name, email address, and write a highly personalized Turkish compliment (compliment) based on their bio/achievements (years of experience, specific certifications, championships, etc) visible in the image. Example: 'Profilinizi incelediğimde 5 yıllık deneyiminiz ve ACE sertifikanız olduğunu gördüm. Sizin gibi donanımlı bir profesyonelin...'. If no specific details are visible, use a generic compliment: 'Profilinizi incelediğimde alanınızdaki profesyonel duruşunuz dikkatimi çekti. Sizin gibi vizyoner bir antrenörün...'. Return ONLY a valid JSON object: {\"name\": \"Trainer Name\", \"email\": \"trainer@email.com\", \"compliment\": \"Generated compliment\"}. If you cannot find the email, use null for email.",
                imagePart
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const resultText = response.text;
        const data = JSON.parse(resultText);
        return data;
    } catch (err) {
        console.error(`Error processing ${path.basename(imagePath)}:`, err.message);
        return null;
    }
}

async function run() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Lutfen .env dosyasinda GEMINI_API_KEY tanimlayin.");
        process.exit(1);
    }

    let trainers = [];
    if (fs.existsSync(DB_FILE)) {
        trainers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.match(/\.(jpe?g|png|heic)$/i));
    console.log(`Toplam ${files.length} gorsel bulundu. Okuma basliyor...`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const existing = trainers.find(t => t.sourceImage === file);
        if (existing) {
            console.log(`[${i+1}/${files.length}] ${file} zaten islenmis, atliyorum.`);
            continue;
        }

        console.log(`[${i+1}/${files.length}] Isleniyor: ${file}`);
        const data = await extractDataFromImage(path.join(DATA_DIR, file));
        
        if (data && data.name && data.email) {
            trainers.push({
                name: data.name,
                email: data.email,
                compliment: data.compliment || null,
                sourceImage: file,
                sent: false,
                sentAt: null
            });
            console.log(`  --> Bulundu: ${data.name} (${data.email})`);
            // Save progress continuously
            fs.writeFileSync(DB_FILE, JSON.stringify(trainers, null, 2));
        } else {
            console.log(`  --> Gerekli veri bulunamadi veya email yok.`);
        }
        
        // Anti-rate limit delay for Free Tier (15 requests per minute -> 4 seconds, using 5s to be safe)
        await new Promise(r => setTimeout(r, 5000));
    }
    
    console.log("\nIslem tamamlandi! Sonuclar trainers-db.json dosyasina kaydedildi.");
}

run();
