// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import express from 'express';

export default class Server {
  app: ReturnType<typeof express>;

  constructor() {
    this.app = express();
    this.init();
  }

  private init() {
    this.app.use((req, res) => {
      res.status(200).json({ message: 'OK' });
    });
  }
}
