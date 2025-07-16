export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">About Us</h1>
      <p className="text-lg mb-8">
        <b>HelloLoveDani</b> was created out of a deep love for dogs and a passion for beautiful, handcrafted accessories.<br />
        We wanted to bring more color, style, and comfort into the lives of our beloved pets.<br /><br />
        Inspired by our best friend, <b>Dani</b>, we embarked on a journey to make every walk and outing a little brighter and more joyful. Each of our products is lovingly designed, with special care for quality and individuality.
      </p>
      <div className="flex items-center gap-6">
        <img
          src="/images/dani-profile.jpg"
          alt="Dani the dog"
          className="w-36 h-36 object-cover rounded-full shadow-lg border-4 border-[var(--accent)]"
        />
        <div>
          <h2 className="text-2xl font-semibold mb-2">Meet Dani 🐶</h2>
          <p>
            Dani is our golden doodle and the original inspiration behind our shop.<br />
            She loves adventure, making new friends, and of course, looking stylish in her favorite bandanas and ribbon ties.<br />
            Every product at HelloLoveDani is tested and approved by Dani herself!
          </p>
        </div>
      </div>
    </div>
  );
}