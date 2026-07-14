/**
 * records.js
 * 공부 기록 계산, 성취도 도출 및 연속 달성률 통계를 관리합니다.
 */
(function() {
    // LocalStorage Key
    const STORAGE_KEY = 'study_records';
    const TIMETABLE_KEY = 'timetable';
    const SETTINGS_KEY = 'settings';

    // 기본 설정 등급 기준 (4단계에서 수정 가능하도록 연동 예정)
    const defaultSettings = [
        { score: 95, grade: 'SS', reward: '-' },
        { score: 85, grade: 'S', reward: '-' },
        { score: 70, grade: 'A', reward: '-' },
        { score: 60, grade: 'B', reward: '-' },
        { score: 50, grade: 'C', reward: '-' },
        { score: 40, grade: 'D', reward: '-' }
    ];

    const StudyRecords = {
        // 특정 날짜의 공부 가능 시간(분)을 시간표 데이터에서 계산하여 가져옴
        getAvailableTime(dateStr) {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)
            
            const timetable = window.AppStorage.get(TIMETABLE_KEY) || {};
            const daySlots = timetable[dayOfWeek] || [];
            
            // 시간표 시각 데이터를 분 단위 합계로 계산
            let totalMinutes = 0;
            daySlots.forEach(slot => {
                if (slot.start && slot.end) {
                    const [sH, sM] = slot.start.split(':').map(Number);
                    const [eH, eM] = slot.end.split(':').map(Number);
                    totalMinutes += (eH * 60 + eM) - (sH * 60 + sM);
                }
            });

            return totalMinutes; 
        },

        // 성취도 퍼센트 및 등급 계산
        calculateAchievement(studyMinutes, availableMinutes) {
            if (availableMinutes <= 0) return { percent: 0, grade: '' };
            
            // 성취도 = (순공시간 / 공부가능시간) * 100
            let percent = Math.round((studyMinutes / availableMinutes) * 100);
            
            // 최대값은 100%로 제한
            if (percent > 100) percent = 100;

            // 등급 산출
            const settings = window.AppStorage.get(SETTINGS_KEY) || defaultSettings;
            let grade = 'D'; // 기본 최하 등급
            
            // 성취도 높은 순서대로 정렬 후 매칭
            const sortedSettings = [...settings].sort((a, b) => b.score - a.score);
            for (let criterion of sortedSettings) {
                if (percent >= criterion.score) {
                    grade = criterion.grade;
                    break;
                }
            }

            return { percent, grade };
        },

        // 기록 저장하기
        saveRecord(dateStr, hours, minutes) {
            const studyMinutes = (hours * 60) + minutes;
            const availableMinutes = this.getAvailableTime(dateStr);

            // 예외처리 1: 공부 가능 시간이 0인 경우
            if (availableMinutes <= 0) {
                return { success: false, message: '공부 가능 시간이 설정되지 않은 날입니다.' };
            }
            // 예외처리 2: 실제 공부 시간이 음수인 경우
            if (studyMinutes < 0) {
                return { success: false, message: '실제 공부 시간은 음수일 수 없습니다.' };
            }

            // 성취도 및 등급 계산
            const { percent, grade } = this.calculateAchievement(studyMinutes, availableMinutes);

            // 데이터 구조화 후 저장
            const records = window.AppStorage.get(STORAGE_KEY) || {};
            records[dateStr] = {
                studyMinutes,
                availableMinutes,
                percent,
                grade
            };

            const saved = window.AppStorage.save(STORAGE_KEY, records);
            return { 
                success: saved, 
                message: saved ? '저장되었습니다' : '저장 실패',
                isOver: (studyMinutes > availableMinutes) // 목표 시간 초과 여부 반환 (확인 메시지용)
            };
        },

        // 전체 기록 조회
        getAllRecords() {
            return window.AppStorage.get(STORAGE_KEY) || {};
        }
    };

    window.StudyRecords = StudyRecords;
})();
