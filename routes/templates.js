import express from 'express';
const router = express.Router();
import { getTemplates } from '../services/templates.js';

export default function Router() {
  router.get('/', async (req, res) => {
    try {
      const templates = await getTemplates();
      res.send(templates);
    } catch (e) {
      res.status(500);
    }
  });

  return router;
}
