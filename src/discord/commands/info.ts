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
