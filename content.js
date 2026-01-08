
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "LIST_PAGE_INPUTS") {
    console.log("=== Listing All Page Inputs ===");
    
    // 获取 input 和 textarea
    const inputs = document.querySelectorAll('input, textarea');
    
    // 转换为更易读的对象数组
    const inputData = Array.from(inputs).map((el, index) => {
      return {
        index: index,
        tag: el.tagName.toLowerCase(),
        type: el.type || 'text',
        id: el.id || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        value: el.value || '',
        isVisible: el.offsetParent !== null // 简单检查元素是否可见
      };
    });

    console.table(inputData); // 使用表格形式打印，非常清晰
    console.log("Detailed List:", inputData);
    console.log("================================");
    
    alert(`已在控制台打印了 ${inputs.length} 个输入框信息。请按 F12 查看 Console。`);
  }
});
