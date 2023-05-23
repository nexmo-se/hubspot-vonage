import express from 'express';
const router = express.Router();

export default function Router(session, neru, Queue) {
  router.post('/create', async (req, res) => {
    const session = neru.createSession();
    const queueApi = new Queue(session);

    try {
      await queueApi
        .createQueue('hubspot', '/workflows/consumer', {
          maxInflight: 200,
          msgPerSecond: 29,
          active: true,
        })
        .execute();

      res.sendStatus(201);
    } catch (e) {
      console.log(e.message);
      res.status(500).send(e.message);
    }
  });
  router.get('/queue', async (req, res) => {
    const session = neru.createSession();
    const queueApi = new Queue(session);
    const result = await queueApi.getQueueDetails('hubspot').execute();
    res.send(result);
  });
  router.get('/list', async (req, res) => {
    const session = neru.createSession();
    const queueApi = new Queue(session);

    const result = await queueApi.list().execute();

    res.send(result);
  });

  router.delete('/:name', async (req, res) => {
    const name = req.params.name;
    const session = neru.createSession();
    const queueApi = new Queue(session);
    await queueApi.deleteQueue(name).execute();
    res.sendStatus(200);
  });

  return router;
}

// module.exports = Router;
