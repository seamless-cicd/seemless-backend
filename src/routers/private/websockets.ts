/* eslint-disable @typescript-eslint/ban-ts-comment */
import express, { Request, Response } from 'express';
import { webSocketsConnectionManager } from '../../utils/websockets';

const websocketsRouter = express.Router();

// `/connect` route activates upon new connections to Websockets API
websocketsRouter.post('/connect', async (req: Request, res: Response) => {
  const connectionId = req.body.connectionId;

  if (!connectionId) {
    throw new Error('No connection ID passed');
  }

  console.log(`Client with ${connectionId} connected to Websockets`);

  webSocketsConnectionManager.addConnection(connectionId);

  return res.sendStatus(200);
});

// `/disconnect` route activates when clients disconnect from Websockets API
websocketsRouter.delete('/disconnect', async (req: Request, res: Response) => {
  const connectionId = req.body.connectionId;

  if (!connectionId) {
    throw new Error('No connection ID passed');
  }

  console.log(`Client with ${connectionId} disconnected from Websockets`);

  webSocketsConnectionManager.deleteConnection(connectionId);

  return res.sendStatus(200);
});

// TEMPORARY: Route for posting messages to the client
websocketsRouter.post('/send-message', async (_: Request, res: Response) => {
  try {
    const data = {
      message: 'Hello world!',
    };

    webSocketsConnectionManager.postDataToConnections(data);
    console.log(`Messages to clients were sent.`);
    res.sendStatus(204);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default websocketsRouter;