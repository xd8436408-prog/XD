const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => { res.send("Bot Koruma Modunda Aktif."); });
app.listen(PORT, () => { console.log(`Sunucu ${PORT} aktif.`); });

const token = process.env.TOKEN;
const channelIdsRaw = process.env.CHANNEL_IDS;
const message = process.env.MESSAGE;

if (!token || !channelIdsRaw || !message) {
    console.error("Eksik değişkenler var!");
} else {
    const channelIds = channelIdsRaw.split(',').map(id => id.trim());
    let currentIndex = 0;

    async function sendNext() {
        const channelId = channelIds[currentIndex];
        
        try {
            await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, 
            { content: message }, 
            { headers: { "Authorization": token, "Content-Type": "application/json" } });

            console.log(`✅ Başarılı: [${channelId}]`);
            currentIndex = (currentIndex + 1) % channelIds.length;
            
            // Başarılı olursa 60-120 saniye arası rastgele bekle
            const waitTime = Math.floor(Math.random() * (120000 - 60000) + 60000);
            console.log(`⏳ Güvenlik için ${waitTime/1000} saniye bekleniyor...`);
            setTimeout(sendNext, waitTime);

        } catch (err) {
            if (err.response?.status === 429) {
                // Hız limitine takıldık! Discord'un 'retry_after' süresini bekle
                const retryAfter = (err.response.data.retry_after || 60) * 1000;
                console.error(`⚠️ Hız limiti! Discord ${retryAfter/1000} sn beklemeni istiyor.`);
                setTimeout(sendNext, retryAfter + 5000); // 5sn de biz ekleyelim garanti olsun
            } else {
                console.error("❌ Hata oluştu, 2 dakika sonra tekrar denenecek.");
                setTimeout(sendNext, 120000);
            }
        }
    }

    sendNext();
}
