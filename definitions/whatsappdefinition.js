export const waDefinition = {
  actionUrl: `https://${process.env.INSTANCE_SERVICE_NAME}.${
    process.env.REGION.split('.')[1]
  }.serverless.vonage.com/workflows?type=whatsapp`,
  published: true,
  inputFields: [
    {
      typeDefinition: {
        name: 'templatename',
        type: 'enumeration',
        fieldType: 'select',
        options: [],
        optionsUrl: `https://${process.env.INSTANCE_SERVICE_NAME}.${
          process.env.REGION.split('.')[1]
        }.serverless.vonage.com/templates-workflows`,
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
        name: 'bodyparams',
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
        name: 'staticInput5',
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
        name: 'URL',
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
        name: 'staticInput4',
        type: 'enumeration',
        fieldType: 'select',
        options: [
          {
            label: 'Image',
            value: 'IMAGE',
          },
          {
            label: 'Video',
            value: 'VIDEO',
          },
          {
            label: 'File',
            value: 'FILE',
          },
        ],
        optionsUrl: null,
        referencedObjectType: null,
        externalOptions: false,
        externalOptionsReferenceType: null,
      },
      supportedValueTypes: ['STATIC_VALUE'],
      isRequired: false,
      automationFieldType: null,
    },
  ],
  objectRequestOptions: {
    properties: ['phone'],
  },
  labels: {
    en: {
      inputFieldLabels: {
        templatename: 'Template name',
        bodyparams: 'Body Parameters',
        staticInput5: 'Header text parameter',
        URL: 'Header URL',
        staticInput4: 'Header URL type',
      },
      actionName: 'Send WA',
      actionDescription: 'Fill out the following fields',
      appDisplayName: 'Send WA',
      actionCardContent: 'Send WA',
    },
  },
  objectTypes: ['0-1'],
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
};
