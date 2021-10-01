// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CommandInteractionOption } from 'discord.js';

export enum CommandCategory {
  Random = 'Random',
  Info = 'Information',
  Music = 'Music',
}

export type CommandExecuteFunction = (
  interaction: CommandInteraction,
  args: Readonly<CommandInteractionOption[]>
) => Promise<void>;

export type CommandOptions = Readonly<{
  name: string;
  category: CommandCategory;
  desc: string;
  slashOptions?: ReturnType<SlashCommandBuilder['addUserOption']>;
  usage?: string;
  execute: CommandExecuteFunction;
}>;

export default class Command {
  readonly name: string;
  readonly category: CommandCategory;
  readonly desc: string;
  readonly slashOptions: SlashCommandBuilder;
  readonly usage: string;
  readonly execute: CommandExecuteFunction;

  constructor({ name, category, desc, slashOptions = new SlashCommandBuilder(), usage = '', execute }: CommandOptions) {
    this.name = name;
    this.desc = desc;
    this.category = category;
    this.slashOptions = slashOptions.setName(name).setDescription(desc);
    this.usage = usage;
    this.execute = execute;
  }
}
