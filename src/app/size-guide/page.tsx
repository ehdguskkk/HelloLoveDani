export default function SizeGuidePage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-[var(--accent)]">Size Guide</h1>
      <p className="mb-6">
        Not sure which size to choose? Use our simple size guide below!
        <br />
        <b>*All measurements are approximate.</b>
      </p>
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Size</th>
            <th className="border px-4 py-2 text-left">Neck Circumference</th>
            <th className="border px-4 py-2 text-left">Suitable For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">XS</td>
            <td className="border px-4 py-2">20~25 cm</td>
            <td className="border px-4 py-2">Puppy, Toy Breed</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">S</td>
            <td className="border px-4 py-2">25~32 cm</td>
            <td className="border px-4 py-2">Small Dogs (e.g. Maltese, Pomeranian)</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">M</td>
            <td className="border px-4 py-2">32~40 cm</td>
            <td className="border px-4 py-2">Medium Dogs (e.g. Shiba Inu, Cocker Spaniel)</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">L</td>
            <td className="border px-4 py-2">40~48 cm</td>
            <td className="border px-4 py-2">Large Dogs (e.g. Golden Retriever)</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">XL</td>
            <td className="border px-4 py-2">48~55 cm</td>
            <td className="border px-4 py-2">XL Dogs</td>
          </tr>
        </tbody>
      </table>
      <p className="text-gray-600">
        If you are in between sizes, we recommend choosing the larger size for a more comfortable fit.<br />
        For personalized sizing help, please <a href="/contact" className="text-[var(--accent)] underline">contact us</a>.
      </p>
    </div>
  );
}