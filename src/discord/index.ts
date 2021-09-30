import { ActivityOptions, Client, Intents, Snowflake } from 'discord.js';
import * as commands from './commands';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Command from './commands/Command';

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

    this.on('interactionCreate', (interaction) => {
      if (!interaction.isCommand() || !BotClient.commands.has(interaction.commandName)) return;
      BotClient.commands.get(interaction.commandName)?.execute(interaction, interaction.options.data);
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
  }

  private async updateGuildSlashCommands(guildId: Snowflake): Promise<void> {
    if (!this.user) return;
    console.log(`Began refreshing slash commands for guild: ${guildId}`);
    try {
      await this.discordRestAPI.put(Routes.applicationGuildCommands(this.user.id, guildId), {
        body: Array.from(BotClient.commands.values()).map(command => command.slashOptions.toJSON()),
      });
    } catch (err) {
      console.log(`An error occurred while refreshing slash commands for the guild ${guildId}`);
    }
  }

  login(token: string): ReturnType<Client['login']> {
    this.discordRestAPI.setToken(token);
    return super.login(token);
  }
}
