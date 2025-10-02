import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Win Rich Solutions</h1>
          <p className="text-xl">
            Empowering entrepreneurs to build successful online businesses
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At <span className="font-semibold text-blue-600">Win Rich Solutions</span>, we believe that everyone should have the opportunity to start and grow their own online business. Our platform provides the tools, support, and infrastructure needed to turn your entrepreneurial dreams into reality.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're a seasoned seller or just starting out, we're committed to making e-commerce accessible, affordable, and profitable for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">High-Quality Products</h3>
              <p className="text-gray-600">
                We ensure every product meets our strict quality standards for your peace of mind
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center p-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning-Fast Delivery</h3>
              <p className="text-gray-600">
                Get your products delivered quickly with our worldwide shipping network
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center p-6">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Customer Support</h3>
              <p className="text-gray-600">
                Our dedicated support team is always ready to assist you anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">1000+</div>
                <p className="text-lg">Active Sellers</p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50K+</div>
                <p className="text-lg">Products Listed</p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">99%</div>
                <p className="text-lg">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Commitment</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            We're more than just a platform – we're your partners in success. Our team works tirelessly to provide you with the best tools, features, and support to help your business thrive in the digital marketplace.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-blue-50 px-6 py-3 rounded-full">
              <span className="font-semibold text-blue-700">Innovation</span>
            </div>
            <div className="bg-green-50 px-6 py-3 rounded-full">
              <span className="font-semibold text-green-700">Reliability</span>
            </div>
            <div className="bg-purple-50 px-6 py-3 rounded-full">
              <span className="font-semibold text-purple-700">Security</span>
            </div>
            <div className="bg-yellow-50 px-6 py-3 rounded-full">
              <span className="font-semibold text-yellow-700">Transparency</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start your journey today and become part of our growing community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}