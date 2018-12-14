# Cheque Image Transform

Simple script to generate jpg images of cheque numbers (MICR Encoding) with random colors and background contrast.

### Usage

#### Options
| name       | type | default | min | max | description |
|------------|------|---------|-----|-----|-------------|
| color      | int  | 20      | 1   | 255 | font color RGB increments |
| background | int  | 30      | 1   | 255 | background grayscale RGB increments |

```ecmascript 6
npm install

npm start color=20 background=30
```
