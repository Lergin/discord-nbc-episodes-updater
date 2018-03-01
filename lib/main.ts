import { initializeApp, credential, database, firestore } from "firebase-admin";
import * as path from "path";
import { BotFramework } from "lergins-bot-framework";

import { DiscordWebhook } from "./notifications/DiscordWebhook";
import { TwitterBot } from "./notifications/TwitterBot";

import { getAvailableEpisodes } from "./nbc";

async function main() {
    const bot: BotFramework = new BotFramework.Builder()
        .discordWebhook(DiscordWebhook)
        .twitterBot(TwitterBot)
        .configFolderPath(path.join(__dirname, '..'))
        .build();

    console.log("Started!");

    update(bot);

    setInterval(() => update(bot), 10*60*1000);
}

async function update(bot: BotFramework) {
    const shows = await bot.config.get('shows');

    let addedShow = false;

    for(let [show, knoweps] of Object.entries(shows)) {
        const eps = await getAvailableEpisodes(show)
        .then(eps => eps.filter(ep => knoweps.indexOf(ep.id) === -1));
        
        for(let ep of eps) {
            addedShow = true;
            knoweps.push(ep.id);
            
            console.log(`New Episode of ${show}: ${ep.seasonNumber}.${ep.episodeNumber.toString().padStart(2, '0')} ${ep.title} (${ep.id})`)
            bot.send('new-episode', {show:show, episode:ep});
        }
    }

    if(addedShow){
        bot.config.set('shows', shows);
    }
}

main().catch(console.error);
