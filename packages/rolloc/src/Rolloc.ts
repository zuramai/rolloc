import { RollocOptions } from "./types";

export default class Rolloc {
    el: SVGElement
    options: RollocOptions

    constructor(el: HTMLElement|string, options?: Partial<RollocOptions>) {
        this.options = options
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

        this.el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wrapperEl.appendChild(this.el)
    }

}