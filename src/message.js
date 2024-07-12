import randomSelection from "./utils.js";

let messageTimer;

function showMessage(text, timeout, priority) {
    if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) return;
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    if(text) text = randomSelection(text);//没显示就随机显示
    sessionStorage.setItem("waifu-text", priority);
    const tips = document.getElementById("waifu-tips");
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    messageTimer = setTimeout(() => {
        sessionStorage.removeItem("waifu-text");
        tips.classList.remove("waifu-tips-active");
    }, timeout);
}

export default showMessage;
