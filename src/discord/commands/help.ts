// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import Command, { CommandCategory } from './Command';

const helpCommand = new Command({
  name: 'help',
  category: CommandCategory.Info,
  desc: 'Shows a list of commands',
  execute: async () => {
    // TODO: Actually have the command do something
  },
});

export default helpCommand;
