export const sendSmsCard = {
  title: 'Send SMS',
  fetch: {
    targetUrl: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/info`,
    objectTypes: [
      {
        name: 'contacts',
        propertiesToSend: ['hs_object_id', 'phone', 'lastname', 'mobilephone'],
      },
    ],
  },
  display: {
    properties: [],
  },
  actions: {
    baseUrls: [],
  },
};
