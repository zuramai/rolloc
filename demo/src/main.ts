import './style.css'

import { createRolloc } from "rolloc"

const rolloc = createRolloc("#roller", {
    items: [
        { value: "grape", text: "Grape" },
        { value: "apple", text: "Apple" },
        { value: "orange", text: "Orange" },
    ]
})
let btnRoll = document.querySelector('button')

btnRoll.addEventListener('click', e => {
    e.preventDefault()
    let input = document.querySelector('input')

    rolloc.roll({ 
        duration: ~~input.value,
    })
    .then(() => {
        alert("success roll")
    })
})
