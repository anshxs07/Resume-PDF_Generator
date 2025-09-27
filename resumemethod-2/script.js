
document.addEventListener("DOMContentLoaded", () => {
  const previewEl = document.getElementById("preview");
  const jsonInput = document.getElementById("jsonInput");
  const previewBtn = document.getElementById("previewBtn");
  const pdfBtn = document.getElementById("pdfBtn");
  const errorEl = document.getElementById("error");
  const jsonFile = document.getElementById("jsonFile");
  const autoPreview = document.getElementById("autoPreview");
  const resetBtn = document.getElementById("resetBtn");
  const sampleJsonPre = document.getElementById("sampleJson");


  const tplSrc = document.getElementById("resume-template").innerHTML;
  const template = Handlebars.compile(tplSrc);


  const sample = {
    name: "Aarav Sharma",
    title: "Product Designer",
    contact: {
      email: "email@example.com",
      phone: "+91 98765 43210",
      linkedin: "linkedin.com/in/aarav"
    },
    summary: "Experienced product designer focused on building reliable, print-ready resume generators.",
    skills: ["React", "Node.js", "A* Search", "Python", "Design Systems"],
    projects: [
      { title: "ResumeGen", description: "PDF generator" },
      { title: "MapFinder", description: "Pathfinding visualiser" }
    ],
    experience: [
      { company: "Acme Corp", role: "Senior Designer", dates: "2021 — Present", description: "Led a team building a PDF generation engine." },
      { company: "Beta Labs", role: "Frontend Engineer", dates: "2018 — 2021", description: "Built responsive editors and print-preview flows." }
    ],
    education: [
      { school: "National Institute of Design", degree: "B.Des — Interaction Design", dates: "2014 — 2018" }
    ]
  };

  
  sampleJsonPre.textContent = JSON.stringify(sample, null, 2);
  jsonInput.value = JSON.stringify(sample, null, 2);

  function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }


  function renderPreviewFromText(text) {
    errorEl.textContent = "";
    try {
      const data = JSON.parse(text);
      const html = template(data);
      previewEl.innerHTML = html;
      return true;
    } catch (err) {
      errorEl.textContent = "Invalid JSON: " + (err.message || err);
      return false;
    }
  }

  renderPreviewFromText(jsonInput.value);

  previewBtn.addEventListener("click", () => {
    renderPreviewFromText(jsonInput.value);
  });


  const debouncedRender = debounce(() => {
    if (autoPreview.checked) renderPreviewFromText(jsonInput.value);
  }, 350);

  jsonInput.addEventListener("input", debouncedRender);
  autoPreview.addEventListener("change", () => {
    if (autoPreview.checked) renderPreviewFromText(jsonInput.value);
  });

  jsonFile.addEventListener("change", (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      jsonInput.value = e.target.result;
      renderPreviewFromText(jsonInput.value);
    };
    reader.readAsText(f);
  });

 
  resetBtn.addEventListener("click", () => {
    jsonInput.value = JSON.stringify(sample, null, 2);
    renderPreviewFromText(jsonInput.value);
    errorEl.textContent = "";
  });

  
  pdfBtn.addEventListener("click", async () => {
    // make sure preview is current and valid
    const ok = renderPreviewFromText(jsonInput.value);
    if (!ok) return;

    
    const opt = {
      margin:       8,                     
      filename:     'resume.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };


    
    try {
     
      await html2pdf().set(opt).from(previewEl).save();
    } catch (err) {
      console.error(err);
      errorEl.textContent = "PDF generation failed: " + (err.message || err);
    } finally {
      pdfBtn.disabled = false;
      pdfBtn.textContent = "Generate PDF";
    }
  });
});
