import { Client } from '@hubspot/api-client';

import axios from 'axios';

export const updateHubspotLastContacted = async (number, objectKey) => {
  try {
    console.log('instantiating hubspot');
    const hubspotClient = new Client();
    const token = await getToken();
    hubspotClient.setAccessToken(token);
    const id = await getContactByPhoneNumber(number, token);

    console.log('updating ' + id);
    //   const id = result.results[0].id;
    const updateResult = await hubspotClient.crm.contacts.basicApi.update(
      id,
      objectKey
      // properties: {
      //   replied: timestamp,
      // },
    );
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

export const updateTimeLine = async (id, from, smsContent, to, objectId, timestamp) => {
  try {
    const hubspotClient = new Client();
    const token = await getToken();
    hubspotClient.setAccessToken(token);
    const timeLineEvent = {
      eventTemplateId: '1223967',
      objectId: objectId,
      tokens: {
        smsContent: smsContent,
        from: from,
        tonumber: to,
        smsId: id,
        timestamp: timestamp,
      },
    };
    //   const TimelineEvent = { eventTemplateId: "1123354", email: "test@gmail.com", tokens, extraData, timelineIFrame };
    const timeLine = await hubspotClient.crm.timeline.eventsApi.create(timeLineEvent);
    console.log(timeLine);
    return timeLine;
  } catch (e) {
    console.log('error updating timeline');
    console.log(e.message);

    return e.message;
  }
};
