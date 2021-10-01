// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import { Snowflake } from 'discord.js';
import EventEmitter from 'events';

enum Events {
  Data = 'data',
}

interface EventTypes {
  [Events.Data]: (...data: unknown[]) => void;
}

declare interface VoiceConnectionManager {
  on<U extends keyof EventTypes>(event: U, listener: EventTypes[U]): this;
  emit<U extends keyof EventTypes>(event: U, ...args: Parameters<EventTypes[U]>): boolean;
}

class VoiceConnectionManager extends EventEmitter {
  static readonly Events = Events;

  private static managers: VoiceConnectionManager[] = [];
  static getVCManager(guildId: Snowflake): VoiceConnectionManager | undefined {
    return this.managers.find((manager) => manager.guildId == guildId);
  }

  readonly guildId: Snowflake;
  private _channelId: Snowflake;
  get channelId(): Snowflake {
    return this._channelId;
  }

  constructor(guildId: Snowflake, channelId: Snowflake) {
    super();
    this.guildId = guildId;
    this._channelId = channelId;

    const manager = VoiceConnectionManager.getVCManager(guildId);
    if (manager) return manager;
    VoiceConnectionManager.managers.push(this);

    this.emit(VoiceConnectionManager.Events.Data, 'Test');
  }
}

export default VoiceConnectionManager;
