import { LogLevel } from 'typescript-logging'
import { Log4TSProvider } from 'typescript-logging-log4ts-style'

export const standardProvider = Log4TSProvider.createProvider(
  'StandardProvider',
  {
    level: LogLevel.Debug,
    groups: [
      {
        expression: new RegExp('.+'),
      },
    ],
  }
)
