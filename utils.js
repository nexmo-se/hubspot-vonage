import { DateTime } from 'luxon';

export const OneWeekAgo = () => {
  return `${DateTime.now().minus({ weeks: 1 }).toISO().split('.')[0]}Z`;
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const formatNumber = (number) => {
  if (!number.startsWith('+')) {
    return `34${number}`;
  } else {
    return number;
  }
};

export const getAuth = () => {
  return Buffer.from(`${process.env.apiKey}:${process.env.apiSecret}`).toString('base64');
};

export const getNumberParams = (text) => {
  return text.match(/[{{]/gi)?.length / 2 || undefined;
};

export const getHeaderUrl = (urlObject) => {
  if (urlObject?.type === 'IMAGE') {
    return {
      type: urlObject?.type?.toLowerCase(),
      image: {
        link: urlObject?.headerUrl,
      },
    };
  }
  if (urlObject?.type === 'DOCUMENT') {
    return {
      type: urlObject?.type?.toLowerCase(),
      document: {
        link: urlObject?.headerUrl,
      },
    };
  }
  if (urlObject?.type === 'VIDEO') {
    return {
      type: urlObject?.type?.toLowerCase(),
      video: {
        link: urlObject?.headerUrl,
      },
    };
  }
};

export const formatTemplate = (template) => {
  let headerParams, urlNeeded, headerText;
  try {
    const header = template.components.find((e) => e.type === 'HEADER');

    const headerNeedsInput =
      header?.format === 'TEXT' || header?.format === 'IMAGE' || header?.format === 'VIDEO' || header?.format === 'DOCUMENT';
    const templText = template.components.find((e) => e.type === 'BODY').text;
    if (headerNeedsInput) {
      if (header.format === 'TEXT') {
        headerText = header.text;
        headerParams = getNumberParams(header.text);
      } else urlNeeded = true;
    }
    return {
      templateText: templText,
      numberParams: getNumberParams(templText),
      headerParams: headerParams,
      urlNeeded: urlNeeded,
      headerType: header?.format,
      headerText: headerText,
    };
  } catch (e) {
    console.log(e);
  }
};
