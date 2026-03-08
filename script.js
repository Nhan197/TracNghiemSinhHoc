const TOTAL_EXAMS = 10;
let currentExamId = null;
let currentAnswers = {};

document.addEventListener("DOMContentLoaded", () => {
    renderExamList();
    document.getElementById("btn-back").addEventListener("click", () => {
        if (confirm("Dữ liệu đang điền sẽ bị mất. Bạn có chắc muốn quay lại?")) showScreen("home-screen");
    });
    document.getElementById("btn-submit").addEventListener("click", submitExam);
});

function showScreen(screenId) {
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("exam-screen").classList.add("hidden");
    document.getElementById(screenId).classList.remove("hidden");
}

function renderExamList() {
    const listDiv = document.getElementById("exam-list");
    listDiv.innerHTML = "";
    for (let i = 1; i <= TOTAL_EXAMS; i++) {
        const isSubmitted = localStorage.getItem(`exam_${i}_submitted`) === "true";
        const card = document.createElement("div");
        card.className = `exam-card ${isSubmitted ? "locked" : ""}`;
        card.innerHTML = `Đề thi số ${i} ${isSubmitted ? "<br><span style='color:green;font-size:0.8rem'>✓ Đã nộp</span>" : ""}`;
        card.addEventListener("click", () => {
            if (!isSubmitted) startExam(i);
            else alert("Bạn đã nộp đề này, không thể làm lại trên thiết bị này.");
        });
        listDiv.appendChild(card);
    }
}

function startExam(id) {
    currentExamId = id;
    currentAnswers = {};
    document.getElementById("exam-title").innerText = `Đề thi số ${id}`;
    
    // Gắn trực tiếp file PDF tương ứng
    document.getElementById("pdf-frame").src = `pdfs/de${id}.pdf`;
    
    document.getElementById("answer-form").reset();
    renderAnswerForm();
    updateProgressBar();
    showScreen("exam-screen");
}

function renderAnswerForm() {
    const container = document.getElementById("answers-container");
    container.innerHTML = "";

    // Phần I: 18 câu trắc nghiệm (1-18)
    container.innerHTML += `<div class="part-title">Phần I: Trắc nghiệm 4 lựa chọn</div>`;
    for (let i = 1; i <= 18; i++) {
        container.innerHTML += `
            <div class="q-row">
                <span class="q-label">Câu ${i}</span>
                <div class="mcq-options">
                    ${['A', 'B', 'C', 'D'].map(opt => `
                        <label><input type="radio" name="q${i}" value="${opt}" onchange="recordAnswer('q${i}', '${opt}')"><span>${opt}</span></label>
                    `).join('')}
                </div>
            </div>`;
    }

    // Phần II: 4 câu Đúng/Sai (19-22), mỗi câu 4 ý a,b,c,d
    container.innerHTML += `<div class="part-title">Phần II: Đúng / Sai</div>`;
    for (let i = 19; i <= 22; i++) {
        container.innerHTML += `<div style="font-weight:bold; margin-top:10px;">Câu ${i}</div>`;
        ['a', 'b', 'c', 'd'].map(sub => {
            let qKey = `q${i}_${sub}`;
            container.innerHTML += `
                <div class="q-row tf-sub">
                    <span class="q-label">Ý ${sub})</span>
                    <div class="tf-options">
                        <label><input type="radio" name="${qKey}" value="Đ" onchange="recordAnswer('${qKey}', 'Đ')"><span>Đúng</span></label>
                        <label><input type="radio" name="${qKey}" value="S" onchange="recordAnswer('${qKey}', 'S')"><span>Sai</span></label>
                    </div>
                </div>`;
        });
    }

    // Phần III: 6 câu Trả lời ngắn (23-28)
    container.innerHTML += `<div class="part-title">Phần III: Trả lời ngắn</div>`;
    for (let i = 23; i <= 28; i++) {
        container.innerHTML += `
            <div style="margin-top:10px;">
                <div class="q-label">Câu ${i}</div>
                <input type="text" class="short-answer" placeholder="Nhập đáp án..." oninput="recordAnswer('q${i}', this.value)">
            </div>`;
    }
}

window.recordAnswer = function(key, value) {
    if (value.trim() === "") delete currentAnswers[key];
    else currentAnswers[key] = value;
    updateProgressBar();
}

function updateProgressBar() {
    // 18 câu P1 + 16 ý P2 + 6 câu P3 = 40 trường cần nhập
    const totalFields = 18 + 16 + 6; 
    const answeredCount = Object.keys(currentAnswers).length;
    document.getElementById("progress-bar").style.width = `${(answeredCount / totalFields) * 100}%`;
}

function submitExam() {
    const totalFields = 40;
    const answeredCount = Object.keys(currentAnswers).length;

    if (answeredCount < totalFields) {
        if (!confirm(`Bạn mới làm ${answeredCount}/${totalFields} ô đáp án. Xác nhận nộp?`)) return;
    } else {
        if (!confirm("Xác nhận nộp bài?")) return;
    }

    localStorage.setItem(`exam_${currentExamId}_submitted`, "true");
    localStorage.setItem(`exam_${currentExamId}_answers`, JSON.stringify(currentAnswers));
    
    alert("✅ Nộp bài thành công!");
    renderExamList();
    showScreen("home-screen");
}
