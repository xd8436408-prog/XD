const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Render'ın kapanmaması için ana sayfa
app.get("/", (req, res) => {
  res.send("Bot aktif ve güvenli modda çalışıyor.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Değişkenleri alıyoruz
const token = process.env.TOKEN;
const channelIdsRaw = process.env.CHANNEL_IDS;
const message = process.env.MESSAGE;

if (!token || !channelIdsRaw || !message) {
  console.error("HATA: TOKEN, CHANNEL_IDS veya MESSAGE eksik!");
} else {
  const channelIds = channelIdsRaw.split(',').map(id => id.trim());
  let currentIndex = 0;

  async function startLoop() {
    const currentChannel = channelIds[currentIndex];
    
    try {
      await axios.post(`https://discord.com/api/v9/channels/${currentChannel}/messages`, {
        content: message
      }, {
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });
      console.log(`✅ Mesaj gönderildi: Kanal [${currentChannel}]`);
      
      // Bir sonraki kanala geç
      currentIndex = (currentIndex + 1) % channelIds.length;

      // GÜVENLİ BEKLEME: 40 ile 70 saniye arası rastgele bekler
      // Discord'un ban atmaması için bu süreler kritiktir.
      const delay = Math.floor(Math.random() * (70000 - 40000 + 1) + 40000);
      console.log(`⏳ ${delay / 1000} saniye sonra sıradaki mesaj gönderilecek...`);
      setTimeout(startLoop, delay);

    } catch (err) {
      if (err.response?.status === 429) {
        // Hız limitine takılırsak Discord'un söylediği süre kadar bekle
        const retryAfter = (err.response.data.retry_after || 60) * 1000;
        console.error(`⚠️ Hız limiti! ${retryAfter / 1000} saniye bekleniyor...`);
        setTimeout(startLoop, retryAfter);
      } else {
        console.error(`❌ Hata: ${err.response?.status || "Bilinmiyor"}`);
        // Diğer hatalarda 1 dakika bekle ve devam et
        setTimeout(startLoop, 60000);
      }
    }
  }

  // Döngüyü ilk kez başlat
  startLoop();
}
