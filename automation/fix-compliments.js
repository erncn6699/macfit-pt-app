const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'trainers-db.json');
let trainers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

let fixedCount = 0;

for (let i = 0; i < trainers.length; i++) {
    if (trainers[i].compliment) {
        let comp = trainers[i].compliment;
        
        // Remove trailing spaces
        comp = comp.trim();

        // Fix "profesyonelin..." -> "profesyoneli görmek ilham verici."
        if (comp.endsWith('profesyonelin...')) {
            comp = comp.replace(/profesyonelin\.\.\.$/, 'profesyoneli görmek bana ilham verdi.');
            fixedCount++;
        } else if (comp.endsWith('...')) {
            // Any other ending with "..."
            comp = comp.replace(/\.\.\.$/, ' görmek bana ilham verdi.');
            fixedCount++;
        } else if (!comp.endsWith('.')) {
            // If it doesn't end with a dot, add a dot
            comp += '.';
            fixedCount++;
        }

        trainers[i].compliment = comp;
    }
}

fs.writeFileSync(DB_FILE, JSON.stringify(trainers, null, 2));
console.log(`Fixed ${fixedCount} compliments in trainers-db.json`);
