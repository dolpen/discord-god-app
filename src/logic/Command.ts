import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js'

export interface Command {
  getCommand(): Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >

  handle(
    client: Client,
    interaction: ChatInputCommandInteraction
  ): Promise<void>
}
