export interface Coordinate {
    x: number
    y: number
}


export interface RollocOptions {
    /**
     * Radius of the rolling circle
     */
    size?: number
    padding?: number

    // Default options used when rolling the circle
    rollOptions?: RollOptions

    anchor?: AnchorLineOptions | AnchorTriangleOptions

    items: RollocItem[]
}

interface AnchorLineOptions {
    type: "line"
    positionAngle?: number
    length?: number
    gapFromCenter?: number
}

interface AnchorTriangleOptions {
    type: "triangle"
    positionAngle?: number
    length?: number
}

export interface RollOptions {
    /**
     * What to rotate on roll
     * `circle`: the whole circle is to be rotated 
     * `anchor`: only the anchor will be rotated 
     */
    type?: "circle" | "anchor"
    duration?: {
        min: number
        max: number
    } | number
}
export interface RollocItem {
    value: string
    text?: string
    image?: HTMLImageElement | SVGImageElement | string

    startAngle?: number
    endAngle?: number
}
