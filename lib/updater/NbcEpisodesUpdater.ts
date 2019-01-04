import { BasicUpdater } from "lergins-bot-framework";
import { getVideos } from "../nbc";
import { bot } from '../main';

export class NbcEpisodesUpdater extends BasicUpdater {
  get id() {
    return 'nbc-episodes-updater';
  }

  async updateInfo() {
    const currentDate = new Date().getTime();
    const lastRunDate = new Date(parseInt(await bot.config().get('last-run')) || currentDate);

    const videos = await getVideos(lastRunDate);

    bot.config().set('last-run', currentDate);

    for(let video of videos){
      console.log(`New Episode of ${video.show.name}: ${video.seasonNumber}.${video.episodeNumber.toString().padStart(2, '0')} ${video.title} (${video.uuid})`)
      bot.send('new-episode', video);      
    }
  }
}
