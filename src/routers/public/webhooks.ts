import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
config();
// PAT for testing if you don't want to use submitted PAT from form
// const PAT = process.env.PAT
const NGROK = process.env.NGROK;

const webhooksRouter = express.Router();

webhooksRouter.post('', async (req: Request, res: Response) => {
  console.log(NGROK);
  const event = req.headers['x-github-event'];
  const { ref, action } = req.body;
  console.log(event);
  console.log(ref);
  console.log(action);

  if (event === 'push' && /\/main$/.test(ref)) {
    console.log('push on main => trigger pipeline actions');
  }

  if (event === 'pull_request' && action === 'opened') {
    console.log('open pr => trigger pipeline');
  }

  if (event === 'pull_request' && action === 'synchronize') {
    console.log('sync pr => trigger pipeline');
  }

  res.status(200).send();
});

webhooksRouter.post('/create', async (req: Request, res: Response) => {
  const {
    triggerOnMain,
    triggerOnPrSync,
    triggerOnPrOpen,
    githubPat,
    githubRepoUrl,
  } = req.body;
  const urlSections = githubRepoUrl.split('/');
  const owner = urlSections[urlSections.length - 2];
  const repo = urlSections[urlSections.length - 1];
  const events = [];

  if (triggerOnMain) {
    events.push('push');
  }
  if (triggerOnPrOpen || triggerOnPrSync) {
    events.push('pull_request');
  }

  const octokit = new Octokit({
    auth: githubPat,
  });

  // URL will eventually have to be updated to that of user
  const { data } = await octokit.request('POST /repos/{owner}/{repo}/hooks', {
    owner: owner,
    repo: repo,
    name: 'web', // this is default to create webhook
    active: true,
    events: events,
    config: {
      url: NGROK + '/api/webhooks', // url to deliver payloads so can ngrok
      content_type: 'json',
      insecure_ssl: '0',
    },
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  
  res.status(200).json(data);
});


webhooksRouter.patch('/patch', async (req: Request, res: Response) => {
  const { 
    triggerOnMain, triggerOnPrSync, triggerOnPrOpen, githubPat, githubRepoUrl
  } = req.body;
  const urlSections = githubRepoUrl.split('/');
  const owner = urlSections[urlSections.length - 2];
  const repo = urlSections[urlSections.length - 1];
  const events = [];

  if (triggerOnMain) {
    events.push('push');
  }
  if (triggerOnPrOpen || triggerOnPrSync) {
    events.push('pull_request');
  }
  
  const octokit = new Octokit({
    auth: githubPat,
  });

  // first find the existing webhooks - necessary to find the one that needs patching
  const webhooks = await octokit.request('GET /repos/{owner}/{repo}/hooks', {
    owner: owner,
    repo: repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  // filter based off of the webhook with defined endpoint here
  const webhook = webhooks.data.filter(webhook => {
    return webhook.config.url === (NGROK + '/api/webhooks');
  });
  // save id
  const webhookId = webhook[0].id

  // patch it here with octokit - hook_id is what determines the hook
  const { data } = await octokit.request('PATCH /repos/{owner}/{repo}/hooks/{hook_id}', {
    owner: owner,
    repo: repo,
    hook_id: webhookId,
    name: 'web', // this is default to create webhook
    active: true,
    events: events,
    config: {
      url: NGROK + '/api/webhooks', // url to deliver payloads so can ngrok
      content_type: 'json',
      insecure_ssl: '0'
    },
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  res.status(200).json(data);
});

export default webhooksRouter;
