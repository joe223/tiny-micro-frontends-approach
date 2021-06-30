import { error } from "./utils.js"

export function request(url, option) {
    return fetch(url, {
      mode: 'cors',
      ...option
    }).then((res) => {
        if (res.status >= 300 || res.status < 200) {
            throw new Error(res.statusText)
        }
        return res.text()
    })
}

export async function parseEntry (url, enableCache) {
    try {
        const res = await request(url)
        const parser = new DOMParser()
        const dom = parser.parseFromString(res, 'text/html')

        const script = (await Promise.all(Array.from(dom.querySelectorAll('script')).map(async tag => {
            if (dom.body.contains(tag)) {
                tag.remove()
            }

            if (tag.src) {
                return await request(tag.src)
            } else {
                return tag.innerHTML
            }
        }))).join(';\r\n')
        const style = (await Promise.all(Array.from(dom.querySelectorAll('style')).map(async tag => {
            if (dom.body.contains(tag)) {
                dom.body.removeChild(tag)
            }
            return tag.innerHTML
        }))).join(';\r\n')
        const html = dom.body.innerHTML

        return {
            cached: enableCache ? true : false,
            script,
            html,
            style
        }
    } catch (e) {
        error(e);
        return {
            html: '<div style="color: #555;font-size: 2rem;padding: 1rem;text-align: center;">Oops :(</div>'
        }
    }
}