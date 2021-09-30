import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';
import Command, { CommandCategory } from './Command';
import { joinVoiceChannel } from '@discordjs/voice';
import VoiceConnectionManager from '../util/VoiceConnectionManager';

const helpCommand = new Command({
  name: 'play',
  category: CommandCategory.Music,
  desc: 'Plays Music',
  slashOptions: new SlashCommandBuilder().addStringOption((option) =>
    option.setName('search_term').setDescription('The song you want to play.').setRequired(true)
  ),
  execute: async (interaction, args) => {
    if (!interaction.inGuild()) return;
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) throw new Error('You must be in a Voice Channel to run this command.');
    if (!args[0]) throw new Error('You must specify a search term!');
    joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guildId,
      adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
    });
    const vcm = new VoiceConnectionManager(member.voice.channel.id);
    vcm.on(VoiceConnectionManager.Events.Data, (data) => console.log(data));
  },
});

export default helpCommand;
