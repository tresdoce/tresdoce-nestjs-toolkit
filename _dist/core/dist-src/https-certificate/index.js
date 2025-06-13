import fs from 'fs';
export const setHttpsOptions = (certPath, publicKeyPath) => {
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
