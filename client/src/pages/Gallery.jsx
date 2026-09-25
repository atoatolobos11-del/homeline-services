import { images } from '../data/images'
import { useShopData } from '../context/DataContext'

export default function Gallery() {
  const { products } = useShopData()

  const gallery = [
    images.hero,
    images.lifestyle,
    images.editorialMain,
    images.editorial2,
    images.editorial3,
    images.bestSellers,
    images.newArrival,
    images.about,
    ...products.slice(0, 4).map((product) => product.image),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Gallery</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">At home with Homeline</h1>
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {gallery.map((src) => (
          <img
            key={src}
            src={src}
            alt="Homeline lifestyle photography"
            loading="lazy"
            className="mb-4 w-full break-inside-avoid rounded-3xl object-cover transition hover:opacity-95"
          />
        ))}
      </div>
    </div>
  )
}
