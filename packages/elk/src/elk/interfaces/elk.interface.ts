import type { ClientOptions } from '@elastic/elasticsearch';
import type { RedactOptions } from '@tresdoce-nestjs-toolkit/utils';

export interface ElasticsearchOptions extends ClientOptions {
  /** Agrega el sufijo `-yyyy.MM.dd` al nombre del índice. Default: `true`. */
  indexDate?: boolean;
  /** Opciones de ofuscación (RedactModule de utils) aplicadas al documento antes de indexarlo. */
  redact?: RedactOptions;
}
