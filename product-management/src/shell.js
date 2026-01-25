import readline from "readline";
import fs from "fs";
import {
  saveDraft,
  listDrafts,
  getDraft,
  updateDraft,
  deleteDraft,
  setActive,
  getActive
} from "./store.js";
import { runPM } from "./agents/pm.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "pm> "
});

let refineMode = false;
let draftCache = null;
let activeDraftId = null;

/* ---------------- UI ---------------- */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

function formatPMOutput(text) {
  let formatted = text;
  
  formatted = formatted.replace(/^#\s+(.+)$/gm, `${colors.cyan}${colors.bright}# $1${colors.reset}`);
  formatted = formatted.replace(/^##\s+(.+)$/gm, `${colors.blue}${colors.bright}## $1${colors.reset}`);
  formatted = formatted.replace(/^\*\*([^*]+)\*\*:/gm, `${colors.yellow}${colors.bright}$1:${colors.reset}`);
  formatted = formatted.replace(/^- \[ \]/gm, `${colors.dim}- [ ]${colors.reset}`);
  formatted = formatted.replace(/^- \[x\]/gi, `${colors.green}- [x]${colors.reset}`);
  formatted = formatted.replace(/^Priority:\s*(P\d)/gm, `${colors.magenta}Priority: $1${colors.reset}`);
  formatted = formatted.replace(/^Effort:\s*(.+)$/gm, `${colors.cyan}Effort: $1${colors.reset}`);
  
  return formatted;
}

function printPMDraft(draft) {
  console.log(`\n${colors.bgBlue}${colors.white}${colors.bright} ═══════════════════════════════════════════════════════════════ ${colors.reset}`);
  console.log(`${colors.bgBlue}${colors.white}${colors.bright}  PM DRAFT OUTPUT                                                      ${colors.reset}`);
  console.log(`${colors.bgBlue}${colors.white}${colors.bright} ═══════════════════════════════════════════════════════════════ ${colors.reset}\n`);
  console.log(formatPMOutput(draft));
  console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
}

function updatePrompt() {
  if (refineMode) {
    if (activeDraftId) {
      rl.setPrompt(`💬 ${colors.cyan}${colors.bright}pm:${colors.reset}${colors.yellow}${colors.bright}${activeDraftId}${colors.reset}${colors.cyan}${colors.bright}>${colors.reset} `);
    } else {
      rl.setPrompt(`💬 ${colors.dim}pm>${colors.reset} `);
    }
  } else if (activeDraftId) {
    rl.setPrompt(`${colors.cyan}${colors.bright}pm:${colors.reset}${colors.yellow}${colors.bright}${activeDraftId}${colors.reset}${colors.cyan}${colors.bright}>${colors.reset} `);
  } else {
    rl.setPrompt(`${colors.dim}pm>${colors.reset} `);
  }
}

function prompt() {
  updatePrompt();
  rl.prompt();
}

function getDraftTitle(content) {
  if (!content) return "Boş draft";
  
  const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    if (line.startsWith("# ")) {
      return line.substring(2).trim();
    }
    if (line.startsWith("## ")) {
      continue;
    }
    if (line.startsWith("**") && line.includes(":")) {
      continue;
    }
    if (line.startsWith("- [") || line.startsWith("- ")) {
      continue;
    }
    if (line.length > 0 && !line.startsWith("#")) {
      return line.substring(0, 50) + (line.length > 50 ? "..." : "");
    }
  }
  
  return "Başlıksız draft";
}

function showAvailableCommands() {
  if (!activeDraftId) {
    console.log(`
📋 Kullanılabilir komutlar:
/new              → yeni feature
/list             → draftlar
/select <numara>  → draft seç
/help             → yardım
/exit             → çıkış
`);
  } else {
    console.log(`
📋 Kullanılabilir komutlar:
/show             → aktif draft
/talk             → draftı tartış
/clear            → aktif draftı sil
/export           → markdown export
/new              → yeni feature
/list             → draftlar
/select <numara>  → draft seç
/help             → yardım
/exit             → çıkış
`);
  }
}

function help() {
  showAvailableCommands();
}

function spinner(msg) {
  const frames = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
  let i = 0;
  const t = setInterval(() => {
    process.stdout.write(`\r${frames[i++ % frames.length]} ${msg}...`);
  }, 80);

  return () => {
    clearInterval(t);
    process.stdout.write("\r");
  };
}

/* ------------- UTILS ---------------- */

function shortId() {
  return Math.random().toString(36).substring(2, 8);
}

/* ------------ COMMANDS -------------- */

function exit() {
  console.log("👋");
  rl.close();
  process.exit(0);
}

async function cmdNew() {
  console.log("\n📝 Yeni issue oluştur\n");
  
  let issueType = null;
  let parentIssue = null;
  let description = null;
  
  const askIssueType = () => {
    return new Promise((resolve) => {
      console.log("Issue type seçin:");
      console.log("[1] Epic");
      console.log("[2] Story");
      console.log("[3] Bug");
      console.log("[4] Task");
      console.log("[5] Enhancement");
      rl.question("\n> Issue type (1-5): ", (answer) => {
        const num = parseInt(answer.trim());
        const types = { 1: "epic", 2: "story", 3: "bug", 4: "task", 5: "enhancement" };
        if (types[num]) {
          issueType = types[num];
          resolve();
        } else {
          console.log(`${colors.red}❌ Geçersiz seçim. 1-5 arası bir sayı girin.${colors.reset}`);
          askIssueType().then(resolve);
        }
      });
    });
  };

  const askParentIssue = () => {
    return new Promise((resolve) => {
      if (issueType === "story") {
        rl.question("> Parent issue (GitHub issue ID, optional, boş bırakabilirsiniz): ", (answer) => {
          const trimmed = answer.trim();
          if (trimmed) {
            parentIssue = trimmed;
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  const askDescription = () => {
    return new Promise((resolve) => {
      console.log("\n> Describe issue:");
      rl.question("", (answer) => {
        const trimmed = answer.trim();
        if (trimmed === "/exit") {
          exit();
          return;
        }
        if (!trimmed) {
          console.log(`${colors.red}❌ Açıklama boş olamaz.${colors.reset}`);
          askDescription().then(resolve);
        } else {
          description = trimmed;
          resolve();
        }
      });
    });
  };

  const processWithPM = async () => {
    let currentDescription = description;
    let context = "";
    
    while (true) {
      const inputForPM = `Issue Type: ${issueType}${parentIssue ? `\nParent Issue: #${parentIssue}` : ""}\n\nDescription: ${currentDescription}${context ? `\n\nPrevious context: ${context}` : ""}`;
      
      const stop = spinner("PM değerlendiriyor");
      let draft = await runPM(inputForPM);
      stop();

      if (draft.includes("[ASK_USER:")) {
        const match = draft.match(/\[ASK_USER:\s*([^\]]+)\]/);
        if (match) {
          const question = match[1].trim();
          const answer = await new Promise((resolve) => {
            rl.question(`\n${colors.yellow}${colors.bright}❓ PM soruyor:${colors.reset} ${question}\n${colors.cyan}> Cevap:${colors.reset} `, (ans) => {
              resolve(ans.trim());
            });
          });
          
          if (answer === "/exit") {
            exit();
            return;
          }
          
          context += `\nQ: ${question}\nA: ${answer}`;
          continue;
        }
      }

      const rejectionPatterns = [
        /cannot create/i,
        /meaningless/i,
        /unclear/i,
        /not enough information/i,
        /please provide/i,
        /please clarify/i,
        /need more context/i
      ];

      const isRejection = rejectionPatterns.some(pattern => pattern.test(draft)) && 
                         !draft.includes("# ") && 
                         !draft.includes("## ");

      if (isRejection) {
        console.log(`\n${colors.yellow}${colors.bright}⚠️  PM:${colors.reset}`);
        console.log(formatPMOutput(draft));
        console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
        console.log(`${colors.red}Draft oluşturulmadı.${colors.reset} ${colors.dim}Lütfen daha açıklayıcı bir istek girin.${colors.reset}`);
        break;
      }

      const id = shortId();
      saveDraft(id, draft);
      setActive(id);
      activeDraftId = id;
      updatePrompt();

      printPMDraft(draft);
      console.log(`${colors.green}${colors.bright}✅ Draft hazır!${colors.reset} ${colors.dim}ID: ${id}${colors.reset}`);
      break;
    }
    
    prompt();
  };

  await askIssueType();
  await askParentIssue();
  await askDescription();
  await processWithPM();
}

function cmdList() {
  const ds = listDrafts();
  if (!ds.length) {
    console.log(`${colors.yellow}📭 Draft yok.${colors.reset}`);
    if (!activeDraftId) {
      showAvailableCommands();
    }
    return;
  }

  draftCache = ds;
  ds.forEach((d, index) => {
    const num = index + 1;
    const star = d.id === activeDraftId ? " ⭐" : "";
    const title = getDraftTitle(d.content);
    console.log(`${num}. ${title} | ${d.status} | ${d.createdAt}${star}`);
  });
  console.log(`\n💡 /select <numara> ile seçebilirsin (örn: /select 1)`);
}

function cmdSelect(id) {
  if (!id) {
    console.log(`${colors.red}❌ Numara ver. (örn: /select 1)${colors.reset}`);
    return;
  }

  const num = parseInt(id);
  if (isNaN(num) || num < 1) {
    console.log(`${colors.red}❌ Geçerli bir numara ver. (örn: /select 1)${colors.reset}`);
    return;
  }

  if (!draftCache || draftCache.length === 0) {
    console.log(`${colors.red}❌ Önce /list ile draftları listele.${colors.reset}`);
    return;
  }

  if (num > draftCache.length) {
    console.log(`${colors.red}❌ ${draftCache.length} draft var. 1-${draftCache.length} arası seç.${colors.reset}`);
    return;
  }

  const selectedDraft = draftCache[num - 1];
  const d = getDraft(selectedDraft.id);
  
  if (!d) {
    console.log(`${colors.red}❌ Draft bulunamadı.${colors.reset}`);
    return;
  }

  activeDraftId = selectedDraft.id;
  setActive(selectedDraft.id);
  updatePrompt();
  const title = getDraftTitle(d.content);
  console.log(`${colors.green}${colors.bright}✅ Aktif:${colors.reset} ${title}`);
  showAvailableCommands();
}

function cmdShow() {
  if (!activeDraftId) {
    console.log(`${colors.red}❌ Aktif draft yok.${colors.reset}`);
    showAvailableCommands();
    return;
  }

  const d = getDraft(activeDraftId);
  console.log(`\n${colors.bgCyan}${colors.black}${colors.bright} ═══════════════════════════════════════════════════════════════ ${colors.reset}`);
  console.log(`${colors.bgCyan}${colors.black}${colors.bright}  ACTIVE DRAFT                                                          ${colors.reset}`);
  console.log(`${colors.bgCyan}${colors.black}${colors.bright} ═══════════════════════════════════════════════════════════════ ${colors.reset}\n`);
  console.log(formatPMOutput(d.content));
  console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
}

function cmdClear() {
  if (!activeDraftId) {
    console.log(`${colors.red}❌ Aktif draft yok.${colors.reset}`);
    return;
  }

  const d = getDraft(activeDraftId);
  const title = getDraftTitle(d.content);
  
  deleteDraft(activeDraftId);
  setActive(null);
  activeDraftId = null;
  updatePrompt();
  
  console.log(`${colors.magenta}🗑 Silindi:${colors.reset} ${title}`);
  showAvailableCommands();
}

function cmdExport() {
  if (!activeDraftId) {
    console.log(`${colors.red}❌ Aktif draft yok.${colors.reset}`);
    showAvailableCommands();
    return;
  }

  const d = getDraft(activeDraftId);
  const path = `draft-${activeDraftId}.md`;
  fs.writeFileSync(path, d.content);
  const title = getDraftTitle(d.content);
  console.log(`${colors.cyan}📄 Kaydedildi:${colors.reset} ${path} ${colors.dim}(${title})${colors.reset}`);
}

/* ------------ REFINE MODE ----------- */

async function refine(input) {
  if (!activeDraftId) {
    console.log(`${colors.red}❌ Draft seç.${colors.reset}`);
    refineMode = false;
    return;
  }

  const base = getDraft(activeDraftId).content;

  const stop = spinner("PM değerlendiriyor");

  const updated = await runPM(`
You are reviewing a draft issue. A customer has provided feedback.

CURRENT DRAFT:
${base}

CUSTOMER FEEDBACK:
${input}

YOUR ROLE AS PM:
- You are a protective Product Manager, not a yes-man
- Evaluate the feedback critically
- If the feedback improves the issue (clarity, completeness, business value), incorporate it and output the IMPROVED draft
- If the feedback doesn't add value, output the ORIGINAL draft unchanged
- NEVER write "Improved Draft", "No changes made", or explanatory text about your decision
- NEVER add meta-commentary like "However, if the customer..." or "Please let me know..."
- Output ONLY the actual GitHub issue content - nothing else
- If you keep the original, output it exactly as is
- If you improve it, output the improved version directly

CRITICAL: Your output must be a valid GitHub issue in the standard format. No explanations, no meta-text, just the issue itself.
  `);

  stop();

  updateDraft(activeDraftId, updated);

  console.log(`\n${colors.bgMagenta}${colors.white}${colors.bright} ═══════════════════════════════════════════════════════════════ ${colors.reset}`);
  console.log(`${colors.bgMagenta}${colors.white}${colors.bright}  PM UPDATED DRAFT                                                      ${colors.reset}`);
  console.log(`${colors.bgMagenta}${colors.white}${colors.bright} ═══════════════════════════════════════════════════════════════ ${colors.reset}\n`);
  console.log(formatPMOutput(updated));
  console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
}

/* ------------ MAIN ------------------ */

console.clear();

activeDraftId = null;
setActive(null);
updatePrompt();

console.log(`${colors.cyan}${colors.bright}🧠 PM hazır.${colors.reset}`);
showAvailableCommands();

prompt();

rl.on("line", async (line) => {
  const input = line.trim();

  if (!input) {
    prompt();
    return;
  }

  // EXIT - her zaman çalışmalı
  if (input === "/exit") {
    exit();
    return;
  }

  // REFINE MODE
  if (refineMode) {
    if (input === "/exit") {
      exit();
      return;
    }
    if (input === "/back" || input === "/cancel") {
      refineMode = false;
      updatePrompt();
      console.log(`${colors.yellow}💬 Talk mode'dan çıkıldı.${colors.reset}`);
      prompt();
      return;
    }
    if (input.startsWith("/")) {
      console.log(`${colors.red}❌ Talk mode'da sadece /back veya /exit kullanabilirsiniz.${colors.reset}`);
      prompt();
      return;
    }
    await refine(input);
    prompt();
    return;
  }

  // "/" zorunlu
  if (!input.startsWith("/")) {
    console.log(`${colors.red}❌ Komutlar / ile başlar.${colors.reset}`);
    prompt();
    return;
  }

  const [cmd, ...args] = input.slice(1).split(" ");

  switch (cmd) {

    case "help":
      help();
      break;

    case "new":
      await cmdNew();
      return;

    case "list":
      cmdList();
      break;

    case "select":
      cmdSelect(args[0]);
      break;

    case "show":
      cmdShow();
      break;

    case "clear":
      cmdClear();
      break;

    case "export":
      cmdExport();
      break;

    case "talk":
      if (!activeDraftId) {
        console.log(`${colors.red}❌ Aktif draft yok.${colors.reset}`);
        showAvailableCommands();
      } else {
        refineMode = true;
        updatePrompt();
        console.log(`${colors.magenta}${colors.bright}💬 Talk mode aktif.${colors.reset} Geri bildirim ver, ${colors.cyan}/back${colors.reset} ile çık, ${colors.cyan}/exit${colors.reset} ile uygulamadan çık.`);
      }
      break;

    case "exit":
      exit();
      return;

    default:
      console.log(`${colors.red}❌ Bilinmeyen.${colors.reset} ${colors.dim}/help${colors.reset}`);
  }

  prompt();
});
