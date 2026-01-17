// ===== Sidepanel 主入口 =====
// 初始化所有管理器
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  TabManager.init();
  UserDataManager.init();
  FormAnalyzer.init();
});
