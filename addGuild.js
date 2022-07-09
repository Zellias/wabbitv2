const Data = require('./models/Data')
function addGuildToDataBase(guildId) {
    Data.create({
        guildId: guildId,
        prefix: '!',
        punishment: null,
        mod: {
            perm1: null,
            perm2: null,
            perm3: null,
        },
        limit: {
            channel: {
                isEnable: false,
                create: null,
                delete: null,
            },
            webhook: {
                isEnable: false,
                action: null,

            },
            role: {
                isEnable: false,
                create: null,
                update: null,
                delete: null,
            },
            kick: {
                isEnable: false,
                add: null,
            },
            ban: {
                isEnable: false,
                add: null,
            },
        },
        whitelist: {
            all: [],
        },
        ability: {
            anti_bot: false,
            anti_link: false,
            anti_spam: false,
            anti_dang_role_perm: false,
            channel_freeze: false,
            anti_ghost_ping: false,
        },
        log: {
            channel: null,
            role: null,
            emoji: null,
            kick: null,
            ban: null,
            message: null,
            guild_update: null,
            join_leave: null,

        },
        premium: false,
    })
}
module.exports = { addGuildToDataBase }