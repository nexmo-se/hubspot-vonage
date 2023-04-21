import express from 'express';
const router = express.Router();
import { comesFromHubspot } from '../services/auth.js';
import { formatNumber } from '../utils.js';

export default function Router() {
  router.get('/', comesFromHubspot, async (req, res) => {
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

  return router;
}
