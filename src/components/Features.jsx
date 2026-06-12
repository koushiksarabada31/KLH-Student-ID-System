function Features() {

  const features = [
    "Photo Upload",
    "Barcode Generator",
    "PDF Export",
    "Live Preview",
    "Admin Dashboard",
    "Student Database"
  ];

  return (
    <section className="py-16 px-8 bg-gray-100">

      <h1 className="text-4xl font-bold text-center text-blue-900">
        Features
      </h1>

      <div className="grid md:grid-cols-3 gap-8 mt-10">

        {features.map((item, index) => (

          <div
            key={index}
            className="bg-white p-8 rounded-xl shadow-lg"
          >

            <h2 className="text-2xl font-bold text-cyan-600">
              {item}
            </h2>

            <p className="mt-4 text-gray-600">
              Advanced module for ID card management system.
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Features;