
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "LIST_PAGE_INPUTS") {
    console.log("=== Listing All Page Inputs ===");
    
    // 获取 input 和 textarea
    const inputs = document.querySelectorAll('input, textarea');
    
    // 转换为更易读的对象数组
    const inputData = Array.from(inputs).map((el, index) => {
      // 为没有 ID 的元素生成临时 ID，方便后续定位
      if (!el.id) {
        el.id = `sb-temp-id-${index}`;
      }
      return {
        index: index,
        tag: el.tagName.toLowerCase(),
        type: el.type || 'text',
        id: el.id,
        name: el.name || '',
        placeholder: el.placeholder || '',
        label: getLabelForElement(el), // 尝试获取标签文本
        value: el.value || '',
        isVisible: el.offsetParent !== null // 简单检查元素是否可见
      };
    }).filter(item => item.isVisible && item.type !== 'hidden' && item.type !== 'submit' && item.type !== 'button'); // 过滤掉不可见、隐藏域和按钮

    console.table(inputData);
    sendResponse({ success: true, data: inputData });
  }

  if (request.action === "FILL_PAGE_INPUTS") {
    console.log("=== Filling Page Inputs ===");
    const { data } = request;
    
    let successCount = 0;
    data.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.value = item.value;
        // 触发 input 事件以通知现代框架 (如 React/Vue) 数据已更改
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        successCount++;
      }
    });
    
    sendResponse({ success: true, count: successCount });
  }
});

// 辅助函数：尝试获取 input 对应的 label
function getLabelForElement(el) {
  let labelText = '';
  // 1. Check for label tag with 'for' attribute
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) labelText = label.innerText;
  }
  // 2. Check closest parent label
  if (!labelText) {
    const parentLabel = el.closest('label');
    if (parentLabel) labelText = parentLabel.innerText;
  }
  // 3. Fallback to specific attributes
  if (!labelText) {
    labelText = el.getAttribute('aria-label') || el.placeholder || el.name || '';
  }
  return labelText.trim();
}
