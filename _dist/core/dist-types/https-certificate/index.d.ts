export declare const setHttpsOptions: (certPath: string, publicKeyPath: string) => {
    cert: NonSharedBuffer;
    key: NonSharedBuffer;
} | {
    cert: string;
    key: string;
};
