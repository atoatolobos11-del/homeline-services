const swatchMap = {
  sage: 'bg-sage',
  cream: 'bg-sand border border-line',
  charcoal: 'bg-charcoal',
  olive: 'bg-olive',
}

export default function ColorSwatches({ colors = [] }) {
  if (!colors.length) return null

  return (
    <div className="flex items-center gap-1.5" aria-label="Available colors">
      {colors.map((color) => (
        <span
          key={color}
          title={color}
          className={`h-3.5 w-3.5 rounded-full ${swatchMap[color] || 'bg-muted'}`}
        />
      ))}
    </div>
  )
}
