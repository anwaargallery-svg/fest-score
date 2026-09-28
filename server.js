const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); // Make sure to run: npm install xlsx

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // To parse large JSON bodies like Base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true })); // To parse large URL-encoded bodies
app.use(express.static(__dirname)); // Serve your HTML/CSS/JS files from the root directory

// Configure Multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
// SIMPLE JSON DATABASE (db.json)
// ==========================================
const dbPath = path.join(__dirname, 'db.json'); // Corrected path
let db = { students: [], results: [], admissions: [], gallery: [], siteContent: {}, messages: [], news: [] };
if (fs.existsSync(dbPath)) {
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.error("Error reading db.json", e);
  }
}

function getInitialScoreboard() {
  return {
    enabled: true,
    festTitle: "ATSA Arts Fest 2026",
    festStatus: "Live",
    teams: [
      { id: "team-1", name: "Emeralds", color: "#198754", points: 145, icon: "bi-trophy-fill" },
      { id: "team-2", name: "Rubies", color: "#dc3545", points: 130, icon: "bi-award-fill" },
      { id: "team-3", name: "Sapphires", color: "#0d6efd", points: 115, icon: "bi-award" },
      { id: "team-4", name: "Topaz", color: "#ffc107", points: 90, icon: "bi-star-fill" }
    ],
    results: [
      {
        id: "res-0",
        eventName: "English Public Debate",
        category: "Super Senior",
        first: { name: "Ibrahim Khalil", chestNo: "C-401", team: "Sapphires", grade: "A Grade", points: 10 },
        second: { name: "Mustafa Kamal", chestNo: "C-409", team: "Emeralds", grade: "A Grade", points: 7 },
        third: { name: "Yousef Hashim", chestNo: "C-414", team: "Topaz", grade: "B Grade", points: 5 },
        updatedAt: new Date().toISOString()
      },
      {
        id: "res-1",
        eventName: "Qira'at (Quran Recitation)",
        category: "Senior",
        first: { name: "Muhammad Ali", chestNo: "C-101", team: "Emeralds", grade: "A Grade", points: 10 },
        second: { name: "Ahmed Kabir", chestNo: "C-108", team: "Rubies", grade: "A Grade", points: 7 },
        third: { name: "Faris Khan", chestNo: "C-115", team: "Sapphires", grade: "B Grade", points: 5 },
        updatedAt: new Date().toISOString()
      },
      {
        id: "res-2",
        eventName: "Malayalam Elocution",
        category: "Junior",
        first: { name: "Zayan Ahmed", chestNo: "C-204", team: "Rubies", grade: "A Grade", points: 10 },
        second: { name: "Bilal Hussain", chestNo: "C-212", team: "Emeralds", grade: "A Grade", points: 7 },
        third: { name: "Adnan Raza", chestNo: "C-220", team: "Topaz", grade: "B Grade", points: 5 },
        updatedAt: new Date().toISOString()
      },
      {
        id: "res-3",
        eventName: "Islamic Calligraphy",
        category: "Sub-Junior",
        first: { name: "Rayan Siddeeque", chestNo: "C-305", team: "Emeralds", grade: "A Grade", points: 10 },
        second: { name: "Umar Farooq", chestNo: "C-311", team: "Sapphires", grade: "A Grade", points: 7 },
        third: { name: "Sameer V.P.", chestNo: "C-319", team: "Rubies", grade: "B Grade", points: 5 },
        updatedAt: new Date().toISOString()
      }
    ]
  };
}

function recalculateScoreboardPoints() {
  if (!db.scoreboard || !Array.isArray(db.scoreboard.teams)) return;
  const teamMap = {};
  db.scoreboard.teams.forEach(t => {
    teamMap[t.name.toLowerCase()] = t;
    t.points = 0;
  });

  if (Array.isArray(db.scoreboard.results)) {
    db.scoreboard.results.forEach(res => {
      ['first', 'second', 'third'].forEach(place => {
        const winners = Array.isArray(res[place]) ? res[place] : (res[place] ? [res[place]] : []);
        winners.forEach(w => {
          if (w && w.team) {
            const tName = String(w.team).toLowerCase();
            const pts = Number(w.points) || 0;
            if (teamMap[tName]) {
              teamMap[tName].points += pts;
            }
          }
        });
      });
    });
  }

  db.scoreboard.teams.sort((a, b) => b.points - a.points);
}

function saveDb() {
  // Ensure settings are initialized
  if (!db.settings) db.settings = { admissionsOpen: true };
  if (!db.messages) db.messages = [];
  if (!db.news) db.news = [];
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

// Initial check on server load
if (!db.scoreboard) {
  db.scoreboard = getInitialScoreboard();
  saveDb();
}

// ==========================================
// API ENDPOINTS
// ==========================================


// 1. Student Portal Login
app.post('/api/login', (req, res) => {
  const { enrollNo, password } = req.body;
  
  const student = db.students.find(s => s.EnrollNo == enrollNo && s.Password == password);
  
  if (student) {
    res.json({ success: true, message: 'Login successful', token: 'mock-jwt-token', student });
  } else {
    res.status(401).json({ success: false, message: 'Invalid enrollment number or password' });
  }
});

// 2. Handle Admission Form Submissions (General & Muthawal)
app.post('/api/admission', upload.single('admPhoto'), (req, res) => {
  const formData = req.body;
  const photo = req.file; // This will hold the uploaded photo details

  console.log('Received Admission Data:', formData);
  
  let photoData = null;
  if (photo) {
    // Convert image buffer to Base64 Data URI
    photoData = `data:${photo.mimetype};base64,${photo.buffer.toString('base64')}`;
  }

  const applicationId = 'ADM-' + Math.floor(Math.random() * 10000); // Mock Application ID
  
  // Save to DB
  db.admissions.push({ applicationId, status: 'Pending Review', ...formData, photo: photoData });
  saveDb();

  res.json({ 
    success: true, 
    message: 'Application submitted successfully',
    applicationId: applicationId
  });
});

// 3. Check Admission Status
app.get('/api/admission-status', (req, res) => {
  const { id } = req.query; // Application ID or Mobile Number
  
  if (!id) {
    return res.status(400).json({ success: false, message: 'Application ID or Mobile number required' });
  }

  const admission = db.admissions.find(a => a.applicationId === id || a.admPhone === id);
  const status = admission ? admission.status : 'Not Found';
  const msg = admission ? `Application ${id} is currently ${status}.` : `No application found for ${id}.`;

  res.json({
    success: true,
    status: status,
    message: msg
  });
});

// Endpoint to get site-wide settings
app.get('/api/settings', (req, res) => {
  if (!db.settings) {
    db.settings = { admissionsOpen: true }; // Default to open if not set
    saveDb();
  }
  res.json({ success: true, settings: db.settings });
});

// Endpoint for admin to update settings
app.post('/api/admin/settings', (req, res) => {
  const { admissionsOpen } = req.body;
  if (typeof admissionsOpen !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Invalid setting value.' });
  }
  db.settings.admissionsOpen = admissionsOpen;
  saveDb();
  res.json({ success: true, message: 'Settings updated successfully.', settings: db.settings });
});

// Endpoint for admin to send a message
app.post('/api/admin/message', (req, res) => {
    const { recipient, subject, body } = req.body; // recipient can be 'all' or an EnrollNo

    if (!subject || !body || !recipient) {
        return res.status(400).json({ success: false, message: 'Recipient, subject, and body are required.' });
    }

    const newMessage = {
        id: `msg-${Date.now()}`,
        recipient: recipient, // 'all' or EnrollNo
        subject: subject,
        body: body,
        timestamp: new Date().toISOString(),
        readBy: [] // Array of EnrollNo who have read it
    };

    if (!db.messages) db.messages = [];
    db.messages.push(newMessage);
    saveDb();

    res.json({ success: true, message: 'Message sent successfully.' });
});

// Endpoint for student to get messages
app.get('/api/student/messages', (req, res) => {
    const { enrollNo } = req.query;
    if (!enrollNo) return res.status(400).json({ success: false, message: 'Enrollment number is required.' });

    const studentMessages = (db.messages || []).filter(msg => msg.recipient === 'all' || msg.recipient === enrollNo);
    const messagesWithReadStatus = studentMessages.map(msg => ({ ...msg, isRead: msg.readBy.includes(enrollNo) }));

    res.json({ success: true, messages: messagesWithReadStatus.reverse() }); // Show newest first
});

// Endpoint for student to mark a message as read
app.post('/api/student/message/read', (req, res) => {
    const { messageId, enrollNo } = req.body;
    if (!messageId || !enrollNo) return res.status(400).json({ success: false, message: 'Message ID and EnrollNo are required.' });

    const message = (db.messages || []).find(msg => msg.id === messageId);
    if (message && !message.readBy.includes(enrollNo)) message.readBy.push(enrollNo);
    saveDb();
    res.json({ success: true });
});

// Endpoint for admin to add or update a student
app.post('/api/admin/student', (req, res) => {
    const { studentData, originalEnroll } = req.body;

    if (!studentData || !studentData.EnrollNo) {
        return res.status(400).json({ success: false, message: 'Enrollment number is required.' });
    }

    const enrollNo = studentData.EnrollNo;

    // Check for duplicates if the enrollment number has changed or it's a new student
    const duplicateExists = db.students.some(
        s => s.EnrollNo === enrollNo && s.EnrollNo !== originalEnroll
    );

    if (duplicateExists) {
        return res.status(409).json({ success: false, message: `Enrollment Number ${enrollNo} already exists.` });
    }

    if (originalEnroll) {
        // Update existing student
        const studentIndex = db.students.findIndex(s => s.EnrollNo === originalEnroll);
        if (studentIndex > -1) {
            db.students[studentIndex] = { ...db.students[studentIndex], ...studentData };
        } else {
            return res.status(404).json({ success: false, message: 'Student to update not found.' });
        }
    } else {
        // Add new student
        db.students.push(studentData);
    }
    saveDb();
    res.json({ success: true, message: 'Student data saved successfully.' });
});

// Endpoint for admin to add/update a news item
app.post('/api/admin/news', (req, res) => {
    const { id, title, content, category } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    if (!db.news) db.news = [];

    if (id) {
        // Update existing news item
        const index = db.news.findIndex(item => item.id === id);
        if (index > -1) {
            db.news[index] = { ...db.news[index], title, content, category: category || 'General', updatedAt: new Date().toISOString() };
            res.json({ success: true, message: 'News item updated successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'News item not found.' });
        }
    } else {
        // Add new news item
        const newItem = { id: `news-${Date.now()}`, title, content, category: category || 'General', createdAt: new Date().toISOString() };
        db.news.push(newItem);
        res.json({ success: true, message: 'News item published successfully.', item: newItem });
    }
    saveDb();
});

// Endpoint for admin to delete a news item
app.delete('/api/admin/news/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = db.news.length;
    db.news = db.news.filter(item => item.id !== id);
    if (db.news.length < initialLength) {
        saveDb();
        res.json({ success: true, message: 'News item deleted.' });
    } else {
        res.status(404).json({ success: false, message: 'News item not found.' });
    }
});

// Endpoint for admin to reset all site data
app.post('/api/admin/reset', (req, res) => {
    const { password } = req.body;

    // This is a basic check. In a real production app, use a more secure password mechanism.
    // The password 'admin123' is a fallback if nothing is set in the db.
    const masterPassword = db.settings?.adminPassword ? Buffer.from(db.settings.adminPassword, 'base64').toString('utf8') : 'admin123';

    if (password !== masterPassword) {
        return res.status(401).json({ success: false, message: 'Incorrect master password.' });
    }

    // Reset the database object to its initial empty state
    db = { 
        students: [], results: [], admissions: [], gallery: [], siteContent: {}, messages: [],
        settings: { admissionsOpen: true, adminPassword: db.settings?.adminPassword } // Preserve settings
    };
    saveDb();

    res.json({ success: true, message: 'All site data has been reset successfully.' });
});

// 4. Examination Results Search
app.post('/api/results', (req, res) => {
  const { searchType, enrollNo, password, course, year } = req.body;

  if (searchType === 'studentBase') {
    const student = db.students.find(s => s.EnrollNo == enrollNo && s.Password == password);
    
    if (student) {
      const studentResults = db.results.filter(r => r.EnrollNo == enrollNo);
      res.json({
        success: true,
        student: student,
        results: studentResults
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials for result lookup' });
    }
  } else if (searchType === 'classBase') {
    const classResults = db.results.filter(r => r.Course == course && r.Year == year);
    res.json({ success: true, results: classResults });
  }
});

// 5. Admin: Bulk Upload Students
app.post('/api/admin/students/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const { course, year } = req.body;

    jsonData.forEach(newStudent => {
      const enrollNo = newStudent['Enrollment Number'] || newStudent.EnrollNo || newStudent['Enroll No'] || newStudent['Enroll No.'];
      if (!enrollNo) return; // Skip rows without an enroll number
      newStudent.EnrollNo = enrollNo; // Standardize the key

      // Map template names to standard keys
      if (newStudent['Full Name']) newStudent.Name = newStudent['Full Name'];
      if (newStudent['Current Year']) newStudent.CurrentYear = newStudent['Current Year'];
      if (newStudent['Login Password']) newStudent.Password = newStudent['Login Password'];
      if (newStudent['House Name']) newStudent.houseName = newStudent['House Name'];
      if (newStudent["Father's Name"]) newStudent.FatherName = newStudent["Father's Name"];
      if (newStudent["Father's Occupation"]) newStudent.fatherOccupation = newStudent["Father's Occupation"];
      if (newStudent["Mother's Name"]) newStudent.motherName = newStudent["Mother's Name"];
      if (newStudent['Permanent Address']) newStudent.Address = newStudent['Permanent Address'];
      if (newStudent['Pincode']) newStudent.pincode = newStudent['Pincode'];
      if (newStudent['Mobile Number']) newStudent.Contact = newStudent['Mobile Number'];
      if (newStudent['Email Address']) newStudent.Email = newStudent['Email Address'];
      if (newStudent['Date of Birth']) newStudent.DOB = newStudent['Date of Birth'];
      if (newStudent['Age']) newStudent.age = newStudent['Age'];
      if (newStudent['Aadhar Number']) newStudent.aadhar = newStudent['Aadhar Number'];
      if (newStudent['Madrasa 5 Name']) newStudent.madrasa5Name = newStudent['Madrasa 5 Name'];
      if (newStudent['Madrasa 5 Reg No']) newStudent.madrasa5RegNo = newStudent['Madrasa 5 Reg No'];
      if (newStudent['Madrasa 5 Mark']) newStudent.madrasa5Mark = newStudent['Madrasa 5 Mark'];
      if (newStudent['Madrasa 5 Year']) newStudent.madrasa5Year = newStudent['Madrasa 5 Year'];
      if (newStudent['Madrasa 7 Name']) newStudent.madrasa7Name = newStudent['Madrasa 7 Name'];
      if (newStudent['Madrasa 7 Reg No']) newStudent.madrasa7RegNo = newStudent['Madrasa 7 Reg No'];
      if (newStudent['Madrasa 7 Mark']) newStudent.madrasa7Mark = newStudent['Madrasa 7 Mark'];
      if (newStudent['Madrasa 7 Year']) newStudent.madrasa7Year = newStudent['Madrasa 7 Year'];
      if (newStudent['School Name']) newStudent.schoolName = newStudent['School Name'];
      if (newStudent['Dars Name']) newStudent.darsName = newStudent['Dars Name'];
      if (newStudent['Usthath Name']) newStudent.usthathName = newStudent['Usthath Name'];
      if (newStudent['Learned Kithabs']) newStudent.learnedKithabs = newStudent['Learned Kithabs'];
      if (newStudent['Physical Education']) newStudent.physicalEducation = newStudent['Physical Education'];

      // Apply course/year from form if provided
      if (course) newStudent.Course = course;
      if (year) newStudent.CurrentYear = year;

      const existingIndex = db.students.findIndex(s => s.EnrollNo == enrollNo);
      if (existingIndex > -1) {
        // Update existing student
        db.students[existingIndex] = { ...db.students[existingIndex], ...newStudent };
      } else {
        // Add new student with defaults
        newStudent.Status = newStudent.Status || 'Active';
        newStudent.Password = newStudent.Password || '123456';
        db.students.push(newStudent);
      }
    });

    saveDb();
    fs.unlinkSync(req.file.path); // Remove temporary file after processing
    res.json({ success: true, message: `Student database updated with ${jsonData.length} records.`, students: db.students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process Excel file' });
  }
});

// 6. Admin: Bulk Upload Results
app.post('/api/admin/results/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const { course, year } = req.body;

    // Merge results data
    jsonData.forEach(newResult => {
      const enrollNo = newResult['Enrollment Number'] || newResult.EnrollNo || newResult['Enroll No'] || newResult['Enroll No.'];
      if (!enrollNo) return;
      newResult.EnrollNo = enrollNo;
      if (newResult['Full Name']) newResult.Name = newResult['Full Name'];
      if (course) newResult.Course = course;
      if (year) newResult.CurrentYear = year;
      const existingIndex = db.results.findIndex(r => r.EnrollNo == enrollNo);
      if (existingIndex > -1) {
        db.results[existingIndex] = { ...db.results[existingIndex], ...newResult };
      } else {
        db.results.push(newResult);
      }
    });

    // Server-side auto-promotion logic
    let promotedCount = 0;
    jsonData.forEach(result => {
      const enrollNo = result.EnrollNo;
      if (!enrollNo) return;
      const studentIndex = db.students.findIndex(s => s.EnrollNo == enrollNo);
      if (studentIndex > -1) {
        const student = db.students[studentIndex];
        let passed = true;
        // Check all subject marks for failure
        for (const key in result) {
          if (key.toLowerCase().includes('enroll') || key.toLowerCase().includes('name')) continue;
          const mark = parseFloat(result[key]);
          if ((!isNaN(mark) && mark < 35) || String(result[key]).toLowerCase() === 'fail') {
            passed = false;
            break;
          }
        }

        if (passed) {
          const courseMaxYears = { 'hifz': 3, 'shareeath': 10, 'muthawal': 2 };
          const max = courseMaxYears[String(student.Course || '').toLowerCase()] || 3;
          if (student.CurrentYear < max) {
            db.students[studentIndex].CurrentYear++;
          } else {
            db.students[studentIndex].Status = 'Graduated';
          }
          promotedCount++;
        } else {
          db.students[studentIndex].Status = 'Failed';
        }
      }
    });

    saveDb();
    fs.unlinkSync(req.file.path); // Remove temporary file after processing
    let message = `Results updated with ${jsonData.length} records.`;
    if (promotedCount > 0) message += ` ${promotedCount} students were promoted/graduated.`;
    res.json({ success: true, message, results: db.results, students: db.students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process Excel file' });
  }
});

// 7. Sync Admin Dashboard Data to Server (Legacy)
app.post('/api/admin/sync', (req, res) => {
  const { students, results, admissions } = req.body;
  
  if (students) db.students = students;
  if (results) db.results = results;
  if (admissions) db.admissions = admissions;
  
  saveDb();
  res.json({ success: true, message: 'Database synced with server successfully' });
});

// 8. Get all data for Admin UI
app.get('/api/admin/data', (req, res) => {
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();
  recalculateScoreboardPoints();
  res.json(db);
});

// ==========================================
// FEST SCOREBOARD ENDPOINTS
// ==========================================

// Public Scoreboard Endpoint
app.get('/api/scoreboard', (req, res) => {
  if (!db.scoreboard) {
    db.scoreboard = getInitialScoreboard();
    saveDb();
  }
  recalculateScoreboardPoints();
  res.json({ success: true, scoreboard: db.scoreboard });
});

// Admin: Update Scoreboard Settings
app.post('/api/admin/scoreboard/settings', (req, res) => {
  const { enabled, festTitle, festStatus, festLogo } = req.body;
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();
  
  if (typeof enabled === 'boolean') db.scoreboard.enabled = enabled;
  if (festTitle !== undefined) db.scoreboard.festTitle = festTitle;
  if (festStatus !== undefined) db.scoreboard.festStatus = festStatus;
  if (festLogo !== undefined) db.scoreboard.festLogo = festLogo;
  
  saveDb();
  res.json({ success: true, message: 'Scoreboard settings updated.', scoreboard: db.scoreboard });
});

// Admin: Add or Edit Team
app.post('/api/admin/scoreboard/team', (req, res) => {
  const { id, name, color, icon, points } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Team name is required.' });
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();

  if (id) {
    const teamIndex = db.scoreboard.teams.findIndex(t => t.id === id);
    if (teamIndex > -1) {
      db.scoreboard.teams[teamIndex] = {
        ...db.scoreboard.teams[teamIndex],
        name,
        color: color || '#198754',
        icon: icon || 'bi-trophy-fill',
        points: points !== undefined ? Number(points) : db.scoreboard.teams[teamIndex].points
      };
    } else {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }
  } else {
    const newTeam = {
      id: `team-${Date.now()}`,
      name,
      color: color || '#198754',
      icon: icon || 'bi-trophy-fill',
      points: points ? Number(points) : 0
    };
    db.scoreboard.teams.push(newTeam);
  }

  recalculateScoreboardPoints();
  saveDb();
  res.json({ success: true, message: 'Team saved successfully.', scoreboard: db.scoreboard });
});

// Admin: Delete Team
app.delete('/api/admin/scoreboard/team/:id', (req, res) => {
  const { id } = req.params;
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();
  
  db.scoreboard.teams = db.scoreboard.teams.filter(t => t.id !== id);
  recalculateScoreboardPoints();
  saveDb();
  res.json({ success: true, message: 'Team deleted successfully.', scoreboard: db.scoreboard });
});

// Admin: Add or Edit Event Result
app.post('/api/admin/scoreboard/result', (req, res) => {
  const { id, eventName, category, first, second, third } = req.body;
  if (!eventName) return res.status(400).json({ success: false, message: 'Event name is required.' });
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();

  const resultData = {
    id: id || `res-${Date.now()}`,
    eventName,
    category: category || 'General',
    first: first || { name: '', team: '', points: 0 },
    second: second || { name: '', team: '', points: 0 },
    third: third || { name: '', team: '', points: 0 },
    updatedAt: new Date().toISOString()
  };

  if (id) {
    const idx = db.scoreboard.results.findIndex(r => r.id === id);
    if (idx > -1) {
      db.scoreboard.results[idx] = resultData;
    } else {
      db.scoreboard.results.push(resultData);
    }
  } else {
    db.scoreboard.results.push(resultData);
  }

  recalculateScoreboardPoints();
  saveDb();
  res.json({ success: true, message: 'Event result saved successfully.', scoreboard: db.scoreboard });
});

// Admin: Delete Event Result
app.delete('/api/admin/scoreboard/result/:id', (req, res) => {
  const { id } = req.params;
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();

  db.scoreboard.results = db.scoreboard.results.filter(r => String(r.id) !== String(id));
  recalculateScoreboardPoints();
  saveDb();
  res.json({ success: true, message: 'Event result deleted successfully.', scoreboard: db.scoreboard });
});

// Admin: Recalculate Points
app.post('/api/admin/scoreboard/recalculate', (req, res) => {
  if (!db.scoreboard) db.scoreboard = getInitialScoreboard();
  recalculateScoreboardPoints();
  saveDb();
  res.json({ success: true, message: 'Team standings recalculated successfully.', scoreboard: db.scoreboard });
});

// Admin: Reset Scoreboard Data
app.post('/api/admin/scoreboard/reset', (req, res) => {
  db.scoreboard = getInitialScoreboard();
  saveDb();
  res.json({ success: true, message: 'Scoreboard reset to default state.', scoreboard: db.scoreboard });
});


// Export the app for serverless environments like Vercel
module.exports = app;

// Start the server only when run directly (for local development)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running for local development on http://localhost:${PORT}`);
  });
}