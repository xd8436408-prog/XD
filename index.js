const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot aktif ve kanallara sırayla mesaj gönderiyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

// Environment Değişkenleri
const token = process.env.TOKEN;
const channelIdsRaw = process.env.CHANNEL_IDS; // Virgülle ayrılmış ID'ler: "111,222,333"
const message = process.env.MESSAGE;

// Değişken Kontrolü
if (!token || !channelIdsRaw || !message) {
    console.error("HATA: TOKEN, CHANNEL_IDS veya MESSAGE eksik!");
} else {
    // Virgülle ayrılan string'i temiz bir diziye çeviriyoruz
    const channelIds = channelIdsRaw.split(',').map(id => id.trim());
    let currentIndex = 0;

    // Döngüyü başlat
    setInterval(() => {
        const currentChannel = channelIds[currentIndex];
        sendMessage(currentChannel);

        // Bir sonraki kanalın indeksine geç, liste biterse başa dön
        currentIndex = (currentIndex + 1) % channelIds.length;
    }, 5000);
}

function sendMessage(channelId) {
  axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    content: message
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ Kanal [${channelId}] için mesaj gönderildi.`);
  }).catch((err) => {
    console.error(`❌ Kanal [${channelId}] hatası:`, err.response?.status, err.response?.data);
  });
}
