import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import config from '../../../../src/trainer-config.json';

// Initialize the Google Generative AI client
// We assume GEMINI_API_KEY is available in the environment
const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { reply: "Sistem yapılandırma hatası: API anahtarı eksik." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the prompt using the trainer config
    const prompt = `
Sen profesyonel bir kişisel antrenör asistanısın. Adın: ${config.trainer.name}.
Unvanın: ${config.trainer.role}.
Çalıştığın şube: ${config.trainer.branch}.
Uzmanlıkların: ${config.trainer.tagline}.

Aşağıdaki bilgileri kullanarak kullanıcıların sorularına doğal, samimi ve kısa cevaplar ver. Asla robot gibi konuşma. Hedefin, kullanıcıyı ikna edip formu doldurmaya veya antrenörle iletişime geçmeye yönlendirmek.

BİLGİLER:
- Deneyim: ${config.trainer.years_experience} yılından beri.
- Danışan Sayısı: ${config.stats?.clients || '100+'}
- Hizmetler:
  1. Birebir Özel Ders: ${config.services.individual.description}
  2. Online Koçluk: ${config.services.online.description}
  3. Grup Dersleri: ${config.services.group.description}
- Fiyat Sorulursa: Kesin fiyat verme. "Fiyatlar kişinin hedefine, seçtiği programa (bireysel, online ya da grup) ve seans sayısına göre değişiyor. En doğrusu ücretsiz ön görüşmede hedefini anlattıktan sonra sana özel bir teklif hazırlamam." de.
- İletişim: Kullanıcıları her zaman sayfadaki formu doldurmaya teşvik et.

Kullanıcının mesajı: "${message}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const replyText = response.text || "Anlamadım, lütfen tekrar dener misin?";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { reply: "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen iletişim formunu kullanın." },
      { status: 500 }
    );
  }
}
