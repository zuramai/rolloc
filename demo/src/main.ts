import './style.css'

import { createRolloc } from "rolloc"
import Rolloc from '../../packages/rolloc/src/Rolloc'

const app = document.querySelector<HTMLDivElement>('#app')!

const rolloc = createRolloc("#roller")
rolloc.roll({ duration: 2000 })
    .then(() => {
        rolloc.roll({ duration: 10000 })
    })