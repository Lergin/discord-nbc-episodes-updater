import { WebhookClient, RichEmbed } from "discord.js";
import { NotificationSubscriber } from "./NotificationSubscriber";

export class DiscordWebhook extends WebhookClient implements NotificationSubscriber {
  private _shows: Set<string> = new Set();

  set shows(shows: Set<string>) {
    this._shows = shows;
  }

  get shows(){
    return this._shows;
  }

  constructor(id: string, key: string){
    super(id, key);
  }

  sendNewEpisode(show: string, episode: any){
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
