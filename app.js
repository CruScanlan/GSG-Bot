//Core Modules
const Discord = require('discord.js');
const logging = require('./logging.js');
const bot = new Discord.Client();

//Configs
const config = require("./config.json");

//Other
let emojiRoles = config.emojiRoles;
let guild = null;
let botChannel = null;
let welcomeMessage = null;

bot.on('ready', () => {
    logging.info("Bot has started running!");
    if(getGuild()) logging.debug(`Got guild ID: ${guild}`);
    if(getBotChannel()) logging.debug(`Got bot channel`);
    getWelcomeMessage();
});

bot.on('message', async msg => {
    if(msg.author.bot) return;

    if(!msg.content.startsWith(config.prefix)) return;
    let command = msg.content.split(" ")[0];
    command = command.slice(config.prefix.length).toLowerCase();
    let args = msg.content.split(" ").slice(1);
    let argsJoined = args.join(" ");

    if(command === "moodle") return msg.reply("http://gympieshs-moodlesite.pukunui.net/\nYour username is your school username.\nYour password will be `gympie` unless you have changed it.")
});

bot.on('messageReactionAdd', async (reaction, user) => {
    let userID = user.id;
    let guildMember = guild.members.find("id", userID);
    if(guildMember.bot) return;
    if(welcomeMessage.id !== reaction.message.id) return;
    if(emojiRoles[reaction.emoji.name] === undefined) return reaction.remove(user);
    if(guildMember.roles.exists("name", emojiRoles[reaction.emoji.name])) return;
    return assignRole(guild.roles.find("name", emojiRoles[reaction.emoji.name]), guildMember);
});

bot.on('messageReactionRemove', async (reaction, user) => {
    let userID = user.id;
    let guildMember = guild.members.find("id", userID);
    if(guildMember.bot) return;
    if(welcomeMessage.id !== reaction.message.id) return;
    if(emojiRoles[reaction.emoji.name] === undefined) return;
    if(!guildMember.roles.exists("name", emojiRoles[reaction.emoji.name])) return;
    return dismissRole(guild.roles.find("name", emojiRoles[reaction.emoji.name]), guildMember);
});

let getGuild = () => {
    try {
        return guild = bot.guilds.find("id", "409891039982387200")
    } catch(e) {
        logging.error("Error when getting guild", {e});
        return guild = null;
    }
};

let getBotChannel = () => {
    if(!guild) getGuild();
    try {
        return botChannel = guild.channels.find("id", config.channels.bot);
    } catch(e) {
        logging.error("Error when getting bot channel", {e});
        return botChannel = null;
    }
};

let getWelcomeMessage = () => {
    try {
        let channel = guild.channels.find("id", config.channels.welcome);
        channel.fetchMessage("409909111384309771").then((msg)=>{
            welcomeMessage = msg;
            logging.debug("Got welcome message");
        })
    } catch(e) {
        logging.error("error when getting welcome message", {e});
        welcomeMessage = null;
    }

};

let assignRole = (role, member) => {
    if(!guild) {
        if(!getGuild()) return botChannel.send("There was an error when retrieving the guild ID");
    }
    member.addRole(role, "Self Assign Role Command").then(()=>{
        return botChannel.send(`${member.user} now has the role: ${role.name}`);
    }).catch((e)=>{
        logging.error("Error when adding role to member", {e});
        return botChannel.send(`There was an error when adding the ${role.name} role to ${member.user}`);
    })
};

let dismissRole = (role, member) => {
    if(!guild) {
        if(!getGuild()) return botChannel.send("There was an error when retrieving the guild ID");
    }
    member.removeRole(role, "Self Assign Role Command").then(()=>{
        return botChannel.send(`${member.user} no longer has the role: ${role.name}`);
    }).catch((e)=>{
        logging.error("Error when adding role to member", {e});
        return botChannel.send(`There was an error when removing the ${role.name} role from ${member.user}`);
    })
};

bot.login(config.token);