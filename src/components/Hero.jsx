import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-900 to-cyan-600 text-white flex items-center justify-center px-10">

      <div className="max-w-2xl">

        <h1 className="text-6xl font-bold">
          Student ID Card Generator
        </h1>

        <p className="mt-6 text-xl">
          Generate professional student ID cards with photo upload,
          barcode generation and PDF export.
        </p>

        <Link to="/generator">

          <button className="mt-8 bg-white text-blue-900 px-6 py-3 rounded-lg font-bold">
            Get Started
          </button>

        </Link>

      </div>

    </section>
  );
}

export default Hero;