# 🕒 알림 시스템 CRON 설정 가이드

## 📋 **개요**

매일 자동으로 실행되어 보험설계사들에게 필요한 알림을 생성하는 CRON 작업 설정 가이드입니다.

## 🚀 **1. CRON 작업 등록**

### **1.1 crontab 편집**

```bash
crontab -e
```

### **1.2 매일 오전 9시 실행 설정**

```bash
# 매일 오전 9시에 알림 시스템 실행
0 9 * * * cd /path/to/surecrm && npm run cron:notifications >> /var/log/surecrm-notifications.log 2>&1

# 또는 Node.js 직접 실행
0 9 * * * cd /path/to/surecrm && /usr/bin/node --loader tsx/esm scripts/daily-notification-cron.ts >> /var/log/surecrm-notifications.log 2>&1
```

### **1.3 다양한 실행 주기 옵션**

```bash
# 매일 오전 9시
0 9 * * * cd /path/to/surecrm && npm run cron:notifications

# 매일 오전 9시, 오후 6시 (2회)
0 9,18 * * * cd /path/to/surecrm && npm run cron:notifications

# 평일만 오전 9시 (월-금)
0 9 * * 1-5 cd /path/to/surecrm && npm run cron:notifications

# 매시간 정각 (테스트용)
0 * * * * cd /path/to/surecrm && npm run cron:notifications

# 15분마다 (개발용)
*/15 * * * * cd /path/to/surecrm && npm run cron:notifications
```

## 🔧 **2. 환경 설정**

### **2.1 환경변수 설정**

CRON 환경에서는 PATH와 환경변수가 제한적이므로 스크립트에서 명시적으로 설정:

```bash
# .env 파일이 올바른 위치에 있는지 확인
# DATABASE_URL, SUPABASE_URL 등 필요한 환경변수들
```

### **2.2 권한 설정**

```bash
# 스크립트 실행 권한
chmod +x scripts/daily-notification-cron.ts

# 로그 디렉토리 권한
mkdir -p logs
chmod 755 logs

# 로그 파일 권한 (자동 생성됨)
touch logs/notification-cron.log
chmod 664 logs/notification-cron.log
```

## 📊 **3. 모니터링 & 로깅**

### **3.1 로그 확인**

```bash
# CRON 실행 로그 확인
tail -f logs/notification-cron.log

# 시스템 CRON 로그 확인
tail -f /var/log/cron

# 실시간 로그 모니터링
tail -f /var/log/surecrm-notifications.log
```

### **3.2 로그 분석 명령어**

```bash
# 성공/실패 통계
grep -c "success\|error" logs/notification-cron.log

# 최근 실행 기록
tail -10 logs/notification-cron.log | jq '.'

# 실행 시간 평균 계산
grep "executionTime" logs/notification-cron.log | jq '.executionTime' | awk '{sum+=$1} END {print "평균 실행시간:", sum/NR, "ms"}'
```

## 🚨 **4. 에러 핸들링 & 알림**

### **4.1 실패 시 이메일 알림 (선택사항)**

```bash
# 실패 시 관리자에게 이메일 발송
0 9 * * * cd /path/to/surecrm && npm run cron:notifications || echo "CRON 실패: $(date)" | mail -s "SureCRM 알림 시스템 실패" admin@example.com
```

### **4.2 헬스체크 URL (선택사항)**

```bash
# 실행 완료 후 외부 헬스체크 서비스에 신호 전송
0 9 * * * cd /path/to/surecrm && npm run cron:notifications && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/your-uuid-here
```

## 🔍 **5. 트러블슈팅**

### **5.1 일반적인 문제들**

1. **PATH 문제**: Node.js나 npm을 찾을 수 없음

   ```bash
   # 절대 경로 사용
   0 9 * * * cd /path/to/surecrm && /usr/local/bin/node /usr/local/bin/npm run cron:notifications
   ```

2. **환경변수 문제**: .env 파일을 읽을 수 없음

   ```bash
   # 환경변수 명시적 설정
   0 9 * * * cd /path/to/surecrm && NODE_ENV=production DATABASE_URL=your-db-url npm run cron:notifications
   ```

3. **권한 문제**: 파일/디렉토리 접근 불가
   ```bash
   # 올바른 사용자로 실행
   sudo -u www-data crontab -e
   ```

### **5.2 CRON 작업 확인**

```bash
# 현재 등록된 CRON 작업 확인
crontab -l

# CRON 서비스 상태 확인
sudo systemctl status cron

# CRON 서비스 재시작
sudo systemctl restart cron
```

## 📈 **6. 성능 최적화**

### **6.1 데이터베이스 연결 풀링**

대용량 데이터 처리 시 연결 풀 설정으로 성능 향상

### **6.2 배치 처리**

한 번에 많은 알림을 처리하지 않고 배치 단위로 분할 처리

### **6.3 실행 시간 분산**

모든 작업을 동시에 실행하지 않고 시간을 분산:

```bash
# 생일 알림: 오전 9시
0 9 * * * cd /path/to/surecrm && npm run cron:notifications -- --type=birthday

# 파이프라인 알림: 오전 10시
0 10 * * * cd /path/to/surecrm && npm run cron:notifications -- --type=pipeline

# 계약 임박 알림: 오후 2시
0 14 * * * cd /path/to/surecrm && npm run cron:notifications -- --type=contract
```

## 🎯 **7. 프로덕션 체크리스트**

- [ ] CRON 작업이 올바르게 등록되었는지 확인
- [ ] 환경변수가 올바르게 설정되었는지 확인
- [ ] 로그 디렉토리와 권한이 올바른지 확인
- [ ] 테스트 실행이 성공하는지 확인
- [ ] 모니터링 시스템이 설정되었는지 확인
- [ ] 실패 시 알림 시스템이 작동하는지 확인

## 🚀 **8. Docker 환경에서의 실행 (선택사항)**

```dockerfile
# Dockerfile에 CRON 설정 추가
FROM node:18-alpine

# CRON 설치
RUN apk add --no-cache dcron

# CRON 작업 파일 복사
COPY crontab /etc/crontabs/root

# 애플리케이션 코드 복사
COPY . /app
WORKDIR /app

# 의존성 설치
RUN npm install

# CRON과 애플리케이션 동시 실행
CMD ["sh", "-c", "crond -f -d 8 & npm start"]
```

이제 **실제 프로덕션 환경에서 완전 자동화된 알림 시스템**이 구축되었습니다! 🎉
