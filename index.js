const Discord = require('discord.js');
const low = require('lowdb');
var _ = require('lodash/core');
const FileSync = require ('lowdb/adapters/FileSync');



const client = new Discord.Client({
    'guilds': [
        429768501159526402,
    ],
    autoReconnect: true,
    max_message_cache: 0
});
const spamCounter = new Set();

const currentAdapter = new FileSync('current.json');
const configAdapter = new FileSync('config.json');

const current = low(currentAdapter)
const config = low(configAdapter)


const channel = '513846075388461078';
const invitelink = 'https://discord.gg/GezqzgX';


const configData = config.value();
let currentData = current.value();


// client.on('ready', () => console.log('OK'));

client.on('ready', function () {
    console.log('Connecté !');
    console.log("Servers:")

    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name);

        // List all channels
        guild.channels.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        });
    });

    client.user.setActivity('Tap Titan 3 (bêta)').catch(console.error)
});

client.on('message', function (message) {
    if (message.author == client.user) { // Prevent bot from responding to its own messages
        return;
    }

    let primaryCommand = '';
    let arguments = [];

    if (message.content.startsWith("!")) {
        let fullCommand = message.content.substr(1) // Remove the leading exclamation mark
        let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
        primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
        arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
    } else {
        return;
    }

    if (primaryCommand === 'invitelink') {
        message.channel.send(invitelink)
    }

    if (primaryCommand === 't') {
        let now = new Date();

        let tournaments = [
            {
                day: 0,
                hour: 1,
            }, {
                day: 3,
                hour: 1,
            },
        ];

        let displayTournaments = [
            currentData.last
        ];


        // calcul des dates des prochains configData
        // ameliorer la generation du calendrier
        for (let i = 0; i < tournaments.length; i++) {
            let tmpDate = new Date();
            tmpDate.setDate(tmpDate.getDate() + (tournaments[i].day + 7 - tmpDate.getDay()) % 7);
            tmpDate.setHours(tournaments[i].hour, 0, 0, 0);
            tmpDate.setMilliseconds(0);

            console.log(tmpDate);

            displayTournaments.push(tmpDate.getTime());
        }

        // tri des configData à venir
        displayTournaments = _(displayTournaments).sortBy(function(tournament) {
            return tournament;
        }).value();
        console.log('prochain tournois', displayTournaments);


        // detection du tournoi en cours

        // let currentTournament = _(displayTournaments).filter(function(tournament) {
        //     if (now.getTime() >= tournament.getTime() && now.getTime() < tournament.getTime() + 86400000) {
        //         console.log(now, tournament, tournament + 86400000);
        //     }
        //     return now.getTime() >= tournament.getTime() && now.getTime() < tournament.getTime() + 86400000;
        // }).value();

        // si le dernier tournoi est fini
        if (currentData.last + 86400000 < now.getTime()) {
            console.log('nouveau tournoi');

            // on met a jour les données du tournoi à venir
            currentData = {
                last: displayTournaments[0],
                loot: (currentData.loot + 1) % configData.loots.length,
                boost: (currentData.boost + 1) % configData.boosts.length,
            };

            // écriture des données du tournoi en cours dans le fichier current
            current.assign(currentData).write();
        }

        // on prévient sur le channel
        message.guild.channels.get(channel)
            .send(`**Prochain Tournoi** __${configData.loots[currentData.loot]}__ avec __${configData.boosts[currentData.boost]}__`)






        let msgauthor = message.author;
        if (spamCounter.has(msgauthor)) {
            try {
                message.delete()
                message.author.send("Tu dois attendre **1 seconde** avant de pouvoir envoyer un autre message.")
            } catch (error){

            }
        } else {
            spamCounter.add(msgauthor), setTimeout(() => { spamCounter.delete(msgauthor) }, 2000)
        }



        if (!message.author.bot) {
            if (message.content.includes("https://discord.gg/")
            || message.content.includes("https://discordapp.com/invite/")) {
                try {
                    message.author.send("Vous n'avez pas l'autorisation de poster des liens vers d'autres discord."), message.delete()
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
})

client.login(process.env.TOKEN)
    .then(console.log)
    .catch(console.error);
