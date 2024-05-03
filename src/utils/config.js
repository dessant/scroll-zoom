const targetEnv = process.env.TARGET_ENV;

const enableContributions = process.env.ENABLE_CONTRIBUTIONS === 'true';

const storageRevisions = {local: process.env.STORAGE_REVISION_LOCAL};

const mv3 = process.env.MV3 === 'true';

export {targetEnv, enableContributions, storageRevisions, mv3};
