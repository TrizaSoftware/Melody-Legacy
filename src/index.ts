// Copyright (c) 2020-2021 T:Riza Corporation. All rights reserved.
// The full license is available in the LICENSE file at the root of this project.

import BotClient from './discord';
import Server from './web';

if (!process.env.TOKEN) throw new Error('No token!');
if (!process.env.PORT) console.warn('No port specified, using 8080');

new BotClient().login(process.env.TOKEN);
new Server().app.listen(process.env.PORT || 8080);
