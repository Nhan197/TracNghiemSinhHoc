const TOTAL_EXAMS = 10;
const FORMAT = { mcq: 18, tf: 4, sa: 6 }; // 18 Trắc nghiệm, 4 Đúng/Sai, 6 Trả lời ngắn
let currentExamId = null;
let currentAnswers = {};

// Khởi tạo ứng dụng
document.addEventListener("DOMContentLoaded", () => {
    renderExamList();

    document.getElementById("btn-back").addEventListener("click", () => {
        if (confirm("Dữ liệu đang làm sẽ bị mất nếu chưa nộp. Bạn có chắc muốn quay lại?")) {
            showScreen("home-screen");
        }
    });

    document.getElementById("btn-submit").addEventListener("click", submitExam);
});

// Quản lý chuyển đổi màn hình
function showScreen(screenId) {
    document.getElementById("home-screen").classList.add("hidden");
    document.getElementById("exam-screen").classList.add("hidden");
    document.getElementById(screenId).classList.remove("hidden");
}

// Render danh sách 10 đề ở trang chủ
function renderExamList() {
    const listDiv = document.getElementById("exam-list");
    listDiv.innerHTML = "";

    for (let i = 1; i <= TOTAL_EXAMS; i++) {
        const isSubmitted = localStorage.getItem(`exam_${i}_submitted`) === "true";
        
        const card = document.createElement("div");
        card.className = `exam-card ${isSubmitted ? "locked" : ""}`;
        
        let htmlContent = `Đề thi số ${i}`;
        if (isSubmitted) {
            htmlContent += `<span class="locked-badge">✓ Đã nộp</span>`;
        }
        card.innerHTML = htmlContent;

        card.addEventListener("click", () => {
            if (!isSubmitted) startExam(i);
            else alert("Bạn đã nộp đề này, không thể làm lại trên thiết bị này.");
        });

        listDiv.appendChild(card);
    }
}

// Bắt đầu làm một đề cụ thể
function startExam(id) {
    currentExamId = id;
    currentAnswers = {};
    document.getElementById("exam-title").innerText = `Đề thi số ${id}`;
    document.getElementById("exam-form").reset();
    
    generateExamContent();
    updateAnswerSheet();
    updateProgressBar();
    showScreen("exam-screen");
    window.scrollTo(0, 0);
}

// Sinh giao diện câu hỏi (Demo dữ liệu mẫu)
function generateExamContent() {
    const container = document.getElementById("questions-container");
    container.innerHTML = "";
    let questionCounter = 1;

    // PHẦN 1: 18 câu trắc nghiệm
    container.innerHTML += `<h3 class="part-title">Phần I: Câu trắc nghiệm nhiều phương án lựa chọn</h3>`;
    for (let i = 1; i <= FORMAT.mcq; i++) {
        container.appendChild(createMCQBox(questionCounter));
        questionCounter++;
    }

    // PHẦN 2: 4 câu đúng/sai
    container.innerHTML += `<h3 class="part-title">Phần II: Câu trắc nghiệm Đúng/Sai</h3>`;
    for (let i = 1; i <= FORMAT.tf; i++) {
        container.appendChild(createTFBox(questionCounter));
        questionCounter++;
    }

    // PHẦN 3: 6 câu trả lời ngắn
    container.innerHTML += `<h3 class="part-title">Phần III: Câu trắc nghiệm trả lời ngắn</h3>`;
    for (let i = 1; i <= FORMAT.sa; i++) {
        container.appendChild(createSABox(questionCounter));
        questionCounter++;
    }
}

// Khung câu hỏi Trắc nghiệm 4 đáp án
function createMCQBox(qNum) {
    const div = document.createElement("div");
    div.className = "question-box";
    const options = ['A', 'B', 'C', 'D'];
    let html = `<div class="question-title">Câu ${qNum}: Nội dung câu hỏi trắc nghiệm số ${qNum} của đề ${currentExamId}...</div><div class="options-group">`;
    options.forEach(opt => {
        html += `
            <label class="option-label">
                <input type="radio" name="q${qNum}" value="${opt}" onchange="recordAnswer(${qNum}, '${opt}')">
                ${opt}. Nội dung phương án ${opt}
            </label>
        `;
    });
    html += `</div>`;
    div.innerHTML = html;
    return div;
}

// Khung câu hỏi Đúng / Sai
function createTFBox(qNum) {
    const div = document.createElement("div");
    div.className = "question-box";
    let html = `<div class="question-title">Câu ${qNum}: Nội dung nhận định số ${qNum}. Chọn Đúng hoặc Sai.</div><div class="options-group">`;
    html += `
        <label class="option-label"><input type="radio" name="q${qNum}" value="Đúng" onchange="recordAnswer(${qNum}, 'Đúng')"> Đúng</label>
        <label class="option-label"><input type="radio" name="q${qNum}" value="Sai" onchange="recordAnswer(${qNum}, 'Sai')"> Sai</label>
    `;
    html += `</div>`;
    div.innerHTML = html;
    return div;
}

// Khung câu hỏi trả lời ngắn
function createSABox(qNum) {
    const div = document.createElement("div");
    div.className = "question-box";
    div.innerHTML = `
        <div class="question-title">Câu ${qNum}: Nội dung câu hỏi trả lời ngắn số ${qNum}...</div>
        <input type="text" class="short-answer-input" placeholder="Nhập câu trả lời của bạn..." 
               oninput="recordAnswer(${qNum}, this.value)">
    `;
    return div;
}

// Ghi nhận đáp án khi học sinh thao tác
window.recordAnswer = function(qNum, value) {
    if (value.trim() === "") {
        delete currentAnswers[qNum];
    } else {
        currentAnswers[qNum] = value;
    }
    updateAnswerSheet();
    updateProgressBar();
}

// Cập nhật thanh tiến trình
function updateProgressBar() {
    const totalQuestions = FORMAT.mcq + FORMAT.tf + FORMAT.sa;
    const answeredCount = Object.keys(currentAnswers).length;
    const percent = (answeredCount / totalQuestions) * 100;
    document.getElementById("progress-bar").style.width = percent + "%";
}

// Cập nhật bảng tóm tắt đáp án dưới cùng
function updateAnswerSheet() {
    const grid = document.getElementById("answer-grid");
    grid.innerHTML = "";
    const totalQuestions = FORMAT.mcq + FORMAT.tf + FORMAT.sa;

    for (let i = 1; i <= totalQuestions; i++) {
        const div = document.createElement("div");
        div.className = `sheet-item ${currentAnswers[i] ? "filled" : ""}`;
        
        let displayVal = currentAnswers[i] || "-";
        // Rút gọn chữ nếu là trả lời ngắn quá dài
        if (displayVal.length > 5) displayVal = "..."; 
        
        div.innerHTML = `<strong>${i}</strong><br>${displayVal}`;
        grid.appendChild(div);
    }
}

// Xử lý nút Nộp bài
function submitExam() {
    const totalQuestions = FORMAT.mcq + FORMAT.tf + FORMAT.sa;
    const answeredCount = Object.keys(currentAnswers).length;

    if (answeredCount < totalQuestions) {
        if (!confirm(`Bạn mới làm ${answeredCount}/${totalQuestions} câu. Bạn có chắc chắn muốn nộp bài?`)) {
            return;
        }
    } else {
        if (!confirm("Xác nhận nộp bài? Đề sẽ bị khóa sau khi nộp.")) return;
    }

    // Lưu trạng thái và đáp án vào localStorage
    localStorage.setItem(`exam_${currentExamId}_submitted`, "true");
    localStorage.setItem(`exam_${currentExamId}_answers`, JSON.stringify(currentAnswers));

    alert("✅ Nộp bài thành công! Đáp án của bạn đã được lưu lại.");
    renderExamList();
    showScreen("home-screen");
}
