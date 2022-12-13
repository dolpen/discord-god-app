import { Routes, SlashCommandBuilder, Snowflake } from 'discord.js'
import { REST } from '@discordjs/rest'
import { standardProvider } from './LogConfig'
import { Messages } from './Messages'

const ms: Messages = Messages.getInstance()
const log = standardProvider.getLogger('bot.commands')

const putSlash = (
  appId: Snowflake,
  token: string | null,
  commands: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>[]
): Promise<unknown> => {
  const rest = new REST({ version: '10' }).setToken(token as string)
  const payload = { body: commands.map((command) => command.toJSON()) }
  return rest.put(Routes.applicationCommands(appId), payload)
}

export const installCommand = async (
  appId: Snowflake,
  token: string | null,
  commands: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>[]
) => {
  await putSlash(appId, token, commands)
    .then(() => log.debug(ms.getMessage('CORE_INSTALL_SLASH_SUCCESS')))
    .catch(() => log.debug(ms.getMessage('CORE_ERROR_INSTALL_SLASH')))
}

export const uninstallCommand = async (
  appId: Snowflake,
  token: string | null
) => {
  await putSlash(appId, token, [])
    .then(() => log.debug(ms.getMessage('CORE_UNINSTALL_SLASH_SUCCESS')))
    .catch(() => log.debug(ms.getMessage('CORE_ERROR_UNINSTALL_SLASH')))
}
