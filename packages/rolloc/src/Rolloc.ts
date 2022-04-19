import { RollocOptions, RollOptions } from "./types";
import type { Coordinate } from "./types"

const defaultOptions: RollocOptions = {
    size: 500,
    padding: 10,
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

    private getRadius() {
        return (this.options.size/2) - this.options.padding * 2
    }

    private mount(el: HTMLElement|string) {
        if (this.el)
            throw new Error('[rolloc] already mounted, unmount previous target first')

        let wrapperEl = this.resolveSelector(el)
        if (!wrapperEl)
            throw new Error('[rolloc] target element not found')

        this.el = document.createElementNS(Rolloc.ns, "svg");
        
        this.el.setAttributeNS(null, "viewBox", `0 0 ${this.options.size} ${this.options.size}`)
        this.el.setAttributeNS(null, "width", this.options.size.toString())
        this.el.setAttributeNS(null, "height", this.options.size.toString())

        // Create elements
        this.draw()

        wrapperEl.appendChild(this.el)
    }

    private draw() {
        let r = this.getRadius()
        let {x, y} = this.getCenterPoint()
        let outerCircle = createElementNS("circle", { 
            class: "rolloc__outer-circle", 
            cx: x.toString(), 
            cy: y.toString(), 
            r: r.toString(), 
            fill:"white", 
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
            x2: x + r/10, 
            y1: y, 
            y2: y + r/10, 
            stroke: 'black'
        })
        
        this.el.appendChild(outerCircle)
        this.el.appendChild(line)
        this.el.appendChild(this.drawItems())
        this.el.appendChild(innerCircle)
        this.el.appendChild(this.drawText())

        line.setAttribute('style',`transform-box: fill-box; transform: translate(20px, 20px);`)
    }

    private drawItems() {
        let g = createElementNS("g", { class: "rolloc__item-group" })
        let itemLength = this.options.items.length
        let r = this.getRadius()
        
        for(let i = 0; i < itemLength; i++) {
            let degPerItem = (1 / itemLength) * 360

            // Get start and end of the curve
            let deg = { start: i * degPerItem, end: (i+1) * degPerItem  }

            // Convert it to coordinate
            let degCoordinate = [this.getArcCoordinate(deg.start, r), this.getArcCoordinate(deg.end, r)] // [point1, point2]

            let d = this.getPiePath(degCoordinate[0], degCoordinate[1])
            let path = createElementNS("path", { d, stroke: "black", fill: "transparent" })

            g.appendChild(path)
        }
        
        return g
    }

    private drawText() {
        let gWrapper = createElementNS("g", { class: "rolloc__texts" })
        let items = this.options.items
        for(let i = 0; i < items.length; i++) {
            let gInner = createElementNS("g", { 
                class: "rolloc__text",
            })

            let degPerItem = (1 / items.length) * 360
            let deg = { start: i * degPerItem, end: (i+1) * degPerItem  }

            // Get the text position in the middle of the pie with radius*2/3
            let point = this.getArcCoordinate(deg.start + (deg.end - deg.start) / 2, this.getRadius() * 2/3)
            
            
            let textEl = createElementNS("text", {
                x: point.x,
                y: point.y,
                "text-anchor": "middle",
                "transform-box": "fill-box",
                "transform-origin": "center",
                "dominant-baseline": "middle",
                // "transform": "rotate(30) translate(100, 30)"
            }, items[i].text)

            gInner.appendChild(textEl)
            gWrapper.appendChild(gInner)
        }
        return gWrapper
    }

    private getPiePath(startPoint: Coordinate, endPoint: Coordinate) {
        let { x, y } = this.getCenterPoint()
        let degPerItem = (1 / this.options.items.length) * 360
        let largeArcPoint = degPerItem <= 180 ? 0 : 1
        let r = this.getRadius()

        return `
            M${x},${y}
            L${startPoint.x},${startPoint.y}
            A${r},${r} 0 ${largeArcPoint} 0 ${endPoint.x} ${endPoint.y}
            L${x},${y}
            Z
        `
    }

    private getCenterPoint(): Coordinate {
        return {
            x: this.options.size/2, 
            y: this.options.size/2
        } 
    }

    private getArcCoordinate(angle: number, r: number) {
        let c = this.getCenterPoint()

        let x =  r * Math.sin(Math.PI * 2 * angle / 360)
        let y =  r * Math.cos(Math.PI * 2 * angle / 360)
        
        let point = {
            x: Math.round(x * 100) / 100 + c.x,
            y: Math.round(y * 100) / 100 + c.y,
        }

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

function createElementNS<T extends keyof SVGElementTagNameMap>(name: T, props: {[key: string]: string|number}, content: string = ""): SVGElementTagNameMap[T] {
    let el = document.createElementNS(Rolloc.ns, name)
    
    Object.keys(props).forEach(p => el.setAttribute(p, props[p].toString()))
    el.innerHTML = content
    
    return el
}