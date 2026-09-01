import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ListingCard } from '../components/ListingCard'
import { useListings } from '../context/ListingsContext'

export function Favorites() {
  const { listings, favoriteIds } = useListings()
  const favorites = listings.filter((listing) => favoriteIds.includes(listing.id))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Favoriten</h1>

      {favorites.length === 0 ? (
        <EmptyState
          title="Noch keine Favoriten"
          description="Merke dir Inserate, um sie hier wiederzufinden."
          action={
            <Link to="/">
              <Button variant="secondary">Marktplatz durchsuchen</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
