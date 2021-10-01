// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import Command, { CommandCategory } from './Command';

const hallCommand = new Command({
  name: 'hall',
  category: CommandCategory.Random,
  desc: 'Get the most infamous Mr. Hall Quote',
  execute: async (interaction) => {
    await interaction.reply('"You can make me a wizard and I can do spells and stuff." - Mr. Hall 2020');
  },
});

export default hallCommand;
