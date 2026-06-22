const { cmd } = require('../zaidi');
const { sleep } = require('../lib/functions');

cmd({
  pattern: "ping",
  desc: "⚡ Check bot speed",
  category: "main",
  react: "⚡",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {

  try {
    await conn.sendMessage(from, {
      react: { text: "⚡", key: m.key }
    });

    const msg = await conn.sendMessage(from, {
      text: `ᥫ᭡𝛧𝜜𝛪𝐷𝛪 𝛭𝐷 𝐵𝜣𝑇 𝛲𝛪𝜨𝐺 𝛪𝛴 𝆺𝅥𓆩 ⏤͟͟͞͞🧸🌷`
    }, { quoted: mek });

    await sleep(1500);

    // Sirf 3 baar change hoga
    const pings = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await sleep(50);
      const ping = Date.now() - start;
      pings.push(ping);

      let emoji = "🟢";
      if (ping > 100) emoji = "🟡";
      if (ping > 250) emoji = "🔴";

      const display = `ᥫ᭡𝛧𝜜𝛪𝐷𝛪 𝛭𝐷 𝐵𝜣𝑇 𝛲𝛪𝜨𝐺 𝛪𝛴 𝆺𝅥𓆩 ${ping}ms ${emoji} 𓆪⏤͟͟͞͞🧸🌷`;

      await conn.relayMessage(from, {
        protocolMessage: {
          key: msg.key,
          type: 14,
          editedMessage: {
            conversation: display
          }
        }
      }, {});

      await sleep(1500);
    }

    // Final result
    const avg = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
    const finalEmoji = avg < 100 ? "🚀" : avg < 200 ? "👍" : "🐢";

    const finalDisplay = `ᥫ᭡𝛧𝜜𝛪𝐷𝛪 𝛭𝐷 𝐵𝜣𝑇 𝛲𝛪𝜨𝐺 𝛪𝛴 𝆺𝅥𓆩 ${avg}ms ${finalEmoji} 𓆪⏤͟͟͞͞🧸🌷`;

    await conn.relayMessage(from, {
      protocolMessage: {
        key: msg.key,
        type: 14,
        editedMessage: {
          conversation: finalDisplay
        }
      }
    }, {});

    await conn.sendMessage(from, {
      react: { text: "✨", key: m.key }
    });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(from, {
      react: { text: "❌", key: m.key }
    });
    reply("❌ *Failed!*");
  }
});