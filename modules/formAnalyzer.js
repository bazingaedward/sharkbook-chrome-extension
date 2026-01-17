// ===== Form Analyzer =====
const FormAnalyzer = {
  init() {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) return;
    
    startBtn.addEventListener('click', () => this.analyze());
  },

  showLoading(statusEl, message) {
    statusEl.innerHTML = `<span class="loading"><span class="spinner"></span>${message}</span>`;
  },
  
  async analyze() {
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('startBtn');
    const resultsArea = document.getElementById('resultsArea');
    const inputsList = document.getElementById('inputsList');
    
    startBtn.disabled = true;
    resultsArea.classList.add('hidden');
    this.showLoading(statusEl, 'Scanning page inputs...');
  
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
      this.showLoading(statusEl, `Found ${response.data.length} inputs. Asking AI...`);
      
      const aiResponse = await this.askAI(response.data);
      
      // 4. Render results
      this.renderResults(aiResponse);
      
      statusEl.innerText = 'Analysis complete. Edit values if needed.';
      resultsArea.classList.remove('hidden');
      
      // Store data for filling - use currentResults which may be edited
      document.getElementById('fillBtn').onclick = () => this.fillPage(tab.id, this.currentResults);
  
    } catch (err) {
      console.error(err);
      statusEl.innerText = 'Error: ' + err.message;
    } finally {
      startBtn.disabled = false;
    }
  },
  
  async fillPage(tabId, dataWithValues) {
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
  },
  
  // Store current results for editing
  currentResults: [],

  renderResults(data) {
    this.currentResults = [...data];
    const container = document.getElementById('inputsList');
    container.innerHTML = '';
    
    data.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'input-item';
      div.dataset.index = index;
      div.innerHTML = `
        <div class="input-item-header">
          <label>${item.label || item.name || item.id}</label>
          <div class="input-item-actions">
            <button class="btn-edit" title="Edit" data-index="${index}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-delete" title="Delete" data-index="${index}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <input type="text" class="val-input" value="${this.escapeHtml(item.value)}" data-index="${index}" />
      `;
      container.appendChild(div);
    });

    // Bind events
    this.bindResultEvents(container);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  bindResultEvents(container) {
    // Handle input changes
    container.querySelectorAll('.val-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.currentResults[index].value = e.target.value;
      });
    });

    // Handle delete
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.deleteResult(index);
      });
    });
  },

  deleteResult(index) {
    this.currentResults.splice(index, 1);
    this.renderResults(this.currentResults);
    
    // Update status
    const statusEl = document.getElementById('status');
    if (this.currentResults.length === 0) {
      document.getElementById('resultsArea').classList.add('hidden');
      statusEl.innerText = 'All fields removed.';
    }
  },
  
  async askAI(inputs) {
    // 获取用户个人资料
    const userProfile = await UserDataManager.getStoredProfile();
    
    // Construct a prompt for the AI
    const simplifiedInputs = inputs.map(i => ({
      id: i.id,
      label: i.label,
      name: i.name,
      placeholder: i.placeholder,
      currentValue: i.value
    }));

    // 构建包含用户资料的 prompt
    let userContext = '';
    if (userProfile && userProfile.trim()) {
      userContext = `
User Profile (use this information to fill the form):
${userProfile}

`;
    }

    const prompt = `You are a helpful automated assistant that fills out web forms.
${userContext}Analyze the following form inputs and provide realistic, context-aware values for them.
  
  Inputs:
  ${JSON.stringify(simplifiedInputs, null, 2)}
  
  Instructions:
  1. Return a VALID JSON object.
  2. The keys must be the input IDs provided in the list.
  3. The values should be the suggested content for that input.
  4. Do not include any explanation or markdown formatting (like \`\`\`json).
  5. If user profile is provided, use that information to fill matching fields.
  6. If an input seems to be for searching, provide a relevant search term.
  7. If an input is a comment section, provide a polite, generic comment.
  
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
};
