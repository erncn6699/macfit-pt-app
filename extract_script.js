const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../src/template.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

if (scriptMatch) {
  let scriptContent = scriptMatch[1];
  
  // Create a React Client Component that runs this inside useEffect
  const componentContent = `
"use client";
import { useEffect } from 'react';

export default function ClientScript() {
  useEffect(() => {
    // Add missing ChatWidget dependencies or mock them if they throw
    try {
      ${scriptContent.replace(/<\/script>/g, '')}
    } catch (e) {
      console.error(e);
    }
  }, []);

  return null;
}
`;
  
  fs.writeFileSync(path.join(__dirname, 'src/app/ClientScript.js'), componentContent);
  console.log("ClientScript generated.");
}
