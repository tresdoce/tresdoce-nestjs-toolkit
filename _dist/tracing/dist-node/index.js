'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var utils = require('@tresdoce-nestjs-toolkit/utils');
var api = require('@opentelemetry/api');
var core = require('@tresdoce-nestjs-toolkit/core');
var core$1 = require('@nestjs/core');
var config = require('@nestjs/config');
var rxjs = require('rxjs');
var _ = _interopDefault(require('lodash'));
var exporterTraceOtlpProto = require('@opentelemetry/exporter-trace-otlp-proto');
var sdkTraceBase = require('@opentelemetry/sdk-trace-base');
var sdkNode = require('@opentelemetry/sdk-node');
var resources = require('@opentelemetry/resources');
var semanticConventions = require('@opentelemetry/semantic-conventions');
var idGeneratorAwsXray = require('@opentelemetry/id-generator-aws-xray');
var core$2 = require('@opentelemetry/core');
var propagatorJaeger = require('@opentelemetry/propagator-jaeger');
var propagatorAwsXray = require('@opentelemetry/propagator-aws-xray');
var propagatorB3 = require('@opentelemetry/propagator-b3');
var instrumentationHttp = require('@opentelemetry/instrumentation-http');
var minimatch = require('minimatch');

function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

/** SPAN_KIND hints at relationship between spans, e.g. client/server */
const SPAN_KIND = 'span.kind';
/** Marks a span representing the client-side of an RPC or other remote call */
const SPAN_KIND_RPC_CLIENT = 'client';
/** Marks a span representing the server-side of an RPC or other remote call */
const SPAN_KIND_RPC_SERVER = 'server';
/** Marks a span representing the producing-side within a messaging system or other remote call */
const SPAN_KIND_MESSAGING_PRODUCER = 'producer';
/** Marks a span representing the consuming-side within a messaging system or other remote call */
const SPAN_KIND_MESSAGING_CONSUMER = 'consumer';
/**
 * ERROR (boolean) true if and only if the application considers the operation
 * represented by the Span to have failed
 */
const ERROR = 'error';
/**
 * COMPONENT (string) ia s low-cardinality identifier of the module, library,
 * or package that is generating a span.
 */
const COMPONENT = 'component';
/**
 * SAMPLING_PRIORITY (number) determines the priority of sampling this Span.
 * If greater than 0, a hint to the Tracer to do its best to capture the trace.
 * If 0, a hint to the trace to not-capture the trace. If absent, the Tracer
 * should use its default sampling mechanism.
 */
const SAMPLING_PRIORITY = 'sampling.priority';
/**
 * Timestamp of request
 */
const TIMESTAMP = 'timestamp';
/**
 * Start time of request
 */
const TIME_START = 'time.start';
/**
 * End time of request
 */
const TIME_END = 'time.end';
/**
 * Duration of request
 */
const TIME_DURATION = 'time.duration';
// ---------------------------------------------------------------------------
// PEER_* tags can be emitted by either client-side of server-side to describe
// the other side/service in a peer-to-peer communications, like an RPC call.
// ---------------------------------------------------------------------------
/**
 * PEER_SERVICE (string) Remote service name (for some unspecified
 * definition of "service"). E.g., "elasticsearch", "a_custom_microservice", "memcache"
 */
const PEER_SERVICE = 'peer.service';
/** PEER_HOSTNAME (string) Remote hostname. E.g., "opentracing.io", "internal.dns.name" */
const PEER_HOSTNAME = 'peer.hostname';
/**
 * PEER_ADDRESS (string) Remote "address", suitable for use in a
 * networking client library. This may be a "ip:port", a bare
 * "hostname", a FQDN, or even a JDBC substring like "mysql://prod-db:3306"
 */
const PEER_ADDRESS = 'peer.address';
/**
 * PEER_HOST_IPV4 (number) Remote IPv4 address as a .-separated tuple.
 * E.g., "127.0.0.1"
 */
const PEER_HOST_IPV4 = 'peer.ipv4';
// PEER_HOST_IPV6 (string) Remote IPv6 address as a string of
// colon-separated 4-char hex tuples. E.g., "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
const PEER_HOST_IPV6 = 'peer.ipv6';
// PEER_PORT (number) Remote port. E.g., 80
const PEER_PORT = 'peer.port';
// ---------------------------------------------------------------------------
// HTTP tags
// ---------------------------------------------------------------------------
/**
 * HTTP_OPERATION (string) HTTP operation of the request for the associated Span. E.g.,
 * "http:AppController:getMyUtil"
 */
const HTTP_OPERATION = 'http.operation';
/**
 * HTTP_CONTROLLER (string) HTTP controller of the request for the associated Span. E.g.,
 * "AppController"
 */
const HTTP_CONTROLLER = 'http.controller';
/**
 * HTTP_HANDLER (string) HTTP handler of the request for the associated Span. E.g.,
 * "getHello"
 */
const HTTP_HANDLER = 'http.handler';
/**
 * HTTP_URL (string) URL of the request being handled in this segment of the
 * trace, in standard URI format. E.g., "https://domain.net/path/to?resource=here"
 */
const HTTP_URL = 'http.url';
/**
 * HTTP_METHOD (string) HTTP method of the request for the associated Span. E.g.,
 * "GET", "POST"
 */
const HTTP_METHOD = 'http.method';
/**
 * HTTP_STATUS_CODE (number) HTTP response status code for the associated Span.
 * E.g., 200, 503, 404
 */
const HTTP_STATUS_CODE = 'http.status_code';
// -------------------------------------------------------------------------
// Messaging tags
// -------------------------------------------------------------------------
/**
 * MESSAGE_BUS_DESTINATION (string) An address at which messages can be exchanged.
 * E.g. A Kafka record has an associated "topic name" that can be extracted
 * by the instrumented producer or consumer and stored using this tag.
 */
const MESSAGE_BUS_DESTINATION = 'message_bus.destination';
// --------------------------------------------------------------------------
// Database tags
// --------------------------------------------------------------------------
/**
 * DB_INSTANCE (string) Database instance name. E.g., In java, if the
 * jdbc.url="jdbc:mysql://127.0.0.1:3306/customers", the instance name is "customers".
 */
const DB_INSTANCE = 'db.instance';
/**
 * DB_STATEMENT (string) A database statement for the given database type.
 * E.g., for db.type="SQL", "SELECT * FROM wuser_table";
 * for db.type="redis", "SET mykey 'WuValue'".
 */
const DB_STATEMENT = 'db.statement';
/**
 * DB_TYPE (string) Database type. For any SQL database, "sql". For others,
 * the lower-case database category, e.g. "cassandra", "hbase", or "redis".
 */
const DB_TYPE = 'db.type';
/**
 * DB_USER (string) Username for accessing database. E.g., "readonly_user"
 * or "reporting_user"
 */
const DB_USER = 'db.user';

var Tags = /*#__PURE__*/Object.freeze({
  __proto__: null,
  SPAN_KIND: SPAN_KIND,
  SPAN_KIND_RPC_CLIENT: SPAN_KIND_RPC_CLIENT,
  SPAN_KIND_RPC_SERVER: SPAN_KIND_RPC_SERVER,
  SPAN_KIND_MESSAGING_PRODUCER: SPAN_KIND_MESSAGING_PRODUCER,
  SPAN_KIND_MESSAGING_CONSUMER: SPAN_KIND_MESSAGING_CONSUMER,
  ERROR: ERROR,
  COMPONENT: COMPONENT,
  SAMPLING_PRIORITY: SAMPLING_PRIORITY,
  TIMESTAMP: TIMESTAMP,
  TIME_START: TIME_START,
  TIME_END: TIME_END,
  TIME_DURATION: TIME_DURATION,
  PEER_SERVICE: PEER_SERVICE,
  PEER_HOSTNAME: PEER_HOSTNAME,
  PEER_ADDRESS: PEER_ADDRESS,
  PEER_HOST_IPV4: PEER_HOST_IPV4,
  PEER_HOST_IPV6: PEER_HOST_IPV6,
  PEER_PORT: PEER_PORT,
  HTTP_OPERATION: HTTP_OPERATION,
  HTTP_CONTROLLER: HTTP_CONTROLLER,
  HTTP_HANDLER: HTTP_HANDLER,
  HTTP_URL: HTTP_URL,
  HTTP_METHOD: HTTP_METHOD,
  HTTP_STATUS_CODE: HTTP_STATUS_CODE,
  MESSAGE_BUS_DESTINATION: MESSAGE_BUS_DESTINATION,
  DB_INSTANCE: DB_INSTANCE,
  DB_STATEMENT: DB_STATEMENT,
  DB_TYPE: DB_TYPE,
  DB_USER: DB_USER
});

const defaultExcludePaths = core.excludePaths();
const REQUEST_RECEIVED = 'REQUEST_RECEIVED';
const RESPONSE_RECEIVED = 'RESPONSE_RECEIVED';
const SKIP_TRACE = 'SKIP_TRACE';
const TAGS = _objectSpread2(_objectSpread2({}, Tags), {}, {
  PROTOCAL: 'protocal',
  TRACING_TAG: 'tracing-tag'
});
const DEFAULT_IGNORE_PATHS = [...core.corePathsExcludesGlobs, '**/docs', '**/docs/*', '**/docs/**'];

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
exports.TracingService = class TracingService {
  constructor(formatService) {
    this.formatService = formatService;
  }
  generateDuration(_timestamp_start, _timestamp_end) {
    return this.formatService.calculateTimestampDiff({
      startTime: _timestamp_start,
      endTime: _timestamp_end,
      options: {
        addSuffix: true
      }
    });
  }
  formatDate(_timestamp) {
    return this.formatService.formatDate({
      date: new Date(_timestamp)
    });
  }
  getTracer() {
    return api.trace.getTracer('default');
  }
  startSpan(_name, _options) {
    return this.getTracer().startSpan(_name, _options);
  }
  extractSpanFromHeaders(_headers) {
    return api.propagation.extract(api.context.active(), _headers);
  }
  setSpanContext(_headers) {
    api.propagation.inject(api.context.active(), _headers);
    this.spanContext = this.extractSpanFromHeaders(_headers);
  }
  getParentSpanOptions(_headers) {
    const spanContext = this.extractSpanFromHeaders(_headers);
    /* istanbul ignore next */
    return spanContext ? {
      childOf: spanContext
    } : {};
  }
  startActiveSpan(_name, _options) {
    return this.startSpan(_name, _options);
  }
  propagateSpanContext(_headers) {
    api.propagation.inject(api.context.active(), _headers);
  }
  setSpanTags(_span, _headers) {
    let tracing_tag;
    if (_headers && _headers[TAGS.TRACING_TAG]) {
      tracing_tag = _headers;
      Object.keys(tracing_tag).forEach(_key => {
        _span.setAttribute(_key, `${tracing_tag[_key]}`);
      });
    }
  }
};
exports.TracingService = __decorate([common.Injectable(), __param(0, common.Inject(utils.FormatService)), __metadata("design:paramtypes", [utils.FormatService])], exports.TracingService);

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
exports.TracingInterceptor = class TracingInterceptor {
  constructor(tracingService, configService) {
    this.tracingService = tracingService;
    this.configService = configService;
    this.reflector = new core$1.Reflector();
  }
  intercept(_context, _next) {
    const appContext = this.configService.get('config.server.context');
    const excludePaths = _.map(defaultExcludePaths, _item => `/${appContext}${_item}`);
    const timeRequest = Date.now();
    const skipTrace = this.reflector.get(SKIP_TRACE, _context.getHandler());
    if (skipTrace) return _next.handle();
    const contextType = _context.getType();
    const controller = _context.getClass().name;
    const handler = _context.getHandler().name;
    const operation = [contextType, controller, handler].join(':');
    this.ctx = _context.switchToHttp();
    this.request = this.ctx.getRequest();
    this.response = this.ctx.getResponse();
    /* istanbul ignore next */
    if (excludePaths.includes(this.request.path)) return _next.handle();
    /* istanbul ignore next */
    this.url = this.request.path === '/' ? `${this.request.headers.host}` : `${this.request.path}`;
    const parentSpanContext = this.tracingService.getParentSpanOptions(this.request.headers);
    this.span = this.tracingService.startActiveSpan(this.url, parentSpanContext);
    this.span.setAttributes({
      [TIMESTAMP]: timeRequest,
      [TIME_START]: this.tracingService.formatDate(timeRequest),
      [HTTP_OPERATION]: operation,
      [HTTP_CONTROLLER]: controller,
      [HTTP_HANDLER]: handler,
      [COMPONENT]: contextType,
      [SPAN_KIND]: SPAN_KIND_MESSAGING_PRODUCER,
      [HTTP_METHOD]: this.request.method,
      [HTTP_URL]: this.url
    });
    this.span.addEvent(REQUEST_RECEIVED);
    const responseHeaders = {};
    this.tracingService.setSpanContext(responseHeaders);
    this.response.set(responseHeaders);
    Object.assign(this.request, {
      span: this.span
    });
    /* istanbul ignore next */
    if (!this.span) return _next.handle();
    this.tracingService.propagateSpanContext(this.request.headers);
    this.tracingService.setSpanTags(this.span, this.request.headers);
    this.tracingService.setSpanContext(this.request.headers);
    return _next.handle().pipe(rxjs.tap(() => {
      this.span.setAttributes({
        [HTTP_STATUS_CODE]: this.response.statusCode,
        [TIME_END]: this.tracingService.formatDate(Date.now()),
        [TIME_DURATION]: this.tracingService.generateDuration(timeRequest, Date.now())
      });
      this.span.addEvent(RESPONSE_RECEIVED);
      this.span.end();
    }));
  }
};
exports.TracingInterceptor = __decorate$1([common.Injectable({
  scope: common.Scope.REQUEST
}), __metadata$1("design:paramtypes", [exports.TracingService, config.ConfigService])], exports.TracingInterceptor);

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.TracingModule = class TracingModule {};
exports.TracingModule = __decorate$2([common.Global(), common.Module({
  providers: [exports.TracingService, exports.TracingInterceptor, utils.FormatService],
  exports: [exports.TracingService, exports.TracingInterceptor]
})], exports.TracingModule);

const SkipTrace = () => common.SetMetadata(SKIP_TRACE, true);

const otelProvider = _options => {
  try {
    const {
      exporter,
      resourceAttributes,
      httpInstrumentation = {
        requireParentforIncomingSpans: false
      },
      ignorePaths = []
    } = _options;
    const ignorePathsToTracing = _.union(DEFAULT_IGNORE_PATHS, ignorePaths);
    const traceExporter = new exporterTraceOtlpProto.OTLPTraceExporter(_objectSpread2({}, exporter));
    const spanProcessor = new sdkTraceBase.BatchSpanProcessor(traceExporter);
    const resource = resources.resourceFromAttributes(_objectSpread2({
      [semanticConventions.ATTR_SERVICE_NAME]: resourceAttributes.serviceName,
      [semanticConventions.ATTR_SERVICE_VERSION]: resourceAttributes.version
    }, resourceAttributes));
    new sdkNode.NodeSDK({
      resource,
      idGenerator: new idGeneratorAwsXray.AWSXRayIdGenerator(),
      spanProcessors: [spanProcessor],
      textMapPropagator: new core$2.CompositePropagator({
        propagators: [new propagatorAwsXray.AWSXRayPropagator(), new propagatorJaeger.JaegerPropagator(), new core$2.W3CTraceContextPropagator(), new core$2.W3CBaggagePropagator(), new propagatorB3.B3Propagator(), new propagatorB3.B3Propagator({
          injectEncoding: propagatorB3.B3InjectEncoding.MULTI_HEADER
        })]
      }),
      instrumentations: [new instrumentationHttp.HttpInstrumentation(_objectSpread2({
        /* istanbul ignore next */
        ignoreIncomingRequestHook(req) {
          /* istanbul ignore next */
          return ignorePathsToTracing.some(ignorePath => minimatch.minimatch(req.url, ignorePath));
        }
      }, httpInstrumentation))]
    }).start();
    common.Logger.log('Creating OpenTelemetry provider successfully!', 'TracingModule');
  } catch (_error) {
    /* istanbul ignore next */
    common.Logger.error('Error creating OpenTelemetry provider: ', _error, 'TracingModule');
  }
};

exports.SkipTrace = SkipTrace;
exports.otelProvider = otelProvider;
//# sourceMappingURL=index.js.map
