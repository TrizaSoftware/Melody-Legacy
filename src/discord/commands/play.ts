// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';
import Command, { CommandCategory } from './Command';
import { joinVoiceChannel } from '@discordjs/voice';
import VoiceConnectionManager from '../util/VoiceConnectionManager';
import CommandError from '../util/CommandError';

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
    if (!member.voice.channel) throw new CommandError('You must be in a Voice Channel to run this command.');
    if (!args[0]) throw new CommandError('You must specify a search term!');
    if (!VoiceConnectionManager.getVCManager(interaction.guildId)) {
      joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: interaction.guildId,
        adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
      });
      new VoiceConnectionManager(interaction.guildId, member.voice.channel.id);
    }
  },
});

export default helpCommand;
