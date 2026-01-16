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

// 初始化主题
ThemeManager.init();

// ===== 表单分析功能 =====
document.getElementById('startBtn').addEventListener('click', async () => {
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    const resultsArea = document.getElementById('resultsArea');
    const inputsList = document.getElementById('inputsList');
    
    startBtn.disabled = true;
    resultsArea.classList.add('hidden');
    statusEl.innerText = 'Scanning page inputs...';
  
    try {
      // 1. Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error("No active tab found");
      }
  
      // 2. Request inputs from content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: "LIST_PAGE_INPUTS" });
      
      if (!response || !response.success || response.data.length === 0) {
        statusEl.innerText = 'No inputs found on this page.';
        startBtn.disabled = false;
        return;
      }
  
      // 3. AI Processing
      statusEl.innerText = `Found ${response.data.length} inputs. Asking AI...`;
      
      const aiResponse = await askAI(response.data);
      
      // 4. Render results
      renderResults(aiResponse);
      
      statusEl.innerText = 'Analysis complete.';
      resultsArea.classList.remove('hidden');
      
      // Store data for filling
      document.getElementById('fillBtn').onclick = () => fillPage(tab.id, aiResponse);
  
    } catch (err) {
      console.error(err);
      statusEl.innerText = 'Error: ' + err.message;
    } finally {
      startBtn.disabled = false;
    }
  });
  
  async function fillPage(tabId, dataWithValues) {
    const statusEl = document.getElementById('status');
    statusEl.innerText = 'Filling inputs...';
    try {
      const resp = await chrome.tabs.sendMessage(tabId, { 
        action: "FILL_PAGE_INPUTS", 
        data: dataWithValues 
      });
      statusEl.innerText = `Success! Filled ${resp.count} fields.`;
    } catch (err) {
      statusEl.innerText = 'Fill Error: ' + err.message;
    }
  }
  
  function renderResults(data) {
    const container = document.getElementById('inputsList');
    container.innerHTML = '';
    
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'input-item';
      div.innerHTML = `
        <label>${item.label || item.name || item.id}</label>
        <div class="val-preview">AI: "${item.value}"</div>
      `;
      container.appendChild(div);
    });
  }
  
  // === AI FUNCTION ===
  async function askAI(inputs) {
    // Construct a prompt for the AI
    const simplifiedInputs = inputs.map(i => ({
      id: i.id,
      label: i.label,
      name: i.name,
      placeholder: i.placeholder,
      currentValue: i.value
    }));

    const prompt = `You are a helpful automated assistant that fills out web forms.
  Analyze the following form inputs and provide realistic, context-aware values for them.
  
  Inputs:
  ${JSON.stringify(simplifiedInputs, null, 2)}
  
  Instructions:
  1. Return a VALID JSON object.
  2. The keys must be the input IDs provided in the list.
  3. The values should be the suggested content for that input.
  4. Do not include any explanation or markdown formatting (like \`\`\`json).
  5. If an input seems to be for searching, provide a relevant search term.
  6. If an input is a comment section, provide a polite, generic comment.
  
  Example Response Format:
  {
    "input-123": "John Doe",
    "email-id": "john@example.com"
  }`;

    try {
      // Generate random IDs for the request
      const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const response = await fetch('https://sharkbook.org/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: generateId(),
          messages: [
            { 
              role: 'user', 
              parts: [
                { type: 'text', text: prompt }
              ],
              id: generateId()
            }
          ],
          trigger: 'submit-message'
        })
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status}`);
      }

      // Parse the API response JSON
      const result = await response.json();
      console.log('AI API result:', result);
      
      // Extract the text field which contains the AI-generated JSON string
      let jsonStr = result.text || '';

      // Basic cleanup to extract JSON if embedded in text or markdown
      const jsonBlockMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[0];
      }

      // Attempt to parse validation
      let suggestions = {};
      try {
        suggestions = JSON.parse(jsonStr);
      } catch (e) {
        console.warn("Direct JSON parse failed, raw text:", result.text);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Map back to inputs
      return inputs.map(input => ({
        ...input,
        value: suggestions[input.id] || input.value || ''
      }));

    } catch (error) {
      console.error('AI Processing Error:', error);
      throw error;
    }
  }
