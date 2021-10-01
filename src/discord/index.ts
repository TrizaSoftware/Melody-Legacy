// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import { ActivityOptions, Client, Intents, MessageEmbed, MessageEmbedOptions, Snowflake } from 'discord.js';
import * as commands from './commands';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Command from './commands/Command';
import CommandError from './util/CommandError';

export default class BotClient extends Client {
  static statuses: [ActivityOptions['type'], string][] = [
    ['WATCHING', 'The T:Riza Corporation'],
    ['PLAYING', 'Some good tunes!'],
    ['PLAYING', 'The legend that was on the cord!'],
    ['PLAYING', `${process.env.PREFIX}help | ${process.env.PREFIX}info`],
    ['WATCHING', 'Jimmy!'],
  ];

  static intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ];

  static commands: Map<string, Command> = new Map(Object.values(commands).map((command) => [command.name, command]));

  private status = -1;
  private async nextStatus(): Promise<void> {
    if (!this.user) return;
    this.status = ++this.status % BotClient.statuses.length;
    this.user.setActivity(BotClient.statuses[this.status][1], { type: BotClient.statuses[this.status][0] });
  }

  private discordRestAPI = new REST({ version: '9' });

  constructor() {
    super({ intents: BotClient.intents });
    this.init();
  }

  private init() {
    this.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand() || !BotClient.commands.has(interaction.commandName)) return;
      try {
        await BotClient.commands.get(interaction.commandName)?.execute(interaction, interaction.options.data);
      } catch (err) {
        if (err instanceof CommandError) {
          await interaction.reply({ embeds: [BotClient.createErrorEmbed(err.embedOptions)] });
        } else {
          console.error(err);
        }
      }
    });

    this.on('ready', async () => {
      await this.guilds.fetch();
      this.guilds.cache.forEach((guild) => this.updateGuildSlashCommands(guild.id));
      this.nextStatus();
      setInterval(this.nextStatus, 10000);
      console.log(`Logged In As ${this.user?.username}#${this.user?.discriminator}`);
    });

    this.on('debug', (message) => {
      console.log(message);
    });

    this.on('guildCreate', (guild) => {
      this.updateGuildSlashCommands(guild.id);
    });
  }

  private async updateGuildSlashCommands(guildId: Snowflake): Promise<void> {
    if (!this.user) return;
    console.log(`Began refreshing slash commands for guild: ${guildId}`);
    try {
      await this.discordRestAPI.put(Routes.applicationGuildCommands(this.user.id, guildId), {
        body: Array.from(BotClient.commands.values()).map((command) => command.slashOptions.toJSON()),
      });
    } catch (err) {
      console.log(`An error occurred while refreshing slash commands for the guild ${guildId}`);
    }
  }

  login(token: string): ReturnType<Client['login']> {
    this.discordRestAPI.setToken(token);
    return super.login(token);
  }

  static createEmbed({
    color = '#369457',
    footer = { text: `© T:Riza Corp 2020 - ${new Date().getFullYear()}` },
    timestamp = Date.now(),
    ...data
  }: Require<MessageEmbedOptions, 'title' | 'description'>): MessageEmbed {
    return new MessageEmbed({ color, footer, timestamp, ...data });
  }

  static createErrorEmbed({
    title = 'Error',
    description = 'An error occured and the command failed.',
    ...data
  }: MessageEmbedOptions = {}): MessageEmbed {
    return this.createEmbed({ title, description, ...data });
  }
}
