import { CollectionResponsePublicTeamNoPaging } from '@hubspot/api-client/lib/codegen/settings/users/index.js';
import { updateTimeLine } from './hubspot.js';
export const sendSms = async (messaging, sender, text, to, campaign) => {
  const vonageNumber = { type: 'sms', number: 'test' };
  console.log('sending' + text);

  try {
    const response = await messaging
      .send({
        client_ref: campaign,
        message_type: 'text',
        to: to,
        from: sender ? sender : vonageNumber.number,
        channel: vonageNumber.type,
        text: text,
      })
      .execute();
    // const id = response.message_uuid;
    // await updateTimeLine(id);
    return response;
  } catch (e) {
    return new Error(e.response.data.detail);
  }
};
