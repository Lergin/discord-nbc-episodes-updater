import { BasicUpdater } from "lergins-bot-framework";
import { getAvailableEpisodes } from "../nbc";
import { bot } from '../main';

export class NbcEpisodesUpdater extends BasicUpdater {
  get id() {
    return 'nbc-episodes-updater';
  }

  async updateInfo() {
    const shows = await bot.config().get('shows') || [];

    let addedShow = false;

    for (const show in shows) {
      if (shows.hasOwnProperty(show)) {
        await getAvailableEpisodes(show)
          .then(eps => Promise.all(eps.map(async ep => {
            return {
              val: ep,
              filter: !await bot.config().has(`shows/${show}`, ep.id)
            }
          })))
          .then(eps => eps
            .filter(ep => ep.filter)
            .map(ep => ep.val)
            .map(ep => {
              bot.config().push(`shows/${show}`, ep.id);

              console.log(`New Episode of ${show}: ${ep.seasonNumber}.${ep.episodeNumber.toString().padStart(2, '0')} ${ep.title} (${ep.id})`)
              bot.send('new-episode', { show: show, episode: ep });
            })
          );
      }
    }
  }
}
