import { RollocOptions, RollOptions } from "./types";
import type { Coordinate, RollocItem } from "./types"

const defaultOptions: RollocOptions = {
    size: 500,
    padding: 0,
    arrow: {
        startPointAtDeg: 100,
        gapFromCenter: 10,
        lineLength: 70,
    },
    rollOptions: {
        duration: 5000
    },
    items: []
}
export default class Rolloc {
    el: SVGElement
    private elements:  {[key: string]: SVGGraphicsElement} = {}
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

        let arrow = this.options.arrow
        let arrowStartPoint = this.getCenterPoint()
        let arrowEndPoint = this.getArcCoordinate(arrow.startPointAtDeg, arrow.lineLength)

        let line = createElementNS("line", { 
            class: 'rolloc__arrow', 
            x1: arrowStartPoint.x, 
            x2: arrowEndPoint.x, 
            y1: arrowStartPoint.y, 
            y2: arrowEndPoint.y, 
            stroke: 'black'
        })
        
        this.appendEl("outerCircle", outerCircle)
        this.appendEl("line", line)
        this.appendEl("itemsGroup", this.drawItems())
        this.appendEl("innerCircle", innerCircle)
        this.appendEl("textGroup", this.drawText())


        let transformOrigin = {
            x: arrow.startPointAtDeg > 270 || arrow.startPointAtDeg <= 90 ? 0 : 100,
            y: arrow.startPointAtDeg < 180 ? 0 : 100
        }
        line.setAttribute('style',`transform-origin: ${transformOrigin.x}% ${transformOrigin.y}%; 
                                    transform-box: fill-box;
                                    `)
    }

    private drawItems() {
        let g = createElementNS("g", { class: "rolloc__item-group" })
        let items = this.options.items
        let itemLength = this.options.items.length
        let r = this.getRadius()
        
        for(let i = 0; i < itemLength; i++) {
            let degPerItem = (1 / itemLength) * 360

            // Get start and end of the curve
            let deg = { start: i * degPerItem, end: (i+1) * degPerItem  }
            this.options.items[i].startAngle = deg.start
            this.options.items[i].endAngle = deg.end

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

    appendEl<T extends SVGGraphicsElement>(name: string, el: T) {
        this.el.appendChild(el as SVGGraphicsElement)   
        this.elements[name] = el
    }

    private getPiePath(startPoint: Coordinate, endPoint: Coordinate) {
        let { x, y } = this.getCenterPoint()
        let degPerItem = (1 / this.options.items.length) * 360
        let largeArcPoint = degPerItem <= 180 ? 0 : 1
        let r = this.getRadius()

        return `
            M${x},${y}
            L${startPoint.x},${startPoint.y}
            A${r},${r} 0 ${largeArcPoint} 1 ${endPoint.x} ${endPoint.y}
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

    private getArcCoordinate(angle: number, r?: number) {
        if(!r) r = this.getRadius()
        let c = this.getCenterPoint()

        let theta = (angle) * Math.PI / 180
        
        let x =  r * Math.cos(theta)
        let y =  r * Math.sin(theta)
        
        let point = {
            x: x + c.x,
            y: y + c.y,
        }

        return point
    }

    public roll(options?: RollOptions) {
        // Override the default options
        options = {...this.options.rollOptions,...options}

        let line = this.elements["line"]
        let duration = typeof options.duration == 'object' ? Math.floor(Math.random() * (options.duration.max - options.duration.min + 1) + options.duration.min) : ~~options.duration
        
        let rotateAmount = duration * ((Math.random() * 2) + 1)
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

        return new Promise<RollocItem>((resolve) => 
            setTimeout(() => resolve(this.getResult()), duration)
        )
    }

    private getResult(): RollocItem | null {
        let deg = (this.degreeRotated + this.options.arrow.startPointAtDeg) % 360 
        
        for(let i = 0; i < this.options.items.length; i++) {
            let item = this.options.items[i]
            if(deg > item.startAngle && deg <= item.endAngle) {
                return item
            }
        }
        return null
    }
}

function createElementNS<T extends keyof SVGElementTagNameMap>(name: T, props: {[key: string]: string|number}, content: string = ""): SVGElementTagNameMap[T] {
    let el = document.createElementNS(Rolloc.ns, name)
    
    Object.keys(props).forEach(p => el.setAttribute(p, props[p].toString()))
    el.innerHTML = content
    
    return el
}