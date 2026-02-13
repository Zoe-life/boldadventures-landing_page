import React from 'react';

interface Tour {
  image: string;
  date: string;
  title: string;
  duration?: string;
  showDurationInTitle?: boolean;
  description: string;
  location: string;
  price: string;
}

const FeaturedTours: React.FC = () => {
  const tours: Tour[] = [
    {
      image: './images/tour-1.jpeg',
      date: 'august 26th, 2020',
      title: 'tibet adventure',
      duration: '6 days',
      showDurationInTitle: true,
      description:
        'Tibet, the Roof of the World, offers a truly unique and transformative experience. The tour ventured into this mystical land, exploring its ancient monasteries, breathtaking landscapes, and rich cultural heritage. Hiking through the Himalayas, the group was rewarded with panoramic views of snow-capped peaks and serene valleys. The Tibetan culture, deeply intertwined with Buddhism, is renowned for its spiritual practices, intricate art, and traditional music. The tour provided a glimpse into the lives of the Tibetan people, their resilience, and their unwavering devotion to their faith.',
      location: 'china',
      price: 'from Ksh.340,000',
    },
    {
      image: './images/tour-2.jpeg',
      date: 'october 1th, 2020',
      title: 'best of java',
      duration: '11 days',
      showDurationInTitle: false,
      description:
        'Java, the most populous island in the world, offers a captivating blend of ancient culture, stunning landscapes, and vibrant cities. The tour delved into the heart of Indonesia, exploring iconic landmarks like Borobudur Temple, one of the world\'s largest Buddhist temples. Hiking through the lush jungles of Bromo Tengger Semeru National Park, the group witnessed the awe-inspiring volcanic landscapes and experienced the thrill of witnessing a volcanic eruption. The Javanese culture, influenced by Hinduism, Buddhism, and Islam, is renowned for its intricate arts, traditional dances, and delicious cuisine. The tour provided a glimpse into the daily lives of the Javanese people, their warm hospitality, and their deep connection to their heritage.',
      location: 'indonesia',
      price: 'from Ksh.200,000',
    },
    {
      image: './images/tour-3.jpeg',
      date: 'september 15th, 2020',
      title: 'explore hong kong',
      duration: '8 days',
      showDurationInTitle: true,
      description:
        'The tour ventured into the heart of Hong Kong, a vibrant metropolis that seamlessly blends towering skyscrapers with lush greenery. The group embarked on thrilling bike rides along the Victoria Harbour, soaking in the breathtaking panoramic views of the city skyline. For those seeking a more immersive experience, hiking trails led them through the tranquil Tai Mo Shan Country Park, offering a serene escape from the urban hustle and bustle.',
      location: 'hong kong',
      price: 'from Ksh.300,000',
    },
    {
      image: './images/tour-4.jpeg',
      date: 'december 5th, 2020',
      title: 'kenya highlights',
      duration: '20 days',
      showDurationInTitle: true,
      description:
        'Kenya, a land of contrasts, offers an unforgettable journey for those seeking to immerse themselves in the wonders of the African continent. The tour embarked on thrilling game drives through renowned national parks like Maasai Mara, witnessing the majestic wildlife in their natural habitat. The vibrant African sunsets painted the sky in hues of orange and gold, creating a breathtaking backdrop for unforgettable memories. For the adventurous, endless biking trails led through diverse landscapes, from the rugged plains to the lush forests. The tour also delved into the rich Kenyan culture, experiencing the warmth and hospitality of the local people and learning about their traditions and customs.',
      location: 'kenya',
      price: 'from Ksh.100,000',
    },
  ];

  return (
    <section className="section" id="featured">
      <div className="section-title">
        <h2>
          featured <span>tours</span>
        </h2>
      </div>
      <div className="section-center featured-center">
        {tours.map((tour, index) => (
          <article className="tour-card" key={index}>
            <div className="tour-img-container">
              <img src={tour.image} className="tour-img" alt="" />
              <p className="tour-date">{tour.date}</p>
            </div>
            <div className="tour-info">
              {tour.showDurationInTitle && tour.duration && (
                <div className="tour-title">
                  <h4>{tour.title}</h4>
                  <p>{tour.duration}</p>
                </div>
              )}
              {!tour.showDurationInTitle && <h4>{tour.title}</h4>}
              <p>{tour.description}</p>
              <div className="tour-footer">
                <p>
                  <span>
                    <i className="fas fa-map"></i>
                    {tour.location}
                  </span>
                </p>
                {!tour.showDurationInTitle && tour.duration && <p>{tour.duration}</p>}
                <p>{tour.price}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="tour-btn">
        <a href="#" className="btn">
          all tours
        </a>
      </div>
    </section>
  );
};

export default FeaturedTours;
