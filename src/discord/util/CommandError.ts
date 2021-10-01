// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import { MessageEmbedOptions } from 'discord.js';

export default class CommandError extends Error {
  embedOptions: MessageEmbedOptions;
  constructor(message?: string, { title = 'Error', ...data }: Omit<MessageEmbedOptions, 'description'> = {}) {
    super();
    this.name = 'CommandError';
    this.embedOptions = { title, description: message, ...data };
  }
}
