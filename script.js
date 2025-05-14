/* إعدادات GitHub API */
const repoOwner = "HosaamMad";  
const repoName = "engli";         
const filePath = "words.json";

// استخدام التوكن المخزن في GitHub Secrets
const token = process.env.GITHUB_TOKEN || "YOUR_FALLBACK_TOKEN"; 

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

// تحديث `words.json` عبر GitHub API
async function updateWordsOnGitHub(newWords) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { "Authorization": `token ${token}` }
    });
    
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

    alert("✅ تم تحديث بنك الكلمات بنجاح!");
    loadStoredWords();
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث بنك الكلمات:", error);
    alert("⚠️ تحقق من إعدادات التوكن والمستودع.");
  }
}

// إضافة كلمة جديدة
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

// حذف كلمة
async function deleteWord(index) {
  wordBank.splice(index, 1);
  await updateWordsOnGitHub(wordBank);
}

// ربط الأزرار بالأحداث
document.getElementById("startQuizBtn").addEventListener("click", displayQuiz);
document.getElementById("manageWordsBtn").addEventListener("click", displayWordBank);
document.getElementById("wordBankBackBtn").addEventListener("click", displayHome);
document.getElementById("addWordBtn").addEventListener("click", addWord);

window.onload = loadStoredWords;
