"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMapping = exports.all = exports.del = exports.put = exports.post = exports.get = exports.paramsRequired = exports.Controller = exports.injectAllRoutes = exports.RoutesKey = exports.Method = void 0;
const fs = require('fs');
const { resolve } = require('path');
const routesList = [];
var Method;
(function (Method) {
    Method["ALL"] = "all";
    Method["DELETE"] = "delete";
    Method["GET"] = "get";
    Method["HEAD"] = "head";
    Method["OPTIONS"] = "options";
    Method["PATCH"] = "patch";
    Method["POST"] = "post";
    Method["PUT"] = "put";
})(Method = exports.Method || (exports.Method = {}));
exports.RoutesKey = Symbol('routes');
// 将当前 routesList 中所有路由注入指定的 router 中
const injectAllRoutes = (router) => {
    while (routesList.length) {
        const routes = routesList.shift();
        routes.forEach(({ handler, method, path = '' }) => {
            if (typeof routes.path === 'string' && typeof path === 'string') {
                path = routes.path + path;
            }
            method.forEach(m => {
                router[m || Method.GET](path, ...(Array.isArray(handler) ? handler : [handler]));
            });
        });
    }
};
exports.injectAllRoutes = injectAllRoutes;
// 路由控制器，添加到 class 声明上
const Controller = (prefix) => {
    return (target) => {
        if (prefix) {
            if (!prefix.startsWith('/')) {
                prefix = '/' + prefix;
            }
        }
        else {
            prefix = '/';
        }
        // type-coverage:ignore-next-line
        target.prototype[exports.RoutesKey].forEach((item) => {
            item.path = (prefix || '') + item.path;
        });
        routesList.push(target.prototype[exports.RoutesKey]);
    };
};
exports.Controller = Controller;
// 路由 url 匹配规则，添加到类成员方法上
const paramsRequired = (option) => {
    return (target, propertyKey, descriptor) => {
        const targetFunction = descriptor.value;
        const route = target[exports.RoutesKey];
        const requiredParams = (ctx, next) => {
            const errorKeys = [];
            if (!Array.isArray(option)) {
                Object.keys(option).forEach(item => {
                    // @ts-ignore
                    const targetParam = ctx.request[item];
                    const targetKeys = option[item] || [];
                    targetKeys.forEach(key => {
                        const param = targetParam[key];
                        if (!param) {
                            errorKeys.push(key);
                        }
                    });
                });
            }
            else {
                let data = ctx.request.query;
                const errorKeys = [];
                if (Object.keys(data).length === 0) {
                    data = ctx.request.body;
                }
                option.forEach(item => {
                    const targetParam = data[item];
                    if (!targetParam) {
                        errorKeys.push(item);
                    }
                });
            }
            if (errorKeys.length > 0) {
                ctx.response.status = 400;
                ctx.response.message = `'${errorKeys.join(',')}' is required in the request data`;
                return;
            }
            return targetFunction(ctx, next);
        };
        route[route.length - 1].handler = Object.assign(requiredParams.bind(target), { requiredParams });
    };
};
exports.paramsRequired = paramsRequired;
// eslint-disable-next-line sonarjs/cognitive-complexity
function RequestMapping(path, method) {
    if (typeof path === 'string' || path instanceof RegExp) {
        path = {
            method,
            path,
        };
    }
    else if (method !== undefined) {
        console.warn('method should not be passed in');
    }
    const requestMap = path || {};
    const requestMethod = requestMap.method;
    const requestMethods = Array.isArray(requestMethod)
        ? requestMethod
        : [requestMethod];
    const requestPath = requestMap.path;
    return (target, propertyKey, descriptor) => {
        // type-coverage:ignore-next-line
        target = propertyKey ? target : target.prototype;
        if (!target[exports.RoutesKey]) {
            target[exports.RoutesKey] = [];
        }
        const routes = target[exports.RoutesKey];
        if (propertyKey) {
            descriptor =
                descriptor || Object.getOwnPropertyDescriptor(target, propertyKey);
            if (!descriptor || typeof descriptor.value !== 'function') {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('invalid usage of decorator `RequestMapping`');
                }
                return;
            }
            const original = descriptor.value;
            routes.push({
                handler: Object.assign(original.bind(target), { original }),
                method: requestMethods,
                path: requestPath,
            });
            return;
        }
        if (requestMethod) {
            routes.forEach(route => (route.method = route.method[0] ? route.method : requestMethods));
        }
        routes.path = requestPath;
    };
}
exports.RequestMapping = RequestMapping;
exports.default = (router, controllerPath) => {
    let loadCtroller = (rootPaths) => {
        try {
            var allfile = fs.readdirSync(rootPaths); //加载目录下的所有文件进行遍历
            allfile.forEach((file) => {
                var filePath = resolve(rootPaths, file); // 获取遍历文件的路径
                if (fs.lstatSync(filePath).isDirectory()) { //判断该文件是否是文件夹，如果是递归继续遍历读取文件
                    loadCtroller(filePath);
                }
                else {
                    let mod = require(filePath);
                }
            });
        }
        catch (error) {
            console.log(error);
            console.log("no such file or dir :---- " + rootPaths);
        }
    };
    loadCtroller(controllerPath);
    (0, exports.injectAllRoutes)(router);
};
function get(url) {
    return RequestMapping(url, Method.GET);
}
exports.get = get;
function post(url) {
    return RequestMapping(url, Method.POST);
}
exports.post = post;
function put(url) {
    return RequestMapping(url, Method.PUT);
}
exports.put = put;
function del(url) {
    return RequestMapping(url, Method.DELETE);
}
exports.del = del;
function all(url) {
    return RequestMapping(url, Method.ALL);
}
exports.all = all;
