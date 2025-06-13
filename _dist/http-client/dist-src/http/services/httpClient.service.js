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
import { Inject, Injectable } from '@nestjs/common';
import Axios from 'axios';
import _ from 'lodash';
import { AXIOS_INSTANCE_TOKEN, defaultConfigInstanceAxios, HTTP_MODULE_PROPAGATE_HEADERS, propagateDefaultHeaders, RequestMethod, } from '../constants/http.constants';
let HttpClientService = class HttpClientService {
    /* istanbul ignore next */
    constructor(_instance = Axios, httpPropagateHeaders = []) {
        this._instance = _instance;
        this.httpPropagateHeaders = httpPropagateHeaders;
        this.headers = defaultConfigInstanceAxios.headers;
        // Methods
        /**
         * Make and http request in base of default config, and configuration
         * @param url API url for request
         * @param config AxiosRequestConfig type user configuration
         */
        this.fetch = async (url, config) => {
            try {
                config = _.omit(config, ['url']);
                config.headers = _.merge({}, this.headers, config.headers);
                return await this.axiosRef.request({
                    url: encodeURI(url),
                    ...config,
                });
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Make http request  based on axios using user´s config
         * @param config Contain request configuration (headers, data, url, method...) type AxiosRequestConfig
         */
        this.request = async (config) => {
            return this.fetch(config.url, config);
        };
        /**
         * Make get http request based on axios
         * @param url API url for request
         * @param config Contain request configuration (headers, httpAgent...) type AxiosRequestConfig
         */
        this.get = async (url, config) => {
            return this.fetch(url, { ...config, method: RequestMethod.GET });
        };
        /**
         * Make post http request based on axios
         * @param url API url for request
         * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
         */
        this.post = async (url, config) => {
            return this.fetch(url, { ...config, method: RequestMethod.POST });
        };
        /**
         * Make put http request based on axios
         * @param url API url for request
         * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
         */
        this.put = async (url, config) => {
            return this.fetch(url, { ...config, method: RequestMethod.PUT });
        };
        /**
         * Make patch patch request based on axios
         * @param url API url for request
         * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
         */
        this.patch = async (url, config) => {
            return this.fetch(url, { ...config, method: RequestMethod.PATCH });
        };
        /**
         * Make delete http request based on axios
         * @param url API url for request
         * @param config Contain request configuration (headers, params...) type AxiosRequestConfig
         */
        this.delete = async (url, config) => {
            return this.fetch(url, { ...config, method: RequestMethod.DELETE });
        };
        /**
         * Make head http request based on axios
         * @param url API url for request
         * @param config Contain request configuration (params, httpAgent...) type AxiosRequestConfig
         */
        this.head = async (url, config) => {
            return this.fetch(url, { ...config, method: RequestMethod.HEAD });
        };
        this.propagateHeadersList = _.union(propagateDefaultHeaders, this.httpPropagateHeaders);
        this.axiosRef.interceptors.request.use((config) => config);
        this.axiosRef.interceptors.response.use((response) => response, (error) => Promise.reject(error));
    }
    get axiosRef() {
        return this._instance;
    }
    initAxios({ headers, ip }) {
        const propagateHeaders = Object.keys(headers)
            .filter((key) => this.propagateHeadersList.includes(key))
            .reduce((obj, key) => ({ ...obj, [key]: headers[key] }), {});
        this.ip = ip;
        this.headers = _.merge({}, defaultConfigInstanceAxios.headers, propagateHeaders);
    }
};
HttpClientService = __decorate([
    Injectable(),
    __param(0, Inject(AXIOS_INSTANCE_TOKEN)),
    __param(1, Inject(HTTP_MODULE_PROPAGATE_HEADERS)),
    __metadata("design:paramtypes", [Function, Array])
], HttpClientService);
export { HttpClientService };
