import { initializeApp, credential, database, firestore } from "firebase-admin";
import * as path from "path";
import { BotFramework } from "lergins-bot-framework";

import { DiscordWebhook } from "./notifications/DiscordWebhook";

import { getAvailableEpisodes } from "./nbc";
import { isArray } from "util";

async function main() {
    const bot: BotFramework = new BotFramework.Builder()
        .observer('discord_webhook', DiscordWebhook)
        .configFolderPath(path.join(__dirname, '..'))
        .build();

    console.log("Started!");

    update(bot);

    setInterval(() => update(bot), 10*60*1000);
}

async function update(bot: BotFramework) {
    const shows = await bot.config.get('shows') || [];

    let addedShow = false;

    for (const show in shows) {
        if (shows.hasOwnProperty(show)) {
            if (!isArray(shows[show])) shows[show] = [];

            const knownEps = shows[show];
            const newEps = await getAvailableEpisodes(show)
                .then(eps => eps.filter(ep => knownEps.indexOf(ep.id) === -1));

            for (let ep of newEps) {
                addedShow = true;
                knownEps.pushe(p.id);

                console.log(`New Episode of ${show}: ${ep.seasonNumber}.${ep.episodeNumber.toString().padStart(2, '0')} ${ep.title} (${ep.id})`)
                bot.send('new-episode', { show: show, episode: ep });
            }
        }
    }

    if(addedShow){
        bot.config.set('shows', shows);
    }
}

main().catch(console.error);
