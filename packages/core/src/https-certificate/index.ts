import fs from 'fs';

export const setHttpsOptions = (certPath: string, publicKeyPath: string) => {
  if (fs.existsSync(certPath) && fs.existsSync(publicKeyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(publicKeyPath),
    };
  }

  return {
    cert: '',
    key: '',
  };
};
