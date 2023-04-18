import express from 'express';
const router = express.Router();
import { basicAuth, comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
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
      console.log(JSON.stringify(req.body.object));

      const formattedData = [{ text, type, phone, to, id, campaign }];
      if (!text || !type || !phone || !to) {
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
      const { text, type, phone, to, id, campaign } = req.body;

      if (type === 'sms') {
        const resp = await sendSms(messaging, phone, text, to, campaign);
        console.log(resp);
        const message_id = resp.message_uuid;
        if (message_id && phone && text && to && id) await updateTimeLine(message_id, phone, text, to, id);
        res.sendStatus(200);
      }
    } catch (e) {
      console.log(e);
      res.status(200).send(e.message);
    }
  });

  return router;
}

// module.exports = Router;
