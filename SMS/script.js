
/* ---------------------- State ---------------------- */
const appState = {
  user: {
    name: "",
    email: "",
    contact: "",
    cnic: "",
    avatar: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    address: ""
  },
  steps: {
    1: { done:false, data:{} },
    2: { done:false, data:{} },
    3: { done:false, data:{ siblings: [] } },
    4: { done:false, data:{} },
    5: { done:false, data:{} },
    6: { done:false, data:{} }
  }
};
const TOTAL_STEPS = 4;


function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".page-section").forEach(sec => {
    sec.classList.remove("active");
    sec.style.display = "none";
  });

  // Show only the selected one
  const active = document.getElementById(sectionId);
  if (active) {
    active.classList.add("active");
    active.style.display = "block";
  }

  // Update sidebar active link
  const links = document.querySelectorAll(".sidebar nav ul li");
  links.forEach(li => li.classList.remove("active"));
  const clickedLink = [...links].find(li =>
    li.querySelector("a").getAttribute("onclick").includes(sectionId)
  );
  if (clickedLink) clickedLink.classList.add("active");
}

//------------------- Toggle Profile ------------------------
function toggleProfile() {
  document.getElementById("profileSidebar").classList.toggle("active");
}
// ------------------- Expandable Application Section -------------
function toggleExpand(el) {
  const parent = el.parentElement;
  parent.classList.toggle("open");
  const content = parent.querySelector(".expandable-content");
  content.style.display = parent.classList.contains("open") ? "flex" : "none";
}
/* ------------------ Profile init ------------------- */
function initProfile(){
  document.getElementById('topbarName').textContent = appState.user.name;
  document.getElementById('topbarAvatar').src = appState.user.avatar;
  document.getElementById('profileAvatar').src = appState.user.avatar;
  document.getElementById('profileName').textContent = appState.user.name;
  document.getElementById('profileEmail').textContent = appState.user.email;
  document.getElementById('profileContact').textContent = appState.user.contact;
  document.getElementById('profileCNIC').textContent = appState.user.cnic;
}

/* ---------------- Wizard navigation ---------------- */
let currentStep = 1;
function goToStep(step){
  currentStep = step;
  showSection('applicationSection');
  document.querySelectorAll('.step-pane').forEach(p=>p.classList.add('hidden'));
  document.getElementById('step'+step).classList.remove('hidden');

  // pills only (no progress yet)
  renderPills('appPills', step);
  renderPills('progressPills', Math.max(step, 1));

  // Show application status card in step 6
  document.getElementById('applicationStatusWrap').classList.toggle('hidden', step !== 6);
}

/* -------------------- Boot ------------------------- */
window.onload = function(){
  initProfile();
  renderPills('appPills', 1);
  setProgress('progressBar', 0);     // keep empty at start
  setProgress('appProgressBar', 0);  // also reset top bar
  showSection('dashboardSection');
};
/* --- Updated renderPills to lock future steps --- */
function renderPills(containerId, activeStep){
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const labels = ["Applying Class","Personal","Education","Guardians"];
  for(let i=1;i<=TOTAL_STEPS;i++){
    let stateClass = '';
    if(i < activeStep && appState.steps[i].done) stateClass = 'done';
    else if(i === activeStep) stateClass = 'active';
    else if(i > activeStep && !appState.steps[i-1].done) stateClass = 'locked';
    const pill = document.createElement('div');
    pill.className = `step-pill ${stateClass}`;
    pill.innerHTML = `<span class="num">${i}</span><span>${labels[i-1]}</span>`;
    if(stateClass !== 'locked'){
      pill.style.cursor = 'pointer';
      pill.onclick = () => goToStep(i);
    }
    container.appendChild(pill);
  }
}

/* ------------------ Helpers ------------------------ */
const val = id => document.getElementById(id)?.value?.trim() || '';
const fileName = id => {
  const f = document.getElementById(id)?.files?.[0];
  return f ? f.name : '';
};

/* --------------- Lightbox (optional) --------------- */
function openLightbox(src){
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.style.display = 'flex';
}
function closeLightbox(){ document.getElementById('lightbox').style.display='none'; }

/* ---------------- Avatar handling ------------------ */
document.addEventListener('change', e=>{
  if(e.target.id==='avatarInput'){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target.result;
      appState.user.avatar = url;
      document.getElementById('liveAvatar').src = url;
      document.getElementById('topbarAvatar').src = url;
      document.getElementById('profileAvatar').src = url;
    };
    reader.readAsDataURL(file);
  }
});
//------------------ setting progress bar---------------
function setProgress(barId, step) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  const percent = (step / TOTAL_STEPS) *80;
  bar.style.width = percent + "%";
}
/* --------------- Save each step data --------------- */
function saveStep(step){
  if(step===1){   // Applying Class first
    const data = {
      applyClass: val('apply_class'),
      structure: val('f_structure')
    };
    if(!data.applyClass){ alert("Please choose a class."); return; }
    appState.steps[1].data = data; appState.steps[1].done = true;
  }

  if(step===2){   // Personal Info
    const data = {
      fullname: val('p_fullname'),
      gender: val('p_gender'),
      dob: val('p_dob'),
      cnic: val('p_cnic'),
      phone: val('p_phone'),
      address: val('p_address'),
      email: val('p_email')
    };
    if(!data.fullname || !data.gender || !data.dob){ alert("Please fill Full Name, Gender and DOB."); return; }
    appState.steps[2].data = data; appState.steps[2].done = true;
    appState.user.name = data.fullname || appState.user.name;
    appState.user.contact = data.phone || appState.user.contact;
    appState.user.cnic = data.cnic || appState.user.cnic;
    initProfile();
  }

  if(step===3){   // Education
    const data = {
      prevSchool: val('e_prev_school'),
      years: val('e_years'),
      grade: val('e_grade'),
      marksheet: fileName('e_marksheet')
    };
    appState.steps[3].data = data; appState.steps[3].done = true;
  }

  if(step===4){   // Guardians
    const siblings = readSiblings();
    const data = {
      name: val('g_name'),
      relation: val('g_relation'),
      cnic: val('g_cnic'),
      contact: val('g_contact'),
      job: val('g_job'),
      siblings
    };
    if(!data.name || !data.relation){ alert("Please fill Guardian Name & Relation."); return; }
    appState.steps[4].data = data; appState.steps[4].done = true;
  }

  // next step
  if(step < TOTAL_STEPS) goToStep(step+1);
}

/* --- Show application status in step 6 --- */
function goToStep(step){
  currentStep = step;
  showSection('applicationSection');
  document.querySelectorAll('.step-pane').forEach(p=>p.classList.add('hidden'));
  document.getElementById('step'+step).classList.remove('hidden');
  renderPills('appPills', step);
  setProgress('appProgressBar', step);
  renderPills('progressPills', Math.max(step, 1));
  setProgress('progressBar', Math.max(step, 1));

  // Show application status card in step 6
  document.getElementById('applicationStatusWrap').classList.toggle('hidden', step !== 6);
}

function addSiblingRow(){
  const tbody = document.querySelector('#siblingsTable tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" placeholder="Name" class="sib-name"></td>
    <td><input type="text" placeholder="Class" class="sib-class"></td>
    <td class="action"><button class="btn gray" onclick="this.closest('tr').remove()">X</button></td>
  `;
  tbody.appendChild(tr);
}
function readSiblings(){
  const rows = [...document.querySelectorAll('#siblingsTable tbody tr')];
  return rows.map(r => ({
    name: r.querySelector('.sib-name')?.value?.trim() || '',
    class: r.querySelector('.sib-class')?.value?.trim() || ''
  })).filter(x=>x.name||x.class);
}
/* --------------- Fee structure logic --------------- */
document.addEventListener('change', e=>{
  if(e.target.id==='f_class'){
    const cls = e.target.value;
    const fee = classFeeMap[cls] || '';
    document.getElementById('f_structure').value = fee ? `Admission: ${fee.admission}, Monthly: ${fee.monthly}` : '';
  }
});
const classFeeMap = {
  "Nursery":{admission:"Rs 5,000",monthly:"Rs 2,000"},
  "KG":{admission:"Rs 5,000",monthly:"Rs 2,200"},
  "1":{admission:"Rs 6,000",monthly:"Rs 2,500"},
  "2":{admission:"Rs 6,000",monthly:"Rs 2,700"},
  "3":{admission:"Rs 6,500",monthly:"Rs 2,900"},
  "4":{admission:"Rs 7,000",monthly:"Rs 3,100"},
  "5":{admission:"Rs 7,500",monthly:"Rs 3,300"},
  "6":{admission:"Rs 8,000",monthly:"Rs 3,600"},
  "7":{admission:"Rs 8,500",monthly:"Rs 3,900"},
  "8":{admission:"Rs 9,000",monthly:"Rs 4,200"},
  "9":{admission:"Rs 10,000",monthly:"Rs 4,800"},
  "10":{admission:"Rs 12,000",monthly:"Rs 5,300"},
  "KG":{admission:"Rs 5,000",monthly:"Rs 2,200"}
};
function generateChallan(){
  const name = appState.steps[1].data.fullname || appState.user.name;
  const cls = document.getElementById('f_class').value || appState.steps[2].data.applyClass || "-";
  const fee = classFeeMap[cls] || {admission:"-",monthly:"-"};
  const html = `
    <div><strong>Student:</strong> ${name}</div>
    <div><strong>Class:</strong> ${cls}</div>
    <div><strong>Admission Fee:</strong> ${fee.admission}</div>
    <div><strong>Monthly Fee:</strong> ${fee.monthly}</div>
    <div><strong>Due Date:</strong> 20 Aug 2025</div>
    <hr/>
    <div class="small">* Present this challan at the designated bank branch.</div>
  `;
  document.getElementById('challanBody').innerHTML = html;
  document.getElementById('challanPreview').classList.remove('hidden');
}
/* --- Show application status in step 6 --- */


function openApplication(el) {
  // Expand Application only
  const li = el.parentElement;

  // Close others
  document.querySelectorAll(".expandable").forEach(item => {
    if (item !== li) {
      item.classList.remove("open");
      item.querySelector(".main-link")?.classList.remove("active");
    }
  });

  // Open Application
  li.classList.add("open");
  el.classList.add("active");
}

// Highlight child links
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".expandable .expandable-content a").forEach(link => {
    link.addEventListener("click", function() {
      // Remove active from all child links
      document.querySelectorAll(".expandable .expandable-content a")
        .forEach(l => l.classList.remove("active"));

      // Mark clicked child active
      this.classList.add("active");

      // Ensure parent main-link stays active
      const parentLink = this.closest(".expandable").querySelector(".main-link");
      parentLink.classList.add("active");
    });
  });
});

//--------------- Applying for class --------------------
// Handle card open/close
document.querySelectorAll(".category-card").forEach(card=>{
  card.addEventListener("click", e=>{
    document.querySelectorAll(".category-card").forEach(c=>c.classList.remove("active"));
    card.classList.add("active");
    e.stopPropagation();
  });
});

// Handle class selection
document.querySelectorAll(".class-chip").forEach(chip=>{
  chip.addEventListener("click", e=>{
    document.querySelectorAll(".class-chip").forEach(c=>c.classList.remove("selected"));
    chip.classList.add("selected");
    document.getElementById("apply_class").value = chip.dataset.value; // set hidden field

  });
});
