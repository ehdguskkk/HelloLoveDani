export default function ReturnsExchangesPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-[var(--accent)]">Returns &amp; Exchanges</h1>
      <p className="mb-4">
        If you are not 100% satisfied with your purchase, we are here to help!<br/>
        Please review our returns and exchanges policy below.
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li>Items can be returned or exchanged within <b>14 days</b> of delivery.</li>
        <li>Products must be unused and in original condition.</li>
        <li>Return shipping costs are the responsibility of the customer unless the item is defective.</li>
        <li>To initiate a return or exchange, please <a href="/contact" className="text-[var(--accent)] underline">contact us</a> with your order number.</li>
      </ul>
      <p className="text-gray-600">
        For any questions or assistance, feel free to reach out at any time.
      </p>
    </div>
  );
}