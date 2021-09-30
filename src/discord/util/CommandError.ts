import { MessageEmbedOptions } from 'discord.js';

export default class CommandError extends Error {
  embedOptions: MessageEmbedOptions;
  constructor(message?: string, { title = 'Error', ...data }: Omit<MessageEmbedOptions, 'description'> = {}) {
    super();
    this.name = 'CommandError';
    this.embedOptions = { title, description: message, ...data };
  }
}
