import { NotificationSubscriber } from "./NotificationSubscriber";

export class NotificationSender {
  private static subscriptions: Set<NotificationSubscriber> = new Set();

  static register(subscriber: NotificationSubscriber) {
    NotificationSender.subscriptions.add(subscriber);
  }

  static unregister(subscriber: NotificationSubscriber) {
    NotificationSender.subscriptions.delete(subscriber);
  }

  static sendNewEpisode(show: string, episode: any) {
    NotificationSender.subscriptions.forEach(sub => sub.sendNewEpisode(show, episode))
  }

  static send(message) {
    NotificationSender.subscriptions.forEach(sub => sub.send(message));
  }
}
