import * as sapper from "@sapper/app"
import "./styles/constants.scss"
import "./styles/sliders.scss"
import "./styles/resetSliders.scss"
import "regenerator-runtime/runtime"

// load default brush
import "./stores/currentBrush"

try {
  sapper.start({
    target: document.querySelector("#sapper")!
  })
} catch {}
