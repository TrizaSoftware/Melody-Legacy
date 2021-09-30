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
