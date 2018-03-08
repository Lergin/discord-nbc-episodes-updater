import { RichEmbed } from "discord.js";
import { DiscordWebhook as _DiscordWebhook } from "lergins-bot-framework";

export class DiscordWebhook extends _DiscordWebhook {
  private shows: Set<string> = new Set();

  constructor(settings){
    super(settings);

    this.shows = new Set(settings.shows);
  }

  async update(key, message) {
    switch (key) {
      case 'new-episode': return this.sendNewEpisode(message);
    }
  }

  sendNewEpisode(data) {
    if (!this.shows.has(data.show.name)) return;

    const embed = new RichEmbed();
    embed.setURL(data.permalink);
    embed.setTitle(`New ${data.show.shortTitle} Episode available`);
    embed.addField("Episode", data.title, true);
    embed.addField("Number", `${data.seasonNumber}.${data.episodeNumber.toString().padStart(2, '0')}`, true);
    embed.addField("Air Date", formatDate(new Date(data.airdate)), true);
    embed.addField("Available Till", formatDate(new Date(data.expiration)), true);
    embed.setImage(`https://www.nbc.com${data.image.path}`);
    embed.setDescription(data.description);

    this.send(embed);
  }
}

function formatDate(date){
  return new Date(date).toISOString().replace('T', ' ').substr(0,19) + ' UTC'
}
