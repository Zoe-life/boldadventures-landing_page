import React from 'react';

interface Service {
  icon: string;
  title: string;
  text: string;
}

const Services: React.FC = () => {
  const services: Service[] = [
    {
      icon: 'fas fa-wallet fa-fw',
      title: 'Adventure packages',
      text: 'Our adventure packages offer the ultimate combination of hiking and biking, allowing you to experience the best of both worlds. Explore stunning landscapes on foot, then hop on a bike to cover more ground and see even more. Our packages are carefully designed to provide a balanced and exciting experience, ensuring that you make the most of your adventure. Whether you\'re seeking a relaxing getaway or an adrenaline-pumping challenge, our adventure packages have something to offer everyone.',
    },
    {
      icon: 'fas fa-tree fa-fw',
      title: 'endless biking',
      text: 'Our endless biking adventures are perfect for those who crave the freedom and exhilaration of two-wheeled exploration. Whether you prefer scenic road biking or challenging mountain trails, we have the perfect route for you. Explore picturesque landscapes, experience the thrill of downhill descents, and discover hidden gems along the way. Our biking tours are designed to cater to all levels of riders, ensuring a memorable and enjoyable experience for everyone.',
    },
    {
      icon: 'fas fa-socks fa-fw',
      title: 'guided hiking tours',
      text: 'Our guided hiking tours offer a unique opportunity to experience breathtaking landscapes and challenging trails under the guidance of experienced professionals. Whether you\'re seeking a leisurely stroll through ancient forests or a rigorous ascent to a mountain peak, our expertly curated itineraries cater to all levels of hikers. Enjoy the camaraderie of like-minded travelers, learn about local flora and fauna, and discover hidden gems that you may have missed on your own.',
    },
  ];

  return (
    <section className="section services" id="services">
      <div className="section-title">
        <h2>
          our <span>services</span>
        </h2>
      </div>
      <div className="section-center services-center">
        {services.map((service, index) => (
          <article className="service" key={index}>
            <span className="service-icon">
              <i className={service.icon}></i>
            </span>
            <div className="service-info">
              <h4 className="service-title">{service.title}</h4>
              <p className="service-text">{service.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Services;
