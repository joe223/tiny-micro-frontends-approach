export function request(url, option) {
    return fetch(url, {
      mode: 'cors',
      ...option
    }).then((res) => res.text())
}

export async function parseEntry (url) {
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
        script,
        html,
        style
    }
}