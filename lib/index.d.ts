/// <reference types="koa__router" />
import Router from '@koa/router';
import { Middleware } from 'koa';
export interface BoundedMiddleware extends Middleware {
    readonly original?: Middleware;
}
export interface Route {
    handler: BoundedMiddleware | BoundedMiddleware[];
    method: Array<Method | undefined>;
    path: Path;
}
export type Target = any;
export type Routes = Route[] & {
    path: Path;
};
export declare enum Method {
    ALL = "all",
    DELETE = "delete",
    GET = "get",
    HEAD = "head",
    OPTIONS = "options",
    PATCH = "patch",
    POST = "post",
    PUT = "put"
}
export interface RequiredOption {
    query?: Array<String>;
    body?: Array<String>;
}
export type Path = string | RegExp;
export interface RequestMap {
    method?: Method | Method[];
    path?: Path;
}
export type Decorator = ClassDecorator | MethodDecorator | PropertyDecorator;
export type RequestMappingDecorator = (target: Target, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare const RoutesKey: unique symbol;
export declare const injectAllRoutes: <T, R>(router: Router<T, R>) => void;
export declare const Controller: (prefix: string | undefined) => (target: Target) => void;
export declare const paramsRequired: (option: RequiredOption | Array<String>) => (target: Target, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
declare function RequestMapping(requestMap: RequestMap): RequestMappingDecorator;
declare function RequestMapping(path?: Path, method?: Method | Method[]): RequestMappingDecorator;
declare const _default: (router: Router, controllerPath: string) => void;
export default _default;
export declare function get(url: string): RequestMappingDecorator;
export declare function post(url: string): RequestMappingDecorator;
export declare function put(url: string): RequestMappingDecorator;
export declare function del(url: string): RequestMappingDecorator;
export declare function all(url: string): RequestMappingDecorator;
export { RequestMapping };
