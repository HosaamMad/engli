const repoOwner = "HosaamMad"; // اسم مستخدم GitHub
const repoName = "engli";       // اسم المستودع
const filePath = "words.json";

// استدعاء التوكن المخزن في GitHub Secrets عبر بيئة التشغيل
const token = process.env.GITHUB_TOKEN;

let wordBank = [];

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

// تحديث `words.json` على GitHub
async function updateWordsOnGitHub(newWords) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { "Authorization": `token ${token}` }
    });

    if (!response.ok) {
      throw new Error("⚠️ فشل المصادقة، تأكد من صحة التوكن.");
    }

    const data = await response.json();
    const sha = data.sha;
    const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(newWords, null, 2))));

    const updateResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: "PUT",
      headers: { "Authorization": `token ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "🚀 تحديث بنك الكلمات من التطبيق",
        content: updatedContent,
        sha: sha
      })
    });

    if (!updateResponse.ok) {
      throw new Error("⚠️ فشل تحديث البيانات، تحقق من الصلاحيات.");
    }

    alert("✅ تم تحديث بنك الكلمات بنجاح!");
    loadStoredWords();
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث بنك الكلمات:", error);
    alert("⚠️ تحقق من إعدادات التوكن والمستودع.");
  }
}

// عرض الكلمات في واجهة إدارة بنك الكلمات
function renderWordsManagement() {
  const wordsList = document.getElementById("wordsList");
  wordsList.innerHTML = "";
  wordBank.forEach(({ word, translation }) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${word} - ${translation}`;
    wordsList.appendChild(listItem);
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

// التنقل بين الواجهات
document.getElementById("startQuizBtn").addEventListener("click", () => {
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
});

document.getElementById("manageWordsBtn").addEventListener("click", () => {
  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("wordBankContainer").style.display = "block";
  loadStoredWords();
});

document.getElementById("quizBackBtn").addEventListener("click", () => {
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("homeScreen").style.display = "block";
});

document.getElementById("wordBankBackBtn").addEventListener("click", () => {
  document.getElementById("wordBankContainer").style.display = "none";
  document.getElementById("homeScreen").style.display = "block";
});

document.getElementById("addWordBtn").addEventListener("click", addWord);

window.onload = loadStoredWords;
