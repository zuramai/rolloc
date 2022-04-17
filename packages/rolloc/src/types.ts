interface Size {
    width: number
    height: number
}
export interface RollocOptions {
    size?: Size

    // Default options used when rolling the circle
    rollOptions: RollOptions
}
export interface RollOptions {
    duration?: {
        min: number
        max: number
    } | number
}