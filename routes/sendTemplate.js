import express from 'express';
const router = express.Router();
import { comesFromHubspot } from '../services/auth.js';
import { isEmpty, getHeaderUrl } from '../utils.js';
import { sendWa } from '../services/wa.js';

export default function Router(messaging) {
  router.post('/', comesFromHubspot, async (req, res) => {
    try {
      const { params: parameters, to, name, urlObject, headerParameters, language } = req.body;
      if (!to || !name || !language) {
        return res.sendStatus(500);
      }
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
      const resp = sendWa(messaging, process.env.number, to, components, name, language);
      res.json({ res: 'okay' });
    } catch (e) {
      console.log('error sending template');
      console.log(e.message);
    }
  });

  return router;
}
