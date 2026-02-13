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

// ********** Update navbar based on user role ************
document.addEventListener('DOMContentLoaded', async () => {
  const navIcons = document.querySelector('.nav-icons');
  
  // Check if user is logged in
  if (isLoggedIn()) {
    try {
      const user = await getCurrentUser();
      
      // Add role-based dashboard link
      let dashboardLink = '';
      if (user.role === 'admin') {
        dashboardLink = `
          <li>
            <a href="admin.html" class="nav-icon" title="Admin Dashboard">
              <i class="fas fa-user-shield"></i>
            </a>
          </li>
        `;
      } else if (user.role === 'guide') {
        dashboardLink = `
          <li>
            <a href="guide.html" class="nav-icon" title="Guide Dashboard">
              <i class="fas fa-hiking"></i>
            </a>
          </li>
        `;
      }
      
      // Add user profile and logout links
      navIcons.innerHTML = `
        ${dashboardLink}
        <li>
          <a href="#" class="nav-icon" title="${user.name}" id="user-profile">
            <i class="fas fa-user"></i>
          </a>
        </li>
        <li>
          <a href="#" class="nav-icon" title="Logout" id="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
          </a>
        </li>
      `;
      
      // Add logout handler
      document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
        window.location.reload();
      });
      
      // Add profile handler
      document.getElementById('user-profile').addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Logged in as ${user.name} (${user.role})`);
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Keep default social icons if error
    }
  } else {
    // Add login link for non-logged-in users
    const loginLink = `
      <li>
        <a href="login.html" class="nav-icon" title="Login">
          <i class="fas fa-sign-in-alt"></i>
        </a>
      </li>
    `;
    navIcons.innerHTML += loginLink;
  }
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

// ********** View Tours by Service Category ************
// Sample tour data categorized by service type
const toursByCategory = {
  'adventure-package': [
    {
      id: 'tour-4',
      title: 'Kenya Highlights',
      description: 'Kenya, a land of contrasts, offers an unforgettable journey for those seeking to immerse themselves in the wonders of the African continent. The tour embarked on thrilling game drives through renowned national parks like Maasai Mara.',
      duration: '20 days',
      price: 'Ksh.100,000',
      location: 'Kenya',
      difficulty: 'Moderate',
      image: './images/tour-4.jpeg'
    }
  ],
  'biking': [
    {
      id: 'tour-3',
      title: 'Explore Hong Kong',
      description: 'The tour ventured into the heart of Hong Kong, a vibrant metropolis that seamlessly blends towering skyscrapers with lush greenery. The group embarked on thrilling bike rides along the Victoria Harbour.',
      duration: '8 days',
      price: 'Ksh.300,000',
      location: 'Hong Kong',
      difficulty: 'Easy',
      image: './images/tour-3.jpeg'
    }
  ],
  'hiking': [
    {
      id: 'tour-1',
      title: 'Tibet Adventure',
      description: 'Tibet, the Roof of the World, offers a truly unique and transformative experience. The tour ventured into this mystical land, exploring its ancient monasteries, breathtaking landscapes, and rich cultural heritage.',
      duration: '6 days',
      price: 'Ksh.340,000',
      location: 'China',
      difficulty: 'Difficult',
      image: './images/tour-1.jpeg'
    },
    {
      id: 'tour-2',
      title: 'Best of Java',
      description: 'Java, the most populous island in the world, offers a captivating blend of ancient culture, stunning landscapes, and vibrant cities. The tour delved into the heart of Indonesia, exploring iconic landmarks.',
      duration: '11 days',
      price: 'Ksh.200,000',
      location: 'Indonesia',
      difficulty: 'Moderate',
      image: './images/tour-2.jpeg'
    }
  ]
};

// View Tours Modal functionality
document.addEventListener('DOMContentLoaded', () => {
  const viewToursButtons = document.querySelectorAll('.view-tours-btn');
  const toursModal = document.getElementById('tours-modal');
  const closeModalBtn = document.getElementById('close-tours-modal');
  const modalTitle = document.getElementById('tours-modal-title');
  const modalBody = document.getElementById('tours-modal-body');

  // Open modal with category tours
  viewToursButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const category = button.getAttribute('data-category');
      const categoryName = button.closest('.service').querySelector('.service-title').textContent;
      
      // Update modal title
      modalTitle.textContent = `${categoryName} Tours`;
      
      // Get tours for this category
      const tours = toursByCategory[category] || [];
      
      // Render tours
      if (tours.length === 0) {
        modalBody.innerHTML = '<p class="no-tours">No tours available in this category yet.</p>';
      } else {
        modalBody.innerHTML = tours.map(tour => `
          <article class="modal-tour-card">
            <div class="modal-tour-img-container">
              <img src="${tour.image}" alt="${tour.title}" class="modal-tour-img" />
              <span class="difficulty-badge difficulty-${tour.difficulty.toLowerCase()}">${tour.difficulty}</span>
            </div>
            <div class="modal-tour-info">
              <h4>${tour.title}</h4>
              <p>${tour.description}</p>
              <div class="modal-tour-footer">
                <p><i class="fas fa-map"></i> ${tour.location}</p>
                <p><i class="fas fa-clock"></i> ${tour.duration}</p>
                <p><strong>${tour.price}</strong></p>
              </div>
              <button class="btn book-tour-btn" data-tour-id="${tour.id}">Book Now</button>
            </div>
          </article>
        `).join('');
        
        // Add event listeners to booking buttons in modal
        const modalBookButtons = modalBody.querySelectorAll('.book-tour-btn');
        modalBookButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if user is logged in
            if (!isLoggedIn()) {
              alert('Please sign in or sign up to book a tour.');
              window.location.href = '/login.html';
              return;
            }
            
            const tourId = btn.getAttribute('data-tour-id');
            const tourCard = btn.closest('.modal-tour-card');
            const tourTitle = tourCard.querySelector('h4').textContent;
            
            // Show booking prompt
            const numberOfPeople = prompt(`How many people are booking for "${tourTitle}"?`, '1');
            
            if (numberOfPeople && parseInt(numberOfPeople) > 0) {
              // Calculate start date (1 month from now)
              const today = new Date();
              const startDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString();
              
              // Create booking
              createBooking(tourId, startDate, parseInt(numberOfPeople))
                .then(booking => {
                  alert(`✓ Booking successful! Your booking reference is ${booking._id.substring(0, 8).toUpperCase()}`);
                  toursModal.classList.remove('show-modal');
                })
                .catch(error => {
                  alert(`✗ Booking failed: ${error.message}`);
                });
            }
          });
        });
      }
      
      // Show modal
      toursModal.classList.add('show-modal');
    });
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    toursModal.classList.remove('show-modal');
  });

  // Close modal when clicking outside
  toursModal.addEventListener('click', (e) => {
    if (e.target === toursModal) {
      toursModal.classList.remove('show-modal');
    }
  });
});