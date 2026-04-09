window.dataLayer = window.dataLayer || [];

export default (action: string, specifics: string): void => {
  dataLayer.push({
    event: 'fynch.event',
    action,
    specifics,
  });
  /* DEPRECATED: Will be removed in future versions */
  dataLayer.push({
    event: 'Fynch Event',
    action,
    specifics,
  });
};
