import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from 'discord.js'

import { Messages } from '../conf/Messages'
import { Command } from './Command'

const COMMAND_NAME = 'report'
const DAYS_OPTION_NAME = 'days'
const EXCLUDE_OPTION_NAME = 'exclude'
const DEFAULT_PASSED_DATE = 30
const DEFAULT_EXCLUDE_CATEGORY = 'RUINS'
const EMOJI_OK = '⭕'
const EMOJI_NG = '❌'
const ms = Messages.getInstance()

const getLastUpdated = (ch: GuildTextBasedChannel): Date => {
  if (ch.lastMessageId == null) {
    return ch.createdAt as Date
  }
  // get date from snowflake
  const id = Number(ch.lastMessageId)
  return new Date(Math.floor(id / 4194304) + 1420070400000)
}

const getChannelInfo = (ch: GuildTextBasedChannel) => {
  const lastUpdated = getLastUpdated(ch)
  return {
    parent: ch.parent?.name || '',
    name: ch.name,
    lastUpdated: lastUpdated,
    timestamp: lastUpdated.getTime(),
  }
}

class ReportCommand implements Command {
  private builder = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(ms.getMessage('REPORT_DESC_EN'))
    .setDescriptionLocalizations({
      ja: ms.getMessage('REPORT_DESC_JA'),
    })
    .addIntegerOption((option) =>
      option
        .setName(DAYS_OPTION_NAME)
        .setMinValue(30)
        .setDescription(ms.getMessage('REPORT_DAYS_EN'))
        .setDescriptionLocalizations({
          ja: ms.getMessage('REPORT_DAYS_JA'),
        })
    )
    .addStringOption((option) =>
      option
        .setName(EXCLUDE_OPTION_NAME)
        .setDescription(ms.getMessage('REPORT_EXCLUDE_EN'))
        .setDescriptionLocalizations({
          ja: ms.getMessage('REPORT_EXCLUDE_JA'),
        })
    )

  getCommand() {
    return this.builder
  }

  async handle(client: Client, interaction: ChatInputCommandInteraction) {
    if (interaction.commandName !== COMMAND_NAME) return
    const member = interaction.member
    if (member === null) {
      await interaction.reply(
        ms.getMessage('REPORT_ERROR_TRIGGER_USER', EMOJI_NG)
      )
      return
    }
    if (interaction.guild === null) {
      await interaction.reply(ms.getMessage('REPORT_ERROR_DM', EMOJI_NG))
      return
    }

    const exclude =
      interaction.options.getString(EXCLUDE_OPTION_NAME, false) ||
      DEFAULT_EXCLUDE_CATEGORY

    const passed =
      interaction.options.getInteger(DAYS_OPTION_NAME, false) ||
      DEFAULT_PASSED_DATE
    const channels = await interaction.guild.channels.fetch()
    const textChannels = Array.from(
      channels.filter((c) => c.type === ChannelType.GuildText).values()
    ) as GuildTextBasedChannel[]
    const now = new Date().getTime()
    const border = now - passed * 86400 * 1000
    const targets = textChannels.map(getChannelInfo).filter((i) => {
      return !i.parent.includes(exclude) && i.timestamp < border
    })
    await interaction.reply(
      ms.getMessage('REPORT_RESULT_SUM', EMOJI_OK, targets.length.toString()) +
        targets
          .map((i) => {
            const passed = Math.floor((now - i.timestamp) / (86400 * 1000))
            return ms.getMessage(
              'REPORT_RESULT_RECORD',
              i.parent,
              i.name,
              passed.toString()
            )
          })
          .join('\n')
    )
  }
}

export const Report = new ReportCommand()
