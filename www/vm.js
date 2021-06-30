import { log } from "./utils.js"

const snapShots = new WeakMap()

export function createContext(external = {}, app) {
    if (snapShots.has(app)) {
        return snapShots.get(app)
    }

    const state = {
        ...external,
        __IS_SANDBOX: true
    }
    const windowCtxHandler = {
        get(obj, prop) {
            return Reflect.has(obj, prop) ? obj[prop] : window[prop]
        },
        set(obj, prop, value) {
            Reflect.set(obj, prop, value)
            return true
        },
        has(obj, prop) {
            return obj && Reflect.has(obj, prop)
        }
    }
    const fakeWindow = new Proxy(state, windowCtxHandler)
    const global = {
        __proto__: null,
        globalThis: fakeWindow,
        window: fakeWindow,
        self: fakeWindow,
        eval: function (code) {
            return runScript('return ' + code, {});
        }, 
        alert: function () {
            alert(`[${app.name}]:` + arguments[0]);
        }, 
    }
    const globalCtxHandler = {
        get(obj, prop) {
            return Reflect.has(obj, prop) ? obj[prop] : fakeWindow[prop]
        },
        set(obj, prop, value) {
            Reflect.set(obj, prop, value)
            return true
        },
        has(obj, prop) {
            return obj && Reflect.has(obj, prop)
        }
    }
    const globalCtx = new Proxy(global, globalCtxHandler)

    if (app.enableSnapshot) {
        snapShots.set(app, globalCtx)
    }
    
    return globalCtx
}

export function runApp(app) {
    const ctx = createContext({
        _Barfish: {
            app
        }
    }, app)

    log(`${app.name} is running in sandbox:`, ctx) 
    runScript(app.resources.script, ctx)
}

export function runScript(code, ctx) {
    try {
        // Function alway run in global context
        return Function(
            'ctx',
            'win',
            `
            with(ctx) {   
                with(win) {
                    return (function(){   
                        ${code};
                    }).call(ctx);
                }
            }`
        )(ctx, ctx.window)
    } catch (e) {
        log(e);
    }
}