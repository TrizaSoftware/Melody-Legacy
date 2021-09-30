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
