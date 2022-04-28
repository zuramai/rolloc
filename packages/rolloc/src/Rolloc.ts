import { RollocOptions, RollOptions } from "./types";
import type { Coordinate, RollocItem } from "./types"

const defaultOptions: RollocOptions = {
    size: 500,
    padding: 0,
    anchor: {
        type:"line",
        positionAngle: 100,
        gapFromCenter: 10,
        length: 70,
    },
    rollOptions: {
        type: "circle",
        duration: 5000
    },
    items: []
}

export default class Rolloc {
    el: SVGElement
    private elements:  {[key: string]: SVGGraphicsElement} = {}
    public options: RollocOptions
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

        this.el = createElementNS("svg", {
            preserveAspectRatio: "xMidYMid slice",
            viewBox:`0 0 ${this.options.size} ${this.options.size}`,
            width:this.options.size.toString(),
            height:this.options.size.toString(),
        });

        // Create elements
        wrapperEl.appendChild(this.el)
        this.draw()

        console.log(this.options.items)

    }

    private draw() {
        let r = this.getRadius()
        let {x, y} = this.getCenterPoint()

        // Inner circle and outer circle
        let circles = this.drawCircles(x,y,r)

        // Draw anchor
        let anchorOptions = this.options.anchor
        let anchor = this.drawAnchor(anchorOptions)

        // Images
        
        this.appendEl("outerCircle", circles.outerCircle)
        this.appendEl("anchor", anchor)
        this.appendEl("itemsGroup", this.drawItems())
        this.appendEl("images", this.drawImages())
        this.appendEl("innerCircle", circles.innerCircle)

        let transformOrigin = {
            x: anchorOptions.positionAngle > 270 || anchorOptions.positionAngle <= 90 ? 0 : 100,
            y: anchorOptions.positionAngle < 180 ? 0 : 100
        }
        
        anchor.style.transformOrigin = `${transformOrigin.x}% ${transformOrigin.y}%`
        anchor.style.transformBox = `fill-box`

    }
    
    private drawImages() {
        let defs = createElementNS("defs", {  })
        this.options.items.forEach((item,i) => {
            if(!item.image) return
            let pieBbox = document.querySelector<SVGGraphicsElement>("#pie-"+i).getBBox()
            
            let pattern = createElementNS("pattern", { id: `image-${i}`, patternUnits: "userSpaceOnUse", x:pieBbox.x, y:pieBbox.y, width: pieBbox.width, height: pieBbox.height })
            let image: SVGImageElement
            if(typeof item.image == "string")
                image = createElementNS("image", { "xlink:href": item.image, width: this.getRadius(), height: this.getRadius() })
            else if(item.image instanceof HTMLImageElement) 
                image = createElementNS("image", { "xlink:href": item.image.src, width: this.getRadius(), height: this.getRadius() })
            else image = item.image
            
            pattern.appendChild(image)
            defs.appendChild(pattern)
        })

        return defs
    }

    private drawAnchor(anchorOptions) {
        let anchor: SVGGeometryElement
        if(anchorOptions.type == 'line') {
            let arrowStartPoint = this.getCenterPoint()
            let arrowEndPoint = this.getArcCoordinate(anchorOptions.positionAngle, anchorOptions.length)
    
            anchor = createElementNS("line", { 
                class: 'rolloc__arrow', 
                x1: arrowStartPoint.x, 
                x2: arrowEndPoint.x, 
                y1: arrowStartPoint.y, 
                y2: arrowEndPoint.y, 
                stroke: 'black'
            })
        }
        return anchor
    }

    private drawCircles(x: number, y: number, r: number) {
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

        return {
            outerCircle,
            innerCircle
        }
    }

    private drawItems() {
        let gEl = createElementNS("g", { class: "rolloc__item-group" })
        let items = this.options.items
        let itemLength = items.length
        let r = this.getRadius()
        
        for(let i = 0; i < itemLength; i++) {
            let itemEl = createElementNS("g", { class: "rolloc__item" })
            let item = items[i]
            let degPerItem = (1 / itemLength) * 360

            // Get start and end of the curve
            let deg = { start: i * degPerItem, end: (i+1) * degPerItem  }
            item.startAngle = deg.start
            item.endAngle = deg.end

            // Convert it to coordinate
            let pie = this.drawPie(deg.start, deg.end, r)
            pie.setAttribute("id","pie-"+i)

            let text = this.drawText(item.text, deg.start, deg.end, r)

            // Fill image if there is any
            if(item.image) 
                pie.setAttribute("fill", `url(#image-${i})`)
            
            itemEl.appendChild(text)
            itemEl.appendChild(pie)
            gEl.appendChild(itemEl)
        }
        
        return gEl
    }

    private drawPie(startDeg, endDeg, r) {
        let degCoordinate = [this.getArcCoordinate(startDeg, r), this.getArcCoordinate(endDeg, r)] // [point1, point2]

        let d = this.getPiePath(degCoordinate[0], degCoordinate[1])
        let path = createElementNS("path", { d, class: "rolloc__pie", stroke: "black", fill: "transparent" })

        return path
    }

    private drawText(text, startDeg, endDeg, r) {
        // Get the text position in the middle of the pie with radius*2/3
        let point = this.getArcCoordinate(startDeg + (endDeg - startDeg) / 2, r * 2/3)

        let textEl = createElementNS("text", {
            x: point.x,
            y: point.y,
            "text-anchor": "middle",
            "transform-box": "fill-box",
            "transform-origin": "center",
            "dominant-baseline": "middle",
            // "transform": "rotate(30) translate(100, 30)"
        }, text)

        return textEl
    }

    private getRadius() {
        return (this.options.size/2) - this.options.padding * 2
    }

    private appendEl<T extends SVGGraphicsElement>(name: string, el: T) {
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

        let anchor = this.elements["anchor"]
        let duration = typeof options.duration == 'object' ? Math.floor(Math.random() * (options.duration.max - options.duration.min + 1) + options.duration.min) : ~~options.duration
        
        let rotateAmount = duration * ((Math.random() * 2) + 1)
        this.degreeRotated += rotateAmount 
        console.log(anchor)
        
        anchor.animate(
            [
                { rotate: this.degreeRotated+"deg" }
            ], 
            {
                duration: duration,
                fill: "forwards",
                easing: "cubic-bezier(0.16, 1, 0.3, 1)"
            }
        )
        console.log("animating");
        

        return new Promise<RollocItem>((resolve) => 
            setTimeout(() => resolve(this.getResult()), duration)
        )
    }

    private getResult(): RollocItem | null {
        let deg = (this.degreeRotated + this.options.anchor.positionAngle) % 360 
        
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
    
    for(let key in props) {
        if(key=="xlink:href")
            el.setAttributeNS("http://www.w3.org/1999/xlink", "href", props[key].toString())
        else 
            el.setAttributeNS(null,key, props[key].toString())
    }
    el.innerHTML = content
    
    return el
}