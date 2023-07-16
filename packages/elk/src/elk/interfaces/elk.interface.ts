import { ClientOptions } from '@elastic/elasticsearch';
import { RedactOptions } from 'fast-redact';

export interface ElasticsearchOptions extends ClientOptions {
  indexDate?: boolean;
  redact?: RedactOptions;
}
