export default function CarRentalCard({ make, model, year, price, inStock }:any) {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg border border-gray-200 p-4">
      {/* Title Section */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-800">{make} {model}</h2>
        <p className="text-gray-600">Year: {year}</p>
      </div>

      {/* Rating (static for now) */}
      <div className="flex items-center mb-3">
        <span className="text-yellow-400">★★★★★</span>
        <span className="text-gray-600 ml-1">4.9 (100)</span>
      </div>

      {/* Location (placeholder) */}
      <p className="text-gray-700 mb-3">JI Kendalsari V, Malang, East Java</p>

      {/* Price */}
      <p className="text-2xl font-bold text-gray-900 mb-3">${price.toFixed(2)}/Day</p>

      {/* Features (placeholder) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center">
          <span className="text-gray-600">Automatic</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600">250km</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600">Premium</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600">5 Persons</span>
        </div>
      </div>

      {/* In Stock Badge */}
      {inStock === false && (
        <div className="text-red-500 font-medium text-sm mb-2">Out of stock</div>
      )}

      {/* Rent Button */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        disabled={inStock === false}
      >
        {inStock === false ? 'Unavailable' : 'Rent Now'}
      </button>
    </div>
  )
}

