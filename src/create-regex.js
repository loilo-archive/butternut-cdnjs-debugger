module.exports = str => {
  const withModifiers = str.match(/^\/(.+)\/([a-z]*)$/)

  if (withModifiers) {
    return new RegExp(withModifiers[1], withModifiers[2])
  } else {
    return new RegExp(str)
  }
}