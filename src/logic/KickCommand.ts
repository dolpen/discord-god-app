import {
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js'
import { Messages } from '../conf/Messages'
import { Command } from './Command'

const COMMAND_NAME = 'afk'
const USER_OPTION_NAME = 'user'
const EMOJI_OK = '⭕'
const EMOJI_NG = '❌'
const ms = Messages.getInstance()

class KickCommand implements Command {
  private builder = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(ms.getMessage('AFK_DESC_EN'))
    .setDescriptionLocalizations({
      ja: ms.getMessage('AFK_DESC_JA'),
    })
    .addUserOption((option) =>
      option
        .setName(USER_OPTION_NAME)
        .setRequired(true)
        .setDescription(ms.getMessage('AFK_USER_EN'))
        .setDescriptionLocalizations({
          ja: ms.getMessage('AFK_USER_JA'),
        })
    )

  getCommand() {
    return this.builder
  }

  async handle(client: Client, interaction: ChatInputCommandInteraction) {
    if (interaction.commandName !== COMMAND_NAME) return
    const member = interaction.member
    if (member === null) {
      await interaction.reply(ms.getMessage('AFK_ERROR_TRIGGER_USER', EMOJI_NG))
      return
    }
    if (interaction.guild === null) {
      await interaction.reply(ms.getMessage('AFK_ERROR_DM', EMOJI_NG))
      return
    }

    const target = interaction.options.getMember(
      USER_OPTION_NAME
    ) as GuildMember
    if (!target) {
      await interaction.reply(ms.getMessage('AFK_ERROR_TARGET_USER', EMOJI_NG))
      return
    }
    if (target.voice.channel !== null) {
      const roomName = target.voice.channel.name
      target.voice
        .disconnect(`Godによる退出処理: ${member.user.username}`)
        .then(async () => {
          await interaction.reply(
            ms.getMessage('AFK_SUCCESS', EMOJI_OK, roomName)
          )
        })
        .catch(async () => {
          await interaction.reply(
            ms.getMessage('AFK_ERROR_FAIL', EMOJI_NG, roomName)
          )
        })
    } else {
      await interaction.reply(ms.getMessage('AFK_ERROR_NV', EMOJI_NG))
    }
  }
}

export const Kick = new KickCommand()
