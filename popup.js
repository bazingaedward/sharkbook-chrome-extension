// 1. 截图功能
document.getElementById('screenshotBtn').addEventListener('click', () => {
  console.log("Starting screenshot capture...");
  
  // 使用 captureVisibleTab 截取当前窗口可视区域
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
    if (chrome.runtime.lastError) {
      console.error("Screenshot error:", chrome.runtime.lastError.message);
      alert("截图失败，请在控制台查看错误信息");
      return;
    }
    
    console.log("=== SCREENSHOT DATA (Base64) ===");
    console.log(dataUrl);
    console.log("================================");
    
    // 为了方便用户感知，我们可以简单的打印到 console，也可以弹窗提示
    alert("截图成功！数据已打印到 Popup 控制台 (请右键插件图标 -> 审查弹出内容 -> Console)");
  });
});

// 2. 查询页面 Input 功能
document.getElementById('listInputsBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error("No active tab found");
      return;
    }

    // 发送消息给 content script
    chrome.tabs.sendMessage(tab.id, { action: "LIST_PAGE_INPUTS" }, (response) => {
      // 检查连接错误（例如 content script 还没加载）
      if (chrome.runtime.lastError) {
        console.error("Message error:", chrome.runtime.lastError.message);
        alert("无法连接到页面。请尝试刷新页面后再试。");
      }
    });

  } catch (err) {
    console.error("Unexpected error:", err);
  }
});

