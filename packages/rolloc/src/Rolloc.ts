import { RollocOptions, RollOptions } from "./types";
import type { Coordinate } from "./types"

const defaultOptions: RollocOptions = {
    size: 200,
    padding: 20,
    rollOptions: {
        duration: 5000
    },
    items: []
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

    private getCircleSize() {
        let size = this.options.size
        let padding = this.options.padding
        return typeof size == 'number' ? [size-padding, size-padding] : [size.width-padding, size.height-padding]
    }

    private mount(el: HTMLElement|string) {
        if (this.el)
            throw new Error('[rolloc] already mounted, unmount previous target first')

        let wrapperEl = this.resolveSelector(el)
        if (!wrapperEl)
            throw new Error('[rolloc] target element not found')

        this.el = document.createElementNS(Rolloc.ns, "svg");
        
        let [w,h] = this.getCircleSize()
        w += this.options.padding
        h += this.options.padding

        this.el.setAttributeNS(null, "viewBox", `0 0 ${w} ${h}`)
        this.el.setAttributeNS(null, "width", w.toString())
        this.el.setAttributeNS(null, "height", h.toString())

        // Create elements
        this.draw()

        wrapperEl.appendChild(this.el)
    }

    private draw() {
        let [w,h] = this.getCircleSize()
        let {x, y} = this.getCenterPoint()
        let outerCircle = createElementNS("circle", { 
            class: "rolloc__outer-circle", 
            cx: x.toString(), 
            cy: y.toString(), 
            r: (w/2).toString(), 
            fill:"white", 
            stroke: "#333" 
        })
        let innerCircle = createElementNS("circle", { 
            class: "rolloc__inner-circle", 
            cx: x, 
            cy: y, 
            r: 20, 
            fill:"#ccc", 
            stroke: "#333", 
        })
        let line = createElementNS("line", { 
            class: 'rolloc__arrow', 
            x1: x, 
            x2: x + w/10, 
            y1: y, 
            y2: y + w/10, 
            stroke: 'black'
        })
        
        this.el.appendChild(outerCircle)
        this.el.appendChild(innerCircle)
        this.el.appendChild(line)
        this.el.appendChild(this.drawItems())

        line.setAttribute('style',`transform-box: fill-box; transform: translate(20px, 20px);`)
    }

    private drawItems() {
        let g = createElementNS("g", { class: "rolloc__item-group" })
        let items: SVGPathElement[] = []
        let itemLength = this.options.items.length
        
        for(let i = 0; i < itemLength; i++) {
            // Build the path d
            let degPerItem = (1 / itemLength)  * 360
            let deg = { start: i * degPerItem, end: (i+1) * degPerItem }
            let degCoordinate = [this.getArcCoordinate(deg.start), this.getArcCoordinate(deg.end)]

            let d = this.getPiePath(degCoordinate[0], degCoordinate[1])
            console.log(degCoordinate)
            // this.el.appendChild(createElementNS("circle", {cx: degCoordinate[1].x, cy: degCoordinate[1].y, r:20, fill:"blue"}))

            // Push it to `d`
            let path = createElementNS("path", { d, stroke: "red", fill: "none" })
            items.push(path)

            g.appendChild(path)
        }
        
        return g
    }

    private getPiePath(startPoint: Coordinate, endPoint: Coordinate) {
        let { x, y } = this.getCenterPoint()
        return `
            M${x},${y}
            L${startPoint.x},${startPoint.y}
            A${x},${y} 0 1 1 ${endPoint.x} ${endPoint.y}
            L${x},${y}
            Z
        `
    }

    private getCenterPoint(): Coordinate {
        return typeof this.options.size == "number" ? {x: this.options.size/2, y: this.options.size/2} : {x: this.options.size.width/2, y: this.options.size.height/2}
    }

    private getArcCoordinate(angle: number) {
        let [w,h] = this.getCircleSize()
        let center = this.getCenterPoint()

        // radius = w/2 or h/2
        let x = center.x * Math.sin(Math.PI * 2 * angle / 360)
        let y = center.y * Math.cos(Math.PI * 2 * angle / 360)
        
        let point = {
            x: Math.round(x) + w/2,
            y: Math.round(y) + w/2,
        }
        console.log(`coordinate x = ${point.x},  y = ${point.y}`);

        return point
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

function createElementNS<T extends keyof SVGElementTagNameMap>(name: T, props: {[key: string]: string|number}): SVGElementTagNameMap[T] {
    let el = document.createElementNS(Rolloc.ns, name)
    
    Object.keys(props).forEach(p => el.setAttribute(p, props[p].toString()))
    return el
}