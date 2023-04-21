import express from 'express';
const router = express.Router();
import { getTemplates } from '../services/templates.js';
import { formatTemplate } from '../utils.js';

export default function Router() {
  router.post('/', async (req, res) => {
    try {
      const templates = await getTemplates();
      const newTemplates = templates.map((template) => {
        const templateFormat = formatTemplate(template);

        const paramsObject = { params: [] };
        const numberParamsBody = templateFormat.numberParams || 0;
        for (let i = 1; i <= numberParamsBody; i++) {
          paramsObject.params.push(`{{${i}}}`);
        }
        return {
          name: `${template.name} (${template.language}) params:${paramsObject.params.length} ${
            templateFormat.headerType === 'IMAGE' || templateFormat.headerType === 'VIDEO' || templateFormat.headerType === 'FILE'
              ? `${templateFormat.headerType}_URL`
              : ''
          }`,
        };
      });
      const templatesForHubspot = newTemplates.map((e) => {
        return { label: e.name, description: e.name, value: e.name };
      });
      res.send({ options: templatesForHubspot, searchable: true });
    } catch (e) {
      res.status(500);
    }
  });

  return router;
}
