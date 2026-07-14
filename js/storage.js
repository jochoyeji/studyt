/**
 * storage.js
 * LocalStorage 데이터 입출력을 안전하게 관리하는 독립 모듈입니다.
 */
(function() {
    const AppStorage = {
        // 데이터 저장
        save(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Storage 저장 실패:', e);
                return false;
            }
        },
        
        // 데이터 불러오기
        get(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Storage 불러오기 실패:', e);
                return null;
            }
        }
    };

    // 전역에서 사용할 수 있도록 공유
    window.AppStorage = AppStorage;
})();
