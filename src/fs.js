const efs = require('fs-extra');

const alias = {
  mkpath: efs.mkdirp,
  mkpathSync: efs.mkdirpSync
};

const keys = [].concat(Object.keys(efs), Object.keys(alias)).filter(key => !key.match(/Sync/));

keys.forEach((key) => {
  const originMethod = efs[key] || alias[key];
  const originMethodSync = efs[`${key}Sync`] || alias[key];
  if (key.substr(0, 1).toLowerCase() !== key.substr(0, 1) || key.startsWith('_') || typeof originMethod !== 'function') {
    module.exports[key] = originMethod;
    return;
  }
  const methods = {
    [key]: (...props) => new Promise((rec, rej) => {
      originMethod(...props, (error, data) => {
        if (error) {
          rej(error);
          return;
        }
        rec(data);
      });
    })
  };

  module.exports[key] = methods[`${key}Sync`];
  if (originMethodSync) {
    module.exports[`${key}Sync`] = originMethodSync;
  }
  module.exports[`${key}Async`] = originMethod;
});
