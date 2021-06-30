export function defineContainer (app) {
    if (!customElements.get(app.name)) {
        class CustomDOM extends HTMLElement {
            static get tag() {
                return app.name
            }
            constructor() {
                super()
                const shadowDOM = this.attachShadow({mode: 'open'})
    
                app.shadowDOM = shadowDOM

                app.onContainerCreated?.(app)
            }
        }
        customElements.define(app.name, CustomDOM)
    }
}

export function createContent (app) {
    const fragment = document.createDocumentFragment()
    const content = document.createElement('template')

    content.innerHTML = `<style>${app.resources.style}</style>` + app.resources.html
    fragment.appendChild(content.content.cloneNode(true))

    return fragment
}