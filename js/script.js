// --- Mobile Navigation Toggle ---
document.addEventListener('DOMContentLoaded', function () {
  var mobileMenuToggle = document.getElementById('mobileMenuToggle');
  var navMenu = document.querySelector('.nav-menu');

  if (!mobileMenuToggle || !navMenu) {
    return;
  }

  function closeMobileMenu() {
    navMenu.classList.remove('mobile-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
  }

  mobileMenuToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('mobile-open');
    mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('mobile-menu-open', isOpen);
  });

  navMenu.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', function (event) {
    if (!navMenu.classList.contains('mobile-open')) {
      return;
    }
    if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) {
      closeMobileMenu();
    }
  });
});

// --- Project CTA Buttons Scroll to Contact ---
document.addEventListener('DOMContentLoaded', function () {
  var quoteBtn = document.querySelector('.project-cta-btn.primary');
  var callBtn = document.querySelector('.project-cta-btn.secondary');
  var contactFormSection = document.querySelector('.contact-form-section');
  if (quoteBtn && contactFormSection) {
    quoteBtn.addEventListener('click', function (e) {
      e.preventDefault();
      contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  if (callBtn && contactFormSection) {
    callBtn.addEventListener('click', function (e) {
      e.preventDefault();
      contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});
// --- About Partner With Us Buttons Scroll ---
document.addEventListener('DOMContentLoaded', function () {
  var aboutPartnerContact = document.getElementById('about-partner-contact');
  var aboutPartnerProducts = document.getElementById('about-partner-products');
  var contactFormSection = document.querySelector('.contact-form-section');
  var productsSection = document.getElementById('products');
  if (aboutPartnerContact && contactFormSection) {
    aboutPartnerContact.addEventListener('click', function (e) {
      e.preventDefault();
      contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  if (aboutPartnerProducts && productsSection) {
    aboutPartnerProducts.addEventListener('click', function (e) {
      e.preventDefault();
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
// --- Scroll to Contact Form from Home CTA Button ---
document.addEventListener('DOMContentLoaded', function () {
  var ctaBtn = document.querySelector('.cta-btn.cta-btn-blue');
  var contactFormSection = document.querySelector('.contact-form-section');
  if (ctaBtn && contactFormSection) {
    ctaBtn.addEventListener('click', function (e) {
      e.preventDefault();
      contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});
// --- Scroll to Contact Form from Product Modal ---
document.addEventListener('DOMContentLoaded', function () {
  var modalContactBtns = document.querySelectorAll('.product-modal-btn.secondary, .product-modal-btn.primary');
  var contactFormSection = document.querySelector('.contact-form-section');
  if (modalContactBtns && contactFormSection) {
    modalContactBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('product-modal').style.display = 'none';
        setTimeout(function () {
          contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      });
    });
  }
});
// --- Scroll to Contact Form on Header Button Click ---
document.addEventListener('DOMContentLoaded', function () {
  var contactBtn = document.getElementById('contactBtn');
  var contactFormSection = document.querySelector('.contact-form-section');
  if (contactBtn && contactFormSection) {
    contactBtn.addEventListener('click', function (e) {
      e.preventDefault();
      contactFormSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});
// --- Product Modal Functionality ---
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('productModalClose');
  const img = document.getElementById('productModalImg');
  const title = document.getElementById('productModalTitle');
  const title2 = document.getElementById('productModalTitle2');
  const type = document.getElementById('productModalType');
  const type2 = document.getElementById('productModalType2');
  const material = document.getElementById('productModalMaterial');
  const category = document.getElementById('productModalCategory');
  const category2 = document.getElementById('productModalCategory2');
  const length = document.getElementById('productModalLength');
  const height = document.getElementById('productModalHeight');
  const width = document.getElementById('productModalWidth');
  const weight = document.getElementById('productModalWeight');
  const color = document.getElementById('productModalColor');
  const durability = document.getElementById('productModalDurability');
  const application = document.getElementById('productModalApplication');
  const usage = document.getElementById('productModalUsage');

  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      img.src = btn.getAttribute('data-img');
      title.textContent = btn.getAttribute('data-title');
      if (title2) title2.textContent = btn.getAttribute('data-title');
      type.textContent = btn.getAttribute('data-type');
      if (type2) type2.textContent = btn.getAttribute('data-type');
      material.textContent = btn.getAttribute('data-material');
      category.textContent = btn.getAttribute('data-category');
      if (category2) category2.textContent = btn.getAttribute('data-category');
      if (length) length.textContent = btn.getAttribute('data-length') || '';
      if (height) height.textContent = btn.getAttribute('data-height') || '';
      if (width) width.textContent = btn.getAttribute('data-width') || '';
      if (weight) weight.textContent = btn.getAttribute('data-weight') || '';
      if (color) color.textContent = btn.getAttribute('data-color') || '';
      if (durability) durability.textContent = btn.getAttribute('data-durability') || '';
      if (application) application.textContent = btn.getAttribute('data-application') || '';
      if (usage) usage.textContent = btn.getAttribute('data-usage') || '';
      modal.style.display = 'flex';
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
});

// --- Carousel Functionality ---
let currentImageIndex = 0;
const carouselImages = document.querySelectorAll('.carousel-img');
const totalImages = carouselImages.length;

function showImage(index) {
  carouselImages.forEach(img => img.classList.remove('active'));
  carouselImages[index].classList.add('active');
}

function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % totalImages;
  showImage(currentImageIndex);
}

setInterval(nextImage, 5000);

// --- Product Gallery Modal Functionality ---
const galleryImages = [];
for (let i = 1; i <= 143; i++) {
  galleryImages.push(`images/gallery_img/gal${i}.png`);
}

let galleryCurrent = 0;
const openGalleryBtn = document.getElementById('open-gallery-modal');
const galleryModal = document.getElementById('gallery-modal');
const galleryModalImg = document.getElementById('gallery-modal-img');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');
const closeGalleryBtn = document.getElementById('close-gallery-modal');

function showGalleryImage(idx) {
  galleryCurrent = (idx + galleryImages.length) % galleryImages.length;
  galleryModalImg.src = galleryImages[galleryCurrent];
}

if (openGalleryBtn && galleryModal && galleryModalImg) {
  openGalleryBtn.addEventListener('click', function () {
    galleryModal.style.display = 'flex';
    showGalleryImage(0);
  });
}

if (closeGalleryBtn && galleryModal) {
  closeGalleryBtn.addEventListener('click', function () {
    galleryModal.style.display = 'none';
  });
}

if (galleryPrev) {
  galleryPrev.addEventListener('click', function () {
    showGalleryImage(galleryCurrent - 1);
  });
}

if (galleryNext) {
  galleryNext.addEventListener('click', function () {
    showGalleryImage(galleryCurrent + 1);
  });
}

if (galleryModal) {
  galleryModal.addEventListener('click', function (e) {
    if (e.target === galleryModal) {
      galleryModal.style.display = 'none';
    }
  });
}

// --- Product Video Gallery Modal Functionality ---
const videoFiles = [];
for (let i = 1; i <= 22; i++) {
  videoFiles.push(`videos/vid${i}.mp4`);
}
const videoPosters = [
  'images/home_product/conventional.png',
  'images/home_product/shiplap.png',
  'images/home_product/Gallery.png'
];

let videoCurrent = 0;
const openVideoBtn = document.getElementById('open-video-modal');
const videoModal = document.getElementById('video-modal');
const videoModalPlayer = document.getElementById('video-modal-player');
const videoPrev = document.getElementById('video-prev');
const videoNext = document.getElementById('video-next');
const closeVideoBtn = document.getElementById('close-video-modal');

function showVideo(idx) {
  videoCurrent = (idx + videoFiles.length) % videoFiles.length;
  videoModalPlayer.src = videoFiles[videoCurrent];
  // No poster image
  videoModalPlayer.removeAttribute('poster');
  videoModalPlayer.load();
}

if (openVideoBtn && videoModal && videoModalPlayer) {
  openVideoBtn.addEventListener('click', function () {
    videoModal.style.display = 'flex';
    showVideo(0);
  });
}

if (closeVideoBtn && videoModal) {
  closeVideoBtn.addEventListener('click', function () {
    videoModal.style.display = 'none';
    videoModalPlayer.pause();
  });
}

if (videoPrev) {
  videoPrev.addEventListener('click', function () {
    showVideo(videoCurrent - 1);
  });
}

if (videoNext) {
  videoNext.addEventListener('click', function () {
    showVideo(videoCurrent + 1);
  });
}

if (videoModal) {
  videoModal.addEventListener('click', function (e) {
    if (e.target === videoModal) {
      videoModal.style.display = 'none';
      videoModalPlayer.pause();
    }
  });
}

// === Scroll to Top/Bottom Buttons ===
document.addEventListener('DOMContentLoaded', function () {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');

  function checkScrollButtons() {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    // Show top button if scrolled down 200px
    if (scrollY > 200) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
    // Show bottom button if not near bottom (200px from bottom)
    if (scrollY + windowHeight < docHeight - 200) {
      scrollToBottomBtn.classList.add('visible');
    } else {
      scrollToBottomBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', checkScrollButtons);
  window.addEventListener('resize', checkScrollButtons);
  checkScrollButtons();

  scrollToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  scrollToBottomBtn.addEventListener('click', function () {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });
});
// === End Scroll to Top/Bottom Buttons ===