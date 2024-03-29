import { IVector2, IVector4 } from "../types/IVector2"
import { brushOptionTypes } from "../constants/brushOptionTypes"
import { PersistentSubject } from "rxjs-extra"
import { OptionBrush } from "./OptionBrush"
import { clearCanvas } from "../helpers/clearCanvas"
import { BrushMouseHandlerArguments, IBrush } from "../types/IBrush"

export class Bucket extends OptionBrush implements IBrush {
  public icon = "perm_media"
  public constructor() {
    super("bucket")
  }
  public filling = false
  public options = {
    color: {
      type: brushOptionTypes.color,
      value$: new PersistentSubject<IVector4>(this.getOptionKey("color"), [
        255,
        0,
        0,
        1
      ])
    }
  }
  public mouseMove({ contexts }: BrushMouseHandlerArguments) {
    // clear cursor layer
    clearCanvas(contexts[1])
  }
  public mouseDown({
    contexts,
    state,
    position: originalPosition
  }: BrushMouseHandlerArguments) {
    if (this.filling) {
      return
    } else if (state & 1) {
      const [layer] = contexts
      this.filling = true
      const position = originalPosition.map(Math.ceil) as IVector2
      const pixelStack = [position]
      const { width: rawWidth, height: rawHeight } = layer.canvas
      const width = Math.ceil(rawWidth)
      const height = Math.ceil(rawHeight)
      const colorLayer = layer.getImageData(0, 0, rawWidth, rawHeight)
      const targetColor = this.options.color.value$.value
      const startIndex = (position[0] + Math.ceil(width) * position[1]) * 4
      const startColor: IVector4 = [
        colorLayer.data[startIndex],
        colorLayer.data[startIndex + 1],
        colorLayer.data[startIndex + 2],
        colorLayer.data[startIndex + 3]
      ]
      if (
        targetColor[0] === startColor[0] &&
        targetColor[1] === startColor[1] &&
        targetColor[2] === startColor[2] &&
        targetColor[3] * 255 === startColor[3]
      ) {
        this.filling = false
        return
      }
      const colorPixel = (
        pixelPosition: number,
        fill: IVector4 = targetColor
      ) => {
        colorLayer.data[pixelPosition] = fill[0]
        colorLayer.data[pixelPosition + 1] = fill[1]
        colorLayer.data[pixelPosition + 2] = fill[2]
        colorLayer.data[pixelPosition + 3] = fill[3] * 255
      }
      const matchStartColor = (
        pixelPosition: number,
        color: IVector4 = startColor
      ) => {
        const r = colorLayer.data[pixelPosition]
        const g = colorLayer.data[pixelPosition + 1]
        const b = colorLayer.data[pixelPosition + 2]
        const a = colorLayer.data[pixelPosition + 3]
        return (
          r === color[0] && g === color[1] && b === color[2] && a === color[3]
        )
      }
      while (pixelStack.length) {
        let newPosition = pixelStack.pop()!,
          x = newPosition[0],
          y = newPosition[1],
          pixelPosition = (y * width + x) * 4,
          reachLeft = 0,
          reachRight = 0
        while (y-- >= 0 && matchStartColor(pixelPosition)) {
          pixelPosition -= width * 4
        }
        pixelPosition += width * 4
        ++y
        while (y++ < height - 1 && matchStartColor(pixelPosition)) {
          colorPixel(pixelPosition)
          if (x > 0) {
            if (matchStartColor(pixelPosition - 4)) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y])
                reachLeft = 1
              }
            } else if (reachLeft) {
              reachLeft = 0
            }
          }
          if (x < width - 1) {
            if (matchStartColor(pixelPosition + 4)) {
              if (!reachRight) {
                pixelStack.push([x + 1, y])
                reachRight = 1
              }
            } else if (reachRight) {
              reachRight = 0
            }
          }
          pixelPosition += width * 4
        }
      }
      contexts[0].putImageData(colorLayer, 0, 0)
      this.filling = false
    }
  }
}
