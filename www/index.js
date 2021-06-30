import { defineContainer, createContent } from "./dom.js";
import { parseEntry } from "./loadResource.js";
import { log, error } from "./utils.js";
import { runApp } from "./vm.js";

const apps = []
const APP_STATE = {
    REGISTERED: 1,
    LOADED: 2,
    UNLOADED: 3
}

export function register (configList = []) {
    configList.forEach(config => {
        apps.push(createApp(config))
    })
}

export function matchUrl (url) {
    log('current url:', url)

    apps.forEach(app => {
        if (url.startsWith(app.route)) {
            loadApp(app)
        } else {
            unloadApp(app)
        }
    })
}

export function launch () {
    window.addEventListener('hashchange', function(){
        const url = window.location.hash

        matchUrl(url)
    })

    matchUrl(window.location.hash)
}

export function createApp (config) {
    return {
        ...config,
        attach: () => {
            defineContainer(app)
            document.body.querySelector(app.container).appendChild(document.createElement(app.name))
        },
        onContainerCreated: (app) => {
            app.shadowDOM.appendChild(app.content)
            log(`${app.name} mounted`)
        }
    }
}

export async function loadApp (app) {
    if (app.state === APP_STATE.LOADED) {
        return
    }
    defineContainer(app)
    
    app.resources = app.resources?.cached 
        ? app.resources
        : await parseEntry(app.entry, app.enableCache)
    app.content = createContent(app)
    document.body.querySelector(app.container).appendChild(document.createElement(app.name))
    app.state = APP_STATE.LOADED

    runApp(app)
    
}

export async function unloadApp (app) {
    // TODO
    // app.emit('unmount')
    document.body.querySelector(app.container).innerHTML = ''
    app.state = APP_STATE.UNLOADED
}
