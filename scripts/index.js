const fs = require('fs')
const path = require('path')
const text2png = require('text2png')
const _ = require('lodash')
const rimraf = require('rimraf')

let i = 0
const scriptsPath = path.resolve(__dirname)
const pngPath = `${scriptsPath}/png`
const localFontPath = `${scriptsPath}/font/micrenc.ttf`

let fontPngPath = ''
const progress = ['|', '/', '\\']

const createImages = () => {
  while (i < 10) {
    // create directories
    mkdirSync(path.resolve(pngPath))

    console.log(`-- creating color combinations for ${i}...`)
    fontPngPath = `${scriptsPath}/png/${i}`
    mkdirSync(path.resolve(fontPngPath))

    const combos = createColorCombos()

    console.log(`--- creating images for ${combos.length} combinations...`)

    _.forEach(combos, (combo, ci) => {
      createByOpacity(combo, i)
      process.stdout.write(`\r complete: ${ci} ${progress[ci % 3]}`)
    })
    i++
  }
}

const createColorCombos = () => {
  let combos = []

  const orders = [
    ['r', 'g', 'b'],
    ['r', 'b', 'g'],
    ['g', 'r', 'b'],
    ['g', 'b', 'r'],
    ['b', 'r', 'g'],
    ['b', 'g', 'r']
  ]
  _.forEach(orders, order => {
    let complete = false

    const first = order[0]
    const second = order[1]
    const third = order[2]

    const color = {
      [first]: 0,
      [second]: 0,
      [third]: 0
    }

    while (!complete) {
      if (color[first] < 255) {
        color[first] += 5
      } else if (color[second] < 255) {
        color[second] += 5
      } else {
        color[third] += 5
      }

      const { r, g, b } = color

      const combo = {
        color: `${r}, ${g}, ${b}`
      }
      const backgrounds = _.map(Array(250 / 5), (el, i) => {
        const number = (i * 5) + 5
        return `${number}, ${number}, ${number}`
      })

      backgrounds.forEach(background => {
        combos.push(_.assign({ background }, combo))
      })

      if (color.r === 255 &&
        color.g === 255 &&
        color.b === 255
      ) {
        complete = true
      }
    }
  })

  return combos
}

const createByOpacity = (colors, number) => {
  let opacity = 1

  // while (opacity > 0) {
    const { color, background } = generateColors(_.assign({ opacity }, colors))
    const name = `${fontPngPath}/${number}(${_.replace(color, ' ', '')}|${_.replace(background, ' ', '')}).jpg`

    // convert font to png
    convert(number, name, {
      localFontPath,
      backgroundColor: `rgba(${background})`,
      color: `rgba(${color})`
    })
    // opacity = Number(opacity - 0.05).toPrecision(2)

  // }
}

const generateColors = (colors) => {
  const background = `${colors.background}, 1`
  const color = `${colors.color}, ${colors.opacity}`

  return {
    background,
    color
  }
}

const convert = (text, name, options) => {
    // create png from font
    fs.writeFileSync(name, text2png(`${text}`, Object.assign({}, {
      localFontName: 'micrenc',
      font: '200px micrenc',
      padding: 10
    }, options)))
}

const mkdirSync = dirPath => {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

console.log('initializing script...')
console.log('- removing png dir if exists...')
rimraf(path.resolve(pngPath), {}, createImages)
