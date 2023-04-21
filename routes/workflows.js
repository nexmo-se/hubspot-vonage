import express from 'express';
const router = express.Router();
import { basicAuth, comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
import { sendWa } from '../services/wa.js';
import { updateTimeLine } from '../services/hubspot.js';
export default function Router(app, messaging, neru, Queue) {
  router.post('/', async (req, res) => {
    try {
      const session = neru.createSession();
      const queueApi = new Queue(session);

      const text = req.body?.fields?.staticInput;
      const type = req.query?.type;
      const phone = req.body?.fields?.staticInput2;
      const campaign = req.body?.fields?.staticInput3;
      const id = req.body?.object?.objectId;
      const to = req.body?.object?.properties?.phone;
      const textTemplate = req.body?.fields?.templatename;
      const name = textTemplate?.split(' (')[0];
      const regExp = /\(([^)]+)\)/;
      const lang = regExp.exec(textTemplate)?.[1];

      const params = req.body?.fields?.bodyparams ? JSON.parse(req.body?.fields?.bodyparams) : [];
      const url = req.body?.fields?.URL;
      const urlType = req.body?.fields?.staticInput4;
      const headerParams = req.body?.fields?.staticInput5;

      const componentsFormatted = formatComponents(headerParams, url, urlType, params);

      const formattedData = [{ text, type, phone, to, id, campaign, componentsFormatted, name, lang }];
      console.log(JSON.stringify(formattedData));
      if (type === 'sms' && (!text || !phone || !to)) {
        res.status(200).send('missing parameters');
      } else {
        await queueApi.enqueue('hubspot', formattedData).execute();
        res.sendStatus(200);
      }
    } catch (e) {
      console.log(e);

      res.status(500).send(e);
    }
  });
  router.post('/consumer', async (req, res) => {
    try {
      const { text, type, phone, to, id, campaign, componentsFormatted, name, lang } = req.body;

      if (type === 'sms') {
        const resp = await sendSms(messaging, phone, text, to, campaign);
        console.log(resp);
        const message_id = resp.message_uuid;
        const timestamp = resp.timestamp;
        if (message_id && phone && text && to && id) await updateTimeLine(message_id, phone, text, to, id, campaign);
        res.sendStatus(200);
      }
      if (type === 'whatsapp') {
        const resp = await sendWa(messaging, phone, to, componentsFormatted, name, lang);
        console.log(resp);
        res.sendStatus(200);
      }
    } catch (e) {
      console.log(e);
      res.status(200).send(e.message);
    }
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

  const formatComponents = (headerParams, url, urlType, params) => {
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

    for (let parameter in params) {
      parametersFormated.push({ type: 'text', text: params[parameter] });
    }
    components.push({
      type: 'body',
      parameters: parametersFormated,
    });
    return components;
  };

  return router;
}

// module.exports = Router;
