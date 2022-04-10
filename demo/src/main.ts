import './style.css'

import { createRolloc } from "rolloc"
import Rolloc from '../../packages/rolloc/src/Rolloc'

const app = document.querySelector<HTMLDivElement>('#app')!

const rolloc = createRolloc("#roller", {
    size: {
        width: 100,
        height: 100
    }
})
