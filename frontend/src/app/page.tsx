import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full border-b border-gray-200 px-8 py-4 flex justify-between items-center bg-white">
        {/* Left Section: About Link */}
        <div className="flex items-center">
          <Link href="/about" className="text-gray-800 hover:text-blue-600">
            About
          </Link>
        </div>

        {/* Center Section: Title */}
        <div className="flex justify-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SpotTalk
          </Link>
        </div>

        {/* Right Section: Contact and Login/Signup */}
        <div className="flex items-center space-x-6">
          <Link href="/contact" className="text-gray-800 hover:text-blue-600">
            Contact
          </Link>
          <Link href="/login" className="text-gray-800 hover:text-blue-600">
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-gradient-to-br from-indigo-50 to-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to SpotTalk</h1>
        <p className="text-lg text-gray-700 max-w-md">
          Your go-to platform for seamless communication. Explore our features
          and connect with the world!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/about"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Learn More
          </Link>
          <Link
            href="/auth/signup"
            className="bg-gray-100 text-blue-600 py-2 px-6 rounded hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 py-4 text-center">
        <p>© 2024 SpotTalk. All rights reserved.</p>
      </footer>
    </div>
  );
}
