'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var _ = _interopDefault(require('lodash'));
var nodemailer = require('nodemailer');
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var path__default = _interopDefault(path);
var cssInline = require('@css-inline/css-inline');
var handlebars = require('handlebars');
var glob = require('glob');
var pug = require('pug');

const MAILER_OPTIONS = 'MAILER_OPTIONS';
const MAILER_TRANSPORT_FACTORY = 'MAILER_TRANSPORT_FACTORY';
const defaultTransportOptions = {
  secure: true,
  requireTLS: true
};

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
let MailerTransportFactory = class MailerTransportFactory {
  constructor(options) {
    this.options = options;
  }
  createTransport(opts) {
    return nodemailer.createTransport(opts || this.options.transport, this.options.defaults);
  }
};
MailerTransportFactory = __decorate([__param(0, common.Inject(MAILER_OPTIONS)), __metadata("design:paramtypes", [Object])], MailerTransportFactory);

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
var __param$1 = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
exports.MailerService = class MailerService {
  constructor(mailerOptions, transportFactory) {
    this.mailerOptions = mailerOptions;
    this.transportFactory = transportFactory;
    this.transporters = new Map();
    if (!transportFactory) {
      this.transportFactory = new MailerTransportFactory(mailerOptions);
    }
    if ((!mailerOptions.transport || Object.keys(mailerOptions.transport).length <= 0) && !mailerOptions.transports) {
      throw new Error('Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.');
    }
    /** Adapter setup **/
    const templateAdapter = _.get(this.mailerOptions, 'template.adapter');
    /** Transporters setup **/
    if (mailerOptions.transports) {
      Object.keys(mailerOptions.transports).forEach(name => {
        this.transporters.set(name, this.transportFactory.createTransport(this.mailerOptions.transports[name]));
        this.initTemplateAdapter(templateAdapter, this.transporters.get(name));
      });
    }
    /** Transporter setup **/
    if (mailerOptions.transport) {
      this.transporter = this.transportFactory.createTransport();
      this.initTemplateAdapter(templateAdapter, this.transporter);
    }
  }
  initTemplateAdapter(templateAdapter, transporter) {
    if (templateAdapter) {
      transporter.use('compile', (mail, callback) => {
        /* istanbul ignore next */
        if (mail.data.html) {
          return callback();
        }
        return templateAdapter.compile(mail, callback, this.mailerOptions);
      });
    }
  }
  async sendMail(sendMailOptions) {
    if (sendMailOptions.transporterName) {
      var _this$transporters;
      if ((_this$transporters = this.transporters) !== null && _this$transporters !== void 0 && _this$transporters.get(sendMailOptions.transporterName)) {
        return this.transporters.get(sendMailOptions.transporterName).sendMail(sendMailOptions);
      } else {
        throw new ReferenceError(`Transporters object doesn't have ${sendMailOptions.transporterName} key`);
      }
    } else {
      if (this.transporter) {
        return this.transporter.sendMail(sendMailOptions);
      } else {
        throw new ReferenceError(`Transporter object undefined`);
      }
    }
  }
};
exports.MailerService = __decorate$1([common.Injectable(), __param$1(0, common.Inject(MAILER_OPTIONS)), __param$1(1, common.Optional()), __param$1(1, common.Inject(MAILER_TRANSPORT_FACTORY)), __metadata$1("design:paramtypes", [Object, Object])], exports.MailerService);

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailerModule_1;
exports.MailerModule = MailerModule_1 = class MailerModule {
  static forRoot(options) {
    return {
      global: true,
      module: MailerModule_1,
      providers: [exports.MailerService, {
        provide: MAILER_OPTIONS,
        useValue: options
      }],
      exports: [exports.MailerService]
    };
  }
};
exports.MailerModule = MailerModule_1 = __decorate$2([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [exports.MailerService, {
    provide: MAILER_OPTIONS,
    useFactory: async configService => configService.get('config.mailer'),
    inject: [config.ConfigService]
  }],
  exports: [exports.MailerService]
})], exports.MailerModule);

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

const getTemplatePath = (template, options, extension, templatePath = 'template.dir') => {
  const templateExt = path__default.extname(template) || extension;
  const templateName = path__default.basename(template, path__default.extname(template));
  const templateDir = path__default.isAbsolute(template) ? path__default.dirname(template) : path__default.join(_.get(options, templatePath, ''), path__default.dirname(template));
  return path__default.join(templateDir, `${templateName}${templateExt}`);
};
const defaultConfigMailer = {
  inlineCssOptions: {},
  inlineCssEnabled: true
};

class EjsAdapter {
  constructor(config) {
    this.precompiledTemplates = {};
    this.config = defaultConfigMailer;
    Object.assign(this.config, config);
  }
  compile(mail, callback, mailerOptions) {
    const {
      context,
      template
    } = mail.data;
    const templateName = path.basename(template, path.extname(template));
    const templatePath = getTemplatePath(template, mailerOptions, '.ejs');
    if (!this.precompiledTemplates[templateName]) {
      try {
        const templateEmail = fs.readFileSync(templatePath, 'utf-8');
        this.precompiledTemplates[templateName] = ejs.compile(templateEmail, _objectSpread2(_objectSpread2({}, _.get(mailerOptions, 'template.options', {})), {}, {
          filename: templatePath
        }));
      } catch (err) {
        throw new Error(err);
      }
    }
    const rendered = this.precompiledTemplates[templateName](context);
    const render = html => {
      if (this.config.inlineCssEnabled) {
        try {
          mail.data.html = cssInline.inline(html, this.config.inlineCssOptions);
        } catch (_error) {
          /* istanbul ignore next */
          callback(_error);
        }
      } else {
        mail.data.html = html;
      }
      return callback();
    };
    /* istanbul ignore next */
    if (typeof rendered === 'string') {
      render(rendered);
    } else {
      rendered.then(render).catch(_error => _error);
    }
  }
}

class HandlebarsAdapter {
  constructor(helpers, config) {
    this.precompiledTemplates = {};
    this.config = defaultConfigMailer;
    /* istanbul ignore next */
    handlebars.registerHelper('concat', (...args) => {
      args.pop();
      return args.join('');
    });
    handlebars.registerHelper(helpers || {});
    Object.assign(this.config, config);
  }
  compile(mail, callback, mailerOptions) {
    const precompile = (template, _callback, options) => {
      const templateExt = path.extname(template) || '.hbs';
      const templateName = path.basename(template, path.extname(template));
      const templateDir = path.isAbsolute(template) ? path.dirname(template) : path.join(_.get(options, 'dir', ''), path.dirname(template));
      const templatePath = path.join(templateDir, `${templateName}${templateExt}`);
      if (!this.precompiledTemplates[templateName]) {
        try {
          const templateEmail = fs.readFileSync(templatePath, 'utf-8');
          this.precompiledTemplates[templateName] = handlebars.compile(templateEmail, _.get(options, 'options', {}));
        } catch (err) {
          throw new Error(err);
        }
      }
      return {
        templateExt,
        templateName,
        templateDir,
        templatePath
      };
    };
    const precompileTemplate = precompile(mail.data.template, callback, mailerOptions.template);
    const runtimeOptions = _.get(mailerOptions, 'options', {
      partials: false,
      data: {}
    });
    /* istanbul ignore next */
    if (runtimeOptions.partials) {
      const files = glob.sync(path.join(runtimeOptions.partials.dir, '**', '*.hbs'));
      files.forEach(file => {
        const partialTemplate = precompile(file, callback, runtimeOptions.partials);
        const templateDir = path.relative(runtimeOptions.partials.dir, path.dirname(partialTemplate.templatePath));
        handlebars.registerPartial(path.join(templateDir, partialTemplate.templateName), fs.readFileSync(partialTemplate.templatePath, 'utf-8'));
      });
    }
    const rendered = this.precompiledTemplates[precompileTemplate.templateName](mail.data.context, _objectSpread2(_objectSpread2({}, runtimeOptions), {}, {
      partials: this.precompiledTemplates
    }));
    if (this.config.inlineCssEnabled) {
      try {
        mail.data.html = cssInline.inline(rendered, this.config.inlineCssOptions);
      } catch (_error) {
        /* istanbul ignore next */
        callback(_error);
      }
    } else {
      mail.data.html = rendered;
    }
    return callback();
  }
}

class PugAdapter {
  constructor(config) {
    this.config = defaultConfigMailer;
    Object.assign(this.config, config);
  }
  compile(mail, callback, mailerOptions) {
    const {
      context,
      template
    } = mail.data;
    const templatePath = getTemplatePath(template, mailerOptions, '.pug');
    const options = _objectSpread2(_objectSpread2({}, context), _.get(mailerOptions, 'template.options', {}));
    pug.renderFile(templatePath, options, (err, body) => {
      if (err) {
        throw new Error(err.message);
      }
      if (this.config.inlineCssEnabled) {
        try {
          mail.data.html = cssInline.inline(body, this.config.inlineCssOptions);
        } catch (_error) {
          /* istanbul ignore next */
          callback(_error);
        }
      } else {
        mail.data.html = body;
      }
      return callback();
    });
  }
}

exports.EjsAdapter = EjsAdapter;
exports.HandlebarsAdapter = HandlebarsAdapter;
exports.MAILER_OPTIONS = MAILER_OPTIONS;
exports.MAILER_TRANSPORT_FACTORY = MAILER_TRANSPORT_FACTORY;
exports.PugAdapter = PugAdapter;
exports.defaultTransportOptions = defaultTransportOptions;
//# sourceMappingURL=index.js.map
