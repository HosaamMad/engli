/* إعدادات GitHub API */
const repoOwner = "HosaamMad"; // استبدل باسم مستخدم GitHub الخاص بك
const repoName = "engli";         // اسم المستودع
const filePath = "words.json";
const token = "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";        // استبدل بمفتاح GitHub API الخاص بك

/* المتغيرات العالمية */
let wordBank = [];
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let correctCount = 0;
let wrongCount = 0;
let timerInterval;
let timerTimeout;
let timeLeft = 10;

/* دوال بنك الكلمات */

// تحميل الكلمات من GitHub
async function loadStoredWords() {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}`);
    wordBank = await response.json();
    renderWordsManagement();
  } catch (error) {
    console.error("❌ خطأ في تحميل بنك الكلمات:", error);
  }
}

// تحديث ملف words.json على GitHub
async function updateWordsOnGitHub(newWords) {
  try {
    // الحصول على المحتوى الحالي والـ sha الخاص به
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    const sha = data.sha;
    // ترميز المحتوى الجديد بصيغة Base64
    const updatedContent = btoa(JSON.stringify(newWords, null, 2));
    
    // إرسال الطلب باستخدام PUT لتحديث الملف
    const updateResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "تحديث بنك الكلمات من التطبيق",
        content: updatedContent,
        sha: sha
      })
    });
    
    if (updateResponse.ok) {
      alert("✅ تم تحديث بنك الكلمات على GitHub بنجاح!");
      loadStoredWords();
    } else {
      alert("❌ حدث خطأ أثناء تحديث بنك الكلمات على GitHub.");
    }
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث بنك الكلمات:", error);
  }
}

// عرض الكلمات في جدول إدارة بنك الكلمات
function renderWordsManagement() {
  const tableBody = document.getElementById("wordsTableBody");
  tableBody.innerHTML = "";
  wordBank.forEach((item, index) => {
    const row = document.createElement("tr");
    
    const wordCell = document.createElement("td");
    wordCell.textContent = item.word;
    row.appendChild(wordCell);
    
    const translationCell = document.createElement("td");
    translationCell.textContent = item.translation;
    row.appendChild(translationCell);
    
    const actionsCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "حذف";
    deleteBtn.className = "btn-red";
    deleteBtn.onclick = () => deleteWord(index);
    actionsCell.appendChild(deleteBtn);
    row.appendChild(actionsCell);
    
    tableBody.appendChild(row);
  });
}

// إضافة كلمة جديدة إلى بنك الكلمات
function addWord() {
  const englishInput = document.getElementById("englishInput").value.trim();
  const arabicInput = document.getElementById("arabicInput").value.trim();
  
  if (englishInput && arabicInput) {
    wordBank.push({ word: englishInput, translation: arabicInput });
    updateWordsOnGitHub(wordBank);
  } else {
    alert("يرجى إدخال الكلمة والترجمة.");
  }
}

// حذف كلمة من بنك الكلمات
async function deleteWord(index) {
  wordBank.splice(index, 1);
  await updateWordsOnGitHub(wordBank);
}

/* دوال الاختبار */

function startQuiz() {
  if (wordBank.length < 3) {
    alert("يجب أن يحتوي بنك الكلمات على 3 كلمات على الأقل للبدء في الاختبار.");
    return;
  }
  quizQuestions = shuffleArray([...wordBank]);
  currentQuizIndex = 0;
  quizScore = 0;
  correctCount = 0;
  wrongCount = 0;
  updateScoreCounter();
  document.getElementById("quizQuestionCounter").textContent = `السؤال: ${currentQuizIndex + 1} / ${quizQuestions.length}`;
  document.getElementById("quizScoreDisplay").textContent = `النتيجة: ${quizScore}`;
  showQuizQuestion();
}

function showQuizQuestion() {
  clearInterval(timerInterval);
  clearTimeout(timerTimeout);
  if (currentQuizIndex >= quizQuestions.length) {
    document.getElementById("quizFeedback").textContent = `انتهى الاختبار. نتيجتك: ${quizScore} من ${quizQuestions.length}`;
    return;
  }
  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizQuestionCounter").textContent = `السؤال: ${currentQuizIndex + 1} / ${quizQuestions.length}`;
  const currentQuestion = quizQuestions[currentQuizIndex];
  document.getElementById("quizEnglishWord").value = currentQuestion.word;
  
  // إعداد الخيارات: الإجابة الصحيحة مع خيارين خاطئين
  let options = [currentQuestion.translation];
  while (options.length < 3) {
    const randomOption = wordBank[Math.floor(Math.random() * wordBank.length)].translation;
    if (!options.includes(randomOption)) {
      options.push(randomOption);
    }
  }
  options = shuffleArray(options);
  const optionsContainer = document.getElementById("quizOptionsContainer");
  optionsContainer.innerHTML = "";
  options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "optionButton";
    btn.onclick = () => checkQuizAnswer(option);
    optionsContainer.appendChild(btn);
  });
  
  // بدء العد التنازلي للمهلة (10 ثوانٍ)
  timeLeft = 10;
  document.getElementById("quizTimerDisplay").textContent = `الوقت المتبقي: ${timeLeft} ثواني`;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("quizTimerDisplay").textContent = `الوقت المتبقي: ${timeLeft} ثواني`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
  timerTimeout = setTimeout(autoMarkWrong, 10000);
}

function autoMarkWrong() {
  const feedbackElem = document.getElementById("quizFeedback");
  const currentQuestion = quizQuestions[currentQuizIndex];
  feedbackElem.textContent = `❌ انتهت المهلة. الإجابة الصحيحة: ${currentQuestion.translation}`;
  wrongCount++;
  updateScoreCounter();
  currentQuizIndex++;
  clearInterval(timerInterval);
  setTimeout(showQuizQuestion, 1000);
}

function checkQuizAnswer(selectedOption) {
  clearTimeout(timerTimeout);
  clearInterval(timerInterval);
  const currentQuestion = quizQuestions[currentQuizIndex];
  const feedbackElem = document.getElementById("quizFeedback");
  if (selectedOption === currentQuestion.translation) {
    feedbackElem.textContent = "✅ صحيح!";
    quizScore++;
    correctCount++;
  } else {
    feedbackElem.textContent = `❌ خاطئ. الإجابة الصحيحة: ${currentQuestion.translation}`;
    wrongCount++;
  }
  updateScoreCounter();
  currentQuizIndex++;
  setTimeout(showQuizQuestion, 1000);
}

function updateScoreCounter() {
  document.getElementById("scoreCounter").textContent = `صحيحة: ${correctCount}, خاطئة: ${wrongCount}`;
  document.getElementById("quizScoreDisplay").textContent = `النتيجة: ${quizScore}`;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* دوال التنقل بين الواجهات */

function displayQuiz() {
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("wordBankContainer").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
  startQuiz();
}

function displayWordBank() {
  const password = prompt("يرجى إدخال كلمة السر:");
  if (password === "123") {
    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("quizContainer").style.display = "none";
    document.getElementById("wordBankContainer").style.display = "block";
    loadStoredWords();
  } else {
    alert("كلمة السر غير صحيحة!");
    displayHome();
  }
}

function displayHome() {
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("wordBankContainer").style.display = "none";
  document.getElementById("homeScreen").style.display = "block";
}

/* أحداث الأزرار */
document.getElementById("startQuizBtn").addEventListener("click", displayQuiz);
document.getElementById("manageWordsBtn").addEventListener("click", displayWordBank);
document.getElementById("quizBackBtn").addEventListener("click", displayHome);
document.getElementById("wordBankBackBtn").addEventListener("click", displayHome);
document.getElementById("addWordBtn").addEventListener("click", addWord);

/* عند تحميل الصفحة */
window.onload = () => {
  loadStoredWords();
  displayHome();
};