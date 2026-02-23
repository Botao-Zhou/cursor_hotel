function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function createPlaceholderImage(
  width: number,
  height: number,
  text: string,
  bg = '#1989fa',
  fg = '#ffffff'
): string {
  const safeText = String(text || '').slice(0, 40)
  const fontSize = Math.max(14, Math.floor(Math.min(width, height) / 7))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${bg}" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-family="Arial, sans-serif" font-size="${fontSize}">${safeText}</text></svg>`
  return svgDataUri(svg)
}
