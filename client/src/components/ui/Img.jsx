/**
 * <Img> — the single place every product/section image is rendered.
 *
 * The problem it solves: the catalog images are hotlinked from Pexels and
 * Unsplash at a fixed w=900. A product card on a phone is ~180px wide but
 * still downloads the 900px file, and every <img> below the fold started
 * fetching immediately on load. On a slow connection that meant a blank grid
 * for seconds.
 *
 * What it does:
 *   - lazy + async by default, so below-the-fold images cost nothing on load
 *   - fetchpriority="high" only for the hero (the LCP element)
 *   - width/height always set, which reserves the box and kills layout shift
 *   - a real srcset so the browser picks a width that matches the screen
 *   - webp when the browser supports it, jpg as the fallback
 *
 * Both CDNs resize on the fly via query params, so this needs no build step
 * and no images on disk.
 */

const CDN_PARAMS = {
  'images.pexels.com': (w, q) => `auto=compress&cs=tinysrgb&w=${w}&q=${q}`,
  'images.unsplash.com': (w, q) => `auto=format&fit=crop&w=${w}&q=${q}`,
}

// Above-the-fold images are fetched immediately at a higher priority; the
// widths are generous because these are the ones the user is looking at.
const DEFAULT_WIDTHS = [400, 800, 1200]

function buildSrcSet(src, widths, { quality = 75 } = {}) {
  if (!src || src.startsWith('data:')) return undefined

  let url
  try {
    url = new URL(src)
  } catch {
    return undefined
  }

  const build = CDN_PARAMS[url.hostname]
  if (!build) return undefined // local or unknown host — serve as-is

  const out = []
  for (const w of widths) {
    out.push(`${url.origin}${url.pathname}?${build(w, quality)} ${w}w`)
    // Unsplash ignores fm=webp and just re-encodes as jpeg, so only offer it
    // where it actually saves bytes.
    if (url.hostname === 'images.pexels.com') {
      out.push(`${url.origin}${url.pathname}?${build(w, quality)}&fm=webp ${w}w`)
    }
  }
  return out.join(', ')
}

/**
 * @param {string}  src        original image URL
 * @param {'high'|'low'|'auto'} priority  'high' for the hero only
 * @param {number[]} widths    srcset candidates
 * @param {string}  sizes      srcset sizes hint, e.g. '(min-width:1280px) 33vw, 100vw'
 * @param {number}  width      intrinsic width, for aspect-ratio reservation
 * @param {number}  height     intrinsic height
 */
export default function Img({
  src,
  alt = '',
  priority = 'low',
  widths = DEFAULT_WIDTHS,
  sizes,
  quality = 75,
  width,
  height,
  className = '',
  style,
  ...rest
}) {
  const eager = priority === 'high'

  return (
    <img
      src={src}
      srcSet={buildSrcSet(src, widths, { quality })}
      sizes={sizes}
      alt={alt}
      // Below the fold: defer. Above it: fetch now, ahead of everything else.
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      // NOTE: lowercase `fetchpriority` — React 18 does not recognize the
      // camelCase `fetchPriority` DOM property (it warns "Invalid DOM
      // property" and drops the attribute). Lowercase works in both 18 & 19.
      fetchpriority={eager ? 'high' : 'auto'}
      // Without these the browser can't reserve space, so the page reflows as
      // each image lands — which reads as "the page is still loading".
      width={width}
      height={height}
      className={className}
      style={style}
      {...rest}
    />
  )
}
