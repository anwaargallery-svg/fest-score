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
        document.getElementById('snackbar-undo-btn').addEventListener('click', () => { clearTimeout(window.snackbarTimeout); hide(); undoCallback(); });
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

// Helper function for consistent data access
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
    // Use relative paths for API calls.
    return endpoint;
};
// Custom JS for the Admin Dashboard
const initAdminDashboard = () => {
    console.log("Admin dashboard initialized.");

    // --- Client-Side Admin Authentication ---
    const adminLoginOverlay = document.getElementById('adminLoginOverlay');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const adminLoginError = document.getElementById('adminLoginError');

    // Check if session exists (user is already logged in during this browser session)
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        if (adminLoginOverlay) {
            adminLoginOverlay.classList.remove('d-flex');
            adminLoginOverlay.style.setProperty('display', 'none', 'important');
        }
    }

    // Handle Login attempt
    const attemptLogin = () => {
        if (!adminPasswordInput) return;
        const pwd = adminPasswordInput.value.trim();
        
        // Local Master Password Check (Decodes Base64)
        const storedPass = localStorage.getItem('anwariyya_admin_password');
        let currentMasterPassword = 'admin123';
        if (storedPass) {
            try {
                currentMasterPassword = atob(storedPass); // Decode Base64 password
            } catch (e) {
                currentMasterPassword = storedPass; // Fallback for old plaintext passwords
                localStorage.setItem('anwariyya_admin_password', btoa(storedPass)); // Auto-update to encoded
            }
        }
        
        if (pwd === currentMasterPassword) { 
            sessionStorage.setItem('admin_logged_in', 'true');
            adminLoginOverlay.classList.remove('d-flex');
            adminLoginOverlay.style.setProperty('display', 'none', 'important');
            adminPasswordInput.value = '';
            adminLoginError.style.display = 'none';
        } else {
            adminLoginError.innerText = pwd ? 'Incorrect master password!' : 'Please enter a password.';
            adminLoginError.style.display = 'block';
        }
    };
    
    if (adminLoginBtn) adminLoginBtn.addEventListener('click', attemptLogin);
    if (adminPasswordInput) adminPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });

    // Handle Secure Logout
    const handleLogout = (e) => { 
        e.preventDefault(); 
        sessionStorage.removeItem('admin_logged_in'); 
        window.location.href = '../../../index.html'; 
    };
    
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminLogoutBtnMobile = document.getElementById('adminLogoutBtnMobile');
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);
    if (adminLogoutBtnMobile) adminLogoutBtnMobile.addEventListener('click', handleLogout);

    // --- QR Code Scanner Logic ---
    let html5QrcodeScanner;
    const qrScannerModal = document.getElementById('qrScannerModal');
    if (qrScannerModal) {
        qrScannerModal.addEventListener('shown.bs.modal', function () {
            if (typeof Html5QrcodeScanner !== 'undefined') {
                html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
                html5QrcodeScanner.render(onScanSuccess, onScanFailure);
            } else {
                document.getElementById('qr-reader').innerHTML = '<div class="alert alert-danger">Scanner library failed to load. Please check your internet connection.</div>';
            }
        });
        qrScannerModal.addEventListener('hidden.bs.modal', function () {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        });
    }

    function onScanSuccess(decodedText, decodedResult) {
        if (html5QrcodeScanner) html5QrcodeScanner.clear();
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('qrScannerModal'));
        if(modalInstance) modalInstance.hide();
        
        const text = decodedText.trim();
        
        if (text.startsWith('#ADM-')) {
            document.getElementById('admissions-tab').click();
            setTimeout(() => {
                const btn = document.querySelector(`.action-view-app[data-id="${text}"]`);
                if (btn) btn.click();
                else window.showSnackbar(`Admission application ${text} not found.`);
            }, 500);
        } else {
            document.getElementById('students-tab').click();
            const searchInput = document.getElementById('studentSearchInput');
            if (searchInput) {
                searchInput.value = text;
                const filterBtn = document.getElementById('studentFilterBtn');
                if (filterBtn) filterBtn.click();
            }
            setTimeout(() => {
                const btn = document.querySelector(`.action-edit-student[data-enroll="${text}"]`);
                if (btn) btn.click();
                else window.showSnackbar(`Student with ID ${text} not found.`);
            }, 500);
        }
    }
    function onScanFailure(error) { /* ignore */ }

    // --- Mobile Sidebar UX Fix ---
    const sidebarMenu = document.getElementById('sidebarMenu');
    const navLinks = document.querySelectorAll('#sidebarMenu .nav-link');
    
    if (sidebarMenu) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Auto-close the mobile menu when a tab is clicked
                if (window.innerWidth < 768 && sidebarMenu.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(sidebarMenu) || new bootstrap.Collapse(sidebarMenu, { toggle: false });
                    bsCollapse.hide();
                }
            });
        });
    }

    // Reset Site Data functionality
    const resetDataForm = document.getElementById('resetDataForm');
    const resetDataModal = document.getElementById('resetDataModal');

    if (resetDataModal) {
        resetDataModal.addEventListener('hidden.bs.modal', () => {
            if (resetDataForm) resetDataForm.reset();
            document.getElementById('resetDataPassword').value = '';
        });
    }

    if (resetDataForm) {
        resetDataForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pass = document.getElementById('resetDataPassword').value;
            const btn = resetDataForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Resetting...';

            try {
                const response = await fetch(getApiUrl('/api/admin/reset'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pass })
                });

                const result = await response.json();

                if (result.success) {
                    window.showSnackbar(result.message);
                    const modal = bootstrap.Modal.getInstance(resetDataModal);
                    if (modal) modal.hide();
                    // Reload all tables to show they are empty
                    loadAdmissionsTables(); 
                    loadStudentsTable();
                    loadResultsTable();
                } else {
                    window.showSnackbar(result.message || "Reset failed. Incorrect password.");
                }
            } catch (error) {
                window.showSnackbar("An error occurred. Could not connect to the server.");
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Confirm Reset';
            }
        });
    }

    // Handle Enrollment Settings
    const enrollPrefixInput = document.getElementById('enrollPrefixInput');
    const enrollSequenceInput = document.getElementById('enrollSequenceInput');
    const enrollPreviewText = document.getElementById('enrollPreviewText');
    
    const updateEnrollPreview = () => {
        if (!enrollPreviewText || !enrollPrefixInput || !enrollSequenceInput) return;
        const p = enrollPrefixInput.value || '2026';
        const s = parseInt(enrollSequenceInput.value) || 1;
        const padLen = Math.max(1, 8 - p.length);
        enrollPreviewText.innerText = `${p}${String(s).padStart(padLen, '0')}`;
    };

    if (enrollPrefixInput) {
        enrollPrefixInput.value = localStorage.getItem('anwariyya_enroll_prefix') || '2026';
        enrollPrefixInput.addEventListener('input', updateEnrollPreview);
    }
    if (enrollSequenceInput) {
        enrollSequenceInput.value = localStorage.getItem('anwariyya_enroll_sequence') || '1';
        enrollSequenceInput.addEventListener('input', updateEnrollPreview);
    }
    updateEnrollPreview();

    const enrollmentSettingsForm = document.getElementById('enrollmentSettingsForm');
    if (enrollmentSettingsForm) {
        enrollmentSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const prefix = document.getElementById('enrollPrefixInput').value.trim();
            const seq = document.getElementById('enrollSequenceInput').value.trim();
            if (prefix) {
                localStorage.setItem('anwariyya_enroll_prefix', prefix);
                localStorage.setItem('anwariyya_enroll_sequence', seq || '1');
                window.showSnackbar(`Enrollment settings updated successfully.`);
            }
        });
    }

    // --- Backup & Restore Logic ---
    const backupDataBtn = document.getElementById('backupDataBtn');
    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(getApiUrl('/api/admin/data'));
                const data = await response.json();
                const dataStr = JSON.stringify(data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                const dateStr = new Date().toISOString().slice(0, 10);
                a.download = `anwariyya_db_backup_${dateStr}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                window.showSnackbar("Server database backup has been downloaded.");
            } catch (e) {
                console.error("Backup failed:", e);
                window.showSnackbar("Error: Could not create backup. Browser storage might be too large.");
            }
        });
    }

    const restoreDataInput = document.getElementById('restoreDataInput');
    if (restoreDataInput) {
        restoreDataInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!confirm("Are you sure you want to restore from this backup? This will overwrite ALL current data on the server.")) {
                restoreDataInput.value = ''; // Reset file input
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    // Instead of localStorage, we will send this to the server to overwrite db.json
                    const response = await fetch(getApiUrl('/api/admin/sync'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(backupData)
                    });
                    const result = await response.json();
                    if (result.success) {
                        window.showSnackbar("Restore successful! Reloading page...");
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        window.showSnackbar("Restore failed on server.");
                    }
                } catch (err) {
                    window.showSnackbar("Restore failed: Invalid or corrupt backup file.");
                }
            };
            reader.readAsText(file);
        });
    }

    // Handle Change Admin Password
    const changeAdminPasswordForm = document.getElementById('changeAdminPasswordForm');
    if (changeAdminPasswordForm) {
        changeAdminPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('adminCurrentPassword').value.trim();
            const newPass = document.getElementById('adminNewPassword').value.trim();
            const confirmPass = document.getElementById('adminConfirmPassword').value.trim();
            
            const storedPass = localStorage.getItem('anwariyya_admin_password');
            let actualCurrentPass = 'admin123';
            if (storedPass) {
                try {
                    actualCurrentPass = atob(storedPass);
                } catch (e) {
                    actualCurrentPass = storedPass;
                }
            }
            
            if (currentPass !== actualCurrentPass) {
                window.showSnackbar("Error: Current password is incorrect.");
                return;
            }
            if (newPass !== confirmPass) {
                window.showSnackbar("Error: New passwords do not match.");
                return;
            }
            
            // Save the new password using Base64 encoding to obfuscate it
            localStorage.setItem('anwariyya_admin_password', btoa(newPass));
            window.showSnackbar("Master password updated successfully!");
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('changeAdminPasswordModal'));
            if(modal) modal.hide();
            changeAdminPasswordForm.reset();
        });
    }

    // Number Count-Up Animation for Dashboard Stats
    const animateCounter = (counter, targetVal) => {
        const currentTarget = +counter.getAttribute('data-target');
        if (currentTarget === targetVal && counter.innerText !== '0') return;
        
        counter.setAttribute('data-target', targetVal);
        counter.innerText = '0';
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace(/,/g, '');
            const increment = Math.max(1, target / 50);
            if (count < target && target > 0) {
                counter.innerText = Math.ceil(count + increment).toLocaleString();
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        updateCount();
    };

    // --- Admissions Directory Logic ---
    async function loadAdmissionsTables() {
        const fullTable = document.getElementById('admissionsTableBody');
        const recentTable = document.getElementById('recentAdmissionsBody');
        
        const response = await fetch(getApiUrl('/api/admin/data'));
        const data = await response.json();
        let admissionsDB = data.admissions || [];
        
        const renderTable = (tbody, data, limit = null) => {
            if (!tbody) return;
            
            // Show Skeleton Loader
            const skeletonHTML = Array(limit || 3).fill(`
                <tr class="placeholder-glow">
                    <td class="ps-4"><span class="placeholder col-8"></span></td>
                    <td><span class="placeholder col-10"></span></td>
                    <td><span class="placeholder col-6"></span></td>
                    <td><span class="placeholder col-8"></span></td>
                    <td><span class="placeholder col-6"></span></td>
                    <td class="text-end pe-4">
                        <span class="placeholder col-2"></span> <span class="placeholder col-2"></span>
                    </td>
                </tr>
            `).join('');
            tbody.innerHTML = skeletonHTML;

            setTimeout(() => {
                if (data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No applications found.</td></tr>`;
                    return;
                }
                
                tbody.innerHTML = '';
                const loopData = limit ? data.slice(-limit).reverse() : data.slice().reverse(); // Show newest first
                
                loopData.forEach(app => {
                    let badgeClass = app.status === 'Approved' ? 'bg-success' : (app.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark');
                    
                    tbody.innerHTML += `
                        <tr>
                            <td class="ps-4 fw-semibold text-muted">${app.appId}</td>
                            <td class="fw-bold">${app.name}</td>
                            <td>${app.course}</td>
                            <td>${app.date}</td>
                            <td><span class="badge ${badgeClass}">${app.status}</span></td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-outline-primary action-view-app" data-id="${app.appId}" title="Review Application"><i class="bi bi-eye"></i></button>
                                <button class="btn btn-sm btn-outline-success action-approve" data-id="${app.appId}" title="Approve"><i class="bi bi-check-lg"></i></button>
                                <button class="btn btn-sm btn-outline-danger action-reject" data-id="${app.appId}" title="Reject"><i class="bi bi-x-lg"></i></button>
                                <button class="btn btn-sm btn-outline-dark action-print-app" data-id="${app.appId}" title="Print Application"><i class="bi bi-printer"></i></button>
                                <button class="btn btn-sm btn-outline-danger action-delete-app" data-id="${app.appId}" title="Delete Application"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            }, 300);
        };

        renderTable(fullTable, admissionsDB);
        renderTable(recentTable, admissionsDB, 5); // Show up to 5 on the dashboard

        // Update New Admissions Counter
        const newAdmissionsCounter = document.getElementById('newAdmissionsCount');
        if(newAdmissionsCounter) {
            animateCounter(newAdmissionsCounter, admissionsDB.length);
        }
        
        // Update Pending Admissions Counter
        const pendingAdmissionsCounter = document.getElementById('pendingAdmissionsCount');
        if(pendingAdmissionsCounter) {
            const pendingCount = admissionsDB.filter(a => a.status === 'Pending').length;
            animateCounter(pendingAdmissionsCounter, pendingCount);
        }
    }

    // --- Admissions Toggle Logic ---
    const toggleAdmissionsBtn = document.getElementById('toggleAdmissionsBtn');
    if (toggleAdmissionsBtn) {
        const label = toggleAdmissionsBtn.nextElementSibling;

        const updateToggleUI = (isOpen) => {
            toggleAdmissionsBtn.checked = isOpen;
            label.innerText = isOpen ? 'Admissions Open' : 'Admissions Closed';
            if (isOpen) label.classList.replace('text-danger', 'text-success');
            else label.classList.replace('text-success', 'text-danger');
        };

        // Fetch initial state from server
        fetch(getApiUrl('/api/settings'))
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    updateToggleUI(data.settings.admissionsOpen);
                }
            }).catch(err => console.error("Failed to fetch settings:", err));

        toggleAdmissionsBtn.addEventListener('change', async (e) => {
            const isOpen = e.target.checked;
            try {
                const response = await fetch(getApiUrl('/api/admin/settings'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admissionsOpen: isOpen })
                });
                const result = await response.json();
                if (result.success) {
                    updateToggleUI(isOpen);
                    window.showSnackbar(isOpen ? 'Admissions have been OPENED.' : 'Admissions have been CLOSED.');
                }
            } catch (err) { window.showSnackbar('Error updating settings. Please check server connection.'); }
        });
    }


    // --- Top Ranks Banner Toggle Logic ---
    const toggleTopRanksBtn = document.getElementById('toggleTopRanksBtn');
    if (toggleTopRanksBtn) {
        let ranksState = localStorage.getItem('anwariyya_show_ranks');
        if (ranksState === null) {
            ranksState = 'true';
            localStorage.setItem('anwariyya_show_ranks', 'true');
        }
        
        const label = toggleTopRanksBtn.nextElementSibling;
        
        if (ranksState === 'false') {
            toggleTopRanksBtn.checked = false;
            label.innerText = 'Top Ranks Hidden';
            label.classList.replace('text-success', 'text-danger');
        } else {
            toggleTopRanksBtn.checked = true;
        }

        toggleTopRanksBtn.addEventListener('change', (e) => {
            const isVisible = e.target.checked;
            localStorage.setItem('anwariyya_show_ranks', isVisible ? 'true' : 'false');
            label.innerText = isVisible ? 'Top Ranks Visible' : 'Top Ranks Hidden';
            if (isVisible) label.classList.replace('text-danger', 'text-success'); else label.classList.replace('text-success', 'text-danger');
            window.showSnackbar(isVisible ? 'Muthawal Top Ranks banner is now VISIBLE on the home page.' : 'Muthawal Top Ranks banner is now HIDDEN.');
        });
    }

    // --- Results Counter Logic ---
    const updateResultsCount = () => {
        const resultsCounter = document.getElementById('resultsPublishedCount');
        if(resultsCounter) {
            const results = JSON.parse(localStorage.getItem('anwariyya_results_db')) || [];
            animateCounter(resultsCounter, results.length);
        }
    };
    updateResultsCount();

    // --- Results Directory Logic ---
    async function loadResultsTable(forceRefresh = false) {
        const tbody = document.getElementById('resultsTableBody');
        if (!tbody) return;

        if (!forceRefresh && tbody.innerHTML && !tbody.innerHTML.includes('placeholder')) return;
        // Skeleton loader remains the same
        const skeletonHTML = Array(3).fill(`
            <tr class="placeholder-glow">
                <td class="ps-4"><span class="placeholder col-8"></span></td>
                <td><span class="placeholder col-10"></span></td>
                <td><span class="placeholder col-6"></span></td>
                <td><span class="placeholder col-4"></span></td>
                <td class="text-end pe-4"><span class="placeholder col-2"></span></td>
            </tr>
        `).join('');
        tbody.innerHTML = skeletonHTML;

        try {
            const response = await fetch(getApiUrl('/api/admin/data'));
            const data = await response.json();
            const resultsDB = data.results || [];

            if (resultsDB.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No results have been published yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = '';
            resultsDB.slice().reverse().forEach(result => {
                const enroll = getStudentProp(result, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) || '#N/A';
                const name = getStudentProp(result, ['Name', 'StudentName']) || 'Unknown';
                const course = getStudentProp(result, ['Course', 'class', 'Class']) || '-';
                const year = getStudentProp(result, ['CurrentYear', 'Year', 'year']) || '-';

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-semibold text-muted">${enroll}</td>
                        <td class="fw-bold">${name}</td>
                        <td>${course}</td>
                        <td>${year}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-sm btn-outline-danger action-delete-result" data-enroll="${enroll}" title="Delete Result Entry"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        } catch(err) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failed to load results.</td></tr>`;
        }
    }


    // --- Student Directory Management Logic ---
    async function loadStudentsTable(searchTerm = '', courseFilter = '') {
        const tbody = document.getElementById('studentsTableBody');
        const totalStudentsCount = document.getElementById('totalStudentsCount');
        const failedStudentsCount = document.getElementById('failedStudentsCount');
        if(!tbody) return;
        
        const skeletonHTML = Array(5).fill(`
            <tr class="placeholder-glow">
                <td class="ps-4"><span class="placeholder col-8"></span></td>
                <td><span class="placeholder col-10"></span></td>
                <td><span class="placeholder col-8"></span></td>
                <td><span class="placeholder col-7"></span></td>
                <td><span class="placeholder col-6"></span></td>
                <td class="text-end pe-4">
                    <span class="placeholder col-2"></span> <span class="placeholder col-2"></span> <span class="placeholder col-2"></span>
                </td>
            </tr>
        `).join('');
        tbody.innerHTML = skeletonHTML;

        try {
            const response = await fetch(getApiUrl('/api/admin/data'));
            const data = await response.json();
            let allStudents = data.students || [];
            sessionStorage.setItem('anwariyya_all_students_cache', JSON.stringify(allStudents)); // Cache for other functions

            setTimeout(() => {
                // 1. UPDATE GLOBAL DASHBOARD COUNTERS (Independent of filters)
                if (totalStudentsCount) animateCounter(totalStudentsCount, allStudents.length);
                if (failedStudentsCount) {
                    const failedCount = allStudents.filter(student => String(student.Status || '').toLowerCase() === 'failed').length;
                    animateCounter(failedStudentsCount, failedCount);
                }

                // 2. APPLY FILTERS FOR TABLE
                document.getElementById('messageRecipient').innerHTML = '<option value="all" selected>All Students (Broadcast)</option>';
                let filteredStudents = allStudents;

                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    filteredStudents = filteredStudents.filter(student => {
                        const enroll = String(student.EnrollNo || student['Enroll No'] || student['Enroll No.'] || student.enrollNo || '');
                        const name = String(student.Name || student.StudentName || '');
                        return enroll.toLowerCase().includes(lowerSearch) || name.toLowerCase().includes(lowerSearch);
                    });
                }

                if (courseFilter) {
                    filteredStudents = filteredStudents.filter(student => {
                        const course = String(student.Course || '');
                        return course === courseFilter;
                    });
                }

                // 3. RENDER TABLE
                if (filteredStudents.length > 0) {
                    tbody.innerHTML = ''; // Clear skeleton
                    filteredStudents.forEach(student => { // Use helper for consistency
                        const studentName = getStudentProp(student, ['Name', 'StudentName']) || 'Unknown';
                        const studentEnroll = getStudentProp(student, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) || '#N/A';
                        document.getElementById('messageRecipient').innerHTML += `<option value="${studentEnroll}">${studentName} (${studentEnroll})</option>`;
                        const enroll = getStudentProp(student, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) || '#N/A';
                        const name = getStudentProp(student, ['Name', 'StudentName']) || 'Unknown';
                        const course = getStudentProp(student, ['Course']) || '-';
                        const contact = getStudentProp(student, ['Contact', 'Phone', 'Mobile']) || '-';
                        const status = String(student.Status || 'Active');
                        const statusBadge = (status.toLowerCase() === 'active' || status.toLowerCase() === 'current student') ? 'bg-success' : (status.toLowerCase() === 'failed' ? 'bg-danger' : 'bg-secondary');
                        
                        const courseMaxYears = { 'Hifz': 3, 'Shareeath': 10, 'Muthawal': 2 };
                        const currentYear = parseInt(student.CurrentYear) || 1;
                        const maxYear = courseMaxYears[course] || '-';
                        const yearText = maxYear !== '-' ? `<br><small class="text-muted">Year ${currentYear} of ${maxYear}</small>` : '';
                        
                        tbody.innerHTML += `
                        <tr>
                            <td class="ps-4 fw-semibold text-muted">${enroll}</td>
                            <td class="fw-bold">${name}</td>
                            <td>${course} ${yearText}</td>
                            <td>${contact}</td>
                            <td><span class="badge ${statusBadge}">${status}</span></td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-outline-success action-promote-student" data-enroll="${enroll}" title="Promote to Next Year"><i class="bi bi-arrow-up-circle"></i></button>
                                <button class="btn btn-sm btn-outline-primary action-edit-student" data-enroll="${enroll}" title="Edit Student Data" data-bs-toggle="modal" data-bs-target="#studentModal"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-sm btn-outline-info action-edit-result" data-enroll="${enroll}" title="Edit Student Result" data-bs-toggle="modal" data-bs-target="#editResultModal"><i class="bi bi-journal-check"></i></button>
                                <button class="btn btn-sm btn-outline-dark action-print-student" data-enroll="${enroll}" title="Print Student Data"><i class="bi bi-printer"></i></button>
                                <button class="btn btn-sm btn-outline-danger action-delete-student" data-enroll="${enroll}" title="Delete Student"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                        `;
                    });
                } else {
                    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No student records found.</td></tr>`;
                }
            }, 150); // Reduced timeout for faster rendering after fetch
        } catch (error) {
            console.error("Failed to load student data from server:", error);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to load student data. Check server connection.</td></tr>`;
        }
    }

    // Search and filter logic
    const studentFilterBtn = document.getElementById('studentFilterBtn');
    const studentSearchInput = document.getElementById('studentSearchInput');
    const studentCourseFilter = document.getElementById('studentCourseFilter');

    const applyStudentFilter = () => {
        const searchTerm = studentSearchInput ? studentSearchInput.value.trim() : '';
        const courseFilter = studentCourseFilter ? studentCourseFilter.value : '';
        loadStudentsTable(searchTerm, courseFilter);
    };

    if (studentFilterBtn) {
        studentFilterBtn.addEventListener('click', applyStudentFilter);
    }
    if (studentSearchInput) {
        studentSearchInput.addEventListener('input', applyStudentFilter);
    }
    if (studentCourseFilter) {
        studentCourseFilter.addEventListener('change', applyStudentFilter);
    }

    // Load the student table when the page initializes
    // Also load other tables that now depend on server data
    loadStudentsTable();
    loadAdmissionsTables();
    loadResultsTable();


    // Admin Actions Handling (Approve, Reject, Delete)
    document.body.addEventListener('click', (e) => {
        const viewAppBtn = e.target.closest('.action-view-app');
        const approveBtn = e.target.closest('.action-approve');
        const rejectBtn = e.target.closest('.action-reject');
        const deleteBtn = e.target.closest('.action-delete-student');
        const deleteAppBtn = e.target.closest('.action-delete-app');
        const promoteBtn = e.target.closest('.action-promote-student');
        const printAppBtn = e.target.closest('.action-print-app');
        const editResultBtn = e.target.closest('.action-edit-result');
        const printStudentBtn = e.target.closest('.action-print-student');
        const editBtn = e.target.closest('.action-edit-student');
        const addStudentBtn = e.target.closest('[data-bs-target="#studentModal"]:not(.action-edit-student)');
        const deleteGalleryBtn = e.target.closest('.action-delete-gallery');
        const editContentBtn = e.target.closest('.action-edit-content');
        const deleteContentBtn = e.target.closest('.action-delete-content');
        const deleteSubjectBtn = e.target.closest('.action-delete-subject');
        const deleteMasterSubjectBtn = e.target.closest('.action-delete-master-subject');
        const downloadClassTemplateBtn = e.target.closest('.action-download-class-template');

        const deleteResultBtn = e.target.closest('.action-delete-result');
        // Clear form for Add Student
        if (addStudentBtn) {
            document.getElementById('modalStudentOriginalEnroll').value = '';
            document.getElementById('modalStudentPhotoData').value = '';
            const photoPreviewContainer = document.getElementById('modalStudentPhotoPreviewContainer');
            if (photoPreviewContainer) photoPreviewContainer.style.display = 'none';
            
            // Auto-generate Enroll No securely without duplicates
            let db = JSON.parse(localStorage.getItem('anwariyya_students_db')) || [];
            const enrollPrefix = localStorage.getItem('anwariyya_enroll_prefix') || '2026';
            let startSeq = parseInt(localStorage.getItem('anwariyya_enroll_sequence') || '1');
            if (isNaN(startSeq)) startSeq = 1;
            let maxNumber = startSeq - 1;
            db.forEach(s => {
                const enr = getStudentProp(s, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) || '';
                if (String(enr).startsWith(enrollPrefix)) {
                    const num = parseInt(String(enr).substring(enrollPrefix.length), 10);
                    if (!isNaN(num) && num > maxNumber) maxNumber = num;
                }
            });
            const nextNumber = maxNumber + 1;
            const padLen = Math.max(1, 8 - enrollPrefix.length);
            document.getElementById('modalStudentEnroll').value = `${enrollPrefix}${String(nextNumber).padStart(padLen, '0')}`;
        }

        // Populate form for Edit Student
        if (editBtn) {
            document.getElementById('studentDataForm').reset();
            const enroll = editBtn.getAttribute('data-enroll');
            const allStudents = JSON.parse(sessionStorage.getItem('anwariyya_all_students_cache')) || [];
            const student = allStudents.find(x => getStudentProp(x, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) === enroll);
            if (student) {
                document.getElementById('modalStudentOriginalEnroll').value = enroll;
                document.getElementById('modalStudentEnroll').value = enroll;
                document.getElementById('modalStudentName').value = getStudentProp(student, ['Name', 'StudentName']) || '';
                document.getElementById('modalStudentCourse').value = getStudentProp(student, ['Course']) || '';
                document.getElementById('modalStudentYear').value = getStudentProp(student, ['CurrentYear', 'year']) || 1;
                document.getElementById('modalStudentStatus').value = getStudentProp(student, ['Status']) || 'Active';
                document.getElementById('modalStudentPassword').value = getStudentProp(student, ['Password', 'password']) || '123456';

                // Personal & Contact
                document.getElementById('modalStudentHouseName').value = getStudentProp(student, ['houseName']) || '';
                document.getElementById('modalStudentFather').value = getStudentProp(student, ['FatherName', "Father's Name"]) || '';
                document.getElementById('modalStudentFatherOccupation').value = getStudentProp(student, ['fatherOccupation', "Father's Occupation"]) || '';
                document.getElementById('modalStudentMother').value = getStudentProp(student, ['motherName', "Mother's Name"]) || '';
                document.getElementById('modalStudentContact').value = getStudentProp(student, ['Contact', 'Phone', 'Mobile']) || '';
                document.getElementById('modalStudentEmail').value = getStudentProp(student, ['Email']) || '';
                document.getElementById('modalStudentDOB').value = getStudentProp(student, ['DOB', 'dob', 'Date of Birth']) || '';
                document.getElementById('modalStudentAadhar').value = getStudentProp(student, ['aadhar']) || '';
                document.getElementById('modalStudentAddress').value = getStudentProp(student, ['Address']) || '';

                // Education
                document.getElementById('modalStudentMadrasa5').value = getStudentProp(student, ['madrasa5Name']) || '';
                document.getElementById('modalStudentMadrasa7').value = getStudentProp(student, ['madrasa7Name']) || '';
                document.getElementById('modalStudentSchool').value = getStudentProp(student, ['schoolName']) || '';
                document.getElementById('modalStudentDars').value = getStudentProp(student, ['darsName']) || '';
                document.getElementById('modalStudentKithabs').value = getStudentProp(student, ['learnedKithabs']) || '';

                const photoInput = document.getElementById('modalStudentPhoto');
                const photoPreviewContainer = document.getElementById('modalStudentPhotoPreviewContainer');
                const photoPreview = document.getElementById('modalStudentPhotoPreview');
                if (photoInput) photoInput.value = '';
                if (student.photo) {
                    if (photoPreview) photoPreview.src = student.photo;
                    if (photoPreviewContainer) photoPreviewContainer.style.display = 'block';
                    document.getElementById('modalStudentPhotoData').value = student.photo;
                } else {
                    if (photoPreviewContainer) photoPreviewContainer.style.display = 'none';
                    document.getElementById('modalStudentPhotoData').value = '';
                }
            }
        }
        
        // Populate form for Edit Result
        if (editResultBtn) {
            const enroll = editResultBtn.getAttribute('data-enroll');
            const resultsDb = JSON.parse(sessionStorage.getItem('anwariyya_all_results_cache')) || [];
            const studentsDb = JSON.parse(sessionStorage.getItem('anwariyya_all_students_cache')) || [];
            
            const studentResult = resultsDb.find(r => getStudentProp(r, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) === enroll);
            const studentDetails = studentsDb.find(s => getStudentProp(s, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) === enroll);
            const fieldsContainer = document.getElementById('editResultFieldsContainer');
            fieldsContainer.innerHTML = ''; // Clear previous fields

            if (studentResult) {
                document.getElementById('editResultEnrollNo').value = enroll;
                document.getElementById('editResultStudentName').innerText = studentDetails?.Name || studentResult.Name || 'Unknown Student';
                document.getElementById('editResultStudentInfo').innerText = `Enroll No: ${enroll} | Course: ${studentDetails?.Course || studentResult.Course || '-'}`;

                const excludedKeys = ['name', 'enrollno', 'enroll no', 'enroll no.', 'course', 'class', 'password', 'pin', 'currentyear', 'contact', 'email', 'status', 'address', 'photo', 'appid'];
                let fieldHtml = '';
                for (const key in studentResult) {
                    if (!excludedKeys.includes(key.trim().toLowerCase())) {
                        fieldHtml += `
                            <div class="col-6 col-md-4">
                                <label class="form-label fw-semibold">${key}</label>
                                <input type="text" class="form-control" data-subject="${key}" value="${studentResult[key] || ''}">
                            </div>
                        `;
                    }
                }
                if (fieldHtml) {
                    fieldsContainer.innerHTML = fieldHtml;
                } else {
                    fieldsContainer.innerHTML = '<div class="col-12 text-muted text-center">No editable subject marks found for this student.</div>';
                }
            } else {
                document.getElementById('editResultStudentName').innerText = studentDetails?.Name || 'Unknown Student';
                document.getElementById('editResultStudentInfo').innerText = `Enroll No: ${enroll}`;
                fieldsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning text-center">No result record found for this student. You can add one by uploading a result file.</div>
                    </div>
                `;
            }
        }

        // Handle View Application Modal
        if (viewAppBtn) {
            const id = viewAppBtn.getAttribute('data-id');
            const admissionsDb = JSON.parse(sessionStorage.getItem('anwariyya_all_admissions_cache')) || [];
            const app = admissionsDb.find(x => x.appId === id);

            if (app) {
                const contentDiv = document.getElementById('viewAdmissionContent');
                const photoHTML = app.photo ? `<div class="text-center mb-4"><img src="${app.photo}" class="img-thumbnail" style="max-height: 150px;" alt="Applicant Photo"></div>` : '';
                
                let madrasa5HTML = '';
                if(app.madrasa5Name || app.madrasaName || app.madrasa5RegNo || app.madrasa5Mark || app.madrasa5Year) {
                    madrasa5HTML = `
                        <tr><th colspan="2" class="bg-primary text-white text-center">Madrasa Education (Class 5)</th></tr>
                        <tr><th class="bg-light">Madrasa Name</th><td>${app.madrasa5Name || app.madrasaName || '-'}</td></tr>
                        <tr><th class="bg-light">Madrasa Reg No.</th><td>${app.madrasa5RegNo || app.madrasaRegNo || '-'}</td></tr>
                        <tr><th class="bg-light">Total Mark</th><td>${app.madrasa5Mark || app.madrasaMark || '-'}</td></tr>
                        <tr><th class="bg-light">Year of Pass</th><td>${app.madrasa5Year || app.madrasaYear || '-'}</td></tr>
                    `;
                }

                let madrasa7HTML = '';
                if(app.madrasa7Name || app.madrasa7RegNo || app.madrasa7Mark || app.madrasa7Year) {
                    madrasa7HTML = `
                        <tr><th colspan="2" class="bg-primary text-white text-center">Madrasa Education (Class 7)</th></tr>
                        <tr><th class="bg-light">Madrasa Name</th><td>${app.madrasa7Name || '-'}</td></tr>
                        <tr><th class="bg-light">Madrasa Reg No.</th><td>${app.madrasa7RegNo || '-'}</td></tr>
                        <tr><th class="bg-light">Total Mark</th><td>${app.madrasa7Mark || '-'}</td></tr>
                        <tr><th class="bg-light">Year of Pass</th><td>${app.madrasa7Year || '-'}</td></tr>
                    `;
                }

                let schoolHTML = '';
                if(app.schoolName) {
                    schoolHTML = `
                        <tr><th colspan="2" class="bg-primary text-white text-center">School Education</th></tr>
                        <tr><th class="bg-light">School Name & Place</th><td>${app.schoolName || '-'}</td></tr>
                    `;
                }

                let darsHTML = '';
                if(app.darsName || app.usthathName || app.learnedKithabs || app.physicalEducation) {
                    darsHTML = `
                        <tr><th colspan="2" class="bg-primary text-white text-center">Dars or Previous Education</th></tr>
                        <tr><th class="bg-light">Name of Dars/College</th><td>${app.darsName || '-'}</td></tr>
                        <tr><th class="bg-light">Usthath's Name (Last Year)</th><td>${app.usthathName || '-'}</td></tr>
                        <tr><th class="bg-light">Learned Kithabs (Last 2 Yrs)</th><td>${app.learnedKithabs || '-'}</td></tr>
                        <tr><th class="bg-light">Physical Education (ഭൗതിക പഠനം)</th><td>${app.physicalEducation || '-'}</td></tr>
                    `;
                }

                contentDiv.innerHTML = `
                    ${photoHTML}
                    <div class="table-responsive">
                        <table class="table table-bordered table-sm align-middle">
                            <tbody>
                                <tr><th class="w-50 bg-light">Application ID</th><td>${app.appId || '-'}</td></tr>
                                <tr><th class="bg-light">Applicant Name</th><td class="fw-bold">${app.name || '-'}</td></tr>
                                <tr><th class="bg-light">House Name</th><td>${app.houseName || '-'}</td></tr>
                                <tr><th class="bg-light">Father's Name</th><td>${app.fatherName || '-'}</td></tr>
                                <tr><th class="bg-light">Father's Occupation</th><td>${app.fatherOccupation || '-'}</td></tr>
                                <tr><th class="bg-light">Mother's Name</th><td>${app.motherName || '-'}</td></tr>
                                <tr><th class="bg-light">Permanent Address</th><td>${app.address || '-'}</td></tr>
                                <tr><th class="bg-light">Pincode</th><td>${app.pincode || '-'}</td></tr>
                                <tr><th class="bg-light">Mobile Number</th><td>${app.phone || '-'}</td></tr>
                                <tr><th class="bg-light">Email Address</th><td>${app.email || '-'}</td></tr>
                                <tr><th class="bg-light">Date of Birth</th><td>${app.dob || '-'}</td></tr>
                                <tr><th class="bg-light">Age</th><td>${app.age || '-'}</td></tr>
                                <tr><th class="bg-light">Aadhar Number</th><td>${app.aadhar || '-'}</td></tr>
                                <tr><th class="bg-light">Admission Class</th><td class="text-primary fw-bold">${app.course || '-'}</td></tr>
                                ${madrasa5HTML}
                                ${madrasa7HTML}
                                ${schoolHTML}
                                ${darsHTML}
                                <tr><th class="bg-light">Date Applied</th><td>${app.date || '-'}</td></tr>
                                <tr><th class="bg-light">Status</th><td><span class="badge ${app.status === 'Approved' ? 'bg-success' : (app.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark')}">${app.status || 'Pending'}</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                `;
                new bootstrap.Modal(document.getElementById('viewAdmissionModal')).show();
            }
        }

        // Handle Promote Student
        if (promoteBtn) {
            const enroll = promoteBtn.getAttribute('data-enroll');
            let db = JSON.parse(localStorage.getItem('anwariyya_students_db')) || [];
            const idx = db.findIndex(x => getStudentProp(x, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) === enroll);
            if (idx > -1) {
                const student = db[idx];
                
                // Safeguards to prevent invalid promotions
                if (String(student.Status).toLowerCase() === 'failed') {
                    window.showSnackbar(`Cannot promote ${student.Name || enroll}. Student has failed their current year.`);
                    return;
                }
                if (String(student.Status).toLowerCase() === 'graduated') {
                    window.showSnackbar(`${student.Name || enroll} has already graduated.`);
                    return;
                }
                
                const courseMaxYears = { 'Hifz': 3, 'Shareeath': 10, 'Muthawal': 2 };
                const max = courseMaxYears[student.Course] || 3;
                let current = parseInt(student.CurrentYear) || 1;
                
                if (current < max) {
                    db[idx].CurrentYear = current + 1;
                    db[idx].Status = 'Active';
                    localStorage.setItem('anwariyya_students_db', JSON.stringify(db));
                    loadStudentsTable();
                    window.showSnackbar(`${student.Name || enroll} promoted to Year ${current + 1}.`, () => {
                        let revertDb = JSON.parse(localStorage.getItem('anwariyya_students_db'));
                        revertDb[idx].CurrentYear = current;
                        revertDb[idx].Status = student.Status;
                        localStorage.setItem('anwariyya_students_db', JSON.stringify(revertDb));
                        loadStudentsTable();
                        window.showSnackbar('Promotion undone.');
                    });
                } else {
                    db[idx].Status = 'Graduated';
                    localStorage.setItem('anwariyya_students_db', JSON.stringify(db));
                    loadStudentsTable();
                    window.showSnackbar(`${student.Name || enroll} has completed their course and Graduated!`, () => {
                        let revertDb = JSON.parse(localStorage.getItem('anwariyya_students_db'));
                        revertDb[idx].Status = 'Active';
                        localStorage.setItem('anwariyya_students_db', JSON.stringify(revertDb));
                        loadStudentsTable();
                        window.showSnackbar('Graduation undone.');
                    });
                }
            }
        }

        // Handle Print Application
        if (printAppBtn) {
            const id = printAppBtn.getAttribute('data-id');
            const admissionsDb = JSON.parse(sessionStorage.getItem('anwariyya_all_admissions_cache')) || [];
            const app = admissionsDb.find(x => x.appId === id);
            if (app) {
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
                printWindow.document.write('<html><head><title>Print Application</title>');
                printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
                printWindow.document.write(`<style>${printStyles}</style>`);
                printWindow.document.write('<\/head><body>');
                printWindow.document.write('<div class="watermark-text">OFFICIAL DOCUMENT</div>');
                printWindow.document.write('<img src="../../images/image.png" class="watermark-logo" alt="watermark">');
                
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
                    <div class="header-section"><div style="width: 120px; text-align: left;"><img src="../../images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div><div style="flex-grow: 1; text-align: center;"><h2 class="college-title">Anwariyya Arabic College</h2><h4 class="document-title">Admission Application</h4></div><div style="width: 220px; text-align: right; display: flex; justify-content: flex-end; gap: 10px; align-items: flex-start;">${qrHTML}${photoHTML}</div></div>
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
                printWindow.document.write('<div class="footer-sig"><div class="sig-line">Date & College Seal</div><div class="sig-line">Principal Signature</div></div>');
                printWindow.document.write('<\/body><\/html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(function() {
                    printWindow.print();
                }, 500);
            }
        }

        // Handle Print Student Profile
        if (printStudentBtn) {
            const enroll = printStudentBtn.getAttribute('data-enroll');
            const allStudents = JSON.parse(sessionStorage.getItem('anwariyya_all_students_cache')) || [];
            const student = allStudents.find(x => getStudentProp(x, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) === enroll);

            if (student) {
                let printModalElement = document.getElementById('printSelectionModal');
                if (!printModalElement) {
                    const modalHtml = `
                    <div class="modal fade" id="printSelectionModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content border-0 shadow">
                                <div class="modal-header bg-dark text-white">
                                    <h5 class="modal-title fw-bold"><i class="bi bi-printer me-2"></i>Print Options</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body p-4 text-center">
                                    <p class="mb-4" id="printSelectionText">What would you like to print for <strong>${student.Name || enroll}</strong>?</p>
                                    <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
                                        <button type="button" class="btn btn-primary px-4 fw-bold" id="printProfileOptionBtn"><i class="bi bi-person-badge me-2"></i>Profile Details</button>
                                        <button type="button" class="btn btn-success px-4 fw-bold" id="printMarksOptionBtn"><i class="bi bi-journal-check me-2"></i>Exam Results</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                    printModalElement = document.getElementById('printSelectionModal');
                } else {
                    document.getElementById('printSelectionText').innerHTML = `What would you like to print for <strong>${student.Name || enroll}</strong>?`;
                }
                
                const executePrint = (printMarks) => {
                    const printStyles = `
                        @page { size: A4; margin: 15mm; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 0; position: relative; }
                        .watermark-text { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 6rem; color: rgba(0, 0, 0, 0.04); font-weight: bold; text-transform: uppercase; z-index: -2; white-space: nowrap; pointer-events: none; }
                        .watermark-logo { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.06; width: 450px; z-index: -1; pointer-events: none; border-radius: 50%; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        th, td { padding: 10px; font-size: 14px; background-color: transparent !important; text-align: left; }
                        .table-bordered th, .table-bordered td { border: 1px solid #ccc !important; }
                        th, .table-light th, .bg-light { background-color: #f0f0f0 !important; color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-weight: bold; }
                        .header-section { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #222; padding-bottom: 15px; margin-bottom: 25px; }
                        .college-title { margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000; }
                        .document-title { margin: 5px 0 0; font-size: 16px; color: #555; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
                        .footer-sig { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; padding: 0 40px; }
                        .sig-line { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-weight: bold; color: #222; font-size: 14px; }
                    `;

                    const printWindow = window.open('', '_blank', 'height=600,width=800');
                    printWindow.document.write(`<html><head><title>Print ${printMarks ? 'Examination Results' : 'Student Profile'}</title>`);
                    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
                    printWindow.document.write(`<style>${printStyles}</style>`);
                    printWindow.document.write('</head><body>');
                    printWindow.document.write('<div class="watermark-text">OFFICIAL DOCUMENT</div>');
                    printWindow.document.write('<img src="../../images/image.png" class="watermark-logo" alt="watermark">');
                    
                    const photoHTML = student.photo ? `<img src="${student.photo}" style="width: 100px; height: 120px; object-fit: cover; border: 1px solid #000; padding: 2px;" alt="Student Photo">` : '';
                    const qrHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(enroll)}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #000; padding: 2px;" alt="QR Code">`;

                    if (printMarks) {
                        // PRINT MARKS
                        const allResults = JSON.parse(sessionStorage.getItem('anwariyya_all_results_cache')) || [];
                        const studentResult = allResults.find(r => (r.EnrollNo || r['Enroll No'] || r['Enroll No.'] || r.enrollNo) === enroll);
                        
                        printWindow.document.write(`<div class="header-section"><div style="width: 120px; text-align: left;"><img src="../../images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div><div style="flex-grow: 1; text-align: center;"><h2 class="college-title">Anwariyya Arabic College</h2><h4 class="document-title">Examination Result Sheet</h4></div><div style="width: 220px; text-align: right; display: flex; justify-content: flex-end; gap: 10px; align-items: flex-start;">${qrHTML}${photoHTML}</div></div>`);
                        
                        const courseMaxYears = { 'Hifz': 3, 'Shareeath': 10, 'Muthawal': 2 };
                        const maxYear = courseMaxYears[student.Course] || '-';
                        const currentYear = student.CurrentYear || 1;
                        const yearText = maxYear !== '-' ? ` - Year ${currentYear} of ${maxYear}` : '';
                        printWindow.document.write(`<div class="mb-4"><strong>Name:</strong> ${student.Name || student.StudentName || '-'}<br><strong>Enrollment No:</strong> ${enroll}<br><strong>Course:</strong> ${student.Course || '-'}${yearText}</div>`);

                        if (studentResult) {
                            let marksHTML = `<table class="table table-bordered mb-0"><thead class="table-light"><tr><th>Subject</th><th>Marks / Grade</th></tr></thead><tbody>`;
                            let overallPass = true;
                            let hasNumericMarks = false;
                            const detailKeys = ['name', 'enrollno', 'enroll no', 'enroll no.', 'course', 'class', 'password', 'pin', 'currentyear', 'contact', 'email', 'status', 'address', 'photo', 'appid'];

                            for (const key in studentResult) {
                                if (!detailKeys.includes(key.trim().toLowerCase())) {
                                    const markValue = studentResult[key];
                                    const numMark = parseFloat(markValue);
                                    let isFail = false;
                                    if (!isNaN(numMark)) { hasNumericMarks = true; if (numMark < 35) { isFail = true; overallPass = false; } } 
                                    else if (String(markValue).toLowerCase() === 'fail' || String(markValue).toLowerCase() === 'f') { isFail = true; overallPass = false; }
                                    marksHTML += `<tr><td class="fw-semibold w-50">${key}</td><td class="${isFail ? 'text-danger fw-bold' : 'fw-bold'}">${markValue} ${isFail ? ' (FAIL)' : ''}</td></tr>`;
                                }
                            }
                            marksHTML += `</tbody></table>`;
                            if (hasNumericMarks || Object.keys(studentResult).length > 7) { printWindow.document.write(`<div class="alert ${overallPass ? 'alert-success' : 'alert-danger'} border border-dark fw-bold mb-4">Overall Status: ${overallPass ? 'PASSED (Eligible for Promotion)' : 'FAILED (Below 35 Marks)'}</div>`); }
                            printWindow.document.write(marksHTML);
                        } else {
                            printWindow.document.write(`<div class="alert alert-warning border border-dark">No examination results published for this student yet.</div>`);
                        }
                    } else {
                        // PRINT DETAILS
                        printWindow.document.write(`<div class="header-section"><div style="width: 120px; text-align: left;"><img src="../../images/image.png" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border-radius: 50%;"></div><div style="flex-grow: 1; text-align: center;"><h2 class="college-title">Anwariyya Arabic College</h2><h4 class="document-title">Student Profile</h4></div><div style="width: 220px; text-align: right; display: flex; justify-content: flex-end; gap: 10px; align-items: flex-start;">${qrHTML}${photoHTML}</div></div>`);
                        
                        // Corrected and cleaned-up print logic
                        const profileDetails = {
                            "Enrollment Number": getStudentProp(student, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']),
                            "Name": getStudentProp(student, ['Name', 'StudentName']),
                            "Course": getStudentProp(student, ['Course']),
                            "Current Year": getStudentProp(student, ['CurrentYear']),
                            "Status": getStudentProp(student, ['Status']),
                            "Date of Birth": getStudentProp(student, ['DOB', 'dob', 'Date of Birth']),
                            "Contact": getStudentProp(student, ['Contact', 'Phone', 'Mobile']),
                            "Email": getStudentProp(student, ['Email']),
                            "Address": getStudentProp(student, ['Address']),
                        };

                        let tableRowsHTML = '';
                        for (const [key, value] of Object.entries(profileDetails)) {
                            tableRowsHTML += `<tr><th class="w-50" style="background: transparent !important; border-bottom: 1px dashed #ccc !important; color: #444 !important;">${key}</th><td style="border-bottom: 1px dashed #ccc !important;">: ${value || '-'}</td></tr>`;
                        }
                        printWindow.document.write(`<table class="table" style="border: none;"><tbody>${tableRowsHTML}</tbody></table>`);
                    }
                    
                    printWindow.document.write('<div class="footer-sig"><div class="sig-line">Date & College Seal</div><div class="sig-line">Principal Signature</div></div>');
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(function() { printWindow.print(); }, 500);
                };

                const printModal = new bootstrap.Modal(printModalElement);
                printModal.show();

                const btnProfile = document.getElementById('printProfileOptionBtn');
                const btnMarks = document.getElementById('printMarksOptionBtn');
                
                const newBtnProfile = btnProfile.cloneNode(true);
                const newBtnMarks = btnMarks.cloneNode(true);
                btnProfile.parentNode.replaceChild(newBtnProfile, btnProfile);
                btnMarks.parentNode.replaceChild(newBtnMarks, btnMarks);

                newBtnProfile.addEventListener('click', () => { printModal.hide(); executePrint(false); });
                newBtnMarks.addEventListener('click', () => { printModal.hide(); executePrint(true); });
            }
        }
        
        // Handle Delete Gallery Image
        if (deleteGalleryBtn) {
            const id = deleteGalleryBtn.getAttribute('data-id');
            // This action should be a server call
            if (confirm('Are you sure you want to delete this image?')) {
                // Example: await fetch(getApiUrl(`/api/admin/gallery/${id}`), { method: 'DELETE' });
                window.showSnackbar('Image deletion is not fully implemented on the server yet.');
                /*
                localStorage.setItem('anwariyya_gallery_db', JSON.stringify(db));
                loadAdminGallery();
                window.showSnackbar(`Image deleted from ${deletedImg.category.toUpperCase()} gallery.`, () => {
                    let currentDb = JSON.parse(localStorage.getItem('anwariyya_gallery_db')) || [];
                    currentDb.splice(idx, 0, deletedImg);
                    localStorage.setItem('anwariyya_gallery_db', JSON.stringify(currentDb));
                    loadAdminGallery(); window.showSnackbar('Gallery deletion undone.');
                });
                */
            }
        }

        // Handle Edit Custom Content Section
        if (editContentBtn) {
            const id = editContentBtn.getAttribute('data-id');
            const contents = JSON.parse(sessionStorage.getItem('anwariyya_all_contents_cache')) || [];
            const section = contents.find(c => c.id === id);
            if (section) {
                document.getElementById('customContentId').value = id;
                document.getElementById('customContentTitle').value = section.title;
                document.getElementById('customContentDesc').value = section.description;
                
                const imagePreview = document.getElementById('customContentImagePreview');
                const currentImageData = document.getElementById('customContentCurrentImageData');
                const removeImageBtn = document.getElementById('removeCustomContentImageBtn');
                
                if (section.image) {
                    imagePreview.src = section.image;
                    imagePreview.style.display = 'block';
                    currentImageData.value = section.image;
                    removeImageBtn.style.display = 'block';
                } else {
                    imagePreview.style.display = 'none';
                    currentImageData.value = '';
                    removeImageBtn.style.display = 'none';
                }
                document.getElementById('customContentImage').value = ''; // Clear file input
                document.getElementById('addContentModalLabel').innerText = 'Edit Custom Section';
                document.getElementById('addContentModalSubmitBtn').innerText = 'Save Changes';
                new bootstrap.Modal(document.getElementById('addContentModal')).show();
            }
        }
        // Handle Drop Custom Content Section
        if (deleteContentBtn) {
            const id = deleteContentBtn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this section?')) {
                // Example: await fetch(getApiUrl(`/api/admin/content/${id}`), { method: 'DELETE' });
                window.showSnackbar('Content deletion is not fully implemented on the server yet.');
            }
        }
        // Handle Delete Subject
        if (deleteSubjectBtn) {
            const id = deleteSubjectBtn.getAttribute('data-id');
            let mappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
            const idx = mappings.findIndex(m => m.id === id);
            if (idx > -1) {
                const deletedMap = mappings.splice(idx, 1)[0];
                localStorage.setItem('anwariyya_subject_mappings', JSON.stringify(mappings));
                if (typeof loadSubjectAssignments === 'function') loadSubjectAssignments();
                window.showSnackbar(`Subjects deleted for ${deletedMap.course} Year/Class ${deletedMap.year}.`, () => {
                    let currentMappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
                    currentMappings.splice(idx, 0, deletedMap);
                    localStorage.setItem('anwariyya_subject_mappings', JSON.stringify(currentMappings));
                    if (typeof loadSubjectAssignments === 'function') loadSubjectAssignments();
                    window.showSnackbar('Subject deletion undone.');
                });
            }
        }

        // Handle Delete Master Subject
        if (deleteMasterSubjectBtn) {
            const subjectToDelete = deleteMasterSubjectBtn.getAttribute('data-subject');
            let pool = JSON.parse(localStorage.getItem('anwariyya_master_subjects')) || [];
            pool = pool.filter(s => s !== subjectToDelete);
            localStorage.setItem('anwariyya_master_subjects', JSON.stringify(pool));
            if (typeof loadMasterSubjects === 'function') loadMasterSubjects();
            window.showSnackbar(`Subject "${subjectToDelete}" removed from master pool.`);
        }

        // Handle Download Specific Class Template
        if (downloadClassTemplateBtn) {
            const course = downloadClassTemplateBtn.getAttribute('data-course');
            const year = downloadClassTemplateBtn.getAttribute('data-year');
            
            const mappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
            const mapping = mappings.find(m => m.course === course && String(m.year).toLowerCase() === String(year).toLowerCase());
            
            let subjectCols = ["Subject 1", "Subject 2", "Subject 3"];

            if (mapping && mapping.subjects && mapping.subjects.length > 0) {
                subjectCols = mapping.subjects;
            }

            const headerRow = ["EnrollNo", "Name", ...subjectCols];
            
            const ws_data = [headerRow];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Results Template");
            
            XLSX.writeFile(wb, `Results_Template_${course}_${year}.xlsx`);
        }
    });

    // Handle Student Photo preview & base64 conversion
    const modalStudentPhoto = document.getElementById('modalStudentPhoto');
    if (modalStudentPhoto) {
        modalStudentPhoto.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const previewContainer = document.getElementById('modalStudentPhotoPreviewContainer');
            const previewImg = document.getElementById('modalStudentPhotoPreview');
            const photoDataInput = document.getElementById('modalStudentPhotoData');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    if (previewImg) previewImg.src = event.target.result;
                    if (previewContainer) previewContainer.style.display = 'block';
                    if (photoDataInput) photoDataInput.value = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                if (previewContainer) previewContainer.style.display = 'none';
                if (photoDataInput) photoDataInput.value = '';
            }
        });
    }

    // Handle Add / Edit Student Form Submission
    const studentDataForm = document.getElementById('studentDataForm');
    if (studentDataForm) {
        studentDataForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const originalEnroll = document.getElementById('modalStudentOriginalEnroll').value;
            const enroll = document.getElementById('modalStudentEnroll').value.trim();
            
            const studentData = {
                EnrollNo: enroll,
                Name: document.getElementById('modalStudentName').value.trim(),
                Course: document.getElementById('modalStudentCourse').value,
                CurrentYear: parseInt(document.getElementById('modalStudentYear').value),
                Status: document.getElementById('modalStudentStatus').value,
                Password: document.getElementById('modalStudentPassword').value.trim() || '123456', // Default password
                photo: document.getElementById('modalStudentPhotoData').value,
                
                houseName: document.getElementById('modalStudentHouseName').value.trim(),
                FatherName: document.getElementById('modalStudentFather').value.trim(),
                fatherOccupation: document.getElementById('modalStudentFatherOccupation').value.trim(),
                motherName: document.getElementById('modalStudentMother').value.trim(),
                Contact: document.getElementById('modalStudentContact').value.trim(),
                Email: document.getElementById('modalStudentEmail').value.trim(),
                DOB: document.getElementById('modalStudentDOB').value,
                aadhar: document.getElementById('modalStudentAadhar').value.trim(),
                Address: document.getElementById('modalStudentAddress').value.trim(),
                madrasa5Name: document.getElementById('modalStudentMadrasa5').value.trim(),
                madrasa7Name: document.getElementById('modalStudentMadrasa7').value.trim(),
                schoolName: document.getElementById('modalStudentSchool').value.trim(),
                darsName: document.getElementById('modalStudentDars').value.trim(),
                learnedKithabs: document.getElementById('modalStudentKithabs').value.trim(),
            };

            const response = await fetch(getApiUrl('/api/admin/student'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentData, originalEnroll })
            });

            const result = await response.json();

            if (result.success) {
                loadStudentsTable();
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('studentModal'));
                if (modalInstance) modalInstance.hide();
                window.showSnackbar(originalEnroll ? 'Student updated successfully!' : 'New student added successfully!');
            } else {
                window.showSnackbar(`Error: ${result.message}`);
            }
        });
    }

    // Handle Edit Result Form Submission
    const editResultForm = document.getElementById('editResultForm');
    if (editResultForm) {
        editResultForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const enroll = document.getElementById('editResultEnrollNo').value;
            if (!enroll) return;

            let resultsDb = JSON.parse(localStorage.getItem('anwariyya_results_db')) || [];
            const resultIndex = resultsDb.findIndex(r => getStudentProp(r, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']) === enroll);

            if (resultIndex > -1) {
                const backupDb = JSON.parse(JSON.stringify(resultsDb));
                const inputs = document.querySelectorAll('#editResultFieldsContainer input');
                inputs.forEach(input => {
                    const subject = input.getAttribute('data-subject');
                    if (subject) {
                        resultsDb[resultIndex][subject] = input.value;
                    }
                });

                localStorage.setItem('anwariyya_results_db', JSON.stringify(resultsDb));
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editResultModal'));
                if (modalInstance) modalInstance.hide();

                window.showSnackbar(`Result for ${enroll} updated successfully!`, () => {
                    localStorage.setItem('anwariyya_results_db', JSON.stringify(backupDb));
                    window.showSnackbar('Result update undone.');
                });
            } else {
                window.showSnackbar('Error: Could not find the result to update.');
            }
        });
    }

    // Handle Export Student Data
    const exportStudentDataBtn = document.getElementById('exportStudentDataBtn');
    if (exportStudentDataBtn) {
        exportStudentDataBtn.addEventListener('click', async () => {
            const allStudents = JSON.parse(sessionStorage.getItem('anwariyya_all_students_cache')) || [];
            if (allStudents.length === 0) {
                window.showSnackbar("No student data available to export.");
                return;
            }

            // Exclude large fields like photo base64 strings before exporting
            const exportData = allStudents.map(({ photo, ...rest }) => rest);

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Students Data");
            
            const dateStr = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `Anwariyya_Students_Export_${dateStr}.xlsx`);
        });
    }

    // Handle Download Student Template
    const downloadStudentTemplateBtn = document.getElementById('downloadStudentTemplateBtn');
    if (downloadStudentTemplateBtn) {
        downloadStudentTemplateBtn.addEventListener('click', () => {
            const ws_data = [
                ["Enrollment Number", "Full Name", "Course", "Current Year", "Status", "Login Password", "House Name", "Father's Name", "Father's Occupation", "Mother's Name", "Permanent Address", "Pincode", "Mobile Number", "Email Address", "Date of Birth", "Age", "Aadhar Number", "Madrasa 5 Name", "Madrasa 5 Reg No", "Madrasa 5 Mark", "Madrasa 5 Year", "Madrasa 7 Name", "Madrasa 7 Reg No", "Madrasa 7 Mark", "Madrasa 7 Year", "School Name", "Dars Name", "Usthath Name", "Learned Kithabs", "Physical Education"]
            ];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Students Template");
            XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
        });
    }

    // --- Custom Student Export Logic ---
    const customExportModal = document.getElementById('customExportModal');
    if (customExportModal) {
        customExportModal.addEventListener('show.bs.modal', async () => {
            const allStudents = JSON.parse(sessionStorage.getItem('anwariyya_all_students_cache')) || [];
            const fieldsContainer = document.getElementById('customExportFieldsContainer');
            
            if (allStudents.length === 0) {
                fieldsContainer.innerHTML = '<div class="text-center text-muted">No student data available to determine fields.</div>';
                return;
            }

            const allKeys = new Set();
            allStudents.forEach(student => {
                Object.keys(student).forEach(key => {
                    if (key !== 'photo' && key !== 'EnrollNo' && key !== 'Name') {
                        allKeys.add(key);
                    }
                });
            });

            const sortedKeys = Array.from(allKeys).sort();
            fieldsContainer.innerHTML = sortedKeys.map(key => `
                <div class="col-12 col-sm-6 col-md-4">
                    <div class="form-check">
                        <input class="form-check-input custom-export-field" type="checkbox" value="${key}" id="export-check-${key}" checked>
                        <label class="form-check-label" for="export-check-${key}">${key}</label>
                    </div>
                </div>
            `).join('');
        });

        document.getElementById('customExportSelectAll').addEventListener('click', () => {
            document.querySelectorAll('.custom-export-field').forEach(cb => cb.checked = true);
        });

        document.getElementById('customExportDeselectAll').addEventListener('click', () => {
            document.querySelectorAll('.custom-export-field').forEach(cb => cb.checked = false);
        });

        document.getElementById('customExportDownloadBtn').addEventListener('click', () => {
            const selectedFields = Array.from(document.querySelectorAll('.custom-export-field:checked')).map(cb => cb.value);
            const headers = ['EnrollNo', 'Name', ...selectedFields];

            const allStudents = JSON.parse(sessionStorage.getItem('anwariyya_all_students_cache')) || [];
            if (allStudents.length === 0) {
                window.showSnackbar("No student data to export.");
                return;
            }

            const exportData = allStudents.map(student => {
                const row = {};
                headers.forEach(header => {
                    row[header] = getStudentProp(student, [header]) || '';
                });
                return row;
            });

            const ws = XLSX.utils.json_to_sheet(exportData, { header: headers });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Custom Student Export");
            XLSX.writeFile(wb, `Anwariyya_Custom_Students_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
        });
    }

    // Handle Bulk Upload Students
    const studentUploadForm = document.getElementById('studentUploadForm');
    if (studentUploadForm) {
        studentUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('studentFileInput');
            if (!fileInput.files[0]) {
                window.showSnackbar("Please select a file to upload.");
                return;
            }

            const submitBtn = studentUploadForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

            const file = fileInput.files[0];
            const courseSelect = document.getElementById('bulkStudentCourse');
            const yearInput = document.getElementById('bulkStudentYear');
            const defaultCourse = courseSelect ? courseSelect.value : '';
            const defaultYear = yearInput ? yearInput.value : '';

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                    let db = JSON.parse(localStorage.getItem('anwariyya_students_db')) || [];
                    let addedCount = 0;
                    let updatedCount = 0;

                    // --- Smart Header Mapper ---
                    // Maps various possible user-input header names to a standardized internal key.
                    const headerMap = {
                        Name: ['full name', 'studentname', 'name'],
                        CurrentYear: ['current year', 'year'],
                        Password: ['login password', 'password', 'pin'],
                        houseName: ['house name'],
                        FatherName: ["father's name", 'fathername'],
                        fatherOccupation: ["father's occupation", 'fatheroccupation'],
                        motherName: ["mother's name", 'mothername'],
                        Address: ['permanent address', 'address'],
                        pincode: ['pincode'],
                        Contact: ['mobile number', 'contact', 'phone'],
                        Email: ['email address', 'email'],
                        DOB: ['date of birth', 'dob'],
                        age: ['age'],
                        aadhar: ['aadhar number', 'aadhar'],
                        madrasa5Name: ['madrasa 5 name'],
                        madrasa5RegNo: ['madrasa 5 reg no'],
                        madrasa5Mark: ['madrasa 5 mark'],
                        madrasa5Year: ['madrasa 5 year'],
                        madrasa7Name: ['madrasa 7 name'],
                        madrasa7RegNo: ['madrasa 7 reg no'],
                        madrasa7Mark: ['madrasa 7 mark'],
                        madrasa7Year: ['madrasa 7 year'],
                        schoolName: ['school name'],
                        darsName: ['dars name'],
                        usthathName: ['usthath name'],
                        learnedKithabs: ['learned kithabs'],
                        physicalEducation: ['physical education']
                    };

                    jsonData.forEach(row => {
                        // Clean up column headers by trimming spaces
                        const cleanRow = {};
                        for (let k in row) {
                            cleanRow[k.trim()] = row[k];
                        }

                        const newStudent = { ...cleanRow };
                        
                        // Automatically map headers from the file to the student object
                        for (const key in cleanRow) {
                            const lowerKey = key.toLowerCase();
                            for (const standardKey in headerMap) {
                                if (headerMap[standardKey].includes(lowerKey)) {
                                    newStudent[standardKey] = cleanRow[key];
                                    break; // Move to the next key once a match is found
                                }
                            }
                        }

                        const enrollNo = getStudentProp(newStudent, ['EnrollNo', 'Enrollment Number', 'Enroll No', 'Enroll No.', 'enrollNo']);
                        if (!enrollNo) return;

                        if (defaultCourse && !newStudent.Course) newStudent.Course = defaultCourse;
                        if (defaultYear && !newStudent.CurrentYear) newStudent.CurrentYear = parseInt(defaultYear);
                        if (!newStudent.Status) newStudent.Status = 'Active';
                        if (!newStudent.Password) newStudent.Password = '123456'; // Default Fallback Pass
                        
                        const existingIndex = db.findIndex(s => String(getStudentProp(s, ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo'])).trim() === String(enrollNo).trim());
                        if (existingIndex > -1) {
                            // Ensure the standardized EnrollNo is preserved during an update.
                            db[existingIndex] = { ...db[existingIndex], ...newStudent };
                            db[existingIndex].EnrollNo = getStudentProp(db[existingIndex], ['EnrollNo', 'Enroll No', 'Enroll No.', 'enrollNo']);
                            updatedCount++;
                        } else {
                            db.push(newStudent);
                            addedCount++;
                        }
                    });

                    localStorage.setItem('anwariyya_students_db', JSON.stringify(db));
                    loadStudentsTable();
                    window.showSnackbar(`Student database updated. Added: ${addedCount}, Updated: ${updatedCount}.`);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadStudentsModal'));
                    if (modal) modal.hide();
                } catch (err) {
                    console.error('File parsing error:', err);
                    window.showSnackbar("Failed to process Excel file. Ensure it is a valid format.");
                }
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Upload & Process';
                studentUploadForm.reset();
            };
            
            reader.onerror = function() {
                window.showSnackbar("Failed to read the file.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Upload & Process';
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // Handle Download Result Template
    const downloadResultTemplateBtn = document.getElementById('downloadResultTemplateBtn');
    if (downloadResultTemplateBtn) {
        downloadResultTemplateBtn.addEventListener('click', () => {
            const bulkCourse = document.getElementById('bulkResultCourse') ? document.getElementById('bulkResultCourse').value : '';
            const bulkYear = document.getElementById('bulkResultYear') ? document.getElementById('bulkResultYear').value.trim() : '';

            let subjectCols = ["Subject 1", "Subject 2", "Subject 3"];

            if (bulkCourse && bulkYear) {
                const mappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
                const mapping = mappings.find(m => m.course === bulkCourse && String(m.year).toLowerCase() === String(bulkYear).toLowerCase());
                if (mapping && mapping.subjects && mapping.subjects.length > 0) {
                    subjectCols = mapping.subjects;
                } else {
                    window.showSnackbar(`No subjects assigned for ${bulkCourse} Year ${bulkYear}. Downloading generic template.`);
                }
            } else {
                window.showSnackbar("Tip: Select Course and Year first to get a tailored template.");
            }

            const headerRow = ["EnrollNo", "Name", ...subjectCols];
            
            const ws_data = [headerRow];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Results Template");
            
            const filename = (bulkCourse && bulkYear) ? `Results_Template_${bulkCourse}_${bulkYear}.xlsx` : "Results_Upload_Template.xlsx";
            XLSX.writeFile(wb, filename);
        });
    }

    // Handle Export Results Data
    const exportResultsDataBtn = document.getElementById('exportResultsDataBtn');
    if (exportResultsDataBtn) {
        exportResultsDataBtn.addEventListener('click', () => {
            const db = JSON.parse(localStorage.getItem('anwariyya_results_db')) || [];
            if (db.length === 0) {
                window.showSnackbar("No result data available to export.");
                return;
            }

            const ws = XLSX.utils.json_to_sheet(db);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Results Data");
            
            const dateStr = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `Anwariyya_Results_Export_${dateStr}.xlsx`);
        });
    }

    // --- Result Upload Logic ---
    const resultUploadForm = document.getElementById('resultUploadForm');
    const resultFileInput = document.getElementById('resultFileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewTable = document.getElementById('previewTable');

    if (resultFileInput && uploadPreview && previewTable) {
        resultFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                uploadPreview.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                    if (jsonData.length === 0) {
                        uploadPreview.style.display = 'none';
                        return;
                    }

                    const headers = Object.keys(jsonData[0]);
                    let tableHTML = '<thead class="table-light"><tr>';
                    headers.forEach(h => tableHTML += `<th>${h}</th>`);
                    tableHTML += '</tr></thead><tbody>';

                    jsonData.slice(0, 5).forEach(row => {
                        tableHTML += '<tr>';
                        headers.forEach(h => tableHTML += `<td>${row[h] || ''}</td>`);
                        tableHTML += '</tr>';
                    });
                    tableHTML += '</tbody>';

                    previewTable.innerHTML = tableHTML;
                    uploadPreview.style.display = 'block';
                } catch (err) { console.error("Preview generation failed:", err); uploadPreview.style.display = 'none'; }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    if(resultUploadForm) {
        resultUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('resultFileInput');
            const file = fileInput.files[0];
            if(!file) {
                window.showSnackbar("Please select a file to upload.");
                return;
            }

            const submitBtn = resultUploadForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            
            const defaultCourse = document.getElementById('bulkResultCourse').value;
            const defaultYear = document.getElementById('bulkResultYear').value;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                    let db = JSON.parse(localStorage.getItem('anwariyya_results_db')) || [];
                    let addedCount = 0;
                    let updatedCount = 0;

                    jsonData.forEach(row => {
                        const enrollNo = getStudentProp(row, ['EnrollNo', 'Enrollment Number', 'Enroll No', 'Enroll No.']);
                        if (!enrollNo) return;

                        if (defaultCourse && !row.Course) row.Course = defaultCourse;
                        if (defaultYear && !row.CurrentYear) row.CurrentYear = defaultYear;

                        const existingIndex = db.findIndex(r => getStudentProp(r, ['EnrollNo', 'Enroll No', 'Enroll No.']) === enrollNo);
                        if (existingIndex > -1) {
                            db[existingIndex] = { ...db[existingIndex], ...row };
                            updatedCount++;
                        } else {
                            db.push(row);
                            addedCount++;
                        }
                    });

                    localStorage.setItem('anwariyya_results_db', JSON.stringify(db));
                    updateResultsCount();
                    loadResultsTable();
                    window.showSnackbar(`Results database updated. Added: ${addedCount}, Updated: ${updatedCount}.`);
                } catch (err) {
                    console.error('Result file parsing error:', err);
                    window.showSnackbar("Failed to process file. Ensure it is a valid Excel or CSV format.");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="bi bi-cloud-arrow-up"></i> Process & Publish Database';
                    resultUploadForm.reset();
                    const preview = document.getElementById('uploadPreview');
                    if (preview) preview.style.display = 'none';
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // --- Delete Class Results Logic ---
    const deleteResultsForm = document.getElementById('deleteResultsForm');
    if (deleteResultsForm) {
        deleteResultsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const courseToDelete = document.getElementById('deleteResultCourse').value;
            const yearToDelete = document.getElementById('deleteResultYear').value;
            
            if (!courseToDelete) return;
            
            if (!confirm(`Are you sure you want to delete results for ${courseToDelete}${yearToDelete ? ' Year ' + yearToDelete : ' (All Years)'}?`)) {
                return;
            }

            const prevResultsDB = localStorage.getItem('anwariyya_results_db');
            if (!prevResultsDB) {
                window.showSnackbar("Result database is already empty.");
                return;
            }

            let resultsDB = JSON.parse(prevResultsDB);
            const initialLength = resultsDB.length;
            
            resultsDB = resultsDB.filter(row => {
                const rowCourse = String(row.Course || row.class || row.Class || '').toLowerCase();
                const rowYear = String(row.CurrentYear || row.Year || row.year || row.CurrentClass || row.Class || '').toLowerCase();
                
                const courseMatch = rowCourse === courseToDelete.toLowerCase();
                const yearMatch = yearToDelete ? rowYear === String(yearToDelete).toLowerCase() : true;
                
                return !(courseMatch && yearMatch); // Exclude matching rows
            });
            
            const deletedCount = initialLength - resultsDB.length;
            
            if (deletedCount > 0) {
                localStorage.setItem('anwariyya_results_db', JSON.stringify(resultsDB));
                updateResultsCount();
                loadResultsTable();
                window.showSnackbar(`Deleted ${deletedCount} result(s) for ${courseToDelete}.`, () => {
                    localStorage.setItem('anwariyya_results_db', prevResultsDB);
                    updateResultsCount();
                    loadResultsTable();
                    window.showSnackbar("Result deletion undone.");
                });
            } else {
                window.showSnackbar("No matching results found to delete.");
            }
            
            deleteResultsForm.reset();
        });
    }

    // --- Site Content (About Us) Management ---
    const aboutUsForm = document.getElementById('aboutUsForm');
    if (aboutUsForm) {
        // Load existing data
        const storedAbout = JSON.parse(localStorage.getItem('anwariyya_about_content'));
        const aboutImagePreview = document.getElementById('aboutImagePreview');
        
        if (storedAbout) {
            if (storedAbout.title) document.getElementById('aboutTitleInput').value = storedAbout.title;
            if (storedAbout.subtitle) document.getElementById('aboutSubtitleInput').value = storedAbout.subtitle;
            if (storedAbout.description) document.getElementById('aboutDescInput').value = storedAbout.description;
            if (storedAbout.image) {
                aboutImagePreview.src = storedAbout.image;
                aboutImagePreview.style.display = 'block';
            }
        }

        // Handle Image Selection and Preview
        document.getElementById('aboutImageInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                aboutImagePreview.src = event.target.result;
                aboutImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });

        // Save Changes
        aboutUsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newContent = {
                title: document.getElementById('aboutTitleInput').value.trim(),
                subtitle: document.getElementById('aboutSubtitleInput').value.trim(),
                description: document.getElementById('aboutDescInput').value.trim(),
                image: aboutImagePreview.src && aboutImagePreview.src.includes('data:image') ? aboutImagePreview.src : (storedAbout ? storedAbout.image : '')
            };
            
            localStorage.setItem('anwariyya_about_content', JSON.stringify(newContent));
            window.showSnackbar("About Us content updated successfully! Changes will reflect on the home page.");
        });

        // Handle Drop 'About Us' Content
        const dropAboutUsBtn = document.getElementById('dropAboutUsBtn');
        if (dropAboutUsBtn) {
            dropAboutUsBtn.addEventListener('click', () => {
                const backup = localStorage.getItem('anwariyya_about_content');
                if (!backup) {
                    window.showSnackbar("No custom About Us content to drop.");
                    return;
                }
                
                localStorage.removeItem('anwariyya_about_content');
                aboutUsForm.reset();
                document.getElementById('aboutImagePreview').style.display = 'none';
                document.getElementById('aboutImagePreview').src = '';
                
                window.showSnackbar("About Us content dropped. Reverted to default.", () => {
                    localStorage.setItem('anwariyya_about_content', backup);
                    const restored = JSON.parse(backup);
                    if (restored.title) document.getElementById('aboutTitleInput').value = restored.title;
                    if (restored.subtitle) document.getElementById('aboutSubtitleInput').value = restored.subtitle;
                    if (restored.description) document.getElementById('aboutDescInput').value = restored.description;
                    if (restored.image) {
                        document.getElementById('aboutImagePreview').src = restored.image;
                        document.getElementById('aboutImagePreview').style.display = 'block';
                    }
                    window.showSnackbar("About Us content restored.");
                });
            });
        }
    }
    
    // --- Additional Custom Sections Logic ---
    function loadAdminContents() {
        const grid = document.getElementById('adminContentGrid');
        if (!grid) return;
        const contents = JSON.parse(localStorage.getItem('anwariyya_dynamic_contents')) || [];
        if (contents.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted py-3">No additional custom sections added.</div>';
            return;
        }
        let html = '';
        contents.forEach(item => {
            html += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        ${item.image ? `<img src="${item.image}" class="card-img-top" style="height:150px; object-fit:cover;">` : '<div class="bg-secondary text-white d-flex justify-content-center align-items-center" style="height:150px;"><i class="bi bi-card-text fs-1"></i></div>'}
                        <div class="card-body">
                            <h6 class="fw-bold">${item.title}</h6>
                            <p class="small text-muted text-truncate" style="max-height: 40px;">${item.description}</p>
                        </div>
                        <div class="card-footer bg-white border-0 text-end d-flex justify-content-end gap-2 pb-3">
                            <button type="button" class="btn btn-sm btn-outline-primary action-edit-content" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#addContentModal"><i class="bi bi-pencil-square me-1"></i> Edit</button>
                            <button type="button" class="btn btn-sm btn-outline-danger action-delete-content" data-id="${item.id}"><i class="bi bi-trash me-1"></i> Drop Section</button>
                        </div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    }
    loadAdminContents(); // Load on init

    const addContentForm = document.getElementById('addContentForm');
    const customContentIdInput = document.getElementById('customContentId');
    const customContentTitleInput = document.getElementById('customContentTitle');
    const customContentDescInput = document.getElementById('customContentDesc');
    const customContentImageInput = document.getElementById('customContentImage');
    const customContentImagePreview = document.getElementById('customContentImagePreview');
    const customContentCurrentImageData = document.getElementById('customContentCurrentImageData');
    const removeCustomContentImageBtn = document.getElementById('removeCustomContentImageBtn');
    const addContentModalLabel = document.getElementById('addContentModalLabel');
    const addContentModalSubmitBtn = document.getElementById('addContentModalSubmitBtn');

    // Reset modal fields when it's hidden
    const addContentModal = document.getElementById('addContentModal');
    if (addContentModal) {
        addContentModal.addEventListener('hidden.bs.modal', function () {
            addContentForm.reset();
            customContentIdInput.value = '';
            customContentImageInput.value = '';
            customContentImagePreview.style.display = 'none';
            customContentImagePreview.src = '';
            customContentCurrentImageData.value = '';
            removeCustomContentImageBtn.style.display = 'none';
            addContentModalLabel.innerText = 'Add Custom Section';
            addContentModalSubmitBtn.innerText = 'Publish Section';
        });
    }

    if (removeCustomContentImageBtn) {
        removeCustomContentImageBtn.addEventListener('click', function() {
            customContentImageInput.value = '';
            customContentImagePreview.style.display = 'none';
            customContentImagePreview.src = '';
            customContentCurrentImageData.value = '';
            this.style.display = 'none';
        });
    }

    if (addContentForm) {
        addContentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('customContentTitle').value.trim();
            const desc = document.getElementById('customContentDesc').value.trim();
            const imgInput = document.getElementById('customContentImage');
            
            const processAdd = (imgData = '') => {
                let db = JSON.parse(localStorage.getItem('anwariyya_dynamic_contents')) || [];
                const editId = customContentIdInput ? customContentIdInput.value : '';
                
                if (editId) {
                    const idx = db.findIndex(c => c.id === editId);
                    if (idx > -1) {
                        db[idx].title = title;
                        db[idx].description = desc;
                        db[idx].image = imgData;
                    }
                    window.showSnackbar(`Custom section "${title}" updated!`);
                } else {
                    db.push({ id: Date.now().toString(36), title: title, description: desc, image: imgData });
                    window.showSnackbar(`Custom section "${title}" added!`);
                }
                
                localStorage.setItem('anwariyya_dynamic_contents', JSON.stringify(db));
                loadAdminContents();
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('addContentModal'));
                if(modal) modal.hide();
            };
            
            if (imgInput.files && imgInput.files[0]) {
                const reader = new FileReader();
                reader.onload = e => processAdd(e.target.result);
                reader.readAsDataURL(imgInput.files[0]);
            } else {
                const currentImg = customContentCurrentImageData ? customContentCurrentImageData.value : '';
                processAdd(currentImg);
            }
        });
    }

    // --- Gallery Upload Logic ---
    function loadAdminGallery() {
        const grid = document.getElementById('adminGalleryGrid');
        if (!grid) return;
        
        // Skeleton Loader
        const skeletonHTML = Array(4).fill(`
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card border-0 shadow-sm h-100 position-relative overflow-hidden rounded-3 placeholder-glow">
                    <div class="placeholder w-100" style="height: 150px;"></div>
                </div>
            </div>
        `).join('');
        grid.innerHTML = skeletonHTML;

        setTimeout(() => {
            const galleryDB = JSON.parse(localStorage.getItem('anwariyya_gallery_db')) || [];
            
            if (galleryDB.length === 0) {
                grid.innerHTML = '<div class="col-12 text-center text-muted py-4">No images currently in gallery.</div>';
                return;
            }
            
            let html = '';
            galleryDB.forEach(img => {
                html += `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card border-0 shadow-sm h-100 position-relative overflow-hidden rounded-3">
                            <img src="${img.image}" class="card-img-top w-100" style="height: 150px; object-fit: cover;" alt="Gallery Image">
                            <span class="position-absolute top-0 start-0 badge bg-dark m-2 text-uppercase opacity-75">${img.category}</span>
                            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 action-delete-gallery shadow" data-id="${img.id}"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>
                `;
            });
            grid.innerHTML = html;
        }, 300);
    }
    loadAdminGallery(); // Load on init

    const galleryUploadForm = document.getElementById('galleryUploadForm');
    if (galleryUploadForm) {
        galleryUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const category = document.getElementById('galleryCategory').value;
            const fileInput = document.getElementById('galleryFileInput');
            const files = fileInput.files;
            
            if (files.length === 0) return;

            let galleryDB = JSON.parse(localStorage.getItem('anwariyya_gallery_db')) || [];
            let uploadCount = 0;
            const totalFiles = files.length;

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    galleryDB.push({
                        id: Date.now() + Math.random().toString(36).substring(2, 9),
                        category: category,
                        image: event.target.result,
                        date: new Date().toISOString()
                    });
                    
                    uploadCount++;
                    if (uploadCount === totalFiles) {
                        try {
                            localStorage.setItem('anwariyya_gallery_db', JSON.stringify(galleryDB));
                            window.showSnackbar(`Successfully uploaded ${totalFiles} image(s) to ${category.toUpperCase()} gallery.`);
                        } catch(err) {
                            window.showSnackbar("Upload Failed: Browser storage limit exceeded! Try compressing your images.");
                        }
                        galleryUploadForm.reset();
                        loadAdminGallery();
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // --- Add Admission Logic (Admin Dashboard) ---
    const addAdmissionForm = document.getElementById('addAdmissionForm');
    if (addAdmissionForm) {
        addAdmissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('admModalName').value.trim();
            const course = document.getElementById('admModalCourse').value;
            const photoInput = document.getElementById('admModalPhoto');
            
            const processForm = (photoData = '') => {
                const appId = '#ADM-' + Math.floor(1000 + Math.random() * 9000);
                const dateApplied = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                
                const newAdmission = {
                    appId: appId,
                    name: fullName,
                    course: course,
                    dob: document.getElementById('admModalDOB').value,
                    gender: document.getElementById('admModalGender').value,
                    bloodGroup: document.getElementById('admModalBlood').value,
                    phone: document.getElementById('admModalPhone').value,
                    email: document.getElementById('admModalEmail').value,
                    guardianName: document.getElementById('admModalGuardian').value,
                    guardianPhone: document.getElementById('admModalGuardianPhone').value,
                    address: document.getElementById('admModalAddress').value,
                    lastExam: document.getElementById('admModalLastExam').value,
                    institution: document.getElementById('admModalInstitution').value,
                    grade: document.getElementById('admModalGrade').value,
                    date: dateApplied,
                    status: 'Pending',
                    photo: photoData
                };
                
                let admissionsDB = JSON.parse(localStorage.getItem('anwariyya_admissions_db')) || [];
                admissionsDB.push(newAdmission);
                localStorage.setItem('anwariyya_admissions_db', JSON.stringify(admissionsDB));
                
                loadAdmissionsTables();
                
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addAdmissionModal'));
                if (modalInstance) modalInstance.hide();
                
                window.showSnackbar(`Admission Application Added! App ID is: ${appId}`, () => {
                    let db = JSON.parse(localStorage.getItem('anwariyya_admissions_db')) || [];
                    db = db.filter(app => app.appId !== appId);
                    localStorage.setItem('anwariyya_admissions_db', JSON.stringify(db));
                    loadAdmissionsTables();
                    window.showSnackbar('Admission addition undone.');
                });
                addAdmissionForm.reset();
            };
            
            if (photoInput && photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) { processForm(e.target.result); };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                processForm();
            }
        });
    }

    // --- Manage Class Subjects Logic ---
    let autoCheckAssignedSubjects;

    function loadMasterSubjects() {
        const pool = JSON.parse(localStorage.getItem('anwariyya_master_subjects')) || [];
        const listContainer = document.getElementById('masterSubjectsList');
        const checkboxesContainer = document.getElementById('subjectCheckboxes');
        
        if (!listContainer || !checkboxesContainer) return;

        if (pool.length === 0) {
            listContainer.innerHTML = '<span class="text-muted small">No subjects added yet.</span>';
            checkboxesContainer.innerHTML = '<div class="text-muted small p-0">Please add subjects to the master pool first.</div>';
            return;
        }

        listContainer.innerHTML = pool.map(sub => `
            <span class="badge bg-secondary d-flex align-items-center p-2 fs-6">
                ${sub} 
                <i class="bi bi-x-circle-fill ms-2 text-white action-delete-master-subject" data-subject="${sub}" style="cursor:pointer;" title="Remove Subject"></i>
            </span>
        `).join('');

        checkboxesContainer.innerHTML = pool.map(sub => `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="form-check">
                    <input class="form-check-input subject-checkbox" type="checkbox" value="${sub}" id="check_${sub.replace(/[^a-zA-Z0-9]/g, '_')}">
                    <label class="form-check-label" for="check_${sub.replace(/[^a-zA-Z0-9]/g, '_')}">
                        ${sub}
                    </label>
                </div>
            </div>
        `).join('');
        
        if (typeof autoCheckAssignedSubjects === 'function') autoCheckAssignedSubjects();
    }

    function loadSubjectAssignments() {
        const tbody = document.getElementById('subjectAssignmentsBody');
        if (!tbody) return;
        const mappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
        if (mappings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No subjects assigned.</td></tr>';
            return;
        }
        let html = '';
        mappings.forEach(map => {
            html += `<tr>
                <td class="fw-semibold">${map.course}</td>
                <td>${map.year}</td>
                <td>${map.subjects.map(s => `<span class="badge bg-secondary me-1 mb-1">${s}</span>`).join('')}</td>
                <td class="text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-info action-download-class-template" data-course="${map.course}" data-year="${map.year}" title="Download Result Template for this class"><i class="bi bi-file-earmark-spreadsheet"></i></button>
                    <button class="btn btn-sm btn-outline-danger action-delete-subject" data-id="${map.id}" title="Delete Assigned Subjects"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    autoCheckAssignedSubjects = () => {
        const courseSelect = document.getElementById('subjectAssignCourse');
        const yearInput = document.getElementById('subjectAssignYear');
        if (!courseSelect || !yearInput) return;
        
        const course = courseSelect.value;
        const year = yearInput.value.trim();
        
        document.querySelectorAll('.subject-checkbox').forEach(cb => cb.checked = false);
        
        if (course && year) {
            const mappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
            const mapping = mappings.find(m => m.course === course && m.year.toLowerCase() === year.toLowerCase());
            
            if (mapping && mapping.subjects) {
                document.querySelectorAll('.subject-checkbox').forEach(cb => {
                    if (mapping.subjects.includes(cb.value)) {
                        cb.checked = true;
                    }
                });
            }
        }
    };

    const subjectAssignCourse = document.getElementById('subjectAssignCourse');
    const subjectAssignYear = document.getElementById('subjectAssignYear');
    if (subjectAssignCourse) subjectAssignCourse.addEventListener('change', autoCheckAssignedSubjects);
    if (subjectAssignYear) subjectAssignYear.addEventListener('input', autoCheckAssignedSubjects);

    loadMasterSubjects();
    loadSubjectAssignments();

    const masterSubjectForm = document.getElementById('masterSubjectForm');
    if (masterSubjectForm) {
        masterSubjectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newSubInput = document.getElementById('newMasterSubject');
            const newSub = newSubInput.value.trim();
            if (!newSub) return;

            let pool = JSON.parse(localStorage.getItem('anwariyya_master_subjects')) || [];
            if (!pool.includes(newSub)) {
                pool.push(newSub);
                localStorage.setItem('anwariyya_master_subjects', JSON.stringify(pool));
                loadMasterSubjects();
                window.showSnackbar(`Added "${newSub}" to master subjects pool.`);
            } else {
                window.showSnackbar(`Subject "${newSub}" already exists in the pool.`);
            }
            newSubInput.value = '';
        });
    }

    const subjectAssignForm = document.getElementById('subjectAssignForm');
    if (subjectAssignForm) {
        subjectAssignForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents the page from auto-reloading
            
            const course = document.getElementById('subjectAssignCourse').value;
            const year = document.getElementById('subjectAssignYear').value.trim();
            
            const checkedBoxes = document.querySelectorAll('.subject-checkbox:checked');
            const subjects = Array.from(checkedBoxes).map(cb => cb.value);
            
            if (subjects.length === 0) {
                window.showSnackbar("Please select at least one subject from the checkboxes.");
                return;
            }

            let mappings = JSON.parse(localStorage.getItem('anwariyya_subject_mappings')) || [];
            const idx = mappings.findIndex(m => m.course === course && m.year.toLowerCase() === year.toLowerCase());
            
            if (idx > -1) {
                mappings[idx].subjects = subjects;
            } else {
                mappings.push({ id: Date.now().toString(36), course, year, subjects });
            }
            
            localStorage.setItem('anwariyya_subject_mappings', JSON.stringify(mappings));
            loadSubjectAssignments();
            window.showSnackbar(`Subjects assigned successfully for ${course} Year/Class ${year}.`);
            subjectAssignForm.reset();
            document.querySelectorAll('.subject-checkbox').forEach(cb => cb.checked = false);
        });
    }

    // --- Messaging Logic ---
    const sendMessageForm = document.getElementById('sendMessageForm');
    if (sendMessageForm) {
        const sentMessagesHistory = document.getElementById('sentMessagesHistory');

        const loadSentMessages = async () => {
            try {
                const response = await fetch(getApiUrl('/api/admin/data'));
                const data = await response.json();
                const messages = data.messages || [];
                sentMessagesHistory.innerHTML = '';
                if (messages.length === 0) {
                    sentMessagesHistory.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No messages sent yet.</td></tr>';
                    return;
                }
                messages.slice().reverse().forEach(msg => {
                    const recipientText = msg.recipient === 'all' ? 'All Students' : msg.recipient;
                    const readCount = msg.readBy ? msg.readBy.length : 0;
                    sentMessagesHistory.innerHTML += `
                        <tr>
                            <td class="ps-4 text-muted">${new Date(msg.timestamp).toLocaleString()}</td>
                            <td class="fw-semibold">${recipientText}</td>
                            <td>${msg.subject}</td>
                            <td><span class="badge bg-info">${readCount} Read</span></td>
                        </tr>
                    `;
                });
            } catch (err) {
                sentMessagesHistory.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-3">Failed to load message history.</td></tr>';
            }
        };

        document.getElementById('messaging-tab').addEventListener('shown.bs.tab', loadSentMessages);

        sendMessageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('sendMessageBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';

            const payload = {
                recipient: document.getElementById('messageRecipient').value,
                subject: document.getElementById('messageSubject').value,
                body: document.getElementById('messageBody').value,
            };

            const response = await fetch(getApiUrl('/api/admin/message'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            window.showSnackbar(result.message || (result.success ? "Message sent!" : "Failed to send message."));
            if (result.success) { sendMessageForm.reset(); loadSentMessages(); }
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-send me-2"></i>Send Message';
        });
    }

    // --- News & Events Logic ---
    const newsEventForm = document.getElementById('newsEventForm');
    if (newsEventForm) {
        const newsTableBody = document.getElementById('newsEventsTableBody');

        const loadNewsItems = async () => {
            try {
                const response = await fetch(getApiUrl('/api/admin/data'));
                const data = await response.json();
                const news = data.news || []; // This is correct
                localStorage.setItem('anwariyya_news_db', JSON.stringify(news)); // Cache for editing

                newsTableBody.innerHTML = '';
                if (news.length === 0) {
                    newsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No news or events published yet.</td></tr>';
                    return;
                }
                news.slice().reverse().forEach(item => {
                    const categoryBadge = item.category === 'Event' ? 'bg-success' : (item.category === 'Achievement' ? 'bg-info' : 'bg-secondary');
                    newsTableBody.innerHTML += `
                        <tr>
                            <td class="ps-4 fw-bold">${item.title}</td>
                            <td><span class="badge ${categoryBadge}">${item.category}</span></td>
                            <td class="text-muted">${new Date(item.createdAt).toLocaleDateString()}</td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-outline-primary action-edit-news" data-id="${item.id}"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-sm btn-outline-danger action-delete-news" data-id="${item.id}"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    `;
                });
            } catch (err) {
                newsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-3">Failed to load news items.</td></tr>';
            }
        };

        document.getElementById('news-tab').addEventListener('shown.bs.tab', loadNewsItems);

        newsEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('publishNewsBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publishing...';

            const payload = {
                id: document.getElementById('newsItemId').value || null,
                title: document.getElementById('newsItemTitle').value,
                content: document.getElementById('newsItemContent').value,
                category: document.getElementById('newsItemCategory').value
            };

            const response = await fetch(getApiUrl('/api/admin/news'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            window.showSnackbar(result.message);
            if (result.success) {
                newsEventForm.reset();
                document.getElementById('cancelNewsEditBtn').click();
                loadNewsItems();
            }
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-send-plus me-2"></i>Publish';
        });

        document.getElementById('cancelNewsEditBtn').addEventListener('click', () => {
            newsEventForm.reset();
            document.getElementById('newsItemId').value = '';
            document.getElementById('newsFormTitle').innerText = 'Publish New Item';
            document.getElementById('publishNewsBtn').innerText = 'Publish';
            document.getElementById('cancelNewsEditBtn').style.display = 'none';
        });

        newsTableBody.addEventListener('click', async (e) => {
            if (e.target.closest('.action-delete-news')) {
                const id = e.target.closest('.action-delete-news').getAttribute('data-id');
                if (confirm('Are you sure you want to delete this news item?')) {
                    const response = await fetch(getApiUrl(`/api/admin/news/${id}`), { method: 'DELETE' });
                    const result = await response.json();
                    window.showSnackbar(result.message);
                    if (result.success) loadNewsItems();
                }
            }
        });
    }

    // --- FEST SCOREBOARD CONTROL ADMIN LOGIC ---
    let currentScoreboardData = null;
    window.adminScoreboardResultsMap = {};

    function getTeamOptionsHTML(selectedTeam = '') {
        let html = '<option value="">Select Team</option>';
        const teams = (currentScoreboardData && currentScoreboardData.teams) || [];
        teams.forEach(t => {
            const isSel = t.name === selectedTeam ? 'selected' : '';
            html += `<option value="${t.name}" ${isSel}>${t.name}</option>`;
        });
        return html;
    }

    function createWinnerRow(place, w = {}, index = 0) {
        const defaultPts = place === '1st' ? 10 : (place === '2nd' ? 7 : 5);
        const pts = w.points !== undefined ? w.points : defaultPts;
        const name = w.name || '';
        const chestNo = w.chestNo || '';
        const team = w.team || '';
        const grade = w.grade || '';

        const div = document.createElement('div');
        div.className = 'winner-row card card-body bg-light mb-2 p-2 position-relative border shadow-sm';
        div.innerHTML = `
            ${index > 0 ? `<button type="button" class="btn-close position-absolute top-0 end-0 m-2 remove-winner-btn" aria-label="Remove Winner" title="Remove Winner"></button>` : ''}
            <div class="row g-2 align-items-center">
                <div class="col-md-3 col-6">
                    <input type="text" class="form-control form-control-sm winner-name" placeholder="Student Name" value="${name}">
                </div>
                <div class="col-md-2 col-6">
                    <input type="text" class="form-control form-control-sm winner-chest" placeholder="Chest No" value="${chestNo}">
                </div>
                <div class="col-md-3 col-6">
                    <select class="form-select form-select-sm festTeamSelect winner-team">
                        ${getTeamOptionsHTML(team)}
                    </select>
                </div>
                <div class="col-md-2 col-6">
                    <input type="text" class="form-control form-control-sm winner-grade" placeholder="Grade (A/B)" value="${grade}">
                </div>
                <div class="col-md-2 col-12">
                    <input type="number" class="form-control form-control-sm winner-points" placeholder="Pts" value="${pts}">
                </div>
            </div>
        `;

        const removeBtn = div.querySelector('.remove-winner-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                div.remove();
            });
        }

        return div;
    }

    function populateWinnersContainer(place, winnersData) {
        const containerId = place === '1st' ? 'fest1stWinnersContainer' : (place === '2nd' ? 'fest2ndWinnersContainer' : 'fest3rdWinnersContainer');
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        let list = [];
        if (Array.isArray(winnersData)) {
            list = winnersData;
        } else if (winnersData && typeof winnersData === 'object' && Object.keys(winnersData).length > 0) {
            list = [winnersData];
        }

        if (list.length === 0) {
            list = [{}];
        }

        list.forEach((w, idx) => {
            container.appendChild(createWinnerRow(place, w, idx));
        });
    }

    function getWinnersFromContainer(containerId, defaultPts) {
        const container = document.getElementById(containerId);
        if (!container) return { name: '', chestNo: '', team: '', grade: '', points: defaultPts };
        const rows = container.querySelectorAll('.winner-row');
        const winners = [];
        rows.forEach(row => {
            const name = row.querySelector('.winner-name').value.trim();
            const chestNo = row.querySelector('.winner-chest').value.trim();
            const team = row.querySelector('.winner-team').value;
            const grade = row.querySelector('.winner-grade').value.trim();
            const pointsInput = row.querySelector('.winner-points').value;
            const points = pointsInput !== '' ? Number(pointsInput) : defaultPts;

            if (name || chestNo || team || grade) {
                winners.push({ name, chestNo, team, grade, points });
            }
        });

        if (winners.length === 0) {
            return { name: '', chestNo: '', team: '', grade: '', points: defaultPts };
        }
        return winners.length === 1 ? winners[0] : winners;
    }

    // Attach listener for Add Winner buttons
    const add1stWinnerBtn = document.getElementById('add1stWinnerBtn');
    if (add1stWinnerBtn) {
        add1stWinnerBtn.addEventListener('click', () => {
            const container = document.getElementById('fest1stWinnersContainer');
            if (container) {
                const count = container.querySelectorAll('.winner-row').length;
                container.appendChild(createWinnerRow('1st', { points: 10 }, count));
            }
        });
    }
    const add2ndWinnerBtn = document.getElementById('add2ndWinnerBtn');
    if (add2ndWinnerBtn) {
        add2ndWinnerBtn.addEventListener('click', () => {
            const container = document.getElementById('fest2ndWinnersContainer');
            if (container) {
                const count = container.querySelectorAll('.winner-row').length;
                container.appendChild(createWinnerRow('2nd', { points: 7 }, count));
            }
        });
    }
    const add3rdWinnerBtn = document.getElementById('add3rdWinnerBtn');
    if (add3rdWinnerBtn) {
        add3rdWinnerBtn.addEventListener('click', () => {
            const container = document.getElementById('fest3rdWinnersContainer');
            if (container) {
                const count = container.querySelectorAll('.winner-row').length;
                container.appendChild(createWinnerRow('3rd', { points: 5 }, count));
            }
        });
    }

    function formatWinnerCell(wData, badgeColorClass, defaultTextClass = 'text-success') {
        const list = Array.isArray(wData) ? wData : (wData && wData.name ? [wData] : []);
        if (list.length === 0) return '-';
        const formatted = list.map(w => {
            if (!w.name) return '';
            return `<div class="mb-1"><strong>${w.name}</strong> ${w.chestNo ? `<small class="badge bg-dark">#${w.chestNo}</small>` : ''} <small class="${defaultTextClass}">(${w.team || '-'})</small> ${w.grade ? `<span class="badge bg-outline-dark text-dark border">${w.grade}</span>` : ''} <span class="badge ${badgeColorClass}">+${w.points || 0}</span></div>`;
        }).filter(Boolean);
        return formatted.length > 0 ? formatted.join('') : '-';
    }

    const loadAdminScoreboard = async () => {
        try {
            const res = await fetch(getApiUrl('/api/scoreboard'));
            const data = await res.json();
            if (!data.success || !data.scoreboard) return;

            currentScoreboardData = data.scoreboard;
            window.adminScoreboardResultsMap = {};
            (data.scoreboard.results || []).forEach(r => {
                window.adminScoreboardResultsMap[r.id] = r;
            });

            const sb = data.scoreboard;

            // Fill Fest Settings Form
            const sbEnableSwitch = document.getElementById('sbEnableSwitch');
            const sbFestTitleInput = document.getElementById('sbFestTitleInput');
            const sbFestStatusSelect = document.getElementById('sbFestStatusSelect');

            if (sbEnableSwitch) sbEnableSwitch.checked = sb.enabled !== false;
            if (sbFestTitleInput) sbFestTitleInput.value = sb.festTitle || 'ATSA Arts Fest 2026';
            if (sbFestStatusSelect) sbFestStatusSelect.value = sb.festStatus || 'Live';

            // Populate Team Select dropdowns in Result Modal
            const teamSelects = document.querySelectorAll('.festTeamSelect');
            teamSelects.forEach(select => {
                const curVal = select.value;
                select.innerHTML = '<option value="">Select Team</option>';
                (sb.teams || []).forEach(t => {
                    select.innerHTML += `<option value="${t.name}">${t.name}</option>`;
                });
                if (curVal) select.value = curVal;
            });

            // Render Teams Table
            const teamsTableBody = document.getElementById('sbTeamsTableBody');
            if (teamsTableBody) {
                if ((sb.teams || []).length === 0) {
                    teamsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No teams added yet.</td></tr>';
                } else {
                    let html = '';
                    sb.teams.forEach(t => {
                        html += `
                            <tr>
                                <td><span class="fw-bold text-dark">${t.name}</span></td>
                                <td>
                                    <span class="badge text-white px-2 py-1" style="background-color: ${t.color || '#198754'};">
                                        <i class="bi ${t.icon || 'bi-trophy-fill'} me-1"></i>${t.color || '#198754'}
                                    </span>
                                </td>
                                <td><span class="badge bg-success fs-6">${t.points || 0} pts</span></td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-primary me-1 edit-team-btn" data-team='${JSON.stringify(t)}'><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger delete-team-btn" data-id="${t.id}"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    });
                    teamsTableBody.innerHTML = html;
                }
            }

            // Render Published Event Results Table
            const resultsTableBody = document.getElementById('sbResultsTableBody');
            if (resultsTableBody) {
                if ((sb.results || []).length === 0) {
                    resultsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No event results recorded yet.</td></tr>';
                } else {
                    let html = '';
                    sb.results.forEach(r => {
                        html += `
                            <tr>
                                <td>
                                    <strong class="d-block text-dark" style="color: #000000 !important;">${r.eventName}</strong>
                                    <span class="badge bg-secondary-subtle text-dark small" style="color: #000000 !important; font-weight: 600;">${r.category || 'General'}</span>
                                </td>
                                <td>
                                    ${formatWinnerCell(r.first, 'bg-warning text-dark', 'text-success')}
                                </td>
                                <td>
                                    ${formatWinnerCell(r.second, 'bg-secondary', 'text-secondary')}
                                </td>
                                <td>
                                    ${formatWinnerCell(r.third, 'bg-danger', 'text-danger')}
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-sm btn-outline-primary me-1 edit-res-btn" data-id="${r.id}"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger delete-res-btn" data-id="${r.id}"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    });
                    resultsTableBody.innerHTML = html;
                }
            }

        } catch (err) {
            console.error('Failed to load admin scoreboard data', err);
        }
    };

    // Auto load when tab clicked or dashboard initialized
    const scoreboardTabBtn = document.getElementById('scoreboard-tab');
    if (scoreboardTabBtn) {
        scoreboardTabBtn.addEventListener('click', loadAdminScoreboard);
    }
    loadAdminScoreboard();

    // 1. Save Settings Form
    const scoreboardSettingsForm = document.getElementById('scoreboardSettingsForm');
    if (scoreboardSettingsForm) {
        scoreboardSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                enabled: document.getElementById('sbEnableSwitch').checked,
                festTitle: document.getElementById('sbFestTitleInput').value.trim(),
                festStatus: document.getElementById('sbFestStatusSelect').value
            };

            const res = await fetch(getApiUrl('/api/admin/scoreboard/settings'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            window.showSnackbar(data.message || 'Settings saved successfully');
            if (data.success) loadAdminScoreboard();
        });
    }

    // 2. Save Team Form
    const sbTeamForm = document.getElementById('sbTeamForm');
    if (sbTeamForm) {
        sbTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById('sbTeamId').value || undefined,
                name: document.getElementById('sbTeamName').value.trim(),
                color: document.getElementById('sbTeamColor').value,
                icon: document.getElementById('sbTeamIcon').value,
                points: document.getElementById('sbTeamPoints').value !== '' ? Number(document.getElementById('sbTeamPoints').value) : undefined
            };

            const res = await fetch(getApiUrl('/api/admin/scoreboard/team'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            window.showSnackbar(data.message || 'Team saved successfully');
            if (data.success) {
                sbTeamForm.reset();
                document.getElementById('sbTeamId').value = '';
                const cancelBtn = document.getElementById('sbTeamCancelBtn');
                if (cancelBtn) cancelBtn.style.display = 'none';
                document.getElementById('sbTeamFormTitle').innerHTML = '<i class="bi bi-flag-fill me-2 text-success"></i>Add / Edit Team';
                loadAdminScoreboard();
            }
        });
    }

    // Team Table Edit & Delete Delegate
    const sbTeamsTableBody = document.getElementById('sbTeamsTableBody');
    if (sbTeamsTableBody) {
        sbTeamsTableBody.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-team-btn');
            const deleteBtn = e.target.closest('.delete-team-btn');

            if (editBtn) {
                const team = JSON.parse(editBtn.getAttribute('data-team'));
                document.getElementById('sbTeamId').value = team.id;
                document.getElementById('sbTeamName').value = team.name;
                document.getElementById('sbTeamColor').value = team.color || '#198754';
                document.getElementById('sbTeamIcon').value = team.icon || 'bi-trophy-fill';
                document.getElementById('sbTeamPoints').value = team.points !== undefined ? team.points : '';
                const cancelBtn = document.getElementById('sbTeamCancelBtn');
                if (cancelBtn) cancelBtn.style.display = 'inline-block';
                document.getElementById('sbTeamFormTitle').innerHTML = '<i class="bi bi-pencil-square me-2 text-primary"></i>Edit Team';
            }

            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this team?')) {
                    const res = await fetch(getApiUrl(`/api/admin/scoreboard/team/${id}`), { method: 'DELETE' });
                    const data = await res.json();
                    window.showSnackbar(data.message);
                    if (data.success) loadAdminScoreboard();
                }
            }
        });
    }

    const sbTeamCancelBtn = document.getElementById('sbTeamCancelBtn');
    if (sbTeamCancelBtn) {
        sbTeamCancelBtn.addEventListener('click', () => {
            sbTeamForm.reset();
            document.getElementById('sbTeamId').value = '';
            sbTeamCancelBtn.style.display = 'none';
            document.getElementById('sbTeamFormTitle').innerHTML = '<i class="bi bi-flag-fill me-2 text-success"></i>Add / Edit Team';
        });
    }

    // 3. Add Event Result Modal Trigger & Save
    const openAddResultModalBtn = document.getElementById('openAddResultModalBtn');
    if (openAddResultModalBtn) {
        openAddResultModalBtn.addEventListener('click', () => {
            document.getElementById('festResultForm').reset();
            document.getElementById('festResultId').value = '';
            populateWinnersContainer('1st', []);
            populateWinnersContainer('2nd', []);
            populateWinnersContainer('3rd', []);
            const modal = new bootstrap.Modal(document.getElementById('festResultModal'));
            modal.show();
        });
    }

    const festResultForm = document.getElementById('festResultForm');
    if (festResultForm) {
        festResultForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById('festResultId').value || undefined,
                eventName: document.getElementById('festResultEventName').value.trim(),
                category: document.getElementById('festResultCategory').value,
                first: getWinnersFromContainer('fest1stWinnersContainer', 10),
                second: getWinnersFromContainer('fest2ndWinnersContainer', 7),
                third: getWinnersFromContainer('fest3rdWinnersContainer', 5)
            };

            const res = await fetch(getApiUrl('/api/admin/scoreboard/result'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            window.showSnackbar(data.message || 'Event result saved');
            if (data.success) {
                const modalEl = document.getElementById('festResultModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                loadAdminScoreboard();
            }
        });
    }

    // Event Results Table Edit & Delete Delegate
    const sbResultsTableBody = document.getElementById('sbResultsTableBody');
    if (sbResultsTableBody) {
        sbResultsTableBody.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-res-btn');
            const deleteBtn = e.target.closest('.delete-res-btn');

            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const r = window.adminScoreboardResultsMap[id] || (editBtn.hasAttribute('data-res') ? JSON.parse(editBtn.getAttribute('data-res')) : null);
                if (!r) return;

                document.getElementById('festResultId').value = r.id;
                document.getElementById('festResultEventName').value = r.eventName;
                document.getElementById('festResultCategory').value = r.category || 'General';

                populateWinnersContainer('1st', r.first);
                populateWinnersContainer('2nd', r.second);
                populateWinnersContainer('3rd', r.third);

                const modal = new bootstrap.Modal(document.getElementById('festResultModal'));
                modal.show();
            }

            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this event result?')) {
                    const res = await fetch(getApiUrl(`/api/admin/scoreboard/result/${id}`), { method: 'DELETE' });
                    const data = await res.json();
                    window.showSnackbar(data.message);
                    if (data.success) loadAdminScoreboard();
                }
            }
        });
    }

    // 4. Recalculate Points Button
    const recalculatePointsBtn = document.getElementById('recalculatePointsBtn');
    if (recalculatePointsBtn) {
        recalculatePointsBtn.addEventListener('click', async () => {
            const res = await fetch(getApiUrl('/api/admin/scoreboard/recalculate'), { method: 'POST' });
            const data = await res.json();
            window.showSnackbar(data.message);
            if (data.success) loadAdminScoreboard();
        });
    }

    // 5. Reset Scoreboard Button
    const resetScoreboardBtn = document.getElementById('resetScoreboardBtn');
    if (resetScoreboardBtn) {
        resetScoreboardBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset all scoreboard data to default?')) {
                const res = await fetch(getApiUrl('/api/admin/scoreboard/reset'), { method: 'POST' });
                const data = await res.json();
                window.showSnackbar(data.message);
                if (data.success) loadAdminScoreboard();
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
    initAdminDashboard();
}