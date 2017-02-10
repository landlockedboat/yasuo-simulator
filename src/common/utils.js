// This function expects two objects with an x and y field
// And returns the squared absolute distance between them
// From http://www.mathwarehouse.com/algebra/distance_formula/index.php
exports.sqDist = function (p1, p2) {
  var powX = Math.pow((p2.x - p1.x), 2)
  var powY = Math.pow((p2.y - p1.y), 2)
  return powX + powY
}

// Clamps a number between min and max
exports.clamp = function (num, min, max) {
  if (num <= min) return min
  else if (num >= max) return max
  return num
}

exports.isClamped = function (val, min, max) {
  return val <= min || val >= max
}

// Clamps num between -lim (absolute) and lim (absolute)
exports.clampAbs = function (num, lim) {
  lim = Math.abs(lim)
  if (num <= -lim) return -lim
  else if (num >= lim) return lim
  return num
}
