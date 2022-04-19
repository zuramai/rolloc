interface Size {
    width: number
    height: number
}
export interface RollocOptions {
    /**
     * Radius of the rolling circle
     */
    size?: Size|number

    // Default options used when rolling the circle
    rollOptions: RollOptions
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
}