import { RollocOptions, RollOptions } from "./types";

const defaultOptions: RollocOptions = {
    size: {
        height: 400,
        width: 400
    },
    rollOptions: {
        duration: 5000
    }
}
export default class Rolloc {
    el: SVGElement
    options: RollocOptions
    public static readonly ns = "http://www.w3.org/2000/svg"

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

        this.el = document.createElementNS(Rolloc.ns, "svg");
        let [w,h] = [this.options.size.width.toString(),this.options.size.height.toString()]
        this.el.setAttributeNS(null, "viewBox", `0 0 ${w} ${h}`)
        this.el.setAttributeNS(null, "width", w.toString())
        this.el.setAttributeNS(null, "height", h.toString())

        // Create elements
        this.draw()

        wrapperEl.appendChild(this.el)
    }

    draw() {
        let outerCircle = createElementNS("circle", { 
            cx: 200, cy: 200, r: 200, fill:"transparent", stroke: "#333" 
        })
        let innerCircle = createElementNS("circle", { 
            cx: 200, cy: 200, r: 20, fill:"#ccc", stroke: "#333" 
        })
        let line = createElementNS("line", { 
            x1: 200, x2: 300, y1: 200, y2: 300, stroke: 'black'
        })
        
        this.el.appendChild(outerCircle)
                .appendChild(innerCircle)
                .appendChild(line)
    }

    roll(options: RollOptions) {
        // Override the default options
        options = {...this.options.rollOptions,...options}

        let line = this.el.querySelector<SVGLineElement>('.rolloc__arrow')
        let d = options.duration
        line.animate(
            [
                { rotate: "2700deg" }
            ], 
            {
                duration: typeof d == 'object' ? Math.floor(Math.random() * (d.max - d.min + 1) + d.min) : options.duration.toString()
            }
        )

    }

}
function createElementNS(name: keyof SVGElementTagNameMap, props: {[key: string]: string|number}) {
    let el = document.createElementNS(Rolloc.ns, name)
    
    Object.keys(props).forEach(p => el.setAttribute(p, props[p].toString()))
    return el

}