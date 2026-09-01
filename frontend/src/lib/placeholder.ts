export function placeholderImage(label: string): string {
    const initials = label
      .split(' ')
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
  
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
      <rect width="640" height="640" fill="#F6F6F5" />
      <rect x="0.5" y="0.5" width="639" height="639" fill="none" stroke="#E2E3E1" />
      <text x="320" y="340" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="64" font-weight="600" fill="#98999D" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>`
  
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }
  