import { neru, Messages, Queue } from 'neru-alpha';
import express from 'express';

const app = express();
const port = process.env.NERU_APP_PORT;

import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { basicAuth, comesFromHubspot } from './services/auth.js';
import { getTemplates } from './services/templates.js';
import { updateHubspotLastContacted, updateTimeLine } from './services/hubspot.js';
import { getMessagesReport, getRecords } from './services/reports.js';
import indexRouter from './routes/index.js';
import workflowRouter from './routes/workflows.js';
import { isEmpty, formatTemplate, getNumberParams, formatNumber } from './utils.js';

const sess = neru.createSession();
const messaging = new Messages(sess);

const listenMessages = async () => {
  const vonageNumber = { type: 'sms', number: '447520660729' };
  const from = { type: 'sms', number: null };
  // await messaging.listenMessages(from, vonageNumber, 'onMessage').execute();
  // await messaging
  //   .listenMessages(
  //     { type: null, number: null },
  //     {
  //       type: null,
  //       number: '447520660729',
  //     },
  //     '/onMessage'
  //   )
  await messaging
    .listenMessages(
      { type: null, number: null },
      {
        type: null,
        number: '447520660729',
      },
      '/onMessage'
    )
    .execute();
  // await messaging.onMessage('onMessage', from, vonageNumber).execute();
};
listenMessages();

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/onMessage', async (req, res) => {
  try {
    if (req.body && req.body.from && req.body.text) {
      const number = req.body.from;
      const timestamp = req.body.timestamp;
      const text = req.body.text;
      console.log('message received', req.body);
      updateHubspotLastContacted(number, {
        properties: {
          replied: timestamp,
        },
      });
      updateHubspotLastContacted(number, {
        properties: {
          lastrepliedtext: text,
        },
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

app.post('/work', async (req, res) => {
  const text = req.body?.fields?.templatename;
  const type = req.query?.type;
  const params = req.body?.fields?.bodyparams ? JSON.parse(req.body?.fields?.bodyparams) : [];
  const url = req.body?.fields?.URL;
  const urlType = req.body?.fields?.staticInput4;
  const headerParams = req.body?.fields?.staticInput5;
  const to = req.body?.object?.properties?.phone;
  const components = [];
  const parametersFormated = [];

  if (headerParams) {
    const headerParamsFormated = [];
    // for (let parameter in headerParams) {
    headerParamsFormated.push({ type: 'text', text: headerParams });
    // }
    components.push({
      type: 'header',
      parameters: headerParamsFormated,
    });
  }

  if (url && urlType) {
    const urlObject = {};
    urlObject['headerUrl'] = url;
    urlObject['type'] = urlType;
    components.push({
      type: 'header',
      parameters: [getHeaderUrl(urlObject)],
    });
  }
  const name = text.split(' (')[0];
  const regExp = /\(([^)]+)\)/;
  const lang = regExp.exec(text)[1];
  for (let parameter in params) {
    parametersFormated.push({ type: 'text', text: params[parameter] });
  }
  components.push({
    type: 'body',
    parameters: parametersFormated,
  });
  const vonageNumber = { type: 'whatsapp', number: process.env.number };

  const custom = {
    message_type: 'custom',
    custom: {
      type: 'template',
      template: {
        name: name,
        language: {
          code: lang,
          policy: 'deterministic',
        },
        components: components,
      },
    },
  };

  try {
    const response = await messaging
      .send({
        message_type: 'custom',
        to: to,
        from: vonageNumber.number,
        channel: vonageNumber.type,
        ...custom,
      })
      .execute();

    console.log(response);
  } catch (e) {
    console.log(e);
  }

  res.sendStatus(200);
});

app.get('/list', async (req, res) => {
  const session = neru.createSession();
  const queueApi = new Queue(session);

  const result = await queueApi.list().execute();

  res.send(result);
});

app.delete('/queues/:name', async (req, res) => {
  const name = req.params.name;
  const session = neru.createSession();
  const queueApi = new Queue(session);

  await queueApi.deleteQueue(name).execute();

  res.sendStatus(200);
});

app.post('/create', async (req, res) => {
  const session = neru.createSession();
  const queueApi = new Queue(session);

  try {
    await queueApi
      .createQueue('hubspot', '/workflows/consumer', {
        maxInflight: 200,
        msgPerSecond: 29,
        active: true,
      })
      .execute();

    res.sendStatus(201);
  } catch (e) {
    console.log(e.message);
    res.status.send(e.message);
  }
});

app.get('/queue', async (req, res) => {
  const session = neru.createSession();
  const queueApi = new Queue(session);

  const result = await queueApi.getQueueDetails('hubspot').execute();

  res.send(result);
});

app.use('/', indexRouter());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/send', comesFromHubspot, async (req, res) => {
  try {
    const phone = req.query?.phone;
    const userId = req.query?.hs_object_id;
    console.log(req.query);
    console.log(userId);

    const phoneFormatted = formatNumber(phone);
    console.log(process.env.channels.split(','));
    res.render('index.ejs', {
      to: phoneFormatted || 'UNDEFINED',
      channels: process.env.channels.split(','),
      user: userId,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post('/sendMessage', comesFromHubspot, async (req, res) => {
  try {
    const { text, to, channel, sender, userId } = req.body;
    console.log('sending message to user ' + userId);

    const vonageNumber = { type: channel, number: process.env.number };
    console.log('sending ' + text + ' via ' + channel);
    const from = sender ? sender : vonageNumber.number;
    const response = await messaging
      .send({
        message_type: 'text',
        to: to,
        from: from,
        channel: vonageNumber.type,
        text: text,
      })
      .execute();
    console.log(response);
    const id = response.message_uuid;
    const timestamp = response.timestamp;
    await updateTimeLine(id, from, text, to, userId, timestamp);

    res.json({ res: 'okay' });
  } catch (e) {
    console.log(e);
    const error = new Error(e.response.data.detail);
    res.status(500).json({ error: error.message });
  }
});

app.get('/templates', comesFromHubspot, async (req, res) => {
  try {
    const templates = await getTemplates();
    res.send(templates);
  } catch (e) {
    res.status(500);
  }
});

app.post('/templates-workflows', async (req, res) => {
  try {
    const templates = await getTemplates();
    const newTemplates = templates.map((template) => {
      const templateFormat = formatTemplate(template);

      const paramsObject = { params: [] };
      const numberParamsBody = templateFormat.numberParams || 0;
      for (let i = 1; i <= numberParamsBody; i++) {
        paramsObject.params.push(`{{${i}}}`);
      }
      //${JSON.stringify(paramsObject)}
      return {
        name: `${template.name} (${template.language}) params:${paramsObject.params.length} ${
          templateFormat.headerType === 'IMAGE' || templateFormat.headerType === 'VIDEO' || templateFormat.headerType === 'FILE'
            ? `${templateFormat.headerType}URL`
            : ''
        }`,
      };
    });
    // console.log(newTemplates);

    const templatesForHubspot = newTemplates.map((e) => {
      return { label: e.name, description: e.name, value: e.name };
    });
    res.send({ options: templatesForHubspot, searchable: true });
  } catch (e) {
    res.status(500);
  }
});
app.post('/send-template', async (req, res) => {
  const { params: parameters, to, name, urlObject, headerParameters, language } = req.body;
  let components = [];
  const parametersFormated = [];
  for (let parameter in parameters) {
    parametersFormated.push({ type: 'text', text: parameters[parameter] });
  }
  if (!isEmpty(urlObject)) {
    const headerObject = getHeaderUrl(urlObject);
    console.log(headerObject);

    components.push({
      type: 'header',
      parameters: [getHeaderUrl(urlObject)],
    });
  }

  if (!isEmpty(headerParameters)) {
    let headerParamsFormated = [];
    for (let parameter in headerParameters) {
      headerParamsFormated.push({ type: 'text', text: headerParameters[parameter] });
    }
    components.push({
      type: 'header',
      parameters: headerParamsFormated,
    });
  }

  components.push({
    type: 'body',
    parameters: parametersFormated,
  });

  const vonageNumber = { type: 'whatsapp', number: process.env.number };

  const custom = {
    message_type: 'custom',
    custom: {
      type: 'template',
      template: {
        name: name,
        language: {
          code: language,
          policy: 'deterministic',
        },
        components: components,
      },
    },
  };

  const response = await messaging
    .send({
      message_type: 'custom',
      to: to,
      from: vonageNumber.number,
      channel: vonageNumber.type,
      ...custom,
    })
    .execute();
  res.json({ res: 'okay' });
});

const getHeaderUrl = (urlObject) => {
  if (urlObject?.type === 'IMAGE') {
    return {
      type: urlObject?.type?.toLowerCase(),
      image: {
        link: urlObject?.headerUrl,
      },
    };
  }
  if (urlObject?.type === 'DOCUMENT') {
    return {
      type: urlObject?.type?.toLowerCase(),
      document: {
        link: urlObject?.headerUrl,
      },
    };
  }
  if (urlObject?.type === 'VIDEO') {
    return {
      type: urlObject?.type?.toLowerCase(),
      video: {
        link: urlObject?.headerUrl,
      },
    };
  }
};

app.use(basicAuth);

app.use('/workflows', workflowRouter(app, messaging, neru, Queue));

app.get('/history', async (req, res) => {
  try {
    const phoneWithPlus = req.query?.phone;
    const phoneFormatted = formatNumber(phoneWithPlus);
    const phone = phoneFormatted?.split('+')[1];
    if (!phone) res.status(200);
    console.log('getting records' + phone);

    const inbound = await getRecords('inbound', phone);
    const outbound = await getRecords('outbound', phone);
    const records = [...inbound.records, ...outbound.records];
    const response = getMessagesReport(records);

    if (!records) throw new Error('something went wrong fetching conversation history');

    res.send({ results: response });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

app.get('/info', (req, res) => {
  const lastname = req.query?.lastname;
  const phone = req.query?.phone;

  res.send({
    results: [],
    primaryAction: {
      type: 'IFRAME',
      width: 890,
      height: 748,
      associatedObjectProperties: ['lastname', 'phone', 'hs_object_id'],
      uri: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/send`,
      label: 'Send message',
    },
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
