import { Client } from '@hubspot/api-client';
import axios from 'axios';
import { eventTemplateDef } from '../definitions/eventTemplatedefinition.js';
import { neru, State } from 'neru-alpha';

export const updateHubspotLastContacted = async (number, objectKey) => {
  try {
    console.log('instantiating hubspot');
    const hubspotClient = new Client();
    const token = await getToken();
    console.log(token);

    hubspotClient.setAccessToken(token);
    const id = await getContactByPhoneNumber(number, token);
    const updateResult = await hubspotClient.crm.contacts.basicApi.update(id, objectKey);
  } catch (e) {
    console.log(e);
    return e.message;
  }
};

const getContactByPhoneNumber = async (number, token) => {
  try {
    const response = await axios.get(`https://api.hubapi.com/contacts/v1/search/query?q=${number}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response && response.data.contacts.length) {
      return response.data.contacts[0].vid;
    }
  } catch (e) {
    console.log('error fetching contact');

    console.log(e.message);
    return e.message;
  }
};

const getToken = async () => {
  const hubspotClient = new Client();
  try {
    const results = await hubspotClient.oauth.tokensApi.createToken(
      'refresh_token',
      undefined,
      undefined,
      process.env.CLIENT_ID,
      process.env.signature,
      process.env.refresh_token
    );
    const token = results.accessToken;
    return token;
  } catch (e) {
    console.log(e);
    return e.message;
  }
};

export const createTemplateTimeLine = async () => {
  try {
    const hubspotClient = new Client({ accessToken: await getToken(), developerApiKey: process.env.hubspot_apikey });

    const resp = await hubspotClient.crm.timeline.templatesApi.create(process.env.appId, eventTemplateDef);
    if (resp.id) {
      const instanceState = neru.getInstanceState();
      await instanceState.set('templateId', resp.id);
    }
    return resp;
  } catch (e) {
    return e;
    console.log(e);
  }
};

export const createCrmCard = async (definition, type) => {
  try {
    const hubspotClient = new Client({ accessToken: await getToken(), developerApiKey: process.env.hubspot_apikey });
    const cardCreation = await hubspotClient.crm.extensions.cards.cardsApi.create(process.env.appId, definition);
    if (cardCreation.id) {
      const instanceState = neru.getInstanceState();
      await instanceState.set(type, cardCreation.id);
    }
  } catch (e) {
    console.log(`error creating ${type} card : ${e}`);
  }
};

export const updateTimeLine = async (id, from, smsContent, to, objectId, clientref) => {
  try {
    const hubspotClient = new Client();
    const token = await getToken();
    hubspotClient.setAccessToken(token);

    const instanceState = neru.getInstanceState();
    const templateId = await instanceState.get('templateId');
    console.log('template found ' + templateId);

    const timeLineEvent = {
      eventTemplateId: templateId,
      // eventTemplateId: '1223967',
      objectId: objectId,
      tokens: {
        smsContent: smsContent,
        from: from,
        tonumber: to,
        smsId: id,
        clientref: clientref || 'custom_message',
      },
    };

    const timeLine = await hubspotClient.crm.timeline.eventsApi.create(timeLineEvent);
    return timeLine;
  } catch (e) {
    console.log('error updating timeline');
    console.log(e.message);
    return e.message;
  }
};
