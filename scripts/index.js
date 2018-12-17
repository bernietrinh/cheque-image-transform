const fs = require('fs')
const path = require('path')
const text2png = require('text2png')
const _ = require('lodash')
const rimraf = require('rimraf')
const sharp = require('sharp')
const lock = require('lock').Lock()

let i = 0
const scriptsPath = path.resolve(__dirname)
const jpgPath = `${scriptsPath}/jpg`
const localFontPath = `${scriptsPath}/font/micrenc.ttf`

let fontPngPath = ''
const progress = ['|', '/', '\\']

const options = {
  color: 20,
  background: 30
}

process.argv.slice(2).forEach(arg => {
  const key = _.replace(arg, /(\=\w+)/gi, '')
  const value = _.replace(arg, /(\w+\=)/gi, '')
  options[key] = _.parseInt(value)

  console.log(`[OPTIONS] ${_.upperFirst(key)} Increments: ${value}`)
})
console.log('------------------------------')

const createImages = () => {
  while (i < 10) {
    // create directories
    mkdirSync(path.resolve(jpgPath))

    console.log(`-- creating color combinations for ${i}...`)
    fontPngPath = `${scriptsPath}/jpg/${i}`
    mkdirSync(path.resolve(fontPngPath))

    const combos = createColorCombos()

    console.log(`--- creating images for ${combos.length} combinations...`)

    const rotations = []
    for (let j = -10; j < 11; j++) {
      rotations.push(j)
    }
    _.forEach(combos, (combo, ci) => {
      createByOpacity(combo, i, rotations[ci % rotations.length])
      process.stdout.write(`\r complete: ${ci} ${progress[ci % 3]}`)
    })
    console.log('\n------------------------------')
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
      [first]: options.color,
      [second]: options.color,
      [third]: options.color
    }

    while (!complete) {
      if (color[first] < 255) {
        color[first] += options.color
      } else if (color[second] < 255) {
        color[second] += options.color
      } else {
        color[third] += options.color
      }

      const { r, g, b } = color

      const combo = {
        color: `${r}, ${g}, ${b}`,
        background: '255, 255, 255'
      }
      // const backgrounds = _.map(Array(_.floor(255 / options.background)), (el, i) => {
      //   const number = (i * options.background) + options.background
      //   return `${number}, ${number}, ${number}`
      // })
      //
      // backgrounds.forEach(background => {
      //   combos.push(_.assign({ background }, combo))
      // })

      combos.push(combo)

      if (color.r >= 255 &&
        color.g >= 255 &&
        color.b >= 255
      ) {
        complete = true
      }
    }
  })

  return combos
}

const createByOpacity = (colors, number, rotation) => {
  let opacity = 1

  // while (opacity > 0) {
    const { color, background } = generateColors(_.assign({ opacity }, colors))
    const name = `${fontPngPath}/${number}(${_.replace(color, ' ', '')}|${_.replace(background, ' ', '')}).jpg`

    // convert font to jpg
    convert(number, name, {
      localFontPath,
      backgroundColor: `rgba(${background})`,
      color: `rgba(${color})`
    }, rotation)
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

const convert = (text, name, options, rotation) => {
  const maxWidth = 325
  const maxHeight = 325
  const font = getRandomInt(100, 250)
  const padHorizontal = maxWidth - font
  const padLeft = getRandomInt(0, padHorizontal)
  const padRight = padHorizontal - padLeft

  const padVertical = maxHeight - font
  const padTop = getRandomInt(0, padVertical)
  const padBottom = padVertical - padTop

  // create jpg from font
  const buffer = text2png(`${text}`, Object.assign({}, {
    localFontName: 'micrenc',
    font: `${font}px micrenc`,
    paddingTop: padTop,
    paddingBottom: padBottom,
    paddingRight: padRight,
    paddingLeft: padLeft
  }, options))

  sharp(buffer)
    .blur()
    .rotate(rotation, { background: [255, 255, 255] })
    .toBuffer((err, data, info) => {
      sharp(data)
        .extract({ left: 0, top: 0, width: info.width, height: info.height })
        .resize({ width: 224, height: 224, fit: 'cover' })
        .toFile(name, (err, info) => {
          if (err) {
            process.stderr.write(`Error writing image to file ${err}\n`)
          }
        })

    })
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

const mkdirSync = dirPath => {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

console.log('initializing script...')
console.log('- removing jpg dir if exists...')
rimraf(path.resolve(jpgPath), {}, createImages)
