// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import Command, { CommandCategory } from './Command';

const infoCommand = new Command({
  name: 'information',
  category: CommandCategory.Info,
  desc: 'Shows all information for Melody.',
  execute: async () => {
    // TODO: Actually have the command do something
  },
});

export default infoCommand;
