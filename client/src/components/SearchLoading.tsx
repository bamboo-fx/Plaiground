export default function SearchLoading() {
  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Processing message */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Finding the best AI tools for you...</h2>
          <p className="text-gray-600">We're analyzing your request and searching our database</p>
        </div>
        
        {/* Loading animation */}
        <div className="flex justify-center mb-10">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-robot text-primary-500 text-2xl"></i>
            </div>
          </div>
        </div>
        
        {/* Skeleton loading cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-md mr-3"></div>
                    <div>
                      <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
