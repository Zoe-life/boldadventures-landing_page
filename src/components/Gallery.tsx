import React from 'react';

interface GalleryImage {
  src: string;
  alt: string;
}

const Gallery: React.FC = () => {
  const images: GalleryImage[] = [
    { src: './images/tour-1.jpeg', alt: '' },
    { src: './images/tour-2.jpeg', alt: '' },
    { src: './images/tour-3.jpeg', alt: '' },
    { src: './images/tour-4.jpeg', alt: '' },
    { src: './images/tour-5.jpeg', alt: '' },
    { src: './images/tour-6.jpeg', alt: '' },
    { src: './images/tour-1.jpeg', alt: '' },
    { src: './images/tour-2.jpeg', alt: '' },
  ];

  return (
    <section id="gallery">
      <div className="gallery-center">
        {images.map((image, index) => (
          <article className="gallery-img-container" key={index}>
            <img src={image.src} className="gallery-img" alt={image.alt} />
            <a href="#" className="gallery-icon">
              <i className="fas fa-search"></i>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
