import express from 'express';
const router = express.Router();
import { formatNumber } from '../utils.js';
import { getMessagesReport, getRecords } from '../services/reports.js';

export default function Router() {
  router.get('/', async (req, res) => {
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

  return router;
}
