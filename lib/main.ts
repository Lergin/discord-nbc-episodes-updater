import { initializeApp, credential, database, firestore } from "firebase-admin";
import * as path from "path";
import { BotFramework, BasicUpdater } from "lergins-bot-framework";

import { DiscordWebhook } from "./notifications/DiscordWebhook";
import { NbcEpisodesUpdater } from "./updater/NbcEpisodesUpdater";

export const bot = new BotFramework.Builder()
    .observer('discord-webhook', DiscordWebhook)
    .configFolderPath(path.join(__dirname, '..'))
    .updater(new NbcEpisodesUpdater())
    .build();

bot.start()
    
console.log("Started!");
