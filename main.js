// Carousel functionality
let currentImageIndex = 0;
const carouselImages = document.querySelectorAll('.carousel-img');
const totalImages = carouselImages.length;

function showImage(index) {
  // Remove active class from all images
  carouselImages.forEach(img => img.classList.remove('active'));
  
  // Add active class to current image
  carouselImages[index].classList.add('active');
}

function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % totalImages;
  showImage(currentImageIndex);
}

// Change image every 5 seconds
setInterval(nextImage, 5000);

// Update active navigation link based on scroll position
function updateActiveLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    // If section is in view (within 100px from top)
    if (window.scrollY >= sectionTop - 100) {
      currentSection = section.getAttribute('id');
    }
  });
  
  // Remove active class from all links
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current section's link
  if (currentSection) {
    const activeLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

// Update active link on scroll
window.addEventListener('scroll', updateActiveLink);

// Update active link when clicking navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function() {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// Initialize on page load
updateActiveLink();
