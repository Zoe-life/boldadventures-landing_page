import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Newsletter functionality can be implemented here
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className="section contact" id="contact">
      <div className="section-center contact-center">
        <article className="contact-title">
          <h3>want latest tour info and updates?</h3>
          <p>Sign up for newsletter and stay up to date</p>
        </article>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-submit">
            submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
