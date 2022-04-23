import { it, describe, expect } from 'vitest'
import { createRolloc } from '../src'

describe("roll", () => {
    let div =  document.createElement("div")

    it("store a correct configuration", () => {
        const rolloc = createRolloc(div, {
            arrow: {
                lineLength: 3
            }
        })

        expect(rolloc.options.arrow.lineLength).toEqual(3)
    })  

    it("should return the correct values", () => {
        const rolloc = createRolloc(div, {
            arrow: {
                startPointAtDeg: 0
            },
            items: [
                { value: "grape", text: "Grape"},
                { value: "apple", text: "Apple"},
                { value: "orange", text: "Orange"},
            ]
        })
        rolloc.roll({duration: 1000})
            .then((res) => {
                expect(res.value).toEqual(res.value)
            })

    })  
})
