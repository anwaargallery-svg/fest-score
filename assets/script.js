// Global Snackbar Utility with Undo Feature
window.showSnackbar = function(message, undoCallback = null) {
    let snackbar = document.getElementById('custom-snackbar');
    if (!snackbar) {
        snackbar = document.createElement('div');
        snackbar.id = 'custom-snackbar';
        snackbar.className = 'd-flex align-items-center text-white rounded shadow-lg';
        snackbar.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translate(-50%, 150px); z-index: 9999; min-width: 320px; max-width: 500px; padding: 12px 20px; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease; opacity: 0; background: rgba(33, 37, 41, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15);';
        document.body.appendChild(snackbar);
    }

    // Reset state & reflow for animations
    snackbar.style.transition = 'none';
    snackbar.style.transform = 'translate(-50%, 150px)'; snackbar.style.opacity = '0';
    void snackbar.offsetWidth; 
    snackbar.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';

    snackbar.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-center">
            <span class="me-auto">${message}</span>
            ${undoCallback ? '<button id="snackbar-undo-btn" class="btn btn-sm btn-warning fw-bold ms-3">UNDO</button>' : ''}
            <button type="button" id="snackbar-close-btn" class="btn-close btn-close-white ms-3" aria-label="Close"></button>
        </div>
    `;

    snackbar.style.transform = 'translate(-50%, 0)'; snackbar.style.opacity = '1';
    if (window.snackbarTimeout) clearTimeout(window.snackbarTimeout);
    
    const hide = () => { snackbar.style.transform = 'translate(-50%, 150px)'; snackbar.style.opacity = '0'; };
    window.snackbarTimeout = setTimeout(hide, 5000);

    document.getElementById('snackbar-close-btn').addEventListener('click', () => { clearTimeout(window.snackbarTimeout); hide(); });
    if (undoCallback) {
        document.getElementById('snackbar-undo-btn').addEventListener('click', () => {
            clearTimeout(window.snackbarTimeout); hide(); undoCallback();
        });
    }
};

// --- Dynamic Rounded Favicon (Browser Tab Icon) ---
(function makeFaviconRound() {
    const favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) return;
    
    const img = new Image();
    img.src = favicon.href;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 64;
        canvas.height = img.height || 64;
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        favicon.href = canvas.toDataURL('image/png');
    };
})();

// Helper to handle local file vs server environments
const getApiUrl = (endpoint) => {
    // Use relative paths for API calls. This works for both local and deployed environments.
    // Example: /api/settings
    return endpoint;
};

document.addEventListener('DOMContentLoaded', function() {

    // --- Load News & Announcements ---
    const loadNews = async () => {
        const container = document.getElementById('news-container');
        if (!container) return;

        try {
            const response = await fetch(getApiUrl('/api/admin/data')); // We can use the same admin data endpoint
            const data = await response.json();
            const news = data.news || [];

            if (news.length === 0) {
                container.innerHTML = '<div class="col-12 text-center text-muted">No announcements at the moment. Please check back later.</div>';
                return;
            }

            container.innerHTML = '';
            news.slice(-6).reverse().forEach(item => { // Show latest 6
                const categoryBadge = item.category === 'Event' ? 'bg-success' : (item.category === 'Achievement' ? 'bg-info' : 'bg-secondary');
                container.innerHTML += `
                    <div class="col-md-6 col-lg-4" data-aos="fade-up">
                        <div class="card h-100 shadow-sm border-0 rounded-4">
                            <div class="card-body d-flex flex-column">
                                <div class="mb-2">
                                    <span class="badge ${categoryBadge} me-2">${item.category}</span>
                                    <small class="text-muted">${new Date(item.createdAt).toLocaleDateString()}</small>
                                </div>
                                <h5 class="card-title fw-bold">${item.title}</h5>
                                <p class="card-text text-muted small flex-grow-1">${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</p>
                                <a href="#" class="btn btn-sm btn-outline-primary stretched-link" data-bs-toggle="modal" data-bs-target="#newsDetailModal" data-news-id="${item.id}">Read More</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } catch (err) { container.innerHTML = '<div class="col-12 text-center text-danger">Failed to load news.</div>'; }
    };
    loadNews();

    // --- Load Dynamic About Us / Learn More Content ---
    const storedAbout = JSON.parse(localStorage.getItem('anwariyya_about_content'));
    if (storedAbout) {
        const aboutTitle = document.getElementById('aboutTitle');
        const aboutSubtitle = document.getElementById('aboutSubtitle');
        const aboutDescription = document.getElementById('aboutDescription');
        const aboutImage = document.getElementById('aboutImage');
        
        if (aboutTitle && storedAbout.title) aboutTitle.innerText = storedAbout.title;
        if (aboutSubtitle && storedAbout.subtitle) aboutSubtitle.innerText = storedAbout.subtitle;
        if (aboutDescription && storedAbout.description) aboutDescription.innerText = storedAbout.description;
        if (aboutImage && storedAbout.image) aboutImage.src = storedAbout.image;
    }

    // --- Load Additional Custom Sections ---
    const customSections = JSON.parse(localStorage.getItem('anwariyya_dynamic_contents')) || [];
    const customSectionsContainer = document.getElementById('dynamicCustomSections');
    
    if (customSectionsContainer && customSections.length > 0) {
        let sectionsHTML = '';
        customSections.forEach((section, idx) => {
            const isEven = idx % 2 === 0;
            const imgHTML = section.image 
                ? `<div class="col-12 col-md-6 ${isEven ? 'order-md-2' : ''}" data-aos="${isEven ? 'fade-left' : 'fade-right'}"><img src="${section.image}" class="img-fluid rounded-4 shadow-lg w-100 border border-4 border-white" style="object-fit: cover; max-height: 400px;"></div>` 
                : '';
            const textHTML = `
                <div class="col-12 ${section.image ? 'col-md-6' : ''} text-center text-md-start ${isEven ? 'order-md-1 pe-md-5' : 'ps-md-5'}" data-aos="${isEven ? 'fade-right' : 'fade-left'}">
                    <h2 class="fw-bold fs-2 text-uppercase mb-3">${section.title}</h2>
                    <p class="text-muted mb-4" style="white-space: pre-wrap;">${section.description}</p>
                </div>
            `;

            sectionsHTML += `
                <section class="py-5 ${isEven ? 'bg-light' : 'bg-white'}">
                    <div class="container pt-4 pb-2">
                        <div class="row align-items-center gy-4">
                            ${isEven ? textHTML + imgHTML : imgHTML + textHTML}
                        </div>
                    </div>
                </section>
            `;
        });
        customSectionsContainer.innerHTML = sectionsHTML;
    }

    // --- Animated Stats Counter for About Section ---
    const statsSection = document.getElementById('about');
    if (statsSection) {
        const stats = {
            years: document.getElementById('statsYears'),
            students: document.getElementById('statsStudents'),
            anwarees: document.getElementById('statsAnwarees')
        };

        const animateCounter = (element, target) => {
            let current = 0;
            const increment = Math.max(1, Math.ceil(target / 100));
            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    if (current > target) current = target;
                    element.innerText = `${current.toLocaleString()}+`;
                    requestAnimationFrame(updateCount);
                } else {
                    element.innerText = `${target.toLocaleString()}+`;
                }
            };
            updateCount();
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const defaultYears = new Date().getFullYear() - 1969;
                fetch(getApiUrl('/api/admin/data')).then(res => res.json()).then(data => {
                    const studentsDb = data.students || [];
                    const totalStudents = studentsDb.length > 0 ? studentsDb.length : 500;
                    const totalGraduates = studentsDb.filter(s => String(s.Status).toLowerCase() === 'graduated').length || 1500;
                    const yearsOfService = new Date().getFullYear() - 1969;

                    if (stats.students) animateCounter(stats.students, totalStudents);
                    if (stats.anwarees) animateCounter(stats.anwarees, totalGraduates);
                    if (stats.years) animateCounter(stats.years, yearsOfService);
                }).catch(() => {
                    if (stats.years) animateCounter(stats.years, defaultYears);
                });

                observer.disconnect(); // Animate only once
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // --- Load Gallery Images ---
    const loadGallery = async () => {
        const response = await fetch(getApiUrl('/api/admin/data'));
        const data = await response.json();
        const galleryDB = data.gallery || [];
        const categories = ['atsa', 'zuhoor', 'uroos'];
        
        categories.forEach(category => {
            const container = document.getElementById(`gallery-${category}-content`);
            if (container) {
                const categoryImages = galleryDB.filter(img => img.category === category);
                if (categoryImages.length > 0) {
                    let html = '';
                    categoryImages.forEach(img => {
                        html += `
                            <div class="col-12 col-md-4">
                                <img src="${img.image}" alt="Gallery Image" class="img-fluid rounded shadow-sm w-100 object-fit-cover" style="height: 250px;">
                            </div>
                        `;
                    });
                    container.innerHTML = html; // Replace placeholders with actual uploaded images
                }
            }
        });
    };
    loadGallery();

    // Handle Student Login
    const loginBtn = document.getElementById('studentLoginBtn');
    if (loginBtn) {
        const attemptStudentLogin = async () => {
            const enrollNo = document.getElementById('loginEnrollNo').value.trim();
            const passwordInput = document.getElementById('loginPassword');
            const password = passwordInput.value.trim();
            const loginMsg = document.getElementById('loginMessage');

            if (!enrollNo || !password) {
                loginMsg.style.display = 'block'; loginMsg.className = 'alert alert-warning';
                loginMsg.innerText = 'Please enter both Enrollment Number and Password.'; passwordInput.classList.add('is-invalid', 'text-danger');
                return;
            }

            try {
                const response = await fetch(getApiUrl('/api/login'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enrollNo, password })
                });
                const result = await response.json();

                if (result.success) {
                    loginMsg.style.display = 'block';
                    loginMsg.className = 'alert alert-success';
                    loginMsg.innerText = `Welcome, ${result.student.Name || 'Student'}! Redirecting...`;
                    passwordInput.classList.remove('is-invalid', 'text-danger');
                    sessionStorage.setItem('active_student_session', enrollNo); // Use sessionStorage for security
                    setTimeout(() => { window.location.href = "assets/subpages/student_portel/student_portal.html"; }, 1000);
                } else {
                    loginMsg.style.display = 'block';
                    loginMsg.className = 'alert alert-danger';
                    loginMsg.innerText = result.message || 'Invalid credentials.';
                    passwordInput.classList.add('is-invalid', 'text-danger');
                }
            } catch (err) {
                loginMsg.style.display = 'block';
                loginMsg.className = 'alert alert-danger';
                loginMsg.innerText = 'Could not connect to the server.';
                passwordInput.classList.add('is-invalid', 'text-danger');
            }
        };
        loginBtn.addEventListener('click', attemptStudentLogin);
        const pwdInput = document.getElementById('loginPassword');
        if (pwdInput) {
            pwdInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptStudentLogin(); });
            pwdInput.addEventListener('input', () => {
                pwdInput.classList.remove('is-invalid', 'text-danger');
                document.getElementById('loginMessage').style.display = 'none';
            });
        }
    }

    // --- Admissions Open/Close Check ---
    const checkAdmissionStatus = async () => {
        try {
            const response = await fetch(getApiUrl('/api/settings'));
            const data = await response.json();
            if (data.success && data.settings.admissionsOpen === false) {
                // Hide admission links site-wide (nav bar, footer, buttons)
                document.querySelectorAll('a[href="admission.html"]').forEach(el => el.style.display = 'none');
                document.querySelectorAll('a[href="muthawal-admission.html"]').forEach(el => el.style.display = 'none');
                
                // If on the admission page itself, redirect back to home
                const admissionFormContainer = document.getElementById('admissionFormContainer');
                if (admissionFormContainer) window.location.href = 'index.html';
            }
        } catch (error) { console.error("Could not check admission status from server:", error); }
    };
    checkAdmissionStatus();

    // Handle Admission Form Submission
    const admissionForm = document.getElementById('admissionForm');
    if (admissionForm) {
        
        const printStudentApplication = (app) => {
            const printStyles = `
                @page { size: A4; margin: 15mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 0; position: relative; }
                .watermark-text { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 6rem; color: rgba(0, 0, 0, 0.04); font-weight: bold; text-transform: uppercase; z-index: -2; white-space: nowrap; pointer-events: none; }
                .watermark-logo { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.06; width: 450px; z-index: -1; pointer-events: none; border-radius: 50%; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                th, td { padding: 10px; border: 1px solid #ccc !important; font-size: 14px; background-color: transparent !important; }
                th, .table-light th, .bg-light { background-color: #f0f0f0 !important; color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-weight: bold; }
                .header-section { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #222; padding-bottom: 15px; margin-bottom: 25px; }
                .college-title { margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000; }
                .document-title { margin: 5px 0 0; font-size: 16px; color: #555; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
                .footer-sig { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; padding: 0 40px; }
                .sig-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-weight: bold; color: #222; font-size: 14px; }
            `;

            const printWindow = window.open('', '_blank', 'height=600,width=800');
            if (!printWindow) {
                alert("Popup blocker prevented printing. Please allow popups and try again.");
                return;
            }
            
            printWindow.document.write('<html><head><title>Print Application</title>');
            printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
            printWindow.document.write(`<style>${printStyles}</style>`);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="watermark-text">OFFICIAL DOCUMENT</div>');
            printWindow.document.write('<img src="assets/images/image.png" class="watermark-logo" alt="watermark">');
            
            const photoHTML = app.photo ? `<img src="${app.photo}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #000; padding: 2px;" alt="Applicant Photo">` : '';
            const qrHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(app.appId)}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #000; padding: 2px;" alt="QR Code">`;
            
            let extraRows = '';
            if(app.houseName) extraRows += `<tr><th class="w-50 bg-light">House Name</th><td>${app.houseName}</td></tr>`;
            if(app.fatherName) extraRows += `<tr><th class="w-50 bg-light">Father's Name</th><td>${app.fatherName}</td></tr>`;
            if(app.fatherOccupation) extraRows += `<tr><th class="w-50 bg-light">Father's Occupation</th><td>${app.fatherOccupation}</td></tr>`;
            if(app.motherName) extraRows += `<tr><th class="w-50 bg-light">Mother's Name</th><td>${app.motherName}</td></tr>`;
            if(app.address) extraRows += `<tr><th class="w-50 bg-light">Permanent Address</th><td>${app.address}</td></tr>`;
            if(app.pincode) extraRows += `<tr><th class="w-50 bg-light">Pincode</th><td>${app.pincode}</td></tr>`;
            if(app.phone) extraRows += `<tr><th class="w-50 bg-light">Mobile Number</th><td>${app.phone}</td></tr>`;
            if(app.email) extraRows += `<tr><th class="w-50 bg-light">Email Address</th><td>${app.email}</td></tr>`;
            if(app.dob) extraRows += `<tr><th class="w-50 bg-light">Date of Birth</th><td>${app.dob}</td></tr>`;
            if(app.age) extraRows += `<tr><th class="w-50 bg-light">Age</th><td>${app.age}</td></tr>`;
            if(app.aadhar) extraRows += `<tr><th class="w-50 bg-light">Aadhar Number</th><td>${app.aadhar}</td></tr>`;
            
            if(app.madrasa5Name || app.madrasaName || app.madrasa5RegNo || app.madrasa5Mark || app.madrasa5Year) {
                extraRows += `<tr><th colspan="2" class="bg-light text-center">Madrasa Education (Class 5)</th></tr>`;
                if(app.madrasa5Name || app.madrasaName) extraRows += `<tr><th class="w-50 bg-light">Madrasa Name</th><td>${app.madrasa5Name || app.madrasaName}</td></tr>`;
                if(app.madrasa5RegNo || app.madrasaRegNo) extraRows += `<tr><th class="w-50 bg-light">Madrasa Reg No.</th><td>${app.madrasa5RegNo || app.madrasaRegNo}</td></tr>`;
                if(app.madrasa5Mark || app.madrasaMark) extraRows += `<tr><th class="w-50 bg-light">Total Mark</th><td>${app.madrasa5Mark || app.madrasaMark}</td></tr>`;
                if(app.madrasa5Year || app.madrasaYear) extraRows += `<tr><th class="w-50 bg-light">Year of Pass</th><td>${app.madrasa5Year || app.madrasaYear}</td></tr>`;
            }
            
            if(app.madrasa7Name || app.madrasa7RegNo || app.madrasa7Mark || app.madrasa7Year) {
                extraRows += `<tr><th colspan="2" class="bg-light text-center">Madrasa Education (Class 7)</th></tr>`;
                if(app.madrasa7Name) extraRows += `<tr><th class="w-50 bg-light">Madrasa Name</th><td>${app.madrasa7Name}</td></tr>`;
                if(app.madrasa7RegNo) extraRows += `<tr><th class="w-50 bg-light">Madrasa Reg No.</th><td>${app.madrasa7RegNo}</td></tr>`;
                if(app.madrasa7Mark) extraRows += `<tr><th class="w-50 bg-light">Total Mark</th><td>${app.madrasa7Mark}</td></tr>`;
                if(app.madrasa7Year) extraRows += `<tr><th class="w-50 bg-light">Year of Pass</th><td>${app.madrasa7Year}</td></tr>`;
            }
            
            if(app.schoolName) {
                extraRows += `<tr><th colspan="2" class="bg-light text-center">School Education</th></tr>`;
                extraRows += `<tr><th class="w-50 bg-light">School Name & Place</th><td>${app.schoolName}</td></tr>`;
            }
            
            if(app.darsName || app.usthathName || app.learnedKithabs || app.physicalEducation) {
                extraRows += `<tr><th colspan="2" class="bg-light text-center">Dars or Previous Education</th></tr>`;
                if(app.darsName) extraRows += `<tr><th class="w-50 bg-light">Name of Dars/College</th><td>${app.darsName}</td></tr>`;
                if(app.usthathName) extraRows += `<tr><th class="w-50 bg-light">Usthath's Name (Last Year)</th><td>${app.usthathName}</td></tr>`;
                if(app.learnedKithabs) extraRows += `<tr><th class="w-50 bg-light">Learned Kithabs (Last 2 Yrs)</th><td>${app.learnedKithabs}</td></tr>`;
                if(app.physicalEducation) extraRows += `<tr><th class="w-50 bg-light">Physical/Secular Education (ഭൗതിക പഠനം)</th><td>${app.physicalEducation}</td></tr>`;
            }

            printWindow.document.write(`
                <div class="header-section"><div style="width: 120px; text-align: left;"><img src="assets/images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div><div style="flex-grow: 1; text-align: center;"><h2 class="college-title">Anwariyya Arabic College</h2><h4 class="document-title">Admission Application</h4></div><div style="width: 220px; text-align: right; display: flex; justify-content: flex-end; gap: 10px; align-items: flex-start;">${qrHTML}${photoHTML}</div></div>
                <table class="table table-bordered">
                    <tbody>
                        <tr><th class="w-50 bg-light">Application ID</th><td>${app.appId}</td></tr>
                        <tr><th class="w-50 bg-light">Applicant Name</th><td>${app.name}</td></tr>
                        <tr><th class="w-50 bg-light">Course</th><td>${app.course}</td></tr>
                        ${extraRows}
                        <tr><th class="w-50 bg-light">Date Applied</th><td>${app.date}</td></tr>
                        <tr><th class="w-50 bg-light">Status</th><td>${app.status}</td></tr>
                    </tbody>
                </table>
            `);
            printWindow.document.write('<div class="footer-sig"><div class="sig-line">Date & Applicant Signature</div><div class="sig-line">Parent/Guardian Signature</div></div>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(function() {
                printWindow.print();
            }, 500);
        };
        
        // Auto fill current date
        const admDate = document.getElementById('admDate');
        if (admDate) {
            admDate.value = new Date().toISOString().split('T')[0];
        }

        // Auto calculate age
        const admDOB = document.getElementById('admDOB');
        const admAge = document.getElementById('admAge');
        if (admDOB && admAge) {
            admDOB.addEventListener('change', function() {
                const dob = new Date(this.value);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }
                admAge.value = age > 0 ? age : 0;
            });
        }

        admissionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = admissionForm.querySelector('button[type="submit"]') || admissionForm.querySelector('input[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText || submitBtn.value : 'Submit';
            if (submitBtn) {
                submitBtn.disabled = true;
                if(submitBtn.innerText) submitBtn.innerText = 'Submitting...';
                else submitBtn.value = 'Submitting...';
            }

            try {
                const formData = new FormData();
                const dateApplied = document.getElementById('admDate') ? document.getElementById('admDate').value : new Date().toISOString().split('T')[0];

                // Build a detailed object for the print preview and backend consumption
                const printAppObj = {
                    name: document.getElementById('admFullName') ? document.getElementById('admFullName').value : '',
                    course: document.getElementById('admCourse') ? document.getElementById('admCourse').value : '',
                    houseName: document.getElementById('admHouseName') ? document.getElementById('admHouseName').value : '',
                    fatherName: document.getElementById('admFatherName') ? document.getElementById('admFatherName').value : '',
                    fatherOccupation: document.getElementById('admFatherOccupation') ? document.getElementById('admFatherOccupation').value : '',
                    motherName: document.getElementById('admMotherName') ? document.getElementById('admMotherName').value : '',
                    address: document.getElementById('admAddress') ? document.getElementById('admAddress').value : '',
                    pincode: document.getElementById('admPincode') ? document.getElementById('admPincode').value : '',
                    phone: document.getElementById('admPhone') ? document.getElementById('admPhone').value : '',
                    email: document.getElementById('admEmail') ? document.getElementById('admEmail').value : '',
                    dob: document.getElementById('admDOB') ? document.getElementById('admDOB').value : '',
                    age: document.getElementById('admAge') ? document.getElementById('admAge').value : '',
                    aadhar: document.getElementById('admAadhar') ? document.getElementById('admAadhar').value : '',
                    madrasa5Name: document.getElementById('admMadrasa5Name') ? document.getElementById('admMadrasa5Name').value : '',
                    madrasa5RegNo: document.getElementById('admMadrasa5RegNo') ? document.getElementById('admMadrasa5RegNo').value : '',
                    madrasa5Mark: document.getElementById('admMadrasa5Mark') ? document.getElementById('admMadrasa5Mark').value : '',
                    madrasa5Year: document.getElementById('admMadrasa5Year') ? document.getElementById('admMadrasa5Year').value : '',
                    madrasa7Name: document.getElementById('admMadrasa7Name') ? document.getElementById('admMadrasa7Name').value : '',
                    madrasa7RegNo: document.getElementById('admMadrasa7RegNo') ? document.getElementById('admMadrasa7RegNo').value : '',
                    madrasa7Mark: document.getElementById('admMadrasa7Mark') ? document.getElementById('admMadrasa7Mark').value : '',
                    madrasa7Year: document.getElementById('admMadrasa7Year') ? document.getElementById('admMadrasa7Year').value : '',
                    schoolName: document.getElementById('admSchool') ? document.getElementById('admSchool').value : '',
                    darsName: document.getElementById('admDarsName') ? document.getElementById('admDarsName').value : '',
                    usthathName: document.getElementById('admUsthathName') ? document.getElementById('admUsthathName').value : '',
                    learnedKithabs: document.getElementById('admKithabs') ? document.getElementById('admKithabs').value : '',
                    physicalEducation: document.getElementById('admPhysicalEdu') ? document.getElementById('admPhysicalEdu').value : '',
                    date: dateApplied,
                    status: 'Pending Review'
                };

                // Append text data to FormData payload
                Object.keys(printAppObj).forEach(key => formData.append(key, printAppObj[key]));

                // Append file properly if it exists
                const photoInput = document.getElementById('admPhoto');
                if (photoInput && photoInput.files && photoInput.files[0]) {
                    formData.append('admPhoto', photoInput.files[0]);
                }

                // Make request to the Node.js server
                const response = await fetch(getApiUrl('/api/admission'), {
                    method: 'POST',
                    body: formData // The browser automatically adds correct multipart boundaries
                });

                const result = await response.json();

                if (result.success) {
                    printAppObj.appId = result.applicationId;
                    
                    const processAndSave = (photoData = '') => {
                        printAppObj.photo = photoData;
                        
                        window.showSnackbar(`Application Submitted! Your App ID is: ${result.applicationId}`);
                        
                        if (confirm(`Application Submitted Successfully!\nYour Application ID is: ${result.applicationId}\n\nDo you want to download or print your application form now?`)) {
                            printStudentApplication(printAppObj);
                        }
                        
                        admissionForm.reset();
                        if (document.getElementById('admDate')) document.getElementById('admDate').value = new Date().toISOString().split('T')[0];
                    };

                    if (photoInput && photoInput.files && photoInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) { processAndSave(e.target.result); };
                        reader.readAsDataURL(photoInput.files[0]);
                    } else {
                        processAndSave();
                    }
                } else {
                    window.showSnackbar(`Submission failed: ${result.message}`);
                }
            } catch (error) {
                console.error("Admission form submission error:", error);
                window.showSnackbar('An error occurred while connecting to the server. Please try again later.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if(submitBtn.innerText) submitBtn.innerText = originalBtnText;
                    else submitBtn.value = originalBtnText;
                }
            }
        });
    }

    // Check Admission Status Logic
    const checkStatusBtn = document.getElementById('checkStatusBtn');
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', async function() {
            const appId = document.getElementById('admissionStatusInput').value.trim();
            const resultDiv = document.getElementById('admissionStatusResult');
            if (!appId) {
                resultDiv.style.display = 'block';
                resultDiv.className = 'alert alert-warning';
                resultDiv.innerText = 'Please enter an Application ID.';
                return;
            }
    
            const response = await fetch(getApiUrl(`/api/admission-status?id=${appId}`));
            const result = await response.json();
    
            if (result.success) {
                if (result.status !== 'Not Found') {
                    resultDiv.className = 'alert alert-success';
                    resultDiv.innerHTML = `<strong>Status:</strong> ${result.status}`;
                } else {
                    resultDiv.className = 'alert alert-danger';
                    resultDiv.innerHTML = result.message;
                }
            } else {
                resultDiv.className = 'alert alert-danger';
                resultDiv.innerHTML = 'Application not found.';
            }
            resultDiv.style.display = 'block';
        });
    }

    // --- QR Code Scanner for Admission Status ---
    const qrModal = document.getElementById('qrScannerModal');
    if (qrModal) {
        function onScanSuccess(decodedText, decodedResult) {
            // Handle on success condition with the decoded text or result.
            console.log(`Scan result: ${decodedText}`, decodedResult);
            
            // Populate the input and close the scanner modal
            const admissionStatusInput = document.getElementById('admissionStatusInput');
            if (admissionStatusInput) {
                admissionStatusInput.value = decodedText;
            }
            bootstrap.Modal.getInstance(qrModal).hide();

            // Automatically trigger the status check
            document.getElementById('checkStatusBtn').click();
        }

        const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
        html5QrcodeScanner.render(onScanSuccess);
    }

    // --- Muthawal Top Ranks Banner ---
    const muthawalRanksBanner = document.getElementById('muthawalRanksBanner');

    if (muthawalRanksBanner) {
        fetch(getApiUrl('/api/settings')).then(res => res.json()).then(data => {
            let isVisible = true;
            if (data.success && data.settings.showRanks === false) {
                isVisible = false;
            }
            
            if (isVisible) {
                muthawalRanksBanner.style.display = 'block';
                loadMuthawalTopRanks();
            } else {
                muthawalRanksBanner.style.display = 'none';
            }
        });
    }

    async function loadMuthawalTopRanks() {
        const response = await fetch(getApiUrl('/api/admin/data'));
        const data = await response.json();
        const resultsDb = data.results || [];
        const studentsDb = data.students || [];
        
        const muthawalResults = resultsDb.filter(r => String(r.Course || r.course || r.Class || r.class).toLowerCase() === 'muthawal');
        const container = document.getElementById('topRanksContainer');
        
        if (muthawalResults.length === 0) {
            if (container) container.innerHTML = '<div class="col-12 text-muted"><i class="bi bi-info-circle me-1"></i>No results published yet to calculate ranks.</div>';
            return;
        }

        const excludedKeys = ['name', 'enrollno', 'enroll no', 'enroll no.', 'course', 'class', 'password', 'pin', 'currentyear', 'contact', 'email', 'status', 'address', 'photo', 'appid'];

        const rankedStudents = muthawalResults.map(res => {
            let total = 0;
            for (const key in res) {
                if (!excludedKeys.includes(key.trim().toLowerCase())) {
                    const mark = parseFloat(res[key]);
                    if (!isNaN(mark)) total += mark;
                }
            }
            
            const enrollNo = res.EnrollNo || res['Enroll No'] || res['Enroll No.'] || res.enrollNo;
            const student = studentsDb.find(s => (s.EnrollNo || s['Enroll No'] || s['Enroll No.'] || s.enrollNo) === enrollNo);
            const photo = (student && student.photo) ? student.photo : 'assets/images/image.png';
            
            return { name: res.Name || res.name || (student ? student.Name : 'Unknown'), total: total, photo: photo };
        });

        rankedStudents.sort((a, b) => b.total - a.total);
        const top3 = rankedStudents.slice(0, 3);
        
        if (container && top3.length > 0) {
            // Build an automatic slideshow (Bootstrap Carousel)
            let html = `
            <div id="topRanksCarousel" class="carousel slide w-100" data-bs-ride="carousel" data-bs-interval="3000">
                <div class="carousel-inner pb-4">
            `;
            const rankColors = ['warning', 'secondary', 'danger']; // Gold, Silver, Bronze
            const rankNames = ['1st Rank', '2nd Rank', '3rd Rank'];

            top3.forEach((student, index) => {
                const color = rankColors[index];
                const badgeText = index === 0 ? 'text-dark' : 'text-white';
                const activeClass = index === 0 ? 'active' : '';
                
                html += `
                    <div class="carousel-item ${activeClass}">
                        <div class="row justify-content-center">
                            <div class="col-12 col-md-8 col-lg-5">
                                <div class="card border-${color} border-2 shadow-lg rounded-4 h-100 mx-auto">
                                    <div class="card-body p-4">
                                        <div class="position-relative d-inline-block mb-4 mt-2">
                                            <img src="${student.photo}" alt="Rank ${index + 1}" class="rounded-circle border border-${color} bg-white shadow-sm" style="width: 130px; height: 130px; object-fit: cover; border-width: 4px !important;">
                                            <span class="position-absolute bottom-0 start-50 translate-middle badge bg-${color} ${badgeText} rounded-pill px-3 py-2 fw-bold shadow-sm" style="transform: translateY(50%) !important; font-size: 0.9rem; border: 2px solid white;">${rankNames[index]}</span>
                                        </div>
                                        <h4 class="fw-bold mt-3">${student.name}</h4>
                                        <p class="text-muted mb-0 mt-2">Total Marks: <span class="fw-bold fs-5 text-${color}">${student.total}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += `
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#topRanksCarousel" data-bs-slide="prev" style="width: 15%;"><span class="carousel-control-prev-icon" aria-hidden="true" style="width: 3rem; height: 3rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></span><span class="visually-hidden">Previous</span></button>
                <button class="carousel-control-next" type="button" data-bs-target="#topRanksCarousel" data-bs-slide="next" style="width: 15%;"><span class="carousel-control-next-icon" aria-hidden="true" style="width: 3rem; height: 3rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></span><span class="visually-hidden">Next</span></button>
            </div>
            `;
            container.innerHTML = html;
        } else {
            if (container) container.innerHTML = '<div class="col-12 text-muted"><i class="bi bi-info-circle me-1"></i>No student records found.</div>';
        }
    }

    // Result Search Logic
    const searchBtn = document.getElementById('searchResultBtn');
    if(searchBtn) {
        const studentBaseRadio = document.getElementById('studentBase');
        const classBaseRadio = document.getElementById('classBase');
        const enrollNoInput = document.getElementById('enrollNo');
        const enrollInputContainer = document.getElementById('enrollInputContainer');
        const classSelectContainer = document.getElementById('classSelectContainer');
        const passwordContainer = document.getElementById('passwordContainer');

        // Dynamic UI Toggles based on Search Type
        if(studentBaseRadio && classBaseRadio && enrollNoInput) {
            studentBaseRadio.addEventListener('change', () => {
                if(enrollInputContainer) enrollInputContainer.style.display = 'block';
                if(classSelectContainer) classSelectContainer.style.display = 'none';
                if(passwordContainer) passwordContainer.style.display = 'block';
            });
            classBaseRadio.addEventListener('change', () => {
                if(enrollInputContainer) enrollInputContainer.style.display = 'none';
                if(classSelectContainer) classSelectContainer.style.display = 'block';
                if(passwordContainer) passwordContainer.style.display = 'none';
            });
        }

        // Dynamic Class Dropdown based on Course Selection
        const classSelect = document.getElementById('classSelect');
        const yearSelectWrapper = document.getElementById('yearSelectWrapper');
        const yearSelect = document.getElementById('yearSelect');

        if (classSelect) {
            classSelect.addEventListener('change', function() {
                const selectedCourse = this.value;
                if (selectedCourse === 'Shareeath') {
                    if(yearSelectWrapper) yearSelectWrapper.style.display = 'block';
                    if(yearSelect) {
                        yearSelect.innerHTML = `
                            <option value="" selected>All Classes</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="+1">+1</option>
                            <option value="+2">+2</option>
                            <option value="D1">D1</option>
                            <option value="D2">D2</option>
                            <option value="D3">D3</option>
                            <option value="Mukhthasar">Mukhthasar</option>
                        `;
                    }
                } else {
                    // Hifz and Muthawal have no sub-classes to search
                    if(yearSelectWrapper) yearSelectWrapper.style.display = 'none';
                    if(yearSelect) yearSelect.innerHTML = '<option value="" selected>All Classes</option>';
                }
            });
        }

        // --- Live Student Info Fetch on Enroll Number Input ---
        const enrollNoInputForLiveFetch = document.getElementById('enrollNo');
        if (enrollNoInputForLiveFetch) {
            enrollNoInputForLiveFetch.addEventListener('input', async function() {
                const enrollNo = this.value.trim();
                let infoBox = document.getElementById('studentInfoFetchBox');

                // Create info box if it doesn't exist
                if (!infoBox) {
                    infoBox = document.createElement('div');
                    infoBox.id = 'studentInfoFetchBox';
                    infoBox.className = 'alert alert-info mt-3 p-2';
                    infoBox.style.display = 'none';
                    this.parentElement.insertAdjacentElement('afterend', infoBox);
                }

                // Only search if the input looks like a valid enroll number (e.g., length > 5)
                if (enrollNo.length > 5) {
                    // This is a simplified check. A full API call would be better for production.
                    const response = await fetch(getApiUrl('/api/admin/data'));
                    const data = await response.json();
                    const studentsDb = data.students || [];

                    const student = studentsDb.find(s => String(getStudentProp(s, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo'])).toLowerCase() === enrollNo.toLowerCase());

                    if (student) {
                        infoBox.innerHTML = `<strong>Student Found:</strong> ${student.Name || 'Unknown'} <span class="badge bg-secondary ms-2">${student.Course || 'N/A'}</span>`;
                        infoBox.style.display = 'block';
                    } else {
                        infoBox.style.display = 'none';
                    }
                } else {
                    infoBox.style.display = 'none';
                }
            });
        }

        searchBtn.addEventListener('click', async function() {
            const searchType = document.querySelector('input[name="searchType"]:checked').id;
            const searchInput = searchType === 'studentBase' 
                ? document.getElementById('enrollNo').value.trim() 
                : (document.getElementById('classSelect') ? document.getElementById('classSelect').value : '');
            const yearInput = document.getElementById('yearSelect') ? document.getElementById('yearSelect').value : '';
            const passwordInput = document.getElementById('password').value.trim();
            
            const resultOutput = document.getElementById('resultOutput');
            const resultMessage = document.getElementById('resultMessage');
            const resultDetails = document.getElementById('resultDetails');
            
            resultOutput.style.display = 'block';
            resultDetails.style.display = 'none';
            
            let resultContainer = document.getElementById('dynamicResultContent');
            if (!resultContainer) {
                const oldWrapper = resultDetails.querySelector('.table-responsive');
                if (oldWrapper) oldWrapper.remove();
                resultContainer = document.createElement('div');
                resultContainer.id = 'dynamicResultContent';
                resultContainer.className = 'mt-3';
                resultDetails.insertBefore(resultContainer, resultDetails.firstChild);
            }
            
            if(!searchInput) {
                resultMessage.className = 'alert alert-warning mb-0';
                resultMessage.innerHTML = searchType === 'studentBase' ? 'Please enter your Enrollment Number.' : 'Please select a Class / Course.';
                return;
            }

            const response = await fetch(getApiUrl('/api/admin/data'));
            const serverData = await response.json();
            const resultsData = serverData.results || [];
            const studentsDb = serverData.students || [];

            if(resultsData.length === 0) {
                resultMessage.className = 'alert alert-danger mb-0';
                resultMessage.innerHTML = 'Result database is currently empty. Please check back later.';
                return;
            }
            
            if (searchType === 'studentBase') {
                if (!passwordInput) {
                    resultMessage.className = 'alert alert-warning mb-0';
                    resultMessage.innerHTML = 'Please enter your Password.';
                    return;
                }

                // 1. Authenticate using Students DB first (Primary source of truth for passwords)
                const studentRecord = studentsDb.find(s => String(s.EnrollNo || s['Enroll No'] || s['Enroll No.'] || s.enrollNo).toLowerCase() === searchInput.toLowerCase());

                if (studentRecord) {
                    const storedPassword = studentRecord.Password || studentRecord.password || '123456';
                    if (String(storedPassword) !== passwordInput) {
                        resultMessage.className = 'alert alert-danger mb-0';
                        resultMessage.innerHTML = 'Incorrect password.';
                        return;
                    }
                }

                // 2. Fetch from Results DB
                const studentResult = resultsData.find(row => {
                    const rEnroll = row.EnrollNo || row['Enroll No'] || row['Enroll No.'] || row.enrollNo;
                    if (rEnroll) {
                        return String(rEnroll).toLowerCase() === searchInput.toLowerCase();
                    } else {
                        return Object.values(row).some(val => String(val).toLowerCase() === searchInput.toLowerCase());
                    }
                });

                if (!studentResult) {
                    resultMessage.className = 'alert alert-danger mb-0';
                    resultMessage.innerHTML = 'Result not found for the provided Enrollment Number.';
                    return;
                }

                // Fallback password check if student was NOT in studentsDb but IS in resultsDb
                if (!studentRecord) {
                    const rowPassword = studentResult.Password || studentResult.password || studentResult.PIN || '';
                    if (rowPassword && String(rowPassword) !== passwordInput) {
                        resultMessage.className = 'alert alert-danger mb-0';
                        resultMessage.innerHTML = 'Incorrect password.';
                        return;
                    }
                }
                
                resultMessage.className = 'alert alert-success mb-0';
                resultMessage.innerHTML = 'Result found successfully!';

                // --- New Result Display Logic ---
                const detailKeys = ['name', 'enrollno', 'enroll no', 'enroll no.', 'course', 'class', 'password', 'pin', 'currentyear', 'contact', 'email', 'status', 'address', 'photo', 'appid'];
                const personalDetails = {};
                const subjectMarks = {};

                // Separate data into personal details and subject marks
                for (const key in studentResult) {
                    const lowerKey = key.trim().toLowerCase();
                    if (detailKeys.includes(lowerKey)) {
                        if (lowerKey !== 'password' && lowerKey !== 'pin') {
                            personalDetails[key] = studentResult[key];
                        }
                    } else {
                        subjectMarks[key] = studentResult[key];
                    }
                }

                // Cross-reference with Students Database to get the Current Class/Year
                const enrollKey = Object.keys(personalDetails).find(k => k.toLowerCase() === 'enrollno' || k.toLowerCase() === 'enroll no' || k.toLowerCase() === 'enroll no.') || '';
                const enrollToSearch = enrollKey ? personalDetails[enrollKey] : searchInput;
                
                const studentRecordForDisplay = studentsDb.find(s => (s.EnrollNo || s['Enroll No'] || s['Enroll No.'] || s.enrollNo) === enrollToSearch);
                if (studentRecordForDisplay) {
                    const courseMaxYears = { 'Hifz': 3, 'Shareeath': 10, 'Muthawal': 2 };
                    const maxYear = courseMaxYears[studentRecordForDisplay.Course] || '-';
                    const currentYear = studentRecordForDisplay.CurrentYear || 1;
                    if (maxYear !== '-') {
                        personalDetails['Current Class'] = `Year ${currentYear} of ${maxYear}`;
                        if (!personalDetails['course'] && !personalDetails['Course']) personalDetails['Course'] = studentRecordForDisplay.Course;
                    }
                }

                    // Build HTML for personal details
                    let personalDetailsHTML = '<div class="p-3 bg-light rounded-top border-bottom-0 border">';
                    for (const key in personalDetails) {
                        personalDetailsHTML += `
                            <div class="row mb-1">
                                <div class="col-5 col-sm-4 fw-semibold text-muted">${key}</div>
                                <div class="col-7 col-sm-8 fw-bold">${personalDetails[key]}</div>
                            </div>
                        `;
                    }

                    // Build HTML for subject marks table
                    let subjectMarksHTML = `
                        <div class="table-responsive">
                            <table class="table table-bordered mb-0 rounded-bottom">
                                <thead class="table-dark"><tr><th>Subject</th><th>Marks / Grade</th></tr></thead>
                                <tbody>
                    `;

                    let overallPass = true;
                    let hasNumericMarks = false;
                    
                    if (Object.keys(subjectMarks).length > 0) {
                        for (const subject in subjectMarks) {
                            const markValue = subjectMarks[subject];
                            const numMark = parseFloat(markValue);
                            let isFail = false;
                            
                            // Check if the mark is a number and if it's below 35
                            if (!isNaN(numMark)) {
                                hasNumericMarks = true;
                                if (numMark < 35) {
                                    isFail = true;
                                    overallPass = false;
                                }
                            } else if (String(markValue).toLowerCase() === 'fail' || String(markValue).toLowerCase() === 'f') {
                                isFail = true;
                                overallPass = false;
                            }

                            subjectMarksHTML += `<tr><td class="fw-semibold w-50">${subject}</td><td class="${isFail ? 'text-danger fw-bold' : ''}">${markValue} ${isFail ? '<span class="badge bg-danger ms-2">FAIL</span>' : ''}</td></tr>`;
                        }
                    } else {
                        subjectMarksHTML += `<tr><td colspan="2" class="text-center text-muted">No subject marks found.</td></tr>`;
                    }
                    subjectMarksHTML += `</tbody></table></div>`;

                    // Add Overall Pass/Fail Status if marks exist
                    if (hasNumericMarks || Object.keys(subjectMarks).length > 0) {
                        personalDetailsHTML += `<div class="row mb-1 mt-3 pt-2 border-top"><div class="col-5 col-sm-4 fw-semibold text-muted">Overall Result</div><div class="col-7 col-sm-8 fw-bold ${overallPass ? 'text-success' : 'text-danger'}">${overallPass ? 'PASSED <small class="text-muted fw-normal">(Eligible for Promotion)</small>' : 'FAILED <small class="text-muted fw-normal">(Below 35 Marks)</small>'}</div></div>`;
                    }
                    personalDetailsHTML += '</div>';

                    // Target the container and inject the new layout
                    resultContainer.innerHTML = personalDetailsHTML + subjectMarksHTML;
                    
                    resultDetails.style.display = 'block';
            } else {
                // Class Base Search (Strictly fetches everyone matching the exact Course and optional Year)
                const classResults = resultsData.filter(row => {
                    const rowCourse = row.Course || row.class || row.Class || '';
                    const rowYear = row.CurrentYear || row.Year || row.year || row.CurrentClass || row.Class || '';
                    const courseMatch = String(rowCourse).toLowerCase() === String(searchInput).toLowerCase();
                    const yearMatch = yearInput ? String(rowYear).toLowerCase() === String(yearInput).toLowerCase() : true;
                    return courseMatch && yearMatch;
                });
                
                if(classResults.length > 0) {
                    resultMessage.className = 'alert alert-success mb-0';
                    const yearText = yearInput ? ` - Year ${yearInput}` : '';
                    resultMessage.innerHTML = `Found ${classResults.length} records for Class/Course: <strong>${searchInput.toUpperCase()}${yearText}</strong>`;
                    // Hide all metadata so only Name, Enroll No, and Subjects/Marks are shown
                    const hiddenFields = ['password', 'pin', 'appid', 'photo', 'course', 'class', 'currentyear', 'contact', 'email', 'status', 'address'];
                    const headers = Object.keys(classResults[0]).filter(k => !hiddenFields.includes(k.trim().toLowerCase()));
                    const theadHTML = `<thead class="table-dark"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
                    
                    const tbodyHTML = `<tbody>${classResults.map(row => `<tr>${headers.map(h => {
                        let val = row[h] || '-';
                        const lowerH = h.trim().toLowerCase();
                        
                        // Cross-reference with students DB (Priority)
                        const rowEnroll = row.EnrollNo || row['Enroll No'] || row['Enroll No.'] || row.enrollNo;
                        const studentRecord = studentsDb.find(s => String(s.EnrollNo || s['Enroll No'] || s['Enroll No.'] || s.enrollNo).toLowerCase() === String(rowEnroll).toLowerCase());
                        
                        if (studentRecord) {
                            if (lowerH === 'name') val = studentRecord.Name || studentRecord.StudentName || val;
                            if (lowerH === 'enrollno' || lowerH === 'enroll no' || lowerH === 'enroll no.') {
                                val = studentRecord.EnrollNo || studentRecord['Enroll No'] || studentRecord['Enroll No.'] || studentRecord.enrollNo || val;
                            }
                        }

                        const numMark = parseFloat(val);
                        let isFail = false;
                        if (!['name', 'enrollno', 'enroll no', 'enroll no.'].includes(lowerH)) {
                            if (!isNaN(numMark) && numMark < 35) isFail = true;
                            else if (String(val).toLowerCase() === 'fail' || String(val).toLowerCase() === 'f') isFail = true;
                        }
                        return `<td class="${isFail ? 'text-danger fw-bold' : ''}">${val} ${isFail ? '<span class="badge bg-danger ms-1">F</span>' : ''}</td>`;
                    }).join('')}</tr>`).join('')}</tbody>`;
                    resultContainer.innerHTML = `<div class="table-responsive"><table class="table table-bordered table-hover mb-0">${theadHTML}${tbodyHTML}</table></div>`;
                    resultDetails.style.display = 'block';
                } else {
                    resultMessage.className = 'alert alert-danger mb-0';
                    resultMessage.innerHTML = 'No records found for the provided Class/Course name.';
                }
            }
        });

        // Print Result Logic
        const printBtn = document.getElementById('printResultBtn');
        if(printBtn) {
            printBtn.addEventListener('click', function() {
                const dynamicContainer = document.getElementById('dynamicResultContent');
                const resultDisplayHTML = dynamicContainer ? dynamicContainer.innerHTML : '';
                
                let studentPhotoHTML = '';
                let title = 'Examination Result Sheet';
                const isSingleStudent = document.querySelector('input[name="searchType"]:checked').id === 'studentBase';
                
                if (isSingleStudent) {
                    const searchInput = document.getElementById('enrollNo').value.trim();
                    const studentsDb = JSON.parse(localStorage.getItem('anwariyya_students_db')) || [];
                    const student = studentsDb.find(s => String(s.EnrollNo || s['Enroll No'] || s['Enroll No.'] || s.enrollNo).toLowerCase() === searchInput.toLowerCase());
                    
                    if (student && student.photo) {
                        studentPhotoHTML = `<img src="${student.photo}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #000; padding: 2px;" alt="Student Photo">`;
                    }
                } else {
                    title = 'Class Results Sheet';
                }
                
                const printWindow = window.open('', '_blank', 'height=600,width=800');
                printWindow.document.write('<html><head><title>Print Student Result</title>');
                printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
                printWindow.document.write('<style>table, .table, th, td, tr { background: transparent !important; background-color: transparent !important; --bs-table-bg: transparent !important; --bs-table-accent-bg: transparent !important; } img:not([alt="watermark"]) { border-radius: 50% !important; }</style>');
                printWindow.document.write('<\/head><body class="p-5">');
                printWindow.document.write('<img src="assets/images/image.png" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; width: 400px; z-index: -1; pointer-events: none;" alt="watermark">');
                printWindow.document.write(`<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;"><div style="width: 120px; text-align: left;"><img src="assets/images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain;"></div><div style="flex-grow: 1; text-align: center;"><h2 style="margin: 0; font-weight: bold; text-transform: uppercase;">Anwariyya Arabic College</h2><h4 style="margin: 5px 0 0; color: #555;">${title}</h4></div><div style="width: 120px; text-align: right;">${studentPhotoHTML}</div></div>`);
                printWindow.document.write(resultDisplayHTML);
                printWindow.document.write('<\/body><\/html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(function() {
                    printWindow.print();
                }, 500); // Gives a small delay to load external Bootstrap CSS
            });
        }
    }

    // --- Dynamic Footer Fetching (From Internet) ---
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        // 1. Host a JSON file on GitHub (Gist or Repo) and paste the 'Raw' URL here.
        // Example JSON structure: { "collegeName": "Anwariyya", "location": "Palakkad", "phone": "+91...", "email": "..." }
        const footerApiUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/footer.json';
        
        // 2. Default fallback data (Used if the internet is down or the URL above is invalid)
        const defaultFooterData = {
            collegeName: 'Anwariyya Arabic College',
            location: 'Pottachira, Nellaya, Palakkad, Kerala',
            phone: '+91 98765 43210',
            email: 'info@anwariyya.in',
            copyright: 'All Rights Reserved.',
            logo: 'assets/images/image.png'
        };

        const renderFooter = (data) => {
            footerElement.innerHTML = `
                <div class="container d-flex flex-column align-items-center">
                    ${data.logo ? `<img src="${data.logo}" class="footer_img mb-3" alt="College Logo" style="width: 60px; height: 60px; border-radius: 50%;">` : ''}
                    <h4 class="mb-2 fw-bold">${data.collegeName}</h4>
                    <p class="mb-1"><i class="bi bi-geo-alt-fill text-warning me-2"></i>${data.location}</p>
                    <p class="mb-2">
                        <i class="bi bi-telephone-fill text-info me-1"></i> ${data.phone} &nbsp;|&nbsp; 
                        <i class="bi bi-envelope-fill text-danger me-1"></i> ${data.email}
                    </p>
                    <div class="w-100 border-top border-secondary my-3 opacity-50"></div>
                    <p class="mb-0 small text-light opacity-75">&copy; ${new Date().getFullYear()} ${data.collegeName}. ${data.copyright}</p>
                </div>
            `;
        };

        fetch(footerApiUrl)
            .then(response => response.ok ? response.json() : defaultFooterData)
            .then(data => renderFooter(data))
            .catch(error => {
                console.warn('Using default footer data (Internet fetch failed):', error);
                renderFooter(defaultFooterData);
            });
    }

    // --- Horizontal Auto-Moving Ticker & Drag Scroll Handler (Infinite Loop) ---
    function initFestHorizontalScroll(container, leftBtnIds = [], rightBtnIds = [], direction = 'left-to-right') {
        if (!container) return;

        let isHovered = false;
        let isDragging = false;
        let startX = 0;
        let scrollLeftPos = 0;
        const autoScrollSpeed = 2.5; // Fast & smooth horizontal auto-scroll speed for TV stage scoreboard

        // Set initial scroll position to middle set for Left-to-Right loop
        setTimeout(() => {
            const halfWidth = container.scrollWidth / 2;
            if (halfWidth > 0 && container.scrollLeft === 0 && direction === 'left-to-right') {
                container.scrollLeft = halfWidth;
            }
        }, 50);

        function marqueeLoop() {
            if (!isHovered && !isDragging && container.scrollWidth > container.clientWidth) {
                const halfWidth = container.scrollWidth / 2;
                if (halfWidth > 0) {
                    if (direction === 'left-to-right') {
                        // Move cards from Left towards Right
                        container.scrollLeft -= autoScrollSpeed;
                        if (container.scrollLeft <= 1) {
                            container.scrollLeft += halfWidth;
                        }
                    } else {
                        // Move cards from Right towards Left
                        container.scrollLeft += autoScrollSpeed;
                        if (container.scrollLeft >= halfWidth) {
                            container.scrollLeft -= halfWidth;
                        }
                    }
                }
            }
            container._marqueeAnimId = requestAnimationFrame(marqueeLoop);
        }

        if (container._marqueeAnimId) {
            cancelAnimationFrame(container._marqueeAnimId);
        }
        container._marqueeAnimId = requestAnimationFrame(marqueeLoop);

        if (!container._eventsBound) {
            container._eventsBound = true;

            // Pause auto-moving on mouse hover or touch interaction
            container.addEventListener('mouseenter', () => { isHovered = true; });
            container.addEventListener('mouseleave', () => { isHovered = false; });
            container.addEventListener('touchstart', () => { isHovered = true; }, { passive: true });
            container.addEventListener('touchend', () => {
                setTimeout(() => { isHovered = false; }, 2500);
            }, { passive: true });

            // Drag-to-scroll functionality for mouse
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                isHovered = true;
                startX = e.pageX - container.offsetLeft;
                scrollLeftPos = container.scrollLeft;
                container.style.cursor = 'grabbing';
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    container.style.cursor = 'grab';
                    setTimeout(() => { isHovered = false; }, 2500);
                }
            });

            container.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 1.5;
                container.scrollLeft = scrollLeftPos - walk;
            });

            // Attach Left navigation buttons
            leftBtnIds.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        isHovered = true;
                        container.scrollBy({ left: -360, behavior: 'smooth' });
                        setTimeout(() => { isHovered = false; }, 3000);
                    };
                }
            });

            // Attach Right navigation buttons
            rightBtnIds.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        isHovered = true;
                        container.scrollBy({ left: 360, behavior: 'smooth' });
                        setTimeout(() => { isHovered = false; }, 3000);
                    };
                }
            });
        }
    }

    // --- Load Fest Scoreboard Data ---
    let lastFestScoreboardJSON = '';
    let lastIndexAnnouncementStage = '';

    function playIndexWinnerAudioFanfare() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.12);
                osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
            });
        } catch (e) {
            console.log('Audio playback prevented or unsupported', e);
        }
    }

    function handleIndexWinnerAnnouncementOverlay(sb) {
        const ann = sb && sb.announcement;
        const isAnnActive = ann && ann.active && ann.stage && ann.stage !== 'none';
        let overlay = document.getElementById('winnerAnnouncementOverlay');

        if (!isAnnActive) {
            if (overlay) overlay.remove();
            lastIndexAnnouncementStage = 'none';
            return;
        }

        const currentStage = ann.stage;
        if (currentStage !== lastIndexAnnouncementStage) {
            playIndexWinnerAudioFanfare();
            lastIndexAnnouncementStage = currentStage;
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'winnerAnnouncementOverlay';
            overlay.className = 'winner-announcement-overlay';
            document.body.appendChild(overlay);
        }

        const sortedTeams = [...(sb.teams || [])].sort((a, b) => (b.points || 0) - (a.points || 0));
        const firstTeam = sortedTeams[0] || { name: 'Champions', points: 0, color: '#f59e0b' };
        const secondTeam = sortedTeams[1] || { name: '1st Runner Up', points: 0, color: '#cbd5e1' };
        const thirdTeam = sortedTeams[2] || { name: '2nd Runner Up', points: 0, color: '#cd7f32' };

        let contentHTML = '';
        const festTitle = sb.festTitle || 'ATSA Arts Fest Scoreboard';

        if (currentStage === '3rd') {
            contentHTML = `
                <div class="text-center mb-4" data-aos="zoom-in">
                    <span class="badge text-white px-4 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow" style="background: #cd7f32; font-size: 1rem; letter-spacing: 1px;">
                        🥉 2nd RUNNER UP ANNOUNCEMENT
                    </span>
                    <h1 class="display-4 fw-extrabold text-white text-uppercase tracking-tight mt-2">${festTitle}</h1>
                </div>
                <div class="champion-card-bronze p-4 p-md-5 text-center shadow-lg position-relative" style="max-width: 600px; width: 100%;">
                    <div class="display-1 text-warning mb-3 trophy-pulse-anim">
                        <i class="bi bi-award-fill" style="color: #cd7f32;"></i>
                    </div>
                    <span class="badge px-3 py-1.5 rounded-pill text-uppercase fw-bold mb-2" style="background-color: ${thirdTeam.color || '#cd7f32'}; font-size: 0.9rem;">
                        3rd Place Overall
                    </span>
                    <h2 class="display-3 fw-black text-white text-uppercase mb-2" style="font-weight: 900;">${thirdTeam.name}</h2>
                    <div class="display-4 fw-bold text-warning mt-3 mb-1">${thirdTeam.points || 0} <span class="fs-4 text-white-50">Points</span></div>
                    <p class="text-white-50 mt-2 mb-0">Congratulations to ${thirdTeam.name} for securing 2nd Runner Up!</p>
                </div>
            `;
        } else if (currentStage === '2nd') {
            contentHTML = `
                <div class="text-center mb-4" data-aos="zoom-in">
                    <span class="badge text-white px-4 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow" style="background: #94a3b8; font-size: 1rem; letter-spacing: 1px;">
                        🥈 1st RUNNER UP ANNOUNCEMENT
                    </span>
                    <h1 class="display-4 fw-extrabold text-white text-uppercase tracking-tight mt-2">${festTitle}</h1>
                </div>
                <div class="champion-card-silver p-4 p-md-5 text-center shadow-lg position-relative" style="max-width: 600px; width: 100%;">
                    <div class="display-1 text-warning mb-3 trophy-pulse-anim">
                        <i class="bi bi-award-fill" style="color: #e2e8f0;"></i>
                    </div>
                    <span class="badge px-3 py-1.5 rounded-pill text-uppercase fw-bold mb-2" style="background-color: ${secondTeam.color || '#94a3b8'}; font-size: 0.9rem;">
                        2nd Place Overall
                    </span>
                    <h2 class="display-3 fw-black text-white text-uppercase mb-2" style="font-weight: 900;">${secondTeam.name}</h2>
                    <div class="display-4 fw-bold text-white mt-3 mb-1">${secondTeam.points || 0} <span class="fs-4 text-white-50">Points</span></div>
                    <p class="text-white-50 mt-2 mb-0">Congratulations to ${secondTeam.name} for securing 1st Runner Up!</p>
                </div>
            `;
        } else if (currentStage === '1st') {
            contentHTML = `
                <div class="text-center mb-4" data-aos="zoom-in">
                    <span class="badge bg-warning text-dark px-4 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow" style="font-size: 1.05rem; letter-spacing: 1.5px;">
                        👑 OVERALL CHAMPIONS ANNOUNCEMENT 👑
                    </span>
                    <h1 class="display-4 fw-extrabold text-white text-uppercase tracking-tight mt-2">${festTitle}</h1>
                </div>
                <div class="champion-card-gold p-4 p-md-5 text-center shadow-lg position-relative" style="max-width: 650px; width: 100%;">
                    <div class="display-1 text-warning mb-3 trophy-pulse-anim">
                        <i class="bi bi-trophy-fill" style="color: #f59e0b; font-size: 5rem;"></i>
                    </div>
                    <span class="badge px-3 py-1.5 rounded-pill text-uppercase fw-bold mb-2 bg-warning text-dark" style="font-size: 1rem;">
                        🏆 GRAND CHAMPIONS (1ST PLACE)
                    </span>
                    <h2 class="display-2 fw-black text-warning text-uppercase mb-2" style="font-weight: 900; text-shadow: 0 0 20px rgba(245, 158, 11, 0.6);">${firstTeam.name}</h2>
                    <div class="display-3 fw-bold text-white mt-3 mb-1">${firstTeam.points || 0} <span class="fs-4 text-warning">Points</span></div>
                    <p class="text-white-50 mt-2 mb-0 fs-5">All hail the Grand Champions of ${festTitle}!</p>
                </div>
            `;
        } else if (currentStage === 'all') {
            contentHTML = `
                <div class="text-center mb-4">
                    <span class="badge bg-warning text-dark px-4 py-2 rounded-pill fw-bold text-uppercase mb-2 shadow" style="font-size: 1.1rem; letter-spacing: 1.5px;">
                        🎉 GRAND CHAMPIONSHIP PODIUM CEREMONY 🎉
                    </span>
                    <h1 class="display-4 fw-extrabold text-white text-uppercase tracking-tight mt-1">${festTitle}</h1>
                    <p class="text-white-50">Final Overall Team Championship Standings</p>
                </div>

                <div class="row g-3 justify-content-center align-items-end w-100 px-md-4" style="max-width: 1100px;">
                    <!-- 2nd Place (Left) -->
                    <div class="col-12 col-md-4 order-2 order-md-1">
                        <div class="champion-card-silver p-4 text-center shadow-lg">
                            <div class="fs-1 text-light mb-2"><i class="bi bi-award-fill"></i></div>
                            <span class="badge bg-secondary px-3 py-1 rounded-pill text-uppercase fw-bold mb-2">2nd Place</span>
                            <h3 class="fw-extrabold text-white text-uppercase mb-1" style="font-size: 1.6rem;">${secondTeam.name}</h3>
                            <div class="fs-2 fw-bold text-white">${secondTeam.points || 0} <small class="fs-6 text-white-50">pts</small></div>
                            <span class="badge text-white mt-2 px-2.5 py-1" style="background-color: ${secondTeam.color || '#64748b'};">1st Runner Up</span>
                        </div>
                    </div>

                    <!-- 1st Place (Center Elevated) -->
                    <div class="col-12 col-md-4 order-1 order-md-2 mb-3 mb-md-4">
                        <div class="champion-card-gold p-4 p-md-5 text-center shadow-lg" style="transform: scale(1.06);">
                            <div class="display-2 text-warning mb-2 trophy-pulse-anim"><i class="bi bi-trophy-fill"></i></div>
                            <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill text-uppercase fw-bold mb-2" style="font-size: 0.95rem;">👑 Champions</span>
                            <h2 class="display-4 fw-black text-warning text-uppercase mb-1" style="font-weight: 900; text-shadow: 0 0 15px rgba(245, 158, 11, 0.5);">${firstTeam.name}</h2>
                            <div class="display-4 fw-bold text-white">${firstTeam.points || 0} <small class="fs-5 text-warning">pts</small></div>
                            <span class="badge text-white mt-2 px-3 py-1" style="background-color: ${firstTeam.color || '#10b981'}; font-size: 0.85rem;">Grand Champions</span>
                        </div>
                    </div>

                    <!-- 3rd Place (Right) -->
                    <div class="col-12 col-md-4 order-3 order-md-3">
                        <div class="champion-card-bronze p-4 text-center shadow-lg">
                            <div class="fs-1 text-warning mb-2" style="color: #cd7f32 !important;"><i class="bi bi-award-fill"></i></div>
                            <span class="badge px-3 py-1 rounded-pill text-uppercase fw-bold mb-2" style="background: #cd7f32; color: #fff;">3rd Place</span>
                            <h3 class="fw-extrabold text-white text-uppercase mb-1" style="font-size: 1.6rem;">${thirdTeam.name}</h3>
                            <div class="fs-2 fw-bold text-white">${thirdTeam.points || 0} <small class="fs-6 text-white-50">pts</small></div>
                            <span class="badge text-white mt-2 px-2.5 py-1" style="background-color: ${thirdTeam.color || '#b45309'};">2nd Runner Up</span>
                        </div>
                    </div>
                </div>
            `;
        }

        overlay.innerHTML = `
            <div class="announcement-spotlight-left"></div>
            <div class="announcement-spotlight-right"></div>
            <button type="button" class="btn btn-outline-light btn-sm rounded-pill position-absolute top-0 end-0 m-4 px-3 fw-bold" onclick="document.getElementById('winnerAnnouncementOverlay').remove();" style="z-index: 10;">
                <i class="bi bi-x-lg me-1"></i> Close Display
            </button>
            <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 w-100 py-5 px-3 position-relative" style="z-index: 2;">
                ${contentHTML}
            </div>
        `;
    }

    const loadFestScoreboard = async () => {
        const scoreboardSection = document.getElementById('scoreboard');
        const teamsContainer = document.getElementById('scoreboardTeamsContainer');
        const tableBody = document.getElementById('festResultsTableBody');
        const titleHeader = document.getElementById('festTitleHeader');
        const statusBadge = document.getElementById('scoreboardFestStatusBadge');
        const liveDot = document.getElementById('scoreboardLiveDot');

        if (!scoreboardSection) return;

        try {
            const res = await fetch(getApiUrl('/api/scoreboard'));
            const data = await res.json();
            
            if (!data.success || !data.scoreboard) {
                scoreboardSection.style.display = 'none';
                return;
            }

            const sb = data.scoreboard;

            handleIndexWinnerAnnouncementOverlay(sb);

            const currentJSON = JSON.stringify(sb);
            if (currentJSON === lastFestScoreboardJSON) {
                // Scoreboard data unchanged - skip DOM re-renders
                return;
            }

            const isInitial = !lastFestScoreboardJSON;
            lastFestScoreboardJSON = currentJSON;

            // If scoreboard is disabled by admin, hide the section gracefully
            if (sb.enabled === false) {
                scoreboardSection.style.display = 'none';
                return;
            } else {
                scoreboardSection.style.display = 'block';
            }

            const typoWrapper = document.getElementById('festTypographyWrapper');
            const typoImg = document.getElementById('festTypographyHeader');

            if (sb.festTypography) {
                if (typoImg) typoImg.src = sb.festTypography;
                if (typoWrapper) typoWrapper.style.display = 'block';
                if (titleHeader) titleHeader.style.display = 'none';
            } else {
                if (typoWrapper) typoWrapper.style.display = 'none';
                if (titleHeader) {
                    titleHeader.style.display = 'block';
                    titleHeader.innerText = sb.festTitle || 'ATSA Arts Fest Scoreboard';
                }
            }
            if (statusBadge) statusBadge.innerHTML = `<i class="bi bi-trophy-fill me-1"></i> ${sb.festStatus || 'Live'}`;
            
            const festLogoImg = document.getElementById('festLogoHeader');
            if (festLogoImg) {
                if (sb.festLogo) {
                    festLogoImg.src = sb.festLogo;
                    festLogoImg.style.display = 'inline-block';
                } else {
                    festLogoImg.style.display = 'none';
                }
            }
            
            if (liveDot) {
                if (sb.festStatus === 'Live') {
                    liveDot.style.display = 'inline-block';
                } else {
                    liveDot.style.display = 'none';
                }
            }

            // Render Teams / Houses Leaderboard
            const teams = sb.teams || [];
            if (teamsContainer) {
                if (teams.length === 0) {
                    teamsContainer.innerHTML = '<div class="col-12 text-center text-muted">No teams registered yet.</div>';
                } else {
                    const maxPoints = Math.max(...teams.map(t => t.points || 0), 1);
                    const rankIcons = ['bi-trophy-fill', 'bi-award-fill', 'bi-award', 'bi-star-fill'];
                    const rankLabels = ['1st', '2nd', '3rd'];
                    const rankBadges = ['bg-warning text-dark', 'bg-secondary text-white', 'bg-danger text-white', 'bg-info text-dark'];

                    let teamsHTML = '';
                    teams.forEach((team, index) => {
                        const rank = index + 1;
                        const rankIcon = rankIcons[index] || 'bi-star-fill';
                        const rankLabel = rankLabels[index] || `#${rank}`;
                        const badgeClass = rankBadges[index] || 'bg-light text-dark';
                        const percent = Math.min(100, Math.round(((team.points || 0) / maxPoints) * 100));

                        teamsHTML += `
                            <div class="col-6 col-md-3" data-aos="fade-up" data-aos-delay="${index * 50}">
                                <div class="card flat-card h-100 overflow-hidden">
                                    <div class="p-3 text-center border-bottom bg-light">
                                        <span class="badge ${badgeClass} mb-1 small">${rankLabel} Place</span>
                                        <h5 class="fw-bold mb-0 text-dark">${team.name}</h5>
                                    </div>
                                    <div class="card-body text-center p-3">
                                        <div class="display-6 fw-bold text-dark mb-1" style="font-weight: 800; font-size: 2.25rem;">${team.points || 0}</div>
                                        <small class="text-uppercase text-muted fw-semibold small" style="letter-spacing: 0.5px;">Points</small>
                                        
                                        <div class="progress mt-3" style="height: 5px; background-color: #e5e7eb; border-radius: 10px;">
                                            <div class="progress-bar" role="progressbar" style="width: ${percent}%; background-color: ${team.color || '#10b981'}; border-radius: 10px;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    teamsContainer.innerHTML = teamsHTML;
                }
            }

            // Render Published Event Results (Card View Grid & Table View)
            window.allFestResults = sb.results || [];
            const cardsContainer = document.getElementById('festResultsCardsContainer');
            const tableBody = document.getElementById('festResultsTableBody');

            const matchWinnerIndex = (w, q) => {
                if (!w) return false;
                const list = Array.isArray(w) ? w : [w];
                return list.some(item => 
                    (item.name && item.name.toLowerCase().includes(q)) ||
                    (item.chestNo && item.chestNo.toLowerCase().includes(q)) ||
                    (item.team && item.team.toLowerCase().includes(q))
                );
            };

            const renderSingleCardRowIndex = (rankPlace, w) => {
                let badgeClass = 'flat-badge-3rd';
                let rowClass = 'flat-rank-row-3rd';
                let rankText = '3rd';
                let ptsBadgeClass = 'pts-badge-3rd';
                let rankIcon = 'bi-award-fill';

                if (rankPlace === '1st') {
                    badgeClass = 'flat-badge-1st';
                    rowClass = 'flat-rank-row-1st';
                    rankText = '1st';
                    ptsBadgeClass = 'pts-badge-1st';
                    rankIcon = 'bi-trophy-fill';
                } else if (rankPlace === '2nd') {
                    badgeClass = 'flat-badge-2nd';
                    rowClass = 'flat-rank-row-2nd';
                    rankText = '2nd';
                    ptsBadgeClass = 'pts-badge-2nd';
                    rankIcon = 'bi-award-fill';
                }

                const name = w ? (w.name || w.studentName || w.student || w.student_name || '') : '';
                const groupName = w ? (w.team || w.group || w.groupName || w.teamName || w.group_name || '') : '';
                const chestNo = w ? (w.chestNo || w.chest || w.chestNumber || w.chest_no || '') : '';
                const grade = w ? (w.grade || w.rankGrade || '') : '';
                const points = w && w.points !== undefined ? w.points : (w && w.pts !== undefined ? w.pts : 0);

                if (!name) {
                    return `
                        <div class="flat-rank-row ${rowClass} d-flex align-items-center justify-content-between opacity-50 py-2 px-2.5 rounded-2 my-1" style="white-space: nowrap;">
                            <span class="badge ${badgeClass} d-inline-flex align-items-center gap-1"><i class="bi ${rankIcon}"></i> ${rankText}</span>
                            <span class="text-muted small fw-semibold">-</span>
                        </div>
                    `;
                }

                return `
                    <div class="flat-rank-row ${rowClass} d-flex align-items-center justify-content-between py-2 px-2.5 rounded-2 my-1" style="white-space: nowrap;">
                        <div class="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                            <span class="badge ${badgeClass} d-inline-flex align-items-center gap-1 flex-shrink-0" style="font-size: 0.8rem;"><i class="bi ${rankIcon}"></i> ${rankText}</span>
                            <div class="winner-info-block min-w-0 flex-grow-1" style="white-space: nowrap;">
                                <div class="winner-student-name fw-bold text-dark text-truncate" style="font-size: 0.9rem; white-space: nowrap;">${name}</div>
                                <div class="d-flex align-items-center gap-1 mt-0.5" style="white-space: nowrap;">
                                    ${groupName ? `<span class="flat-tag-team" style="font-size: 0.7rem; padding: 1px 6px;"><i class="bi bi-people-fill me-1"></i>${groupName}</span>` : ''}
                                    ${chestNo ? `<span class="flat-tag-chest" style="font-size: 0.7rem; padding: 1px 6px;">#${chestNo}</span>` : ''}
                                    ${grade ? `<span class="flat-tag-grade" style="font-size: 0.7rem; padding: 1px 6px;">Grade ${grade}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            };

            const renderCardBlockIndex = (rankPlace, winnersData) => {
                const list = Array.isArray(winnersData) ? winnersData : (winnersData && (winnersData.name || winnersData.studentName) ? [winnersData] : []);
                if (list.length === 0) return renderSingleCardRowIndex(rankPlace, null);
                return list.map(w => renderSingleCardRowIndex(rankPlace, w)).join('');
            };

            const getCardWinnerCountIndex = (res) => {
                if (!res) return 0;
                const count = (w) => {
                    if (!w) return 0;
                    if (Array.isArray(w)) return w.filter(item => item && (item.name || item.studentName || item.student || item.student_name)).length;
                    return (w.name || w.studentName || w.student || w.student_name) ? 1 : 0;
                };
                return count(res.first) + count(res.second) + count(res.third);
            };

            const chunkCardsIntoSetsIndex = (orderedCards) => {
                if (!orderedCards || orderedCards.length === 0) return [];
                const sets = [];
                let i = 0;
                while (i < orderedCards.length) {
                    const remaining = orderedCards.slice(i);
                    let currentSlotCount = 0;
                    const setCards = [];

                    for (let j = 0; j < remaining.length; j++) {
                        const card = remaining[j];
                        const isWide = getCardWinnerCountIndex(card) > 3;
                        const cardSlots = isWide ? 2 : 1;

                        if (currentSlotCount + cardSlots > 4 && setCards.length > 0) {
                            break;
                        }

                        setCards.push({
                            res: card,
                            isWide: isWide,
                            slots: cardSlots
                        });
                        currentSlotCount += cardSlots;
                    }

                    sets.push({
                        setCards: setCards,
                        totalSlots: currentSlotCount
                    });

                    i += setCards.length;
                }
                return sets;
            };

            const renderTableCellIndex = (rankPlace, winnersData) => {
                const list = Array.isArray(winnersData) ? winnersData : (winnersData && (winnersData.name || winnersData.studentName) ? [winnersData] : []);
                if (list.length === 0 || !list[0].name) return '<span class="text-muted small">-</span>';

                const iconClass = rankPlace === '1st' ? 'bi-trophy-fill text-warning' : (rankPlace === '2nd' ? 'bi-award-fill text-secondary' : 'bi-award text-danger');
                const rankBadgeBg = rankPlace === '1st' ? 'bg-warning text-dark' : (rankPlace === '2nd' ? 'bg-secondary text-white' : 'bg-danger text-white');
                const teamBadgeBg = rankPlace === '1st' ? 'bg-success-subtle text-success' : (rankPlace === '2nd' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary');
                const ptsTextClass = rankPlace === '1st' ? 'text-warning' : (rankPlace === '2nd' ? 'text-secondary' : 'text-danger');

                return list.map(w => {
                    const name = w.name || w.studentName || w.student || w.student_name || '-';
                    const chestNo = w.chestNo || w.chest || w.chestNumber || '';
                    const team = w.team || w.group || w.groupName || '';
                    const grade = w.grade || '';
                    const pts = w.points !== undefined ? w.points : (w.pts || 0);
                    return `
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <i class="bi ${iconClass} fs-5"></i>
                            <div>
                                <div class="d-flex align-items-center gap-1 mb-1">
                                    <span class="badge ${rankBadgeBg} fw-bold" style="font-size: 0.65rem;"><i class="bi ${iconClass.split(' ')[0]} me-1"></i>${rankPlace}</span>
                                    <span class="fw-semibold text-dark small">${name}</span>
                                </div>
                                ${chestNo ? `<small class="badge bg-dark text-white me-1">Chest #${chestNo}</small>` : ''}
                                ${team ? `<small class="badge ${teamBadgeBg} me-1">${team}</small>` : ''}
                                ${grade ? `<small class="badge bg-secondary-subtle text-secondary me-1">${grade}</small>` : ''}
                                <small class="fw-bold ${ptsTextClass}">+${pts} pts</small>
                            </div>
                        </div>
                    `;
                }).join('');
            };

            window.festSetIndex = 0;
            window.festCountdownSeconds = 10;

            const startCardTimer = (totalPages) => {
                if (window.festCardTimerInterval) clearInterval(window.festCardTimerInterval);
                if (totalPages <= 1) return;

                window.festCardTimerInterval = setInterval(() => {
                    window.festCountdownSeconds--;

                    const textEl = document.getElementById('festCountdownText');
                    const barEl = document.getElementById('festCountdownBar');

                    if (textEl) textEl.innerText = `${window.festCountdownSeconds}s`;
                    if (barEl) barEl.style.width = `${(window.festCountdownSeconds / 10) * 100}%`;

                    if (window.festCountdownSeconds <= 0) {
                        window.festCountdownSeconds = 10;
                        window.festSetIndex = (window.festSetIndex + 1) % totalPages;
                        const activeBtn = document.querySelector('#festCategoryFilterGroup .btn.active');
                        const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
                        const searchInput = document.getElementById('festSearchInput');
                        const q = searchInput ? searchInput.value : '';
                        renderResultsView(activeFilter, q, false);
                    }
                }, 1000);
            };

            const renderResultsView = (filterCategory = 'all', searchQuery = '', resetPage = true) => {
                let filtered = window.allFestResults || [];

                if (filterCategory !== 'all') {
                    filtered = filtered.filter(r => String(r.category).toLowerCase() === filterCategory.toLowerCase());
                }

                if (searchQuery.trim() !== '') {
                    const q = searchQuery.toLowerCase();
                    filtered = filtered.filter(r => 
                        (r.eventName && r.eventName.toLowerCase().includes(q)) ||
                        matchWinnerIndex(r.first, q) ||
                        matchWinnerIndex(r.second, q) ||
                        matchWinnerIndex(r.third, q)
                    );
                }

                if (resetPage) {
                    window.festSetIndex = 0;
                    window.festCountdownSeconds = 10;
                }

                // Balance mixed cards if 'all' category is selected
                let orderedCards = [];
                if (filterCategory === 'all') {
                    const buckets = {
                        'Sub-Junior': filtered.filter(r => String(r.category).toLowerCase() === 'sub-junior'),
                        'Junior': filtered.filter(r => String(r.category).toLowerCase() === 'junior'),
                        'Senior': filtered.filter(r => String(r.category).toLowerCase() === 'senior'),
                        'Super Senior': filtered.filter(r => String(r.category).toLowerCase() === 'super senior')
                    };
                    const catKeys = ['Sub-Junior', 'Junior', 'Senior', 'Super Senior'];
                    const otherCards = filtered.filter(r => !catKeys.map(k=>k.toLowerCase()).includes(String(r.category).toLowerCase()));
                    const maxLen = Math.max(...catKeys.map(k => buckets[k].length), 1);

                    for (let i = 0; i < maxLen; i++) {
                        catKeys.forEach(k => {
                            if (buckets[k][i]) orderedCards.push(buckets[k][i]);
                        });
                    }
                    otherCards.forEach(c => orderedCards.push(c));
                } else {
                    orderedCards = filtered;
                }

                const sets = chunkCardsIntoSetsIndex(orderedCards);
                const totalPages = sets.length || 1;
                
                if (window.festSetIndex >= totalPages) window.festSetIndex = 0;

                // Render Rectangle Card Set View with Wide Extra-Result Cards
                if (cardsContainer) {
                    if (sets.length === 0) {
                        cardsContainer.innerHTML = '<div class="w-100 text-center py-5 text-muted"><i class="bi bi-inbox display-4 d-block mb-3 opacity-50"></i><h5>No event programme results found.</h5><p class="small">Try adjusting search or category filter.</p></div>';
                        if (window.festCardTimerInterval) clearInterval(window.festCardTimerInterval);
                    } else {
                        const currentSetObj = sets[window.festSetIndex] || sets[0];
                        const currentSetCards = currentSetObj.setCards;

                        let cardsHTML = `
                            <div class="mb-3 px-1">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="badge bg-dark text-white rounded-pill px-3 py-1.5 fw-bold small">
                                            Set ${window.festSetIndex + 1} of ${totalPages}
                                        </span>
                                        ${totalPages > 1 ? `<small class="text-muted fw-semibold">Auto-switching in <strong id="festCountdownText">${window.festCountdownSeconds}s</strong></small>` : ''}
                                    </div>
                                    ${totalPages > 1 ? `
                                        <div class="d-flex align-items-center gap-1">
                                            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" id="prevSetBtn" title="Previous Set">
                                                <i class="bi bi-chevron-left me-1"></i> Prev Set
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold" id="nextSetBtn" title="Next Set">
                                                Next Set <i class="bi bi-chevron-right ms-1"></i>
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                                ${totalPages > 1 ? `
                                    <div class="progress" style="height: 4px; background-color: #e2e8f0; border-radius: 4px;">
                                        <div id="festCountdownBar" class="progress-bar bg-warning" style="width: ${(window.festCountdownSeconds / 10) * 100}%; transition: width 1s linear;"></div>
                                    </div>
                                ` : ''}
                            </div>

                            <div class="row g-3 mb-2">
                        `;

                        currentSetCards.forEach((item, index) => {
                            const res = item.res;
                            const delay = (index * 0.08).toFixed(2);
                            if (item.isWide) {
                                cardsHTML += `
                                    <div class="col-12 col-lg-6 fest-card-anim" style="animation-delay: ${delay}s;">
                                        <div class="card flat-card h-100 p-3 shadow-sm border d-flex flex-column justify-content-between rounded-3">
                                            <div>
                                                <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                                    <h5 class="fw-extrabold mb-0 text-dark text-truncate me-2" style="font-size: 1.15rem; font-weight: 800; letter-spacing: -0.2px;" title="${res.eventName}">
                                                        ${res.eventName}
                                                    </h5>
                                                    <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                                                        <span class="flat-tag" style="font-size: 0.78rem; font-weight: 700; padding: 3px 10px;">${res.category || 'General'}</span>
                                                        <span class="badge bg-warning text-dark fw-bold px-2 py-1" style="font-size: 0.72rem;"><i class="bi bi-star-fill me-1"></i>Multi-Winner</span>
                                                    </div>
                                                </div>
                                                <div class="row row-cols-1 row-cols-sm-2 g-2 winner-cards-data-wrapper">
                                                    <div class="col">
                                                        ${renderCardBlockIndex('1st', res.first)}
                                                    </div>
                                                    <div class="col">
                                                        ${renderCardBlockIndex('2nd', res.second)}
                                                        ${renderCardBlockIndex('3rd', res.third)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            } else {
                                cardsHTML += `
                                    <div class="col-12 col-sm-6 col-lg-3 fest-card-anim" style="animation-delay: ${delay}s;">
                                        <div class="card flat-card h-100 p-3 shadow-sm border d-flex flex-column justify-content-between rounded-3">
                                            <div>
                                                <div class="text-center mb-2 pb-2 border-bottom">
                                                    <h5 class="fw-extrabold mb-1 text-dark text-center text-truncate" style="font-size: 1.1rem; font-weight: 800; letter-spacing: -0.2px;" title="${res.eventName}">
                                                        ${res.eventName}
                                                    </h5>
                                                    <span class="flat-tag" style="font-size: 0.78rem; font-weight: 700; padding: 3px 10px;">${res.category || 'General'}</span>
                                                </div>
                                                <div class="winner-cards-data-wrapper">
                                                    ${renderCardBlockIndex('1st', res.first)}
                                                    ${renderCardBlockIndex('2nd', res.second)}
                                                    ${renderCardBlockIndex('3rd', res.third)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                        });
                        cardsHTML += `</div>`;

                        cardsContainer.innerHTML = cardsHTML;

                        // Attach manual pagination handlers
                        const prevBtn = document.getElementById('prevSetBtn');
                        const nextBtn = document.getElementById('nextSetBtn');

                        if (prevBtn) {
                            prevBtn.onclick = () => {
                                window.festSetIndex = (window.festSetIndex - 1 + totalPages) % totalPages;
                                window.festCountdownSeconds = 10;
                                renderResultsView(filterCategory, searchQuery, false);
                                startCardTimer(totalPages);
                            };
                        }

                        if (nextBtn) {
                            nextBtn.onclick = () => {
                                window.festSetIndex = (window.festSetIndex + 1) % totalPages;
                                window.festCountdownSeconds = 10;
                                renderResultsView(filterCategory, searchQuery, false);
                                startCardTimer(totalPages);
                            };
                        }

                        // Wire navigation arrow buttons if present
                        ['festScrollLeftBtn', 'festFloatingLeftBtn'].forEach(id => {
                            const btn = document.getElementById(id);
                            if (btn) btn.onclick = (e) => {
                                e.preventDefault();
                                window.festSetIndex = (window.festSetIndex - 1 + totalPages) % totalPages;
                                window.festCountdownSeconds = 10;
                                renderResultsView(filterCategory, searchQuery, false);
                                startCardTimer(totalPages);
                            };
                        });

                        ['festScrollRightBtn', 'festFloatingRightBtn'].forEach(id => {
                            const btn = document.getElementById(id);
                            if (btn) btn.onclick = (e) => {
                                e.preventDefault();
                                window.festSetIndex = (window.festSetIndex + 1) % totalPages;
                                window.festCountdownSeconds = 10;
                                renderResultsView(filterCategory, searchQuery, false);
                                startCardTimer(totalPages);
                            };
                        });

                        startCardTimer(totalPages);
                    }
                }

                // Render Table View (Secondary)
                if (tableBody) {
                    if (filtered.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted"><i class="bi bi-inbox display-6 d-block mb-2"></i>No event results found.</td></tr>';
                    } else {
                        let rowsHTML = '';
                        filtered.forEach(res => {
                            rowsHTML += `
                                <tr>
                                    <td class="ps-3">
                                        <span class="fw-bold text-dark d-block" style="color: #000000 !important;">${res.eventName}</span>
                                        <span class="badge bg-secondary-subtle text-dark rounded-pill small" style="color: #000000 !important; font-weight: 600;">${res.category || 'General'}</span>
                                    </td>
                                    <td>
                                        ${renderTableCellIndex('1st', res.first)}
                                    </td>
                                    <td>
                                        ${renderTableCellIndex('2nd', res.second)}
                                    </td>
                                    <td>
                                        ${renderTableCellIndex('3rd', res.third)}
                                    </td>
                                </tr>
                            `;
                        });
                        tableBody.innerHTML = rowsHTML;
                    }
                }
            };

            renderResultsView('all', '', isInitial);

            // Set up search and category filter event handlers
            const searchInput = document.getElementById('festSearchInput');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const activeBtn = document.querySelector('#festCategoryFilterGroup .btn.active');
                    const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
                    renderResultsView(activeFilter, e.target.value);
                });
            }

            const filterBtns = document.querySelectorAll('#festCategoryFilterGroup .btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const filter = this.getAttribute('data-filter');
                    const q = searchInput ? searchInput.value : '';
                    renderResultsView(filter, q);
                });
            });

            // View Switcher Buttons (Cards View vs Table View)
            const festViewCardsBtn = document.getElementById('festViewCardsBtn');
            const festViewTableBtn = document.getElementById('festViewTableBtn');
            const cardsWrapper = document.getElementById('festResultsCardsWrapper');
            const tableWrapper = document.getElementById('festResultsTableWrapper');

            if (festViewCardsBtn && festViewTableBtn && cardsWrapper && tableWrapper) {
                festViewCardsBtn.addEventListener('click', () => {
                    festViewCardsBtn.classList.add('active');
                    festViewTableBtn.classList.remove('active');
                    cardsWrapper.style.display = 'block';
                    tableWrapper.style.display = 'none';
                });

                festViewTableBtn.addEventListener('click', () => {
                    festViewTableBtn.classList.add('active');
                    festViewCardsBtn.classList.remove('active');
                    cardsWrapper.style.display = 'none';
                    tableWrapper.style.display = 'block';
                });
            }

        } catch (err) {
            console.error('Error loading fest scoreboard:', err);
            if (teamsContainer) teamsContainer.innerHTML = '<div class="col-12 text-center text-danger">Failed to load scoreboard data.</div>';
        }
    };
    loadFestScoreboard();
    setInterval(loadFestScoreboard, 5000);

    // --- Full Screen Scoreboard Mode (No Navbars) ---
    const toggleFullScreenBtn = document.getElementById('toggleFullScreenBtn');
    const exitFullScreenBtn = document.getElementById('exitFullScreenBtn');

    const enterFullScreenMode = () => {
        document.body.classList.add('scoreboard-fullscreen-mode');
        if (toggleFullScreenBtn) toggleFullScreenBtn.style.display = 'none';
        if (exitFullScreenBtn) exitFullScreenBtn.style.display = 'inline-block';
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
        }
    };

    const exitFullScreenMode = () => {
        document.body.classList.remove('scoreboard-fullscreen-mode');
        if (toggleFullScreenBtn) toggleFullScreenBtn.style.display = 'inline-block';
        if (exitFullScreenBtn) exitFullScreenBtn.style.display = 'none';
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log('Exit fullscreen failed:', err));
        }
    };

    if (toggleFullScreenBtn) toggleFullScreenBtn.addEventListener('click', enterFullScreenMode);
    if (exitFullScreenBtn) exitFullScreenBtn.addEventListener('click', exitFullScreenMode);

    // Auto trigger if URL contains ?fullscreen=true or #fullscreen
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fullscreen') === 'true' || window.location.hash === '#fullscreen') {
        enterFullScreenMode();
    }
});