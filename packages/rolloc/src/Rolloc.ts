import { RollocOptions, RollOptions } from "./types";
import "./css/rolloc.css"

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
    private options: RollocOptions
    private degreeRotated: number = 0
    static readonly ns = "http://www.w3.org/2000/svg"

    constructor(el: HTMLElement|string, options?: Partial<RollocOptions>) {
        this.options = {...defaultOptions,...options}
        this.mount(el)
    }

    private resolveSelector<T>(selector: string | T | null | undefined): T | null {
        if (typeof selector === 'string')
          return document.querySelector(selector) as unknown as T
        else
          return selector || null
    }

    private mount(el: HTMLElement|string) {
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

    private draw() {
        let outerCircle = createElementNS("circle", { 
            class: "rolloc__outer-circle", cx: 200, cy: 200, r: 200, fill:"transparent", stroke: "#333" 
        })
        let innerCircle = createElementNS("circle", { 
            class: "rolloc__inner-circle", cx: 200, cy: 200, r: 20, fill:"#ccc", stroke: "#333", 
        })
        let line = createElementNS("line", { 
            class: 'rolloc__arrow', x1: 200, x2: 300, y1: 200, y2: 300, stroke: 'black'
        })
        
        this.el.appendChild(outerCircle)
        this.el.appendChild(innerCircle)
        this.el.appendChild(line)

        line.setAttribute('style',`transform-box: fill-box; transform: translate(20px, 20px);`)
    }

    public roll(options?: RollOptions) {
        // Override the default options
        options = {...this.options.rollOptions,...options}

        let line = this.el.querySelector<SVGLineElement>('.rolloc__arrow')
        let duration = typeof options.duration == 'object' ? Math.floor(Math.random() * (options.duration.max - options.duration.min + 1) + options.duration.min) : ~~options.duration
        
        let rotateAmount = duration
        console.log(duration)
        this.degreeRotated += rotateAmount

        line.animate(
            [
                { rotate: this.degreeRotated+"deg" }
            ], 
            {
                duration: duration,
                fill: "forwards",
                easing: "cubic-bezier(0.16, 1, 0.3, 1)"
            }
        )

        return new Promise((resolve: Function) => 
            setTimeout(() => resolve(), duration)
        )

    }

}
function createElementNS(name: keyof SVGElementTagNameMap, props: {[key: string]: string|number}) {
    let el = document.createElementNS(Rolloc.ns, name)
    
    Object.keys(props).forEach(p => el.setAttribute(p, props[p].toString()))
    return el

}