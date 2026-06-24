/* ==========================================================================
   HAMBAK TECH SERVICES: TRAINING & COURSE ARCHITECTURE ENGINE
   ========================================================================== */

async function loadDynamicCourses() {
  const courseContainer = document.getElementById("coursesGrid");
  if (!courseContainer) return;

  const BACKEND_API = "https://hambak-tech-services.onrender.com/api";

  try {
    // Fetching course payloads directly from your specialized training endpoints
    const networkResponse = await fetch(`${BACKEND_API}/courses`);
    if (!networkResponse.ok) return; // Silent fallback: preserves clean static catalog if route is unpopulated

    const dataPayload = await networkResponse.json();
    const coursesArray = Array.isArray(dataPayload) ? dataPayload : (dataPayload.courses || null);

    if (coursesArray && coursesArray.length > 0) {
      courseContainer.innerHTML = ""; // Safe to wipe hardcoded cards now

      coursesArray.forEach(course => {
        const parsedCard = document.createElement("div");
        parsedCard.className = "course-card";

        const assetImage = course.image 
          ? (course.image.startsWith('http') ? course.image : `${BACKEND_API}/..${course.image}`)
          : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";

        parsedCard.innerHTML = `
          <div class="course-image">
            <img src="${assetImage}" alt="${course.title || 'Hambak Technical Syllabus Unit'}">
          </div>
          <div class="course-content">
            <div class="course-level">${course.level || 'Professional'}</div>
            <h3>${course.title || course.name}</h3>
            <p>${course.description || 'Premium technical training curriculum deployed under standard Hambak operations.'}</p>
            <div class="course-meta">
              <span><i class="fa-solid fa-clock"></i> ${course.duration || 'Flexible'}</span>
              <span><i class="fa-solid fa-user-group"></i> Active Enrollment</span>
            </div>
            <div class="course-price">₦${Number(course.price).toLocaleString()}</div>
            <button onclick="handleCourseEnrollment('${course._id}', '${(course.title || course.name).replace(/'/g, "\\'")}')" class="course-btn">Enroll Now</button>
          </div>
        `;
        courseContainer.appendChild(parsedCard);
      });
    }
  } catch (fault) {
    console.error("Course matrix infrastructure synchronization failure context:", fault);
  }
}

// Global scope enrollment routing pipeline
window.handleCourseEnrollment = function(courseId, courseName) {
  // Directly routing to WhatsApp with structured text parameters
  const operationalText = `Hello Hambak Tech and Services, I am highly interested in registering for the "${courseName}" course tract. Please guide me through the onboarding process.`;
  window.location.href = `https://wa.me/2349127469686?text=${encodeURIComponent(operationalText)}`;
};

document.addEventListener("DOMContentLoaded", () => {
  loadDynamicCourses();
});
