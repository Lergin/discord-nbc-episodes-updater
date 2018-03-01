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
      case 'new-episode': return this.sendNewEpisode(message.show, message.episode);
    }
  }

  sendNewEpisode(show: string, episode: any) {
    if (!this.shows.has(show)) return;

    const embed = new RichEmbed();
    embed.setURL(episode.permalink);
    embed.setTitle(`New ${episode.showName} Episode available`);
    embed.addField("Episode", episode.title, true);
    embed.addField("Number", `${episode.seasonNumber}.${episode.episodeNumber.toString().padStart(2, '0')}`, true);
    embed.addField("Available Till", formatDate(new Date(episode.expiration)), true);
    embed.setImage(episode.image.path);
    embed.setDescription(episode.description);

    this.send(embed);
  }
}

function formatDate(date){
  return new Date(date).toISOString().replace('T', ' ').substr(0,19) + ' UTC'
}
