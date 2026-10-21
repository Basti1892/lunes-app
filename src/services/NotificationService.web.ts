import type NativeNotificationService from './NotificationService'

// Notifications are disabled on web. The repetition reminder is only scheduled in the native apps.
export default class NotificationService {
  public static scheduleRepetitionReminder: typeof NativeNotificationService.scheduleRepetitionReminder = async () =>
    undefined

  public static clearRepetitionReminder: typeof NativeNotificationService.clearRepetitionReminder = async () =>
    undefined
}
