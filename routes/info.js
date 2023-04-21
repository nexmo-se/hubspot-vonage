import express from 'express';
const router = express.Router();

export default function Router() {
  router.get('/', async (req, res) => {
    res.send({
      results: [],
      primaryAction: {
        type: 'IFRAME',
        width: 890,
        height: 748,
        associatedObjectProperties: ['lastname', 'phone', 'hs_object_id'],
        uri: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/send`,
        label: 'Send message',
      },
    });
  });

  return router;
}
