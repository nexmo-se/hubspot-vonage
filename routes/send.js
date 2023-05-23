import express from 'express';
const router = express.Router();
import { comesFromHubspot } from '../services/auth.js';
import { formatNumber } from '../utils.js';
import { getContactByDealAssigned } from '../services/hubspot.js';

export default function Router() {
  router.get('/', comesFromHubspot, async (req, res) => {
    try {
      let phone = req.query?.phone;
      console.log(JSON.stringify(req.query));

      console.log('phone before assignemnt' + phone);

      const userId = req.query?.hs_object_id;
      const numberContact = await getContactByDealAssigned(userId);
      console.log('number contact :' + numberContact);

      if (!phone) phone = numberContact;
      console.log('phone: ' + phone);
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

  return router;
}
