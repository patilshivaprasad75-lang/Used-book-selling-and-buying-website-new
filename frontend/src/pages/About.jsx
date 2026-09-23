export default function About() {
  return (
    <section className="about-section">
      <div className="about-container">
        <span className="section-tag">Our Story</span>
        <h1>About Old Books Selling Management</h1>
        <p>
          Old Books Selling Management System is an online marketplace designed for students and readers to buy
          and sell second-hand books easily, affordably, and sustainably.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <i className="fas fa-bullseye" />
            <h3>Our Mission</h3>
            <p>Reduce educational expenses and promote book reuse across communities.</p>
          </div>
          <div className="about-card">
            <i className="fas fa-eye" />
            <h3>Our Vision</h3>
            <p>Build India's most trusted platform for exchanging old and used books.</p>
          </div>
          <div className="about-card">
            <i className="fas fa-leaf" />
            <h3>Sustainability</h3>
            <p>Every book resold is one less book printed — good for your wallet and the planet.</p>
          </div>
          <div className="about-card">
            <i className="fas fa-users" />
            <h3>Community</h3>
            <p>Connecting students, sellers and readers in one trusted marketplace.</p>
          </div>
        </div>

        <div className="about-story">
          <h2>Why We Started</h2>
          <p>
            Textbooks and reference material can be expensive, and every year piles of used books go to waste
            after students finish their courses. OldBooks was built to close that gap — letting sellers list
            their used books quickly and helping buyers find quality books at a fraction of the price.
          </p>
        </div>
      </div>
    </section>
  );
}
