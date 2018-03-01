export interface NotificationSubscriber {
  send(message);
  sendNewEpisode(show: string, episode: any);
}
