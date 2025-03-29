export default function HowItWorks() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">How It Works</h2>
        <p className="text-gray-600 text-center mb-12">Find the perfect AI tool in just a few simple steps</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-primary-700 text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Describe Your Task</h3>
            <p className="text-gray-600">
              Simply enter what you're trying to accomplish in natural language. Our search understands your intent.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-primary-700 text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Get AI-Powered Results</h3>
            <p className="text-gray-600">
              Our intelligent search engine analyzes your query and finds the most relevant AI tools from our database.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-primary-700 text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Compare and Choose</h3>
            <p className="text-gray-600">
              Review ratings, features, and pricing to find the perfect tool that matches your specific needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
