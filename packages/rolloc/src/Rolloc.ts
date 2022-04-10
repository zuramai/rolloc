import { RollocOptions } from "./types";

const defaultOptions: RollocOptions = {
    size: {
        height: 400,
        width: 400
    }
}
export default class Rolloc {
    el: SVGElement
    options: RollocOptions
    readonly ns = "http://www.w3.org/2000/svg"

    constructor(el: HTMLElement|string, options?: Partial<RollocOptions>) {
        this.options = {...defaultOptions,...options}
        this.mount(el)
    }

    resolveSelector<T>(selector: string | T | null | undefined): T | null {
        if (typeof selector === 'string')
          return document.querySelector(selector) as unknown as T
        else
          return selector || null
    }

    mount(el: HTMLElement|string) {
        if (this.el)
            throw new Error('[rolloc] already mounted, unmount previous target first')

        let wrapperEl = this.resolveSelector(el)
        if (!wrapperEl)
            throw new Error('[rolloc] target element not found')

        this.el = document.createElementNS(this.ns, "svg");
        let [w,h] = [this.options.size.width.toString(),this.options.size.height.toString()]
        this.el.setAttributeNS(null, "viewBox", `0 0 ${w} ${h}`)
        this.el.setAttributeNS(null, "width", w.toString())
        this.el.setAttributeNS(null, "height", h.toString())
        wrapperEl.appendChild(this.el)
    }

    draw() {
        
    }

}