// ===== 用户资料管理 =====
const UserDataManager = {
  STORAGE_KEY: 'sharkbook_user_profile',
  MAX_LENGTH: 2000,
  
  async init() {
    const editor = document.getElementById('profileEditor');
    const charCount = document.getElementById('charCount');
    const saveBtn = document.getElementById('saveProfileBtn');
    const saveStatus = document.getElementById('saveStatus');
    
    if (!editor) return;
    
    // 加载已保存的内容
    const stored = await this.getStoredProfile();
    if (stored) {
      editor.value = stored;
      this.updateCharCount(editor.value.length);
    }
    
    // 监听输入，实时更新字数
    editor.addEventListener('input', () => {
      const len = editor.value.length;
      this.updateCharCount(len);
      
      // 超出限制时截断
      if (len > this.MAX_LENGTH) {
        editor.value = editor.value.substring(0, this.MAX_LENGTH);
        this.updateCharCount(this.MAX_LENGTH);
      }
    });
    
    // Save button
    saveBtn.addEventListener('click', async () => {
      await this.saveProfile(editor.value);
      saveStatus.textContent = '✓ Saved';
      saveStatus.className = 'save-status success';
      setTimeout(() => {
        saveStatus.textContent = '';
        saveStatus.className = 'save-status';
      }, 2000);
    });
  },
  
  updateCharCount(len) {
    const charCount = document.getElementById('charCount');
    charCount.textContent = `${len} / ${this.MAX_LENGTH}`;
    charCount.classList.toggle('warning', len >= this.MAX_LENGTH * 0.9);
  },
  
  async getStoredProfile() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || '';
    } catch (e) {
      console.warn('Failed to get stored profile:', e);
      return '';
    }
  },
  
  async saveProfile(content) {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: content });
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }
};
