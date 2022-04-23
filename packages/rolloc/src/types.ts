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
    rollOptions: RollOptions

    arrow?: {
        startPointAtDeg?: number
        lineLength?: number
        gapFromCenter?: number
    }
    items: RollocItem[]
}
export interface RollOptions {
    duration?: {
        min: number
        max: number
    } | number
}
export interface RollocItem {
    value: string
    text?: string
    image?: string

    startAngle?: number
    endAngle?: number
}