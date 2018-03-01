import { NotificationTwitterBot } from "lergins-bot-framework";

export class TwitterBot extends NotificationTwitterBot {
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

  }
}