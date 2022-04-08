import fs from 'fs';

export const setHttpsOptions = (crPath, pkPath) => {
  if (fs.existsSync(crPath) && fs.existsSync(pkPath)) {
    return {
      cert: fs.readFileSync(crPath),
      key: fs.readFileSync(pkPath),
    };
  }

  return {
    cert: '',
    key: '',
  };
};
