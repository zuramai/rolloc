// Main TS goes here

import Rolloc from "./Rolloc";
import { RollocOptions } from "./types";

export function createRolloc(el: HTMLElement|string, options?: Partial<RollocOptions>) {
    return new Rolloc(el, options)
}