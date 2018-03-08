import { BasicUpdater } from "lergins-bot-framework";
import { getAvailableEpisodes, getVideos } from "../nbc";
import { bot } from '../main';

export class NbcEpisodesUpdater extends BasicUpdater {
  get id() {
    return 'nbc-episodes-updater';
  }

  async updateInfo() {
    const lastRunDate = new Date(parseInt(await bot.config().get('last-run')) || new Date().getTime());

    const videos = await getVideos(lastRunDate);

    bot.config().set('last-run', new Date().getTime());

    for(let video of videos){
      console.log(`New Episode of ${video.show.name}: ${video.seasonNumber}.${video.episodeNumber.toString().padStart(2, '0')} ${video.title} (${video.uuid})`)
      bot.send('new-episode', video);      
    }
  }
}
