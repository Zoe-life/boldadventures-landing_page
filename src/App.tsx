import React from 'react';
import Header from './components/Header';
import About from './components/About';
import Services from './components/Services';
import FeaturedTours from './components/FeaturedTours';
import Contact from './components/Contact';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import './styles/styles.scss';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <About />
      <Services />
      <FeaturedTours />
      <Contact />
      <Gallery />
      <Footer />
    </>
  );
};

export default App;
