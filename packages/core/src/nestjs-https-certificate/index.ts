import fs from 'fs';

export const readHttpsCertificate = (crPath, pkPath) => {
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
