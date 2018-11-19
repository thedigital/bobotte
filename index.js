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

    client.user.setActivity('mange des pommes').catch(console.error)
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

        // on initilise les tournois à venir avec le dernier tournoi connu
        let displayTournaments = [
            currentData.last
        ];


        // calcul des dates des prochains tournois (dans les 8 jours à venir)
        for (let i = 0; i < 8; i++) {
            let tmpDate = new Date();
            tmpDate.setTime(tmpDate.getTime() + (86400000 * i));

            // si c'est un jour de tournoi, on garde la date
            if (configData.tournaments.days.includes(tmpDate.getDay())) {
                tmpDate.setHours(configData.tournaments.hour, 0, 0);
                tmpDate.setMilliseconds(0);
                displayTournaments.push(tmpDate.getTime());
            }
        }

        // tri des tournois
        displayTournaments = _(displayTournaments).sortBy(function(tournament) {
            return tournament;
        }).value();
        // console.log('prochain tournois', displayTournaments);


        // si le dernier tournoi est fini
        if (currentData.last + 86400000 < now.getTime()) {
            // console.log('nouveau tournoi');

            // on prévient de la fin du tournoi en cours
            let label = 'FIN DU TOURNOI';
            let loot = configData.loots[currentData.loot];
            let boost = configData.boosts[currentData.boost];
            message.guild.channels.get(channel)
                .send(`**FIN DU TOURNOI** : __${loot}__ avec __${boost}__`)

            // on met a jour le fichier semaphore avec les données du tournoi à venir
            currentData = {
                last: displayTournaments[1],
                loot: (currentData.loot + 1) % configData.loots.length,
                boost: (currentData.boost + 1) % configData.boosts.length,
            };

            // écriture des données du tournoi en cours dans le fichier current
            current.assign(currentData).write();

            // on enleve le premier élément qui n'est plus actif
            displayTournaments.slice(0, 1);
        }


        // on prévient sur le channel des tournois en cours et à venir
        for (let i = 0; i < displayTournaments.length; i++) {
            let label = 'Prochain Tournoi';
            let loot = configData.loots[(currentData.loot + i) % configData.loots.length];
            let boost = configData.boosts[(currentData.boost + i) % configData.boosts.length];

            if (i == 0 && now.getTime() < currentData.last + 86400000) {
                label = 'Tournoi en cours';
            } else if (i == 1 && now.getTime() < currentData.last + 86400000) {
                label = 'Prochain tournoi (' + new Intl.DateTimeFormat().format(new Date(displayTournaments[i])) + ')';
            } else {
                label = 'Tournoi du ' + new Intl.DateTimeFormat().format(new Date(displayTournaments[i]));
            }

            message.guild.channels.get(channel)
                .send(`**${label}** : __${loot}__ avec __${boost}__`)
        }




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
