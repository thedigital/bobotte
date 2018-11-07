const Discord = require('discord.js');
const client = new Discord.Client({autoReconnect: true, max_message_cache: 0});
const spamCounter = new Set();
const low = require('lowdb')
const FileSync = require ('lowdb/adapters/FileSync')

const adapter = new FileSync('rotation.json')
const dbrot = low(adapter)
const adapter2 = new FileSync('tournois.json')
const dbtournois = low(adapter2)

client.on('ready', function () {
    client.user.setActivity('Tap Titan 3 (bêta)').catch(console.error)
})

client.on('message', function (message) {
var date = new Date()
var nmbjour = date.getDay()
if (nmbjour == 0){
    var jour = 'dimanche'
} else if (nmbjour == 1){
    var jour = 'lundi'
} else if (nmbjour == 2){
    var jour = 'mardi'
} else if (nmbjour == 3){
    var jour = 'mercredi'
} else if (nmbjour == 4){
    var jour = 'jeudi'
} else if (nmbjour == 5){
    var jour = 'vendredi'
} else if (nmbjour == 6){
    var jour = 'samedi'
}

var numberunique = Number(dbrot.get("unique").map('value').value())

if (nmbjour == 2 && numberunique == 1){
    var numberloot = Number(dbrot.get("rotation").map('loot').value())
dbrot.get("rotation").find({ loot: numberloot}).assign({ loot: numberloot += 1 }).write()
if(numberloot === 4){
    dbrot.get("rotation").find({ loot: numberloot}).assign({ loot: numberloot -=3 }).write()
}

var numberboost = Number(dbrot.get("rotation").map('boost').value())
dbrot.get("rotation").find({ boost: numberboost}).assign({ boost: numberboost += 1 }).write()
if(numberboost === 11){
    dbrot.get("rotation").find({ boost: numberboost}).assign({ boost: numberboost -=10 }).write()
}

var loot = dbtournois.get("loot").map(numberloot).value()
var boost = dbtournois.get("boost").map(numberboost).value()

    message.guild.channels.get('509422880665108490').send(`**Prochain Tournoi** __${loot}__ avec __${boost}__`)
    dbrot.get("unique").find({ value: numberunique}).assign({ value: numberunique -=1 }).write()
} else if (nmbjour == 6 && numberunique == 1){
    var numberloot = Number(dbrot.get("rotation").map('loot').value())
dbrot.get("rotation").find({ loot: numberloot}).assign({ loot: numberloot += 1 }).write()
if(numberloot === 4){
    dbrot.get("rotation").find({ loot: numberloot}).assign({ loot: numberloot -=3 }).write()
}

var numberboost = Number(dbrot.get("rotation").map('boost').value())
dbrot.get("rotation").find({ boost: numberboost}).assign({ boost: numberboost += 1 }).write()
if(numberboost === 11){
    dbrot.get("rotation").find({ boost: numberboost}).assign({ boost: numberboost -=10 }).write()
}

var loot = dbtournois.get("loot").map(numberloot).value()
var boost = dbtournois.get("boost").map(numberboost).value()
    message.guild.channels.get('509422880665108490').send(`**Prochain Tournoi** __${loot}__ avec __${boost}__`)
    dbrot.get("unique").find({ value: numberunique}).assign({ value: numberunique -=1 }).write()
} else {
    console.log('aucun tournoi')
}

if(nmbjour !=2 && nmbjour !=6 && numberunique == 0){
    dbrot.get("unique").find({ value: numberunique}).assign({ value: numberunique +=1 }).write()
}
if (message.content === 'invitelink'){
  message.channel.send('https://discord.gg/Mv5zU4g')
}
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
