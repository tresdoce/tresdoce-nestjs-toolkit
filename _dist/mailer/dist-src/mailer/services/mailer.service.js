var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable, Optional } from '@nestjs/common';
import _ from 'lodash';
import { MAILER_OPTIONS, MAILER_TRANSPORT_FACTORY } from '../constants/mailer.constant';
import { MailerTransportFactory } from '../factories/mailer-transport.factory';
let MailerService = class MailerService {
    constructor(mailerOptions, transportFactory) {
        this.mailerOptions = mailerOptions;
        this.transportFactory = transportFactory;
        this.transporters = new Map();
        if (!transportFactory) {
            this.transportFactory = new MailerTransportFactory(mailerOptions);
        }
        if ((!mailerOptions.transport || Object.keys(mailerOptions.transport).length <= 0) &&
            !mailerOptions.transports) {
            throw new Error('Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.');
        }
        /** Adapter setup **/
        const templateAdapter = _.get(this.mailerOptions, 'template.adapter');
        /** Transporters setup **/
        if (mailerOptions.transports) {
            Object.keys(mailerOptions.transports).forEach((name) => {
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
            if (this.transporters?.get(sendMailOptions.transporterName)) {
                return this.transporters.get(sendMailOptions.transporterName).sendMail(sendMailOptions);
            }
            else {
                throw new ReferenceError(`Transporters object doesn't have ${sendMailOptions.transporterName} key`);
            }
        }
        else {
            if (this.transporter) {
                return this.transporter.sendMail(sendMailOptions);
            }
            else {
                throw new ReferenceError(`Transporter object undefined`);
            }
        }
    }
};
MailerService = __decorate([
    Injectable(),
    __param(0, Inject(MAILER_OPTIONS)),
    __param(1, Optional()),
    __param(1, Inject(MAILER_TRANSPORT_FACTORY)),
    __metadata("design:paramtypes", [Object, Object])
], MailerService);
export { MailerService };
