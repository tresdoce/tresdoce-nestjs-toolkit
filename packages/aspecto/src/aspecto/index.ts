import instrument from '@aspecto/opentelemetry';

export const aspectoInstrument = (config): void => {
  instrument({
    serviceName: `${config.project.name}`,
    aspectoAuth: `${config.aspecto.aspectoAuth}`,
    env: `${config.server.isProd ? 'production' : 'develop'}`,
    samplingRatio: config.aspecto.samplingRatio || 0.1,
  });
};
