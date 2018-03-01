import * as Twitter from "twit";
import { NotificationSubscriber } from './NotificationSubscriber';
import { NotificationSender } from "./NotificationSender";

export class NotificationTwitterBot extends Twitter implements NotificationSubscriber {
  private _shows: Set<string> = new Set();

  set shows(shows: Set<string>) {
    this._shows = shows;
  }

  get shows() {
    return this._shows;
  }
  
  constructor(config){
    super(config);

    this.shows = new Set(config.shows);
  }

  async send(message, sendNotification=true) {
    let a = this.post('statuses/update', {status: message});

    try {
      let data = await a.then(res => res.data).catch(console.error);
    }catch(err ){
      console.log(err);
    }
  }

  sendNewEpisode(show: string, episode: any) {
    if (!this.shows.has(show)) return;

  }

  sendTweet() {
  }
}