chrome.runtime.onInstalled.addListener(() => {
  console.log('Sharkbook Extension installed');
});

// 点击扩展图标时自动打开侧边栏
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Failed to set panel behavior:', error));
