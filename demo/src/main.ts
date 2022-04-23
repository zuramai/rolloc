import './style.css'

import { createRolloc } from "rolloc"

const rolloc = createRolloc("#roller", {
    items: [
        { value: "grape", text: "Grape" },
        { value: "apple", text: "Apple" },
        { value: "orange", text: "Orange" },
        { value: "lemon", text: "Lemon" },
    ]
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

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
const ctx = canvas.getContext('2d')

ctx.beginPath()
ctx.arc(50,50,25,0,Math.PI*0.3)
ctx.stroke()

