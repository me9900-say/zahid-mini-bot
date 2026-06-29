const { getDB } = require('../lib/database');

const COLLECTION = 'autoreacts';

async function getAutoreactSettings(userId) {
    try {
        const db = await getDB();
        const settings = await db.collection(COLLECTION).findOne({ userId });
        if (!settings) {
            return { userId, enabled: false, groupReact: true, inboxReact: true, cmdOnly: false, emojis: ["❤️", "🔥", "✨"] };
        }
        return settings;
    } catch (e) {
        return { userId, enabled: false, emojis: ["❤️"] };
    }
}

async function setAutoreactSettings(userId, settings) {
    try {
        const db = await getDB();
        await db.collection(COLLECTION).updateOne({ userId }, { $set: { ...settings, userId } }, { upsert: true });
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = { getAutoreactSettings, setAutoreactSettings };
