# koa-router-decorators-plus
本插件针对`@rxts/koa-router-decorators`进行更改拓展！

## TOC <!-- omit in toc -->

- [更改](#更改)
- [安装](#安装)
- [使用方法](#使用方法)
- [License](#license)

## 更改
1. 解决在使用以后route挂载不上的问题（原因:`没有引用controller文件注解不会触发`）
2. Controller添加`prefix`
3. 添加参数校验方法`paramsRequired`

## 安装
```sh
# yarn
yarn add koa-router-decorators-plus

# npm
npm i koa-router-decorators-plus
```

## 使用方法

#### Controller的使用
```ts
import { Controller, get, paramsRequired } from 'koa-router-decorators-plus'
import * as Koa from 'koa'
@Controller('/test')
export default class startApi {
    // 括号中如果不传入参数  则自动拼接url 即：/test/getIndex
    @get()
    async getIndex(ctx: Koa.Context, next: Function) {
        ctx.body = {
            a : 66666
        }
    }

    @paramsRequired(['username', 'password'])
    @get('/login')
    async getString(ctx: Koa.Context, next: Function) {
        // 使用paramsRequired后会自动扫描ctx.request.query或则ctx.request.body上是否存在相关参数
        // 没有则返回400, 有则进入当前handler
        const { username, password } = ctx.request.query
        ctx.body = {
            username,
            password
        }
    }
}
```

#### 路由注册

```ts
import Koa from 'koa'
import loadController from 'koa-router-decorators-plus'
import KoaRouter from 'koa-router'
const app = new Koa()
// 第二个参数为存放contorller的文件夹
loadController(router, resolve(__dirname, './controllers'))
const router = new KoaRouter()
app.use(router.routes())
app.use(router.allowedMethods())
```
## License

[MIT][] © 

[mit]: http://opensource.org/licenses/MIT



