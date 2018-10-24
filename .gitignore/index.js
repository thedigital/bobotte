const Discord = require('discord.js');
const client = new Discord.Client({autoReconnect: true, max_message_cache: 0});
const spamCounter = new Set();

client.on('message', function (message) {
  let msgauthor = message.author
    if (spamCounter.has(msgauthor)) try {
        message.delete()
        message.author.send("Tu dois attendre **1 seconde** avant de pouvoir envoyer un autre message.")
    }catch (error){} else {
    spamCounter.add(msgauthor), setTimeout(() => { spamCounter.delete(msgauthor) }, 2000)
    }
    if (!message.author.bot) if (message.content.includes("https://discord.gg/") || message.content.includes("https://discordapp.com/invite/")) try {message.author.send("Vous n'avez pas l'autorisation de poster des liens vers d'autres discord."), message.delete()} catch (error) {console.log(error)}
})

client.on('ready', () => console.log('OK'));
client.login(process.env.TOKEN)
