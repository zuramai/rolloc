import './style.css'

import { createRolloc } from "rolloc"

const rolloc = createRolloc("#roller")
let btnRoll = document.querySelector('button')


btnRoll.addEventListener('click', e => {
    e.preventDefault()
    let input = document.querySelector('input')

    rolloc.roll({ duration: ~~input.value })
        .then(() => {
            alert("success roll")
        })
})

