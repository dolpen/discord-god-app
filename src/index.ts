import { Client, GatewayIntentBits, Snowflake } from 'discord.js'
import { addCleanupListener } from 'async-cleanup'
import { Messages } from './conf/Messages'
import { standardProvider } from './conf/LogConfig'
import { installCommand, uninstallCommand } from './conf/Commands'
import { Kick } from './logic/KickCommand'
import { Report } from './logic/ReportCommand'

const ms: Messages = Messages.getInstance()
const log = standardProvider.getLogger('bot.core')

// ======== CLIENT SETUP ========
const clientOpts = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
}
const token = process.env.DISCORD_TOKEN
const appId: Snowflake = '1014407001821958164'
const commands = [Kick.getCommand(), Report.getCommand()]
if (!token) {
  log.debug(ms.getMessage('CORE_ERROR_MISSING_TOKEN'))
  process.exit(1)
}
const client = new Client(clientOpts)

// ======== HANDLERS ========
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  await Kick.handle(client, interaction)
  await Report.handle(client, interaction)
})

// ======== LIFECYCLE ========
client.once('ready', async () => await installCommand(appId, token, commands))
client.once('invalidated', async () => await uninstallCommand(appId, token))
addCleanupListener(async () => {
  await uninstallCommand(appId, token)
  client.destroy()
  log.debug(ms.getMessage('CORE_DISCONNECT'))
})

// ======== CONNECT ========
// eslint-disable-next-line  @typescript-eslint/no-floating-promises
client
  .login(token)
  .then(() => log.debug(ms.getMessage('CORE_CONNECT')))
  .catch(() => log.debug(ms.getMessage('CORE_ERROR_LAUNCH')))
