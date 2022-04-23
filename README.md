# Rolloc
A Javascript library to create spin roller. [Open demo](https://zuramai.github.io/rolloc/).

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
    // The roll default options
    rollOptions: {
        duration: 5000
    }
}

const rolloc = createRolloc("#roller", options)

// Roll and override the default rollOptions
rolloc.roll({ 
    duration: ~~input.value 
})
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

## Contributing
1. Fork this repository
2. Make a change and commit to the forked repository
3. Make a pull request to this repository
