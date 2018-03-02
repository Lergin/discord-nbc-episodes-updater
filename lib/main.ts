import { initializeApp, credential, database, firestore } from "firebase-admin";
import * as path from "path";
import { isArray } from "util";
import { BotFramework } from "lergins-bot-framework";

import { DiscordWebhook } from "./notifications/DiscordWebhook";

import { getAvailableEpisodes } from "./nbc";

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
            await getAvailableEpisodes(show)
                .then(eps => Promise.all(eps.map(async ep => {
                    return {
                        val: ep,
                        filter: !await bot.config.has(`shows/${show}`, ep.id)
                    }
                })))
                .then(eps => eps
                    .filter(ep => ep.filter)
                    .map(ep => ep.val)
                    .map(ep => {
                        bot.config.push(`shows/${show}`, ep.id);

                        console.log(`New Episode of ${show}: ${ep.seasonNumber}.${ep.episodeNumber.toString().padStart(2, '0')} ${ep.title} (${ep.id})`)
                        bot.send('new-episode', { show: show, episode: ep });
                    })
                );
        }
    }
}

main().catch(console.error);
