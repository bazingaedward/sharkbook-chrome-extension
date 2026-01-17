// ===== 主题管理系统 =====
const ThemeManager = {
  STORAGE_KEY: 'sharkbook_theme',
  
  // 初始化主题
  async init() {
    // 1. 尝试从存储中读取用户偏好
    const stored = await this.getStoredTheme();
    
    if (stored) {
      this.applyTheme(stored);
    } else {
      // 2. 读取系统主题偏好
      const systemTheme = this.getSystemTheme();
      this.applyTheme(systemTheme);
    }
    
    // 3. 监听系统主题变化
    this.watchSystemTheme();
    
    // 4. 绑定切换按钮事件
    this.bindToggleButton();
  },
  
  // 获取系统主题
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  // 获取存储的主题
  async getStoredTheme() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || null;
    } catch (e) {
      console.warn('Failed to get stored theme:', e);
      return null;
    }
  },
  
  // 保存主题到存储
  async saveTheme(theme) {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: theme });
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  },
  
  // 应用主题
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
  },
  
  // 切换主题
  async toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    await this.saveTheme(newTheme);
  },
  
  // 监听系统主题变化
  watchSystemTheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
      // 只有在用户没有手动设置主题时才跟随系统
      const stored = await this.getStoredTheme();
      if (!stored) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  },
  
  // 绑定主题切换按钮
  bindToggleButton() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }
};
