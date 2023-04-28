export const smsDefinition = {
  actionUrl: `https://${process.env.INSTANCE_SERVICE_NAME}.${process.env.REGION.split('.')[1]}.serverless.vonage.com/workflows?type=sms`,
  objectTypes: ['CONTACT'],
  published: 'true',
  inputFields: [
    {
      typeDefinition: {
        name: 'staticInput2',
        type: 'string',
        fieldType: 'text',
        options: [],
        optionsUrl: null,
        referencedObjectType: null,
        externalOptions: false,
        externalOptionsReferenceType: null,
      },
      supportedValueTypes: ['STATIC_VALUE'],
      isRequired: false,
      automationFieldType: null,
    },
    {
      typeDefinition: {
        name: 'staticInput3',
        type: 'string',
        fieldType: 'text',
        options: [],
        optionsUrl: null,
        referencedObjectType: null,
        externalOptions: false,
        externalOptionsReferenceType: null,
      },
      supportedValueTypes: ['STATIC_VALUE'],
      isRequired: false,
      automationFieldType: null,
    },
    {
      typeDefinition: {
        name: 'staticInput',
        type: 'string',
        fieldType: 'text',
        options: [],
        optionsUrl: null,
        referencedObjectType: null,
        externalOptions: false,
        externalOptionsReferenceType: null,
      },
      supportedValueTypes: ['STATIC_VALUE'],
      isRequired: true,
      automationFieldType: null,
    },
  ],
  outputFields: [
    {
      typeDefinition: {
        name: 'myOutput',
        type: 'string',
        fieldType: 'text',
        options: [],
        optionsUrl: null,
        referencedObjectType: null,
        externalOptions: false,
        externalOptionsReferenceType: null,
      },
    },
  ],
  objectRequestOptions: {
    properties: ['phone'],
  },
  labels: {
    en: {
      inputFieldLabels: {
        staticInput2: 'Sender Id (From)',
        staticInput3: 'Campaign name',
        staticInput: 'Text',
      },
      actionName: 'Send SMS',
      actionDescription: 'Fill out the following fields',
      appDisplayName: 'Send SMS',
      actionCardContent: 'Send SMS',
    },
  },
};
