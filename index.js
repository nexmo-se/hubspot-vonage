import { neru, Messages, Queue } from 'neru-alpha';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { basicAuth } from './services/auth.js';
import indexRouter from './routes/index.js';
import workflowRouter from './routes/workflows.js';
import queueRouter from './routes/queues.js';
import templateRouter from './routes/templates.js';
import inboundMessages from './routes/inboundMessages.js';
import infoRouter from './routes/info.js';
import sendRouter from './routes/send.js';
import historyRouter from './routes/history.js';
import templateWorkflows from './routes/templates-wf.js';
import sendSMSRouter from './routes/sendMessage.js';
import sendWAtemplate from './routes/sendTemplate.js';
import { listenMessages } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.NERU_APP_PORT;
const sess = neru.createSession();
const messaging = new Messages(sess);

listenMessages(messaging);

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', indexRouter());
app.use('/onMessage', inboundMessages());
app.use('/templates', templateRouter());
app.use('/queues', queueRouter(sess, neru, Queue));
app.use('/send', sendRouter());
app.use('/sendMessage', sendSMSRouter(messaging));
app.use('/send-template', sendWAtemplate(messaging));

app.use(basicAuth);
app.use('/info', infoRouter());
app.use('/history', historyRouter());
app.use('/templates-workflows', templateWorkflows());
app.use('/workflows', workflowRouter(app, messaging, neru, Queue));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
