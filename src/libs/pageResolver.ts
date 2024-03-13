const pageOptions = {
  'uistatus.dol.state.nj.us': 'UI: Claim status',
  'PFL: Maternity timeline tool': 'maternity/timeline-tool',
  'PFL: What happens after I apply?':
    'myleavebenefits/worker/resources/claims-status.shtml',
  'PFL:Announcing a new way to log in':
    'myleavebenefits/worker/resources/login-update',
  'Basicneeds.nj.gov': 'transgender',
  'Transgender.nj.gov': 'basicneeds'
};

export const pageResolver = (pageURL: string): string => {
  const urlOptions = Object.values(pageOptions);
  for (const url of urlOptions) {
    if (pageURL.includes(url)) {
      return url;
    }
  }
  return pageURL;
};