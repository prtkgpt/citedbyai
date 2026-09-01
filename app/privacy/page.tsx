export const metadata = { title: "Privacy — citedbyai.lol" };

export default function Privacy() {
  return (
    <div className="wrap legal">
      <a className="logo" href="/">citedbyai<span>.lol</span></a>
      <h1>Privacy</h1>
      <p><strong>What we collect.</strong> The URL, description, and bid amounts you submit. These are public by design: they appear on the leaderboard and in machine-readable feeds.</p>
      <p><strong>Payments.</strong> Handled entirely by Stripe. We never see or store your card details. Stripe's own privacy policy applies to payment data.</p>
      <p><strong>Crawler log.</strong> We log visits from self-identified bot user agents (bot name, path, timestamp) and display aggregate stats publicly. We do not log personal browsing data of human visitors.</p>
      <p><strong>Cookies.</strong> We set no tracking cookies ourselves. Stripe may set cookies during checkout.</p>
      <p><strong>Deletion.</strong> Listings are public records of the game and are not deleted on request, except where the law requires.</p>
    </div>
  );
}
