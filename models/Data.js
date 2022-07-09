var mongoose = require("mongoose");


var DataSchema = new mongoose.Schema({
    guildId: { type: String},
    prefix: String,
    email: String,
    punishment: String,
    extra_owner:Array,
    mod: {
        perm1: Array,
        perm2: Array,
        perm3: Array,
    },
    limit: {
        channel: {
            isEnable: { type: Boolean, default: false },
            create: String,
            delete: String,
        },
        webhook: {
            isEnable: { type: Boolean, default: false },
            action: String,
            
        },
        role: {
            isEnable: { type: Boolean, default: false },
            create: String,
            update: String,
            delete: String,
        },
        kick: {
            isEnable: { type: Boolean, default: false },
            add: String,
        },
        ban: {
            isEnable: { type: Boolean, default: false },
            add: String,
        },


    },
    ability: {
        anti_bot: { type: Boolean, default: false },
        anti_link: { type: Boolean, default: false },
        anti_spam: { type: Boolean, default: false },
        channel_freeze: { type: Boolean, default: false },
        anti_dang_role_perm: { type: Boolean, default: false },
        anti_ghost_ping: { type: Boolean, default: false },
    },
    whitelist: {
        all: Array,

    },
    log: {
        channel: String,
        role: String,
        emoji: String,
        kick: String,
        ban: String,
        message: String,
        guild_update: String,
        join_leave: String,

    },
    premium: { type: Boolean, default: false },
});



module.exports = mongoose.model("Data", DataSchema);