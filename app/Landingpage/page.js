import { FaSearch, FaCarSide, FaStar, FaCheckCircle, FaArrowRight } from "react-icons/fa";

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
        className="max-w-6xl mx-auto px-6 min-h-screen"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)" }}
      >
        {/* HERO SECTION */}
        <section className="text-center mt-28 mb-16 bg-white/90 p-10 rounded-3xl shadow-2xl border border-blue-100 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10 text-blue-700 text-[10rem] pointer-events-none select-none">
            <FaCarSide />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">
            Find Your Dream Car
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 font-medium">
            The easiest way to buy, rent, or sell luxury vehicles. <br className="hidden md:block" />
            <span className="text-blue-600 font-semibold">Drive in style, drive with confidence.</span>
          </p>
          <div className="max-w-md mx-auto relative mb-6">
            <input
              type="text"
              placeholder="Search by brand, model, or feature..."
              className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl text-gray-800 shadow focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-500 bg-white"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600">
              <FaSearch className="text-xl" />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow">
              <FaStar className="text-yellow-300" /> 1000+ 5-Star Reviews
            </span>
            <span className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full font-semibold text-sm shadow">
              <FaCheckCircle className="text-green-400" /> Trusted by Car Enthusiasts
            </span>
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm shadow">
              <FaArrowRight /> Start Your Journey
            </span>
          </div>
        </section>
  
        {/* POPULAR BRANDS SECTION */}
        <section className="border-t border-blue-200 pt-12 bg-gradient-to-br from-blue-50/80 to-white/80 p-8 rounded-3xl shadow-lg mt-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Popular Brands
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {brands.map((brand) => (
              <div
                key={brand}
                className="bg-white border border-blue-100 p-8 rounded-2xl shadow-md hover:shadow-xl text-center transition-transform hover:-translate-y-2 hover:border-blue-500 cursor-pointer group"
              >
                <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION SECTION */}
        <section className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-700 to-black text-white px-10 py-8 rounded-3xl shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to get started?</h3>
            <p className="mb-6 text-lg">Sign up now and experience the future of car buying and selling.</p>
            <a href="/Signup" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full shadow hover:bg-blue-50 transition-all text-lg">Get Started</a>
          </div>
        </section>
      </div>
    );
  }
  