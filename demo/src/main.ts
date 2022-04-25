import './style.css'

import { createRolloc } from "rolloc"

const rolloc = createRolloc("#roller", {
    items: [
        { value: "grape", text: "Grape" },
        { value: "apple", text: "Apple" },
        { value: "orange", text: "Orange" },
        { value: "lemon", text: "Lemon" },
    ],
    arrow: {
        startPointAtDeg: 220,
        gapFromCenter: 10,
        lineLength: 70,
    }
})
let btnRoll = document.querySelector('button')

btnRoll.addEventListener('click', e => {
    e.preventDefault()
    let input = document.querySelector('input')

    rolloc.roll({ 
        duration: ~~input.value,
        
    })
    .then((item) => {
        alert("success roll, result = "+item.value)
    })
})
