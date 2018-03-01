import { initializeApp, credential, database, firestore } from "firebase-admin";
import * as path from "path";

import { DiscordWebhook } from "./notifications/DiscordWebhook";
import { NotificationSender } from "./notifications/NotificationSender";
import { NotificationTwitterBot } from "./notifications/TwitterBot";
import { Config, ConfigEventType } from "./config/Config";
import { JsonConfig } from "./config/JsonConfig";
import { FirebaseConfig } from "./config/FirebaseConfig";

import { getAvailableEpisodes } from "./nbc";

let configFile: any = { use_firebase: true, firebase_service_account: 'firebase_service_account.json' };
try {
    configFile = require("../config.json");
} catch (ex) {
    console.log(`No config file provided: Trying to load from firebase using firebase_service_account.json`);
}

if(configFile.use_firebase){
    const serviceAccount = require(`../${configFile.firebase_service_account}`);

    initializeApp({
        credential: credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    const db = database();
    
    console.log(`Loading configuration from firebase (${serviceAccount.project_id})`);
    new FirebaseConfig(db.ref(configFile.firebase_config_path || "config"));
}else{
    console.log(`Loading configuration from config.json`);
    new JsonConfig(path.join(__dirname, "..", "config.json"));
}

async function main() {
    initDiscordWebhooks();

    initTwitterBots();

    console.log("Started!");

    update();

    setInterval(() => update(), 10*60*1000);
}

async function update() {
    const shows = await Config.get('shows');

    let addedShow = false;

    for(let [show, knoweps] of Object.entries(shows)) {
        const eps = await getAvailableEpisodes(show)
        .then(eps => eps.filter(ep => knoweps.indexOf(ep.id) === -1));
        
        for(let ep of eps) {
            addedShow = true;
            knoweps.push(ep.id);
            
            console.log(`New Episode of ${show}: ${ep.seasonNumber}.${ep.episodeNumber.toString().padStart(2, '0')} ${ep.title} (${ep.id})`)
            NotificationSender.sendNewEpisode(show, ep);
        }
    }

    if(addedShow){
        Config.set('shows', shows);
    }
}

main().catch(console.error);

function initDiscordWebhooks(){
    const discordWebhooks: Map<String, DiscordWebhook> = new Map();

    function registerWebhook(settings, key) {
        if (!settings.id || !settings.key) throw new Error("Each webhook needs an id and a key!")

        const discordWebhook = new DiscordWebhook(settings.id, settings.key);
        discordWebhook.shows = new Set(settings.shows);

        discordWebhooks.set(key, discordWebhook);
        NotificationSender.register(discordWebhook);
    }

    function unregisterWebhook(key) {
        NotificationSender.unregister(discordWebhooks.get(key));
        discordWebhooks.delete(key);
    }

    Config.on("discord.webhooks", ConfigEventType.CHILD_ADDED, (hook, key) => {
        registerWebhook(hook, key);
        console.log(`Registered DiscordWebhook ${hook.id} (${key})`);
    });

    Config.on("discord.webhooks", ConfigEventType.CHILD_CHANGED, (hook, key) => {
        unregisterWebhook(key);
        registerWebhook(hook, key);
        console.log(`Updated DiscordWebhook ${hook.id} (${key})`);
    });

    Config.on("discord.webhooks", ConfigEventType.CHILD_REMOVED, (hook, key) => {
        unregisterWebhook(key);
        console.log(`Deleted DiscordWebhook ${hook.id} (${key})`);
    });
}

function initTwitterBots(){
    const twitterBots: Map<String, NotificationTwitterBot> = new Map();

    Config.on("twitter.bots", ConfigEventType.CHILD_ADDED, (botConfig, key) => {
        const bot = new NotificationTwitterBot(botConfig);
        twitterBots.set(key, bot);
        NotificationSender.register(bot);

        console.log(`Registered TwitterBot ${botConfig.consumer_key} (${key})`);
    });

    Config.on("twitter.bots", ConfigEventType.CHILD_CHANGED, (botConfig, key) => {
        NotificationSender.unregister(twitterBots.get(key));

        const bot = new NotificationTwitterBot(botConfig);
        twitterBots.set(key, bot);
        NotificationSender.register(bot);

        console.log(`Updated TwitterBot ${botConfig.consumer_key} (${key})`);
    });

    Config.on("twitter.bots", ConfigEventType.CHILD_REMOVED, (botConfig, key) => {
        NotificationSender.unregister(twitterBots.get(key));
        twitterBots.delete(key);

        console.log(`Deleted TwitterBot ${botConfig.consumer_key} (${key})`);
    });
}
