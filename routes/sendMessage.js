import express from 'express';
const router = express.Router();
import { comesFromHubspot } from '../services/auth.js';
import { sendSms } from '../services/sms.js';
import { updateTimeLine } from '../services/hubspot.js';
import { sendWa, sendWaFreeForm } from '../services/wa.js';

export default function Router(messaging) {
  router.post('/', comesFromHubspot, async (req, res) => {
    try {
      const { text, to, channel, sender, userId } = req.body;
      const clientref = null;
      const campaign = null;
      const vonageNumber = { type: channel, number: process.env.number };
      if (channel === 'whatsapp') {
        const resp = await sendWaFreeForm(messaging, text, to, channel, sender);
        const id = resp.message_uuid;
        await updateTimeLine(id, 'WhatsApp_number', text, vonageNumber.number, userId, clientref);

        return res.json({ res: 'okay' });
      }
      console.log('sending ' + text + ' via ' + channel);
      const from = sender ? sender : vonageNumber.number;
      const response = await sendSms(messaging, from, text, to, campaign);
      const id = response.message_uuid;
      await updateTimeLine(id, from, text, to, userId, clientref);
      res.json({ res: 'okay' });
    } catch (e) {
      console.log(`error sending sms message: ${e}`);
      const error = new Error(e.response.data.detail);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
