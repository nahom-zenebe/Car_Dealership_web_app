import { FaSearch } from "react-icons/fa";

export default function LandingPage() {
    const brands = [
      "Rolls-Royce",
      "BMW",
      "Mercedes",
      "Audi",
      "Tesla",
      "Porsche",
      "Ferrari",
      "Lamborghini",
    ];
  
    return (
      <div
        className="max-w-6xl mx-auto px-6 min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/Users/Apple/Desktop/untitled folder 24/my-next-app/public/background.jpg')` }}

      >
   
        <section className="text-center mt-28 mb-16 bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            The easiest way to buy a car.
          </h1>
          <p className="text-xl text-gray-700 mb-10">
            Drive your dream car down the stylish streets.
          </p>
  
         
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Enter car brand or model"
              className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl text-gray-800 shadow focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-500"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600">
              <FaSearch className="text-xl" />
            </div>
          </div>
        </section>
  

        <section className="border-t border-gray-200 pt-10 bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">
            Popular Brands
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-lg text-center transition-transform hover:-translate-y-1 hover:border-blue-500"
              >
                <span className="text-lg font-semibold text-gray-800">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
  