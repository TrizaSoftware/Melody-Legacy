import BotClient from './discord';

if (!process.env.TOKEN) throw new Error('No token!');

const botClient = new BotClient();
botClient.login(process.env.TOKEN);
