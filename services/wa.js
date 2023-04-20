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
