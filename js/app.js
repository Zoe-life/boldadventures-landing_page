// ********** set date ************
// select span
const date = (document.getElementById(
  "date"
).innerHTML = new Date().getFullYear());

// ********** nav toggle ************
// select button and links
const navBtn = document.getElementById("nav-toggle");
const links = document.getElementById("nav-links");
// add event listener
navBtn.addEventListener("click", () => {
  links.classList.toggle("show-links");
});

// ********** smooth scroll ************
// select links
const scrollLinks = document.querySelectorAll(".scroll-link");
scrollLinks.forEach(link => {
  link.addEventListener("click", e => {
    // prevent default
    e.preventDefault();
    links.classList.remove("show-links");

    const id = e.target.getAttribute("href").slice(1);
    const element = document.getElementById(id);
    //
    let position = element.offsetTop - 62;

    window.scrollTo({
      left: 0,
      // top: element.offsetTop,
      top: position,
      behavior: "smooth"
    });
  });
});

// ********** Read More Button Functionality ************
// Add event listener for read more button in about section
const readMoreBtn = document.getElementById('read-more-btn');
const moreContent = document.getElementById('about-more-content');

if (readMoreBtn && moreContent) {
  readMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (moreContent.style.display === 'none') {
      moreContent.style.display = 'block';
      readMoreBtn.textContent = 'read less';
    } else {
      moreContent.style.display = 'none';
      readMoreBtn.textContent = 'read more';
    }
  });
}

// ********** Tour Booking Functionality ************
// Add event listeners to all booking buttons
document.addEventListener('DOMContentLoaded', () => {
  const bookingButtons = document.querySelectorAll('.book-tour-btn');
  
  bookingButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Check if user is logged in
      if (!isLoggedIn()) {
        // Redirect to login page
        alert('Please sign in or sign up to book a tour.');
        window.location.href = '/login.html';
        return;
      }
      
      // Get tour information from the card
      const tourCard = e.target.closest('.tour-card');
      const tourId = tourCard.getAttribute('data-tour-id');
      const tourTitle = tourCard.querySelector('h4').textContent;
      
      // Show booking modal or prompt
      const numberOfPeople = prompt(`How many people are booking for "${tourTitle}"?`, '1');
      
      if (numberOfPeople && parseInt(numberOfPeople) > 0) {
        // Calculate start date (1 month from now without mutating the date object)
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString();
        
        // Create booking
        createBooking(tourId, startDate, parseInt(numberOfPeople))
          .then(booking => {
            alert(`✓ Booking successful! Your booking reference is ${booking._id.substring(0, 8).toUpperCase()}`);
          })
          .catch(error => {
            alert(`✗ Booking failed: ${error.message}`);
          });
      }
    });
  });
});

// ********** Newsletter form integration ************
// This will be enabled when backend is running
// Uncomment the code below to enable newsletter subscription

/*
const newsletterForm = document.querySelector('.contact-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitBtn = newsletterForm.querySelector('.btn-submit');
    const email = emailInput.value;
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';
    
    try {
      // Note: This requires the backend API to be running
      const API_BASE_URL = window.location.origin.includes('localhost') 
        ? 'http://localhost:5000/api' 
        : window.location.origin + '/api';
      
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✓ Successfully subscribed to newsletter!');
        emailInput.value = '';
      } else {
        alert('✗ ' + data.message);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('✗ Failed to subscribe. Please try again later.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'submit';
    }
  });
}
*/