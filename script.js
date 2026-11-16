const STORAGE_KEY = "personalHubData_v2";

// Default Biodata
const defaultData = {
    profile: {
        fullName: "Vinod Gangwar",
        headline: "BCA Student | Invertis University, Bareilly",
        dob: "",
        gender: "",
        about: "I am a BCA student at Invertis University, Bareilly. I am interested in computer applications, programming and modern technology. I enjoy learning new skills and developing practical projects.",
        photo: "assets/profile-photo.png"
    },

    contact: {
        email: "",
        phone: "",
        address: "",
        country: "India",

        linkedin: "https://www.linkedin.com/in/vinod-gangwar-2a62b3292?utm_source=share_via&utm_content=profile&utm_medium=member_android",

        github: "https://github.com/vinodkurmi904-tech",

        instagram: "https://www.instagram.com/_vinod__official_0?vrfl=MTk3ZHBiczgydGVmeA==",

        facebook: "https://www.facebook.com/share/19jbv5gscM/"
    },

    education: [
        {
            id: "bca-invertis",
            course: "Bachelor of Computer Applications (BCA)",
            institution: "Invertis University, Bareilly",
            startYear: "",
            endYear: "",
            grade: "Pursuing"
        }
    ],

    skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "Computer Applications",
        "Programming"
    ],

    updatedAt: null
};

// Load saved data
let data = loadData();

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        return saved
            ? {
                ...structuredClone(defaultData),
                ...saved,
                profile: {
                    ...defaultData.profile,
                    ...saved.profile
                },
                contact: {
                    ...defaultData.contact,
                    ...saved.contact
                }
            }
            : structuredClone(defaultData);

    } catch (error) {
        console.warn("Saved data could not be read", error);
        return structuredClone(defaultData);
    }
}

// Save data
function saveData() {
    data.updatedAt = new Date().toISOString();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    renderAll();
}

// Get element by ID
function $(id) {
    return document.getElementById(id);
}

// Escape HTML
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// Generate initials
function initials(name) {
    return name.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase() || "P";
}

// Notification
let toastTimer;

function toast(message) {
    const el = $("toast");

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        el.classList.remove("show");
    }, 2600);
}

// Navigation
function showSection(id) {
    const target = $(id);

    if (!target) return;

    document.querySelectorAll(".view").forEach(view => {
        view.classList.toggle("active", view.id === id);
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.section === id
        );
    });

    $("pageTitle").textContent = ({
        dashboard: "Dashboard",
        profile: "Personal Profile",
        education: "Education Details",
        skills: "Skills & Interests",
        contact: "Contact Details"
    })[id] || "Dashboard";

    $("sidebar").classList.remove("open");

    window.location.hash = id;
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showSection(link.dataset.section);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.go);
    });
});

// Mobile menu
$("menuToggle").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
});

// Fill forms with biodata
function fillForm() {

    Object.entries(data.profile).forEach(([key, value]) => {
        if (key !== "photo" && $(key)) {
            $(key).value = value || "";
        }
    });

    Object.entries(data.contact).forEach(([key, value]) => {
        if ($(key)) {
            $(key).value = value || "";
        }
    });

    renderAvatars();
}

// Display profile photos
function renderAvatars() {

    const name = data.profile.fullName || "Your Name";

    const photo = data.profile.photo || "";

    ["dashboardAvatar", "profileAvatar"].forEach(id => {

        const el = $(id);

        el.innerHTML = photo
            ? `<img src="${photo}" alt="Profile photo">`
            : escapeHTML(initials(name));

    });
}

// Save personal profile
$("profileForm").addEventListener("submit", event => {

    event.preventDefault();

    [
        "fullName",
        "headline",
        "dob",
        "gender",
        "about"
    ].forEach(key => {

        data.profile[key] = $(key).value.trim();

    });

    saveData();

    toast("Personal details saved successfully.");

});

// Save contact details
$("contactForm").addEventListener("submit", event => {

    event.preventDefault();

    [
        "email",
        "phone",
        "address",
        "country",
        "linkedin",
        "github",
        "instagram",
        "facebook"
    ].forEach(key => {

        data.contact[key] = $(key).value.trim();

    });

    saveData();

    toast("Contact details saved successfully.");

});

// Upload profile photo
$("photoInput").addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        toast("Please choose an image file.");

        return;
    }

    if (file.size > 2 * 1024 * 1024) {

        toast("Please choose an image smaller than 2 MB.");

        event.target.value = "";

        return;
    }

    const reader = new FileReader();

    reader.onload = () => {

        data.profile.photo = reader.result;

        saveData();

        toast("Profile photo updated.");

    };

    reader.readAsDataURL(file);

});

// Education section
const dialog = $("educationDialog");

function openEducation(record = null) {

    $("educationForm").reset();

    $("educationId").value = record?.id || "";

    $("educationDialogTitle").textContent =
        record ? "Edit education" : "Add education";

    [
        "course",
        "institution",
        "startYear",
        "endYear",
        "grade"
    ].forEach(key => {

        $(key).value = record?.[key] || "";

    });

    dialog.showModal();
}

// Open education form
$("addEducationBtn").addEventListener("click", () => {
    openEducation();
});

$("closeDialog").addEventListener("click", () => {
    dialog.close();
});

$("cancelDialog").addEventListener("click", () => {
    dialog.close();
});

// Save education
$("educationForm").addEventListener("submit", event => {

    event.preventDefault();

    const record = {

        id: $("educationId").value ||
            crypto.randomUUID(),

        course: $("course").value.trim(),

        institution: $("institution").value.trim(),

        startYear: $("startYear").value,

        endYear: $("endYear").value,

        grade: $("grade").value.trim()

    };

    const index = data.education.findIndex(
        item => item.id === record.id
    );

    if (index >= 0) {

        data.education[index] = record;

    } else {

        data.education.push(record);

    }

    saveData();

    dialog.close();

    toast("Education record saved.");

});

// Display education
function renderEducation() {

    const list = $("educationList");

    if (!data.education.length) {

        list.innerHTML = `
            <div class="empty-state">
                <h3>No education added</h3>
                <p>Add your educational details.</p>
            </div>
        `;

        return;
    }

    list.innerHTML = data.education.map(item => `

        <article class="record-item">

            <div>
                <h3>${escapeHTML(item.course)}</h3>

                <p>${escapeHTML(item.institution)}</p>

                <p>
                    ${escapeHTML(item.startYear || "Year not set")}
                    –
                    ${escapeHTML(item.endYear || "Present")}
                    ${item.grade ? " · " + escapeHTML(item.grade) : ""}
                </p>
            </div>

            <div class="record-actions">

                <button class="small-button"
                    data-edit-education="${escapeHTML(item.id)}">
                    Edit
                </button>

                <button class="small-button delete"
                    data-delete-education="${escapeHTML(item.id)}">
                    Delete
                </button>

            </div>

        </article>

    `).join("");

    list.querySelectorAll("[data-edit-education]").forEach(button => {

        button.addEventListener("click", () => {

            openEducation(
                data.education.find(
                    item => item.id === button.dataset.editEducation
                )
            );

        });

    });

    list.querySelectorAll("[data-delete-education]").forEach(button => {

        button.addEventListener("click", () => {

            if (confirm("Delete this education record?")) {

                data.education = data.education.filter(
                    item => item.id !== button.dataset.deleteEducation
                );

                saveData();

                toast("Education record deleted.");

            }

        });

    });

}

// Add skills
$("skillForm").addEventListener("submit", event => {

    event.preventDefault();

    const value = $("skillInput").value.trim();

    if (!value) return;

    if (data.skills.some(
        item => item.toLowerCase() === value.toLowerCase()
    )) {

        toast("This item is already in your list.");

        return;
    }

    data.skills.push(value);

    $("skillInput").value = "";

    saveData();

    toast("Item added.");

});

// Display skills
function renderSkills() {

    $("skillCount").textContent =
        `${data.skills.length} items`;

    $("skillList").innerHTML = data.skills.length

        ? data.skills.map((skill, index) => `

            <span class="skill-chip">

                ${escapeHTML(skill)}

                <button type="button"
                    data-remove-skill="${index}">
                    ×
                </button>

            </span>

        `).join("")

        : `<div class="empty-state">
                <h3>No items yet</h3>
                <p>Add a skill or interest.</p>
           </div>`;

    $("skillList").querySelectorAll("[data-remove-skill]")
        .forEach(button => {

            button.addEventListener("click", () => {

                data.skills.splice(
                    Number(button.dataset.removeSkill), 1
                );

                saveData();

                toast("Item removed.");

            });

        });

}

// Dashboard summary
function renderDashboard() {

    const p = data.profile;

    const c = data.contact;

    const fields = [
        p.fullName,
        p.headline,
        p.about,
        c.email,
        c.phone,
        c.address
    ];

    const completed = fields.filter(
        value => String(value || "").trim()
    ).length;

    const percent = Math.round(
        completed / fields.length * 100
    );

    $("completionStat").textContent = percent + "%";

    $("completionBar").style.width = percent + "%";

    $("educationStat").textContent = data.education.length;

    $("skillsStat").textContent = data.skills.length;

    const contacts = [
        c.email,
        c.phone,
        c.address
    ].filter(Boolean).length;

    $("contactStat").textContent = contacts + "/3";

    $("dashboardName").textContent =
        p.fullName || "Your Name";

    $("dashboardHeadline").textContent =
        p.headline || "Add a short profile headline";

    $("dashboardEmail").textContent =
        c.email || "Not added";

    $("dashboardPhone").textContent =
        c.phone || "Not added";

    $("dashboardLocation").textContent =
        [c.address, c.country].filter(Boolean).join(", ")
        || "Not added";

    $("lastUpdated").textContent =
        data.updatedAt
        ? "Last saved " + new Date(data.updatedAt).toLocaleString()
        : "Not updated yet";

    renderAvatars();
}

// Refresh all sections
function renderAll() {

    renderDashboard();

    renderEducation();

    renderSkills();

}

// Export data
$("exportBtn").addEventListener("click", () => {

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = "personalhub-backup.json";

    anchor.click();

    URL.revokeObjectURL(url);

    toast("Your data backup has been exported.");

});

// Start application
fillForm();

renderAll();

// Open section from URL
if (location.hash && $(location.hash.slice(1))) {

    showSection(location.hash.slice(1));

}