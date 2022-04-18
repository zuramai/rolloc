# Rolloc
A Javascript library to create spin roller.

## Installation
1. Install
```bash
npm install rolloc # or yarn/pnpm
```

## Basic Usage
HTML:
```html
<div id="roller"></div>
```
JS:
```js
import { createRolloc } from "rolloc"

const options = {
    size: {
        height: 400,
        width: 400
    },
    rollOptions: {
        duration: 5000
    }
}

const rolloc = createRolloc("#roller", options)
```

## Running the demo locally
```bash
git clone https://github.com/zuramai/rolloc.git
cd rolloc
pnpm install -r

# Run the js
pnpm run js:dev

# And run the demo site (vite)
pnpm run dev
```