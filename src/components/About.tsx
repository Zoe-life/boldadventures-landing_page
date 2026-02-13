import React from 'react';

const About: React.FC = () => {
  return (
    <section className="section" id="about">
      <div className="section-title">
        <h2>
          about <span>us</span>
        </h2>
      </div>
      <div className="section-center about-center">
        <article className="about-img">
          <img src="./images/about.jpeg" className="about-photo" alt="awesome beach" />
        </article>
        <article className="about-info">
          <h3>explore the difference</h3>
          <p>
            We are passionate about travelling and are dedicated to exploring the world on two
            wheels. Whether you're seeking thrilling mountain bike adventures or leisurely cycling
            through scenic landscapes, we're here to inspire and guide you on your next journey.
          </p>
          <p>
            Our website offers a wealth of information, resources, and curated itineraries to help
            you plan unforgettable biking and hiking trips. Join us as we discover the beauty of
            the world, one pedal stroke at a time.
          </p>
          <a href="#" className="btn">
            read more
          </a>
        </article>
      </div>
    </section>
  );
};

export default About;
