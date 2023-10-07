import { Provider } from "@nestjs/common";
import * as client from "prom-client";
import { PROMETHEUS_OPTIONS } from "../constants/promethes.constant";
import { PrometheusOptions } from "../interfaces/prometheus.interface";
import { getOrCreateMetric, getToken } from "./utils";

/**
 * @public
 */
export function makeSummaryProvider(
  options: client.SummaryConfiguration<string>,
): Provider {
  return {
    provide: getToken(options.name),
    useFactory(config?: PrometheusOptions): client.Metric<string> {
      return getOrCreateMetric("Summary", options, config);
    },
    inject: [
      {
        token: PROMETHEUS_OPTIONS,
        optional: true,
      },
    ],
  };
}
