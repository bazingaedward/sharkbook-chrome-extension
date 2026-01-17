// ===== Tab 切换管理 =====
const TabManager = {
  STORAGE_KEY: 'sharkbook_active_tab',
  
  async init() {
    // 恢复上次选择的 Tab
    const stored = await this.getStoredTab();
    if (stored) {
      this.switchTo(stored);
    }
    
    // 绑定 Tab 点击事件
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        this.switchTo(tabId);
        this.saveTab(tabId);
      });
    });
  },
  
  switchTo(tabId) {
    // 更新 Tab 按钮状态
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // 更新 Tab 内容区域
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
  },
  
  async getStoredTab() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || null;
    } catch (e) {
      return null;
    }
  },
  
  async saveTab(tabId) {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: tabId });
    } catch (e) {
      console.warn('Failed to save tab:', e);
    }
  }
};
