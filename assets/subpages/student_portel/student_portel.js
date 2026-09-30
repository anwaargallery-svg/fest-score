function logout(){
    sessionStorage.removeItem('active_student_session');
    window.location.href = "../../../index.html";
}

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

// Helper function for consistent data access, similar to admin.js
function getStudentProp(student, keys) {
    if (!student) return undefined;
    for (const key of keys) {
        if (student[key] !== undefined && student[key] !== null) {
            return student[key];
        }
    }
    return undefined;
}

const getApiUrl = (endpoint) => {
    if (window.location.protocol === 'file:' || !window.location.hostname) {
        return `http://localhost:3000${endpoint}`;
    }
    if (window.location.port && window.location.port !== '3000' && window.location.port !== '80' && window.location.port !== '443') {
        const host = window.location.hostname || 'localhost';
        return `http://${host}:3000${endpoint}`;
    }
    return endpoint;
};

document.addEventListener('DOMContentLoaded', async () => {
    let activeEnroll = sessionStorage.getItem('active_student_session');

    if (!activeEnroll) {
        alert("Please log in to access the portal.");
        window.location.href = "../../../index.html";
        return;
    }
    
    const response = await fetch(getApiUrl('/api/admin/data'));
    const data = await response.json();
    const studentsDb = data.students || [];
    const resultsDb = data.results || [];
    
    let student = studentsDb.find(s => String(getStudentProp(s, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo'])).toLowerCase() === activeEnroll.toLowerCase());
    let isFromResultsOnly = !student;

    if (!student) {
        alert("No student data found for your session! Please contact administration.");
        localStorage.removeItem('active_student_session');
        window.location.href = "../../../index.html";
        return;
    }

        const name = student.Name || student.StudentName || 'Unknown Student';
        const enroll = getStudentProp(student, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) || '-';
        const course = getStudentProp(student, ['Course', 'course', 'Class', 'class']) || '-';
        const contact = student.Contact || student.Phone || student.Mobile || (isFromResultsOnly ? 'Not Available' : 'Not Provided');
        const email = student.Email || (isFromResultsOnly ? 'Not Available' : 'Not Provided');
        const address = student.Address || (isFromResultsOnly ? 'Not Available' : 'Not Provided');
        const dob = student.DOB || student.dob || student['Date of Birth'] || (isFromResultsOnly ? 'Not Available' : 'Not Provided');
        
        const currentYear = parseInt(student.CurrentYear) || 1;
        const courseMaxYears = { 'Hifz': 3, 'Shareeath': 10, 'Muthawal': 2 };
        const maxYear = courseMaxYears[course] || '-';
        const yearText = maxYear !== '-' ? `Year ${currentYear} of ${maxYear}` : `Year ${currentYear}`;

        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        document.getElementById('navStudentName').innerText = name;
        document.getElementById('sideStudentName').innerText = name;
        document.getElementById('sideStudentEnroll').innerText = `Roll No: ${enroll}`;
        document.getElementById('sideStudentCourse').innerText = course;
        
        const studentAvatarImg = document.getElementById('studentAvatarImg');
        const avatarInitialsDiv = document.getElementById('avatarInitials');
        if (studentAvatarImg && avatarInitialsDiv) {
            if (student.photo) {
                studentAvatarImg.src = student.photo;
                studentAvatarImg.style.display = 'block';
                avatarInitialsDiv.classList.remove('d-flex');
                avatarInitialsDiv.classList.add('d-none');
            } else {
                avatarInitialsDiv.classList.remove('d-none');
                avatarInitialsDiv.classList.add('d-flex');
                avatarInitialsDiv.innerText = initials;
                studentAvatarImg.style.display = 'none';
            }
        }

        document.getElementById('detailName').innerText = name;
        document.getElementById('detailEnroll').innerText = enroll;
        document.getElementById('detailContact').innerText = contact;
        document.getElementById('detailEmail').innerText = email;
        document.getElementById('detailAddress').innerText = address;
        document.getElementById('detailDob').innerText = dob;
        document.getElementById('detailYear').innerText = yearText;

        // Handle Print Profile Details
        const printProfileBtn = document.getElementById('printProfileBtn');
        if (printProfileBtn) {
            printProfileBtn.addEventListener('click', () => {
                const printStyles = `
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 0; position: relative; }
                    .watermark-text { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 6rem; color: rgba(0, 0, 0, 0.04); font-weight: bold; text-transform: uppercase; z-index: -2; white-space: nowrap; pointer-events: none; }
                    .watermark-logo { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.06; width: 450px; z-index: -1; pointer-events: none; border-radius: 50%; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
                    th, td { padding: 12px; border-bottom: 1px dashed #ccc !important; font-size: 15px; background-color: transparent !important; text-align: left; }
                    th { background-color: transparent !important; color: #444 !important; font-weight: bold; width: 40%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .header-section { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #222; padding-bottom: 15px; margin-bottom: 25px; }
                    .college-title { margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000; }
                    .document-title { margin: 5px 0 0; font-size: 16px; color: #555; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
                    .footer-sig { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; padding: 0 40px; }
                    .sig-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-weight: bold; color: #222; font-size: 14px; }
                `;
                const printWindow = window.open('', '_blank', 'height=600,width=800');
                printWindow.document.write('<html><head><title>Print Student Profile</title>');
                printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
                printWindow.document.write(`<style>${printStyles}</style>`);
                printWindow.document.write('</head><body>');
                printWindow.document.write('<div class="watermark-text">OFFICIAL DOCUMENT</div>');
                printWindow.document.write('<img src="../../../assets/images/image.png" class="watermark-logo" alt="watermark">');
                const photoHTML = student.photo ? `<img src="${student.photo}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #000; padding: 2px;" alt="Student Photo">` : '';
                printWindow.document.write(`<div class="header-section"><div style="width: 120px; text-align: left;"><img src="../../../assets/images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div><div style="flex-grow: 1; text-align: center;"><h2 class="college-title">Anwariyya Arabic College</h2><h4 class="document-title">Student Profile</h4></div><div style="width: 120px; text-align: right;">${photoHTML}</div></div>`);
                printWindow.document.write(`<table style="border: none;"><tbody><tr><th>Enrollment Number</th><td>: ${enroll}</td></tr><tr><th>Full Name</th><td>: ${name}</td></tr><tr><th>Course</th><td>: ${course}</td></tr><tr><th>Current Class / Year</th><td>: ${yearText}</td></tr><tr><th>Date of Birth</th><td>: ${dob}</td></tr><tr><th>Contact Number</th><td>: ${contact}</td></tr><tr><th>Email Address</th><td>: ${email}</td></tr><tr><th>Permanent Address</th><td>: ${address}</td></tr></tbody></table>`);
                printWindow.document.write('<div class="footer-sig"><div class="sig-line">Date & College Seal</div><div class="sig-line">Principal Signature</div></div>');
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(function() { printWindow.print(); }, 500);
            });
        }

        // --- Inbox / Messaging Logic ---
        const loadMessages = async () => {
            const accordionContainer = document.getElementById('messagesAccordion');
            const unreadBadge = document.getElementById('unreadMessagesBadge');
            if (!accordionContainer || !unreadBadge) return;

            try {
                const response = await fetch(getApiUrl(`/api/student/messages?enrollNo=${enroll}`));
                const data = await response.json();

                if (!data.success || data.messages.length === 0) {
                    accordionContainer.innerHTML = '<div class="text-center text-muted p-4">Your inbox is empty.</div>';
                    unreadBadge.style.display = 'none';
                    return;
                }

                let unreadCount = 0;
                accordionContainer.innerHTML = '';
                data.messages.forEach(msg => {
                    if (!msg.isRead) unreadCount++;
                    const isUnreadClass = !msg.isRead ? 'fw-bold' : '';
                    const badgeColor = !msg.isRead ? 'bg-primary' : 'bg-secondary';

                    accordionContainer.innerHTML += `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading-${msg.id}">
                                <button class="accordion-button collapsed ${isUnreadClass}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${msg.id}" aria-expanded="false" aria-controls="collapse-${msg.id}" data-message-id="${msg.id}" data-is-read="${msg.isRead}">
                                    <span class="badge ${badgeColor} me-3">${new Date(msg.timestamp).toLocaleDateString()}</span>
                                    ${msg.subject}
                                </button>
                            </h2>
                            <div id="collapse-${msg.id}" class="accordion-collapse collapse" aria-labelledby="heading-${msg.id}" data-bs-parent="#messagesAccordion">
                                <div class="accordion-body" style="white-space: pre-wrap;">${msg.body}</div>
                            </div>
                        </div>
                    `;
                });

                unreadBadge.innerText = unreadCount;
                unreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';

                // Add event listeners to mark as read on open
                document.querySelectorAll('.accordion-button').forEach(button => {
                    button.addEventListener('click', async () => {
                        const messageId = button.getAttribute('data-message-id');
                        const isRead = button.getAttribute('data-is-read') === 'true';
                        if (!isRead) {
                            await fetch(getApiUrl('/api/student/message/read'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, enrollNo: enroll }) });
                            // Refresh messages to update UI state
                            loadMessages();
                        }
                    });
                });

            } catch (err) {
                accordionContainer.innerHTML = '<div class="text-center text-danger p-4">Failed to load messages.</div>';
            }
        };
        loadMessages();
        // Fetch and Display Student Results in the New Tab
        // Get all results for the student and sort to show the latest by default
        const allStudentResults = resultsDb.filter(r => {
            return String(getStudentProp(r, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo'])).toLowerCase() === enroll.toLowerCase();
        });
        
        allStudentResults.sort((a, b) => {
            const yearA = parseInt(a.CurrentYear || a.Year || a.year || a.Class || 1);
            const yearB = parseInt(b.CurrentYear || b.Year || b.year || b.Class || 1);
            return yearB - yearA; // Descending
        });

        const studentResult = allStudentResults.length > 0 ? allStudentResults[0] : null;

        const resultsContainer = document.getElementById('myResultsContent');
        if (resultsContainer) {
            if (studentResult) {
                let marksHTML = `<div class="text-end mb-3">
                    <button id="printMyResultBtn" class="btn btn-sm btn-dark"><i class="bi bi-printer me-1"></i> Print Latest Result</button>
                    <button id="downloadProgressCardBtn" class="btn btn-sm btn-primary ms-2"><i class="bi bi-file-earmark-pdf me-1"></i> Download Full Progress Card (PDF)</button>
                </div>`;
                marksHTML += `<div class="table-responsive"><table class="table table-bordered table-hover mt-2"><thead class="table-light"><tr><th>Subject</th><th>Marks / Grade</th></tr></thead><tbody>`;
                let overallPass = true;
                let hasNumeric = false;
                
                for (const key in studentResult) {
                    const lowerKey = key.trim().toLowerCase();
                    if (!['name', 'enrollno', 'enroll no', 'enroll no.', 'course', 'class', 'password', 'pin', 'currentyear', 'appid', 'status', 'contact', 'email', 'address', 'photo'].includes(lowerKey)) {
                        const markValue = studentResult[key];
                        const numMark = parseFloat(markValue);
                        let isFail = false;
                        
                        if (!isNaN(numMark)) {
                            hasNumeric = true;
                            if (numMark < 35) { isFail = true; overallPass = false; }
                        } else if (String(markValue).toLowerCase() === 'fail' || String(markValue).toLowerCase() === 'f') {
                            isFail = true; overallPass = false;
                        }
                        
                        marksHTML += `<tr><td class="fw-semibold text-muted w-50">${key}</td><td class="${isFail ? 'text-danger fw-bold' : 'fw-bold'}">${markValue} ${isFail ? '<span class="badge bg-danger ms-2">FAIL</span>' : ''}</td></tr>`;
                    }
                }
                marksHTML += `</tbody></table></div>`;
                
                if (hasNumeric || Object.keys(studentResult).length > 7) {
                     marksHTML = `<div class="alert ${overallPass ? 'alert-success' : 'alert-danger'} border-0 shadow-sm fw-bold mb-4"><i class="bi ${overallPass ? 'bi-check-circle' : 'bi-x-circle'} me-2"></i>Overall Status: ${overallPass ? 'PASSED (Eligible for Promotion)' : 'FAILED (Below 35 Marks)'}</div>` + marksHTML;
                }
                
                resultsContainer.innerHTML = marksHTML;

                // Handle Print My Result
                setTimeout(() => {
                    const printMyResultBtn = document.getElementById('printMyResultBtn');
                    if(printMyResultBtn) {
                        printMyResultBtn.addEventListener('click', () => {
                            // Password protection for printing
                            const pass = prompt("Please enter your password to confirm printing:");
                            if (pass === null) return; // Cancelled
                            const actualPass = student.Password || student.password || '123456';
                            if (pass !== String(actualPass)) {
                                alert("Incorrect password! Printing cancelled.");
                                return;
                            }

                            const resultDisplayHTML = document.querySelector('#myResultsContent .table-responsive').innerHTML;
                            const statusHTML = document.querySelector('#myResultsContent .alert') ? document.querySelector('#myResultsContent .alert').outerHTML : '';
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
                                .badge { border: 1px solid #000; color: #000 !important; background-color: transparent !important; }
                            `;
                            const printWindow = window.open('', '_blank', 'height=600,width=800');
                            printWindow.document.write('<html><head><title>Print My Result</title>');
                            printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
                            printWindow.document.write(`<style>${printStyles}</style>`);
                            printWindow.document.write('<\/head><body>');
                            printWindow.document.write('<div class="watermark-text">OFFICIAL DOCUMENT</div>');
                            printWindow.document.write('<img src="../../../assets/images/image.png" class="watermark-logo" alt="watermark">');
                            const photoHTML = student.photo ? `<img src="${student.photo}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #000; padding: 2px;" alt="Student Photo">` : '';
                            printWindow.document.write(`<div class="header-section"><div style="width: 120px; text-align: left;"><img src="../../../assets/images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div><div style="flex-grow: 1; text-align: center;"><h2 class="college-title">Anwariyya Arabic College</h2><h4 class="document-title">Examination Result Sheet</h4></div><div style="width: 120px; text-align: right;">${photoHTML}</div></div>`);
                            printWindow.document.write(`<div class="mb-4"><strong>Name:</strong> ${name}<br><strong>Enrollment No:</strong> ${enroll}<br><strong>Course:</strong> ${course} ${yearText}</div>`);
                            printWindow.document.write(statusHTML);
                            printWindow.document.write(resultDisplayHTML);
                            printWindow.document.write('<div class="footer-sig"><div class="sig-line">Date & College Seal</div><div class="sig-line">Principal Signature</div></div>');
                            printWindow.document.write('<\/body><\/html>');
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(function() { printWindow.print(); }, 500);
                        });
                    }

                    // Handle Download Full Progress Card (Direct PDF Download)
                    const downloadProgressCardBtn = document.getElementById('downloadProgressCardBtn');
                    if (downloadProgressCardBtn) {
                        // Dynamically load html2pdf if not already loaded
                        if (!window.html2pdf) {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                            document.head.appendChild(script);
                        }

                        downloadProgressCardBtn.addEventListener('click', () => {
                            if (!window.html2pdf) {
                                alert("PDF engine is still loading. Please wait a few seconds and try again.");
                                return;
                            }

                            // Password protection for downloading
                            const pass = prompt("Please enter your password to confirm download:");
                            if (pass === null) return; // Cancelled
                            const actualPass = student.Password || student.password || '123456';
                            if (pass !== String(actualPass)) {
                                alert("Incorrect password! Download cancelled.");
                                return;
                            }

                            const originalBtnHtml = downloadProgressCardBtn.innerHTML;
                            downloadProgressCardBtn.innerHTML = '<i class="bi bi-arrow-repeat spin me-1"></i> Generating PDF...';
                            downloadProgressCardBtn.disabled = true;

                            // Create a temporary hidden container for the PDF generation
                            const pdfContainer = document.createElement('div');
                            pdfContainer.style.width = '800px'; 
                            pdfContainer.style.padding = '30px';
                            pdfContainer.style.backgroundColor = '#fff';
                            pdfContainer.style.color = '#000';
                            pdfContainer.style.fontFamily = 'Arial, sans-serif';
                            
                            const photoHTML = student.photo ? `<img src="${student.photo}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #000; padding: 2px;" alt="Student Photo">` : '';
                            
                            let htmlContent = `
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #222; padding-bottom: 15px; margin-bottom: 25px;">
                                    <div style="width: 120px; text-align: left;"><img src="../../../assets/images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div>
                                    <div style="flex-grow: 1; text-align: center;">
                                        <h2 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase;">Anwariyya Arabic College</h2>
                                        <h4 style="margin: 5px 0 0; font-size: 16px; color: #555; font-weight: bold; text-transform: uppercase;">Comprehensive Progress Card</h4>
                                    </div>
                                    <div style="width: 120px; text-align: right;">${photoHTML}</div>
                                </div>

                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                                    <tbody>
                                        <tr><th style="padding: 8px; border: 1px solid #ccc; background: #f0f0f0; width: 25%; text-align: left;">Student Name</th><td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${name}</td></tr>
                                        <tr><th style="padding: 8px; border: 1px solid #ccc; background: #f0f0f0; text-align: left;">Enrollment No</th><td style="padding: 8px; border: 1px solid #ccc;">${enroll}</td></tr>
                                        <tr><th style="padding: 8px; border: 1px solid #ccc; background: #f0f0f0; text-align: left;">Course</th><td style="padding: 8px; border: 1px solid #ccc;">${course}</td></tr>
                                        <tr><th style="padding: 8px; border: 1px solid #ccc; background: #f0f0f0; text-align: left;">Date of Birth</th><td style="padding: 8px; border: 1px solid #ccc;">${dob}</td></tr>
                                    </tbody>
                                </table>
                            `;

                            // Sort chronologically for the printed transcript (Year 1, Year 2, etc.)
                            const sortedResults = [...allStudentResults].sort((a, b) => {
                                const yearA = parseInt(a.CurrentYear || a.Year || a.year || a.Class || 1);
                                const yearB = parseInt(b.CurrentYear || b.Year || b.year || b.Class || 1);
                                return yearA - yearB; 
                            });

                            sortedResults.forEach((res, index) => {
                                // Add a clean page break for each class/year
                                if (index > 0) htmlContent += `<div class="html2pdf__page-break"></div>`;

                                const rYear = res.CurrentYear || res.Year || res.year || res.Class || (index + 1);
                                htmlContent += `<div style="background-color: #e9ecef; padding: 10px; font-weight: bold; border: 1px solid #ccc; border-bottom: none; text-align: center; font-size: 16px; margin-top: 20px;">Academic Year / Class: ${rYear}</div>`;
                                htmlContent += `<table style="width: 100%; border-collapse: collapse; font-size: 14px;"><thead><tr><th style="padding: 8px; border: 1px solid #ccc; background: #f0f0f0; text-align: left;">Subject</th><th style="padding: 8px; border: 1px solid #ccc; background: #f0f0f0; text-align: left;">Marks / Grade</th></tr></thead><tbody>`;
                                
                                let yearPass = true;
                                let hasNumericMarks = false;
                                const detailKeys = ['name', 'enrollno', 'enroll no', 'enroll no.', 'course', 'class', 'password', 'pin', 'currentyear', 'contact', 'email', 'status', 'address', 'photo', 'appid'];

                                for (const key in res) {
                                    if (!detailKeys.includes(key.trim().toLowerCase())) {
                                        const markValue = res[key];
                                        const numMark = parseFloat(markValue);
                                        let isFail = false;
                                        if (!isNaN(numMark)) { 
                                            hasNumericMarks = true; 
                                            if (numMark < 35) { isFail = true; yearPass = false; } 
                                        } 
                                        else if (String(markValue).toLowerCase() === 'fail' || String(markValue).toLowerCase() === 'f') { 
                                            isFail = true; yearPass = false; 
                                        }
                                        htmlContent += `<tr><td style="padding: 8px; border: 1px solid #ccc; width: 50%; font-weight: 600;">${key}</td><td style="padding: 8px; border: 1px solid #ccc; ${isFail ? 'color: #dc3545; font-weight: bold;' : 'font-weight: bold;'}">${markValue} ${isFail ? ' (FAIL)' : ''}</td></tr>`;
                                    }
                                }
                                htmlContent += `</tbody></table>`;
                                
                                if (hasNumericMarks || Object.keys(res).length > 7) { 
                                    htmlContent += `<div style="border: 1px solid #ccc; border-top: none; padding: 8px; text-align: center; font-weight: bold; background-color: ${yearPass ? '#e8f5e9' : '#f8d7da'}; color: ${yearPass ? '#198754' : '#dc3545'}; margin-bottom: 20px;">Status for Year ${rYear}: ${yearPass ? 'PASSED' : 'FAILED'}</div>`; 
                                }
                            });

                            htmlContent += `<div style="margin-top: 60px; display: flex; justify-content: space-between; padding: 0 40px;"><div style="border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-weight: bold; font-size: 14px;">Date & College Seal</div><div style="border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-weight: bold; font-size: 14px;">Principal Signature</div></div>`;
                            
                            pdfContainer.innerHTML = htmlContent;
                            
                            // Hide the element from screen while processing
                            const hiddenWrapper = document.createElement('div');
                            hiddenWrapper.style.overflow = 'hidden';
                            hiddenWrapper.style.height = '0';
                            hiddenWrapper.appendChild(pdfContainer);
                            document.body.appendChild(hiddenWrapper);

                            // Configuration for PDF library
                            const opt = {
                                margin: 0.5,
                                filename: `Anwariyya_Progress_Card_${enroll}.pdf`,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { scale: 2, useCORS: true },
                                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                            };

                            // Generate and auto-download
                            html2pdf().set(opt).from(pdfContainer).save().then(() => {
                                document.body.removeChild(hiddenWrapper);
                                downloadProgressCardBtn.innerHTML = originalBtnHtml;
                                downloadProgressCardBtn.disabled = false;
                            });
                        });
                    }
                }, 100);
            } else {
                resultsContainer.innerHTML = `<div class="alert alert-warning text-center mt-3"><i class="bi bi-exclamation-triangle me-2"></i>No result records found for your enrollment number yet.</div>`;
            }
        }

        // Handle Change Password
        const updatePasswordBtn = document.getElementById('updatePasswordBtn');
        if (updatePasswordBtn) {
            updatePasswordBtn.addEventListener('click', async () => {
                const currentPass = document.getElementById('currentPassword').value.trim();
                const newPass = document.getElementById('newPassword').value.trim();
                const confirmPass = document.getElementById('confirmNewPassword').value.trim();
                const msgDiv = document.getElementById('passwordMessage');

                if (!currentPass || !newPass || !confirmPass) {
                    msgDiv.className = 'alert alert-danger mb-3'; msgDiv.innerText = 'Please fill out all fields.'; msgDiv.style.display = 'block';
                    return;
                }

                const actualCurrentPass = student.Password || student.password || '123456';
                if (currentPass !== String(actualCurrentPass)) {
                    msgDiv.className = 'alert alert-danger mb-3'; msgDiv.innerText = 'Incorrect current password.'; msgDiv.style.display = 'block';
                    return;
                }

                if (newPass !== confirmPass) {
                    msgDiv.className = 'alert alert-danger mb-3';
                    msgDiv.innerText = 'New passwords do not match.';
                    msgDiv.style.display = 'block';
                    return;
                }

                // Update password on server
                const studentData = { ...student, Password: newPass };
                const apiResponse = await fetch(getApiUrl('/api/admin/student'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentData, originalEnroll: activeEnroll })
                });
                const result = await apiResponse.json();

                if (result.success) {
                    student.Password = newPass; // Update local session object
                    msgDiv.className = 'alert alert-success mb-3'; msgDiv.innerText = 'Password updated successfully!'; msgDiv.style.display = 'block';
                    setTimeout(() => {
                        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                        if (modalInstance) modalInstance.hide();
                        document.getElementById('currentPassword').value = '';
                        document.getElementById('newPassword').value = '';
                        document.getElementById('confirmNewPassword').value = '';
                        msgDiv.style.display = 'none';
                    }, 1500);
                } else {
                    msgDiv.className = 'alert alert-danger mb-3'; msgDiv.innerText = result.message || 'Failed to update password.'; msgDiv.style.display = 'block';
                }
            });
        }

        // --- Password Strength Indicator ---
        const newPasswordInputForStrength = document.getElementById('newPassword');
        if (newPasswordInputForStrength) {
            let strengthIndicatorDiv = document.getElementById('password-strength-indicator');
            if (!strengthIndicatorDiv) {
                strengthIndicatorDiv = document.createElement('div');
                strengthIndicatorDiv.id = 'password-strength-indicator';
                strengthIndicatorDiv.className = 'mt-2';
                strengthIndicatorDiv.innerHTML = `
                    <div class="progress" style="height: 5px;">
                        <div id="password-strength-bar" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <small id="password-strength-text" class="form-text text-muted"></small>
                `;
                newPasswordInputForStrength.parentNode.insertBefore(strengthIndicatorDiv, newPasswordInputForStrength.nextSibling);
            }

            const strengthBar = document.getElementById('password-strength-bar');
            const strengthText = document.getElementById('password-strength-text');

            const checkPasswordStrength = (password) => {
                let score = 0;
                if (!password) {
                    return 0;
                }
                // Award points for different criteria
                if (password.length >= 8) score++;
                if (password.match(/[a-z]/)) score++;
                if (password.match(/[A-Z]/)) score++;
                if (password.match(/[0-9]/)) score++;
                if (password.match(/[^a-zA-Z0-9]/)) score++;

                return score;
            };

            newPasswordInputForStrength.addEventListener('input', () => {
                const password = newPasswordInputForStrength.value;
                const score = checkPasswordStrength(password);
                const strengthLevels = {
                    0: { text: '', width: '0%', color: '' },
                    1: { text: 'Weak', width: '20%', color: 'bg-danger' },
                    2: { text: 'Weak', width: '40%', color: 'bg-danger' },
                    3: { text: 'Medium', width: '60%', color: 'bg-warning' },
                    4: { text: 'Good', width: '80%', color: 'bg-info' },
                    5: { text: 'Strong', width: '100%', color: 'bg-success' }
                };

                const { text, width, color } = strengthLevels[score];

                strengthBar.style.width = width;
                strengthBar.className = `progress-bar ${color}`;
                strengthText.innerText = text;
                strengthText.className = `form-text text-${color.replace('bg-', '')}`;
            });
        }

        // --- Real-time Password Confirmation Matching ---
        const newPassInput = document.getElementById('newPassword');
        const confirmPassInput = document.getElementById('confirmNewPassword');

        if (newPassInput && confirmPassInput) {
            let visualMatchDiv = document.getElementById('password-visual-match');
            if (!visualMatchDiv) {
                visualMatchDiv = document.createElement('div');
                visualMatchDiv.id = 'password-visual-match';
                visualMatchDiv.className = 'mt-2 p-2 rounded';
                visualMatchDiv.style.cssText = 'font-family: monospace; font-size: 1.1rem; letter-spacing: 2px; background-color: #f8f9fa; border: 1px solid #dee2e6; min-height: 38px;';
                confirmPassInput.parentNode.insertBefore(visualMatchDiv, confirmPassInput.nextSibling);
            }

            const handlePasswordMatch = () => {
                const newPass = newPassInput.value;
                const confirmPass = confirmPassInput.value;
                let visualHTML = '';

                for (let i = 0; i < confirmPass.length; i++) {
                    if (i < newPass.length && newPass[i] === confirmPass[i]) {
                        visualHTML += `<span class="text-success">${confirmPass[i]}</span>`;
                    } else {
                        visualHTML += `<span class="text-danger">${confirmPass[i]}</span>`;
                    }
                }

                visualMatchDiv.innerHTML = visualHTML;

                if (confirmPass.length > 0 && newPass === confirmPass) {
                    confirmPassInput.classList.remove('is-invalid');
                    confirmPassInput.classList.add('is-valid');
                } else if (confirmPass.length > 0) {
                    confirmPassInput.classList.remove('is-valid');
                    confirmPassInput.classList.add('is-invalid');
                } else {
                    confirmPassInput.classList.remove('is-valid', 'is-invalid');
                }
            };

            confirmPassInput.addEventListener('input', handlePasswordMatch);
            newPassInput.addEventListener('input', handlePasswordMatch);
        }


        // --- Handle Photo Upload & Remove ---
        const photoFileInput = document.getElementById('photoFileInput');
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        
        if (photoFileInput) {
            if (removePhotoBtn && student.photo) removePhotoBtn.style.display = 'block';

            photoFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async function(event) {
                    const photoData = event.target.result;
                    const msgDiv = document.getElementById('photoUploadMessage');
                    const previewImg = document.getElementById('photoPreview');

                    previewImg.src = photoData;
                    previewImg.style.display = 'block';
                    
                    const studentData = { ...student, photo: photoData };
                    const apiResponse = await fetch(getApiUrl('/api/admin/student'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ studentData, originalEnroll: activeEnroll })
                    });
                    const result = await apiResponse.json();

                    if (result.success) {
                        student.photo = photoData;
                        if (studentAvatarImg) { studentAvatarImg.src = photoData; studentAvatarImg.style.display = 'block'; }
                        if (avatarInitialsDiv) { avatarInitialsDiv.classList.remove('d-flex'); avatarInitialsDiv.classList.add('d-none'); }
                        msgDiv.className = 'alert alert-success mb-3'; msgDiv.innerText = 'Photo updated successfully!'; msgDiv.style.display = 'block';
                        setTimeout(() => {
                            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('uploadPhotoModal'));
                            if (modalInstance) modalInstance.hide();
                            msgDiv.style.display = 'none';
                            previewImg.style.display = 'none';
                            if(removePhotoBtn) removePhotoBtn.style.display = 'block';
                            photoFileInput.value = '';
                        }, 1500);
                    } else {
                        msgDiv.className = 'alert alert-danger mb-3'; msgDiv.innerText = 'Failed to update photo.'; msgDiv.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', async () => {
                const studentData = { ...student, photo: "" }; // Set photo to empty string to remove
                const apiResponse = await fetch(getApiUrl('/api/admin/student'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentData, originalEnroll: activeEnroll })
                });
                const result = await apiResponse.json();

                if (result.success) {
                    delete student.photo; // Update local session object
                    if (studentAvatarImg) { studentAvatarImg.src = ''; studentAvatarImg.style.display = 'none'; }
                    if (avatarInitialsDiv) { avatarInitialsDiv.classList.remove('d-none'); avatarInitialsDiv.classList.add('d-flex'); }
                    
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('uploadPhotoModal'));
                    if (modalInstance) modalInstance.hide();
                    removePhotoBtn.style.display = 'none';
                    window.showSnackbar("Photo removed successfully.");
                }
            });
        }

        // --- Dynamic Footer Fetching (From Internet) ---
        const footerElement = document.querySelector('footer');
        if (footerElement) {
            // Paste the same 'Raw' URL you used in the main script.js here
            const footerApiUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/footer.json';
            
            const defaultFooterData = {
                collegeName: 'Anwariyya Arabic College',
                location: 'Pottachira, Nellaya, Palakkad',
                phone: '+91 98765 43210',
                email: 'info@anwariyya.in',
                copyright: 'All Rights Reserved.'
            };

            const renderFooter = (data) => {
                footerElement.innerHTML = `
                    <div class="container text-center py-3">
                        <p class="mb-1 fw-bold text-dark">${data.collegeName}</p>
                        <p class="mb-1 small text-muted">
                            <i class="bi bi-geo-alt-fill me-1"></i> ${data.location} | 
                            <i class="bi bi-telephone-fill me-1"></i> ${data.phone}
                        </p>
                        <p class="mb-0 small text-muted">&copy; ${new Date().getFullYear()} ${data.collegeName}. ${data.copyright}</p>
                    </div>
                `;
            };
            
            fetch(footerApiUrl)
                .then(response => response.ok ? response.json() : defaultFooterData)
                .then(data => renderFooter(data))
                .catch(error => renderFooter(defaultFooterData));
        }
});