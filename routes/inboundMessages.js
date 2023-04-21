import express from 'express';
const router = express.Router();
import { updateHubspotLastContacted } from '../services/hubspot.js';

export default function Router() {
  router.post('/', async (req, res) => {
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

  return router;
}
