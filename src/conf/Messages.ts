import * as fs from 'fs'
import formatMessage from 'format-message'

export class Messages {
  private readonly messageDictionary: { [key: string]: string }
  private static instance: Messages

  private constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.messageDictionary = JSON.parse(
      fs.readFileSync('resources/messages.json', 'utf-8')
    )
    formatMessage.setup({
      locale: 'ja-JP',
      missingTranslation: 'ignore',
    })
  }

  static getInstance(): Messages {
    if (!Messages.instance) Messages.instance = new Messages()

    return Messages.instance
  }

  public getMessage(messageKey: string, ...params: string[]): string {
    if (!(messageKey in this.messageDictionary)) return messageKey
    if (params == null) return this.messageDictionary[messageKey] || messageKey
    return formatMessage(
      this.messageDictionary[messageKey] || messageKey,
      params
    )
  }
}
