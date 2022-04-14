import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { AMQP_CONSUMER_METADATA } from '../constants/amqp.constants';
import { ConsumerMetadata } from '../domain/consumer-metadata.domain';

@Injectable()
export class ConsumerExplorer {
  constructor(
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
    private readonly discoveryService: DiscoveryService,
  ) {}

  public explore(connectionToken: string): Array<ConsumerMetadata> {
    const providers = this.discoveryService
      .getProviders()
      .filter(({ metatype }) => metatype)
      .filter(({ instance }) => instance);
    return providers
      .map(({ instance }) => {
        const instancePrototype = Object.getPrototypeOf(instance);
        return this.metadataScanner.scanFromPrototype(instance, instancePrototype, (method) =>
          this.exploreMethodMetadata(instancePrototype, method, connectionToken),
        );
      })
      .reduce((previous, current) => {
        return previous.concat(current);
      });
  }

  private exploreMethodMetadata(
    instancePrototype: unknown,
    method: string,
    connectionToken: string,
  ): ConsumerMetadata {
    const targetCallback = instancePrototype[method];
    const metadata = this.reflector.get<ConsumerMetadata>(AMQP_CONSUMER_METADATA, targetCallback);
    return metadata?.connectionToken === connectionToken ? metadata : null;
  }
}
