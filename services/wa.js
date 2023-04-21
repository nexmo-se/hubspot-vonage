import { formatNumber } from '../utils.js';
export const sendWa = async (messaging, sender, to, components, name, language) => {
  const vonageNumber = { type: 'whatsapp', number: process.env.number };

  try {
    const custom = {
      message_type: 'custom',
      custom: {
        type: 'template',
        template: {
          name: name,
          language: {
            code: language,
            policy: 'deterministic',
          },
          components: components,
        },
      },
    };
    const response = await messaging
      .send({
        message_type: 'custom',
        to: to,
        from: sender ? sender : vonageNumber.number,
        channel: vonageNumber.type,
        ...custom,
      })
      .execute();
    return response;
  } catch (e) {
    console.log(e);
    // return new Error(e.response.data.detail);
  }
};

export const sendWaFreeForm = async (messaging, text, to, channel, sender) => {
  try {
    const vonageNumber = { type: channel, number: process.env.number };
    // console.log('sending ' + text + ' via ' + channel);
    const toFormatted = formatNumber(to);
    const response = await messaging
      .send({
        message_type: 'text',
        to: toFormatted,
        from: sender ? sender : vonageNumber.number,
        channel: vonageNumber.type,
        text: text,
      })
      .execute();
    console.log(response);

    return response;
  } catch (e) {
    console.log(e);
    const error = new Error(e.response.data.detail);
    res.status(500).json({ error: error.message });
  }
};
