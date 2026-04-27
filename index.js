const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot döngüsel modda aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

// --- AYARLAR ---
const token = process.env.TOKEN;
const message = process.env.MESSAGE;

// Verdiğin kanal ID'lerini listeye ekledik
const channels = [
  "1467580268075421789",
  "1465058037088784447",
  "1465052769743405128"
];

let currentIndex = 0; // Hangi kanalda olduğumuzu takip eder

if (!token || !message) {
    console.error("HATA: TOKEN veya MESSAGE değişkeni eksik!");
} else {
    // 5 saniyede bir (5000ms) çalışır
    setInterval(sendMessage, 5000);
}

function sendMessage() {
  const currentChannelId = channels[currentIndex];

  axios.post(`https://discord.com/api/v9/channels/${currentChannelId}/messages`, {
    content: message
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ [Kanal ${currentIndex + 1}] Mesaj gönderildi: ${currentChannelId}`);
    
    // SIRALAMA MANTIĞI:
    // 0 -> 1 -> 2 -> (başa dön) 0
    currentIndex = (currentIndex + 1) % channels.length;

  }).catch((err) => {
    console.error(`❌ HATA (${currentChannelId}):`, err.response?.status);
    
    // Hata alınsa bile bir sonraki kanala geçmek için:
    currentIndex = (currentIndex + 1) % channels.length;
  });
}
