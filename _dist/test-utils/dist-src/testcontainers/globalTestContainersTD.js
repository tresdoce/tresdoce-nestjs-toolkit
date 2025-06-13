import { DockerComposeEnvironment } from 'testcontainers';
import _ from 'lodash';
let environment;
export const initDockerCompose = (_services, _composeFilePath = '.', _composeFile = 'docker-compose.yml', _startupTimeout = 60000) => {
    return async () => {
        console.info(`🐳 Initialize docker-compose...`);
        if (_.isEmpty(_services)) {
            console.log(`• All services from ${_composeFile}`);
        }
        else {
            console.log(`• Services from ${_composeFile}: ${_services.join(', ')}`);
        }
        try {
            environment = await new DockerComposeEnvironment(_composeFilePath, _composeFile)
                .withStartupTimeout(_startupTimeout)
                .up(_services);
            global.__TESTCONTAINERS__ = environment;
            console.info(`✨ Container(s) initialized.`);
            return environment;
        }
        catch (_error) {
            /* istanbul ignore next */
            console.error(`😰 Error initializing container(s): ${_error}`);
        }
    };
};
export const closeDockerCompose = (_options) => {
    return async () => {
        console.info('🐳 Terminate docker-compose...');
        try {
            await environment.down(_options);
            console.info(`👌 Container(s) stopped successfully.`);
        }
        catch (_error) {
            /* istanbul ignore next */
            console.error(`😒 Container(s) not initialized.`);
        }
    };
};
