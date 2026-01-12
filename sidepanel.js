
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
      const response = await fetch('https://sharkbook.org/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });
      console.log('AI API raw response:', response);

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status}`);
      }

      // Handle Vercel AI SDK response which might be a stream or plain text
      // We will attempt to read the full text and parse the JSON from it.
      // Note: If the API returns a Vercel stream-data format (0:"..."), this naive parsing might fail
      // without a stream decoder, but for "start implementation" we assume standard text/json content 
      // or that we can regex extract the JSON.
      const rawText = await response.text();
      let jsonStr = rawText;

      // Basic cleanup to extract JSON if embedded in text or markdown
      const jsonBlockMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[0];
      }

      // Attempt to parse validation
      let suggestions = {};
      try {
        suggestions = JSON.parse(jsonStr);
      } catch (e) {
        // If simple parse fails, try to clean Vercel stream artifacts if visible (e.g. 0:"{")
        // preventing complex stream parsing logic for this MVP step unless requested.
        console.warn("Direct JSON parse failed, raw response:", rawText);
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
