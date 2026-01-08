
// 3. 打开侧边栏 AI 助手
document.getElementById('openSidePanelBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      // Chrome 114+ 支持直接打开侧边栏
      if (chrome.sidePanel && chrome.sidePanel.open) {
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close(); // 打开后关闭 Popup
      } else {
        alert("您的 Chrome 版本不支持 Side Panel API，请手动从浏览器菜单打开。");
      }
    }
  } catch (err) {
    console.error("Side Panel error:", err);
    alert("无法打开侧边栏：" + err.message);
  }
});
