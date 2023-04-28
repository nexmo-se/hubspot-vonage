export const conversationHistory = {
  title: 'Conversation History',
  fetch: {
    targetUrl: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/history`,
    objectTypes: [
      {
        name: 'contacts',
        propertiesToSend: ['phone', 'mobilephone'],
      },
    ],
  },
  display: {
    properties: [
      {
        name: 'message_body',
        label: 'Message',
        dataType: 'STRING',
        options: [],
      },
      {
        name: 'from',
        label: 'from',
        dataType: 'STRING',
        options: [],
      },
      {
        name: 'to',
        label: 'to',
        dataType: 'STRING',
        options: [],
      },
      {
        name: 'created',
        label: 'Date',
        dataType: 'STRING',
        options: [],
      },
    ],
  },
  actions: {
    baseUrls: [],
  },
};
