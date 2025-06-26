/**
 * GA4 Enhanced Measurement 수동 구현 - 보험설계사 CRM 특화 버전
 *
 * 자동 Enhanced Measurement 대신 수동으로 이벤트를 제어하여
 * 더 정확한 데이터 수집과 개인정보 보호를 보장합니다.
 *
 * SureCRM 보험설계사를 위한 특화 기능들:
 * - 고객 관리 세션 추적
 * - 영업 파이프라인 분석
 * - 계약 성과 측정
 * - 사용자 몰입도 분석
 */

import { trackEvent } from './analytics';
import { shouldCollectAnalytics } from './analytics-config';

// 스크롤 추적 최적화
let scrollDepths: Set<number> = new Set();
let maxScrollDepth = 0;

// 보험설계사 특화 세션 데이터
let sessionStartTime = Date.now();
let lastActivityTime = Date.now();
let clientInteractionCount = 0;
let contractActionCount = 0;
let pipelineActionCount = 0;

// 사용자 세션 품질 측정
interface SessionQualityMetrics {
  focusTime: number;
  blurTime: number;
  activeTime: number;
  idleTime: number;
  taskCompletions: number;
  errorCount: number;
}

let sessionQuality: SessionQualityMetrics = {
  focusTime: 0,
  blurTime: 0,
  activeTime: 0,
  idleTime: 0,
  taskCompletions: 0,
  errorCount: 0,
};

export function initEnhancedMeasurement() {
  if (!shouldCollectAnalytics()) return;

  // 1. 스크롤 추적 (최적화된 버전)
  initScrollTracking();

  // 2. 아웃바운드 링크 클릭 추적
  initOutboundLinkTracking();

  // 3. 파일 다운로드 추적
  initFileDownloadTracking();

  // 4. 사이트 검색 추적
  initSiteSearchTracking();

  // 5. 비디오 인터랙션 추적
  initVideoTracking();

  // 🏢 SureCRM 보험설계사 특화 추적
  // 6. 고객 관리 세션 품질 추적
  initClientManagementTracking();

  // 7. 영업 활동 효율성 추적
  initSalesActivityTracking();

  // 8. 사용자 몰입도 실시간 분석
  initEngagementTracking();

  // 9. 페이지 성능 및 사용성 추적
  initPerformanceTracking();

  // 10. 오류 및 사용자 좌절감 추적
  initErrorTracking();
}

// 스크롤 추적 (성능 최적화)
function initScrollTracking() {
  let isTracking = false;

  const handleScroll = () => {
    if (isTracking) return;
    isTracking = true;

    requestAnimationFrame(() => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      // 이전보다 더 깊이 스크롤한 경우만 추적
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        // 25%, 50%, 75%, 90% 지점에서 이벤트 발생
        const milestones = [25, 50, 75, 90];
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !scrollDepths.has(milestone)) {
            scrollDepths.add(milestone);

            trackEvent({
              action: 'scroll',
              category: 'engagement',
              label: `${milestone}_percent`,
              custom_parameters: {
                scroll_depth: scrollPercent,
                page_height: documentHeight,
                viewport_height: window.innerHeight,
                engagement_time: Date.now() - sessionStartTime,
              },
            });
          }
        });
      }

      isTracking = false;
    });
  };

  // 스로틀링으로 성능 최적화
  let scrollTimeout: NodeJS.Timeout;
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    },
    { passive: true }
  );
}

// 아웃바운드 링크 추적
function initOutboundLinkTracking() {
  document.addEventListener('click', event => {
    const link = (event.target as Element)?.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const isOutbound =
      href.startsWith('http') && !href.includes(window.location.hostname);

    if (isOutbound) {
      trackEvent({
        action: 'click',
        category: 'outbound_link',
        label: href,
        custom_parameters: {
          link_url: href,
          link_text: link.textContent?.trim() || '',
          link_domain: new URL(href).hostname,
          page_location: window.location.href,
        },
      });
    }
  });
}

// 파일 다운로드 추적
function initFileDownloadTracking() {
  document.addEventListener('click', event => {
    const link = (event.target as Element)?.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // 다운로드 가능한 파일 확장자
    const downloadExtensions =
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|csv|txt|png|jpg|jpeg|gif)$/i;

    if (downloadExtensions.test(href)) {
      const fileName = href.split('/').pop() || href;
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

      trackEvent({
        action: 'file_download',
        category: 'engagement',
        label: fileName,
        custom_parameters: {
          file_name: fileName,
          file_extension: fileExtension,
          file_url: href,
          download_trigger: 'link_click',
        },
      });
    }
  });
}

// 사이트 검색 추적
function initSiteSearchTracking() {
  // 검색 폼 제출 감지
  document.addEventListener('submit', event => {
    const form = event.target as HTMLFormElement;
    const searchInput = form.querySelector(
      'input[type="search"], input[name*="search"], input[placeholder*="검색"]'
    ) as HTMLInputElement;

    if (searchInput && searchInput.value.trim()) {
      trackEvent({
        action: 'view_search_results',
        category: 'site_search',
        label: searchInput.value.trim(),
        custom_parameters: {
          search_term: searchInput.value.trim(),
          search_location: window.location.pathname,
          search_type: 'form_submit',
        },
      });
    }
  });

  // 검색 URL 파라미터 감지
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerms =
    urlParams.get('q') || urlParams.get('search') || urlParams.get('query');

  if (searchTerms) {
    trackEvent({
      action: 'view_search_results',
      category: 'site_search',
      label: searchTerms,
      custom_parameters: {
        search_term: searchTerms,
        search_location: window.location.pathname,
        search_type: 'url_parameter',
      },
    });
  }
}

// 비디오 상호작용 추적
function initVideoTracking() {
  const videos = document.querySelectorAll('video');

  videos.forEach((video, index) => {
    const videoTitle =
      video.getAttribute('title') ||
      video.getAttribute('data-title') ||
      `video_${index + 1}`;

    // 비디오 시작
    video.addEventListener('play', () => {
      trackEvent({
        action: 'video_start',
        category: 'video',
        label: videoTitle,
        custom_parameters: {
          video_title: videoTitle,
          video_duration: Math.round(video.duration || 0),
          video_current_time: Math.round(video.currentTime || 0),
        },
      });
    });

    // 비디오 완료 (90% 이상 시청)
    video.addEventListener('timeupdate', () => {
      const progress = (video.currentTime / video.duration) * 100;

      if (progress >= 90) {
        trackEvent({
          action: 'video_complete',
          category: 'video',
          label: videoTitle,
          custom_parameters: {
            video_title: videoTitle,
            video_duration: Math.round(video.duration),
            completion_rate: Math.round(progress),
          },
        });
      }
    });
  });
}

// 🏢 보험설계사 특화: 고객 관리 세션 품질 추적
function initClientManagementTracking() {
  // 클라이언트 페이지 진입 시 세션 시작
  if (window.location.pathname.includes('/clients/')) {
    const clientSessionStart = Date.now();

    // 페이지 이탈 시 세션 종료 추적
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - clientSessionStart;

      trackEvent({
        action: 'client_session_end',
        category: 'client_management',
        label: 'session_quality',
        value: Math.round(sessionDuration / 1000), // 초 단위
        custom_parameters: {
          session_duration_ms: sessionDuration,
          client_interactions: clientInteractionCount,
          session_quality_score: calculateSessionQuality(
            sessionDuration,
            clientInteractionCount
          ),
          page_path: window.location.pathname,
        },
      });
    });
  }

  // 고객 관련 버튼/링크 클릭 추적
  document.addEventListener('click', event => {
    const target = event.target as Element;
    const button = target.closest('button, a');

    if (button) {
      const buttonText = button.textContent?.trim() || '';
      const isClientAction =
        buttonText.includes('고객') ||
        buttonText.includes('계약') ||
        buttonText.includes('미팅') ||
        button.getAttribute('data-client-action');

      if (isClientAction) {
        clientInteractionCount++;
        lastActivityTime = Date.now();

        trackEvent({
          action: 'client_interaction',
          category: 'client_management',
          label: buttonText,
          custom_parameters: {
            interaction_type: 'button_click',
            button_text: buttonText,
            interaction_sequence: clientInteractionCount,
            time_since_last_action: Date.now() - lastActivityTime,
          },
        });
      }
    }
  });
}

// 🚀 보험설계사 특화: 영업 활동 효율성 추적
function initSalesActivityTracking() {
  // 파이프라인 페이지에서의 활동 추적
  if (window.location.pathname.includes('/pipeline')) {
    let stageInteractions = 0;
    let cardDragCount = 0;

    // 드래그 앤 드롭 추적
    document.addEventListener('dragstart', () => {
      cardDragCount++;
    });

    document.addEventListener('drop', event => {
      const dropZone = (event.target as Element).closest('[data-stage]');
      if (dropZone) {
        const stageName = dropZone.getAttribute('data-stage');

        trackEvent({
          action: 'pipeline_card_move',
          category: 'sales_pipeline',
          label: stageName || 'unknown_stage',
          custom_parameters: {
            target_stage: stageName,
            drag_sequence: cardDragCount,
            pipeline_efficiency_score: calculatePipelineEfficiency(
              stageInteractions,
              cardDragCount
            ),
          },
        });
      }
    });

    // 스테이지 카드 클릭 추적
    document.addEventListener('click', event => {
      const stageCard = (event.target as Element).closest('[data-stage-card]');
      if (stageCard) {
        stageInteractions++;

        trackEvent({
          action: 'pipeline_stage_interaction',
          category: 'sales_pipeline',
          label: 'stage_exploration',
          custom_parameters: {
            stage_interactions: stageInteractions,
            interaction_density:
              stageInteractions / ((Date.now() - sessionStartTime) / 60000), // 분당 상호작용
          },
        });
      }
    });
  }
}

// 🎯 사용자 몰입도 실시간 분석
function initEngagementTracking() {
  let focusStartTime = Date.now();
  let isPageVisible = !document.hidden;
  let mouseMovements = 0;
  let keystrokes = 0;

  // 페이지 가시성 변경 추적
  document.addEventListener('visibilitychange', () => {
    const now = Date.now();

    if (document.hidden) {
      // 페이지가 숨겨질 때
      if (isPageVisible) {
        sessionQuality.focusTime += now - focusStartTime;
        isPageVisible = false;
      }
    } else {
      // 페이지가 다시 보일 때
      focusStartTime = now;
      isPageVisible = true;
    }
  });

  // 마우스 움직임 추적 (스로틀링)
  let mouseMoveTimeout: NodeJS.Timeout;
  document.addEventListener('mousemove', () => {
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
      mouseMovements++;
      lastActivityTime = Date.now();
    }, 100);
  });

  // 키보드 입력 추적
  document.addEventListener('keydown', () => {
    keystrokes++;
    lastActivityTime = Date.now();
  });

  // 5분마다 몰입도 리포트 전송
  setInterval(() => {
    const now = Date.now();
    const totalSessionTime = now - sessionStartTime;
    const timeSinceLastActivity = now - lastActivityTime;

    // 비활성 시간이 30초 이상이면 유휴 상태로 간주
    if (timeSinceLastActivity > 30000) {
      sessionQuality.idleTime += timeSinceLastActivity;
    } else {
      sessionQuality.activeTime += 1000; // 1초 추가
    }

    const engagementScore = calculateEngagementScore(
      mouseMovements,
      keystrokes,
      sessionQuality
    );

    trackEvent({
      action: 'user_engagement_analysis',
      category: 'behavioral_analytics',
      label: 'periodic_report',
      value: Math.round(engagementScore * 100),
      custom_parameters: {
        engagement_score: engagementScore,
        session_duration_minutes: Math.round(totalSessionTime / 60000),
        mouse_movements: mouseMovements,
        keystrokes: keystrokes,
        focus_ratio: sessionQuality.focusTime / totalSessionTime,
        activity_ratio: sessionQuality.activeTime / totalSessionTime,
        engagement_classification: classifyEngagement(engagementScore),
      },
    });

    // 카운터 리셋
    mouseMovements = 0;
    keystrokes = 0;
  }, 300000); // 5분
}

// ⚡ 페이지 성능 및 사용성 추적
function initPerformanceTracking() {
  // 페이지 로드 성능 측정
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      const firstPaint =
        paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint =
        paint.find(entry => entry.name === 'first-contentful-paint')
          ?.startTime || 0;

      trackEvent({
        action: 'page_performance_analysis',
        category: 'web_vitals',
        label: window.location.pathname,
        value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        custom_parameters: {
          page_load_time: Math.round(
            navigation.loadEventEnd - navigation.fetchStart
          ),
          dom_content_loaded: Math.round(
            navigation.domContentLoadedEventEnd - navigation.fetchStart
          ),
          first_paint: Math.round(firstPaint),
          first_contentful_paint: Math.round(firstContentfulPaint),
          dns_lookup: Math.round(
            navigation.domainLookupEnd - navigation.domainLookupStart
          ),
          tcp_connect: Math.round(
            navigation.connectEnd - navigation.connectStart
          ),
          server_response: Math.round(
            navigation.responseEnd - navigation.requestStart
          ),
          performance_grade: getPerformanceGrade(
            navigation.loadEventEnd - navigation.fetchStart
          ),
        },
      });
    }, 1000);
  });

  // Core Web Vitals 측정
  if ('web-vitals' in window || typeof window !== 'undefined') {
    // FCP, LCP, FID, CLS 측정 (web-vitals 라이브러리 사용시)
    // 간단한 자체 구현으로 대체

    // Largest Contentful Paint 근사치
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      trackEvent({
        action: 'core_web_vitals',
        category: 'web_vitals',
        label: 'largest_contentful_paint',
        value: Math.round(lastEntry.startTime),
        custom_parameters: {
          lcp_time: Math.round(lastEntry.startTime),
          element_type: (lastEntry as any).element?.tagName || 'unknown',
          vitals_rating:
            lastEntry.startTime < 2500
              ? 'good'
              : lastEntry.startTime < 4000
                ? 'needs_improvement'
                : 'poor',
        },
      });
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
  }
}

// 🚨 오류 및 사용자 좌절감 추적
function initErrorTracking() {
  // JavaScript 오류 추적
  window.addEventListener('error', event => {
    sessionQuality.errorCount++;

    trackEvent({
      action: 'javascript_error',
      category: 'error_tracking',
      label: event.error?.name || 'unknown_error',
      custom_parameters: {
        error_message: event.message,
        error_source: event.filename,
        error_line: event.lineno,
        error_column: event.colno,
        error_stack: event.error?.stack?.substring(0, 500) || '', // 처음 500자만
        user_agent: navigator.userAgent,
        page_url: window.location.href,
      },
    });
  });

  // 네트워크 오류 추적 (fetch/XMLHttpRequest 실패)
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);

      if (!response.ok) {
        trackEvent({
          action: 'network_error',
          category: 'error_tracking',
          label: `${response.status}_error`,
          custom_parameters: {
            response_status: response.status,
            response_url: response.url,
            request_method: (args[1] as RequestInit)?.method || 'GET',
            error_type: 'http_error',
          },
        });
      }

      return response;
    } catch (error) {
      trackEvent({
        action: 'network_error',
        category: 'error_tracking',
        label: 'fetch_failed',
        custom_parameters: {
          error_message: (error as Error).message,
          request_url: args[0].toString(),
          request_method: (args[1] as RequestInit)?.method || 'GET',
          error_type: 'network_failure',
        },
      });
      throw error;
    }
  };

  // 사용자 좌절감 감지 (빠른 연속 클릭, 강력한 스크롤 등)
  let rapidClicks = 0;
  let rapidClickTimeout: NodeJS.Timeout;

  document.addEventListener('click', () => {
    rapidClicks++;

    clearTimeout(rapidClickTimeout);
    rapidClickTimeout = setTimeout(() => {
      if (rapidClicks >= 5) {
        // 3초 내에 5회 이상 클릭 = 좌절감 신호
        trackEvent({
          action: 'user_frustration_detected',
          category: 'user_experience',
          label: 'rapid_clicking',
          custom_parameters: {
            frustration_type: 'rapid_clicking',
            click_count: rapidClicks,
            time_window_seconds: 3,
            page_context: window.location.pathname,
          },
        });
      }
      rapidClicks = 0;
    }, 3000);
  });
}

// 유틸리티 함수들
function calculateSessionQuality(
  duration: number,
  interactions: number
): number {
  const durationMinutes = duration / 60000;
  const interactionRate = interactions / Math.max(durationMinutes, 1);

  // 0-100 점수 (높을수록 좋음)
  const durationScore = Math.min(durationMinutes * 10, 50); // 최대 50점
  const interactionScore = Math.min(interactionRate * 25, 50); // 최대 50점

  return Math.round(durationScore + interactionScore);
}

function calculatePipelineEfficiency(
  interactions: number,
  dragCount: number
): number {
  // 드래그 대비 인터랙션 비율로 효율성 측정
  if (dragCount === 0) return 0;
  return Math.round((interactions / dragCount) * 100) / 100;
}

function calculateEngagementScore(
  mouseMovements: number,
  keystrokes: number,
  quality: SessionQualityMetrics
): number {
  const totalTime =
    quality.focusTime +
    quality.blurTime +
    quality.activeTime +
    quality.idleTime;
  if (totalTime === 0) return 0;

  const focusRatio = quality.focusTime / totalTime;
  const activityRatio = quality.activeTime / totalTime;
  const interactionDensity =
    (mouseMovements + keystrokes) / (totalTime / 60000); // 분당 상호작용

  // 가중 평균으로 몰입도 점수 계산
  const engagementScore =
    focusRatio * 0.4 +
    activityRatio * 0.3 +
    Math.min(interactionDensity / 50, 1) * 0.3;

  return Math.round(engagementScore * 1000) / 1000; // 소수점 3자리
}

function classifyEngagement(score: number): string {
  if (score >= 0.8) return 'highly_engaged';
  if (score >= 0.6) return 'moderately_engaged';
  if (score >= 0.4) return 'lightly_engaged';
  if (score >= 0.2) return 'minimally_engaged';
  return 'disengaged';
}

function getPerformanceGrade(loadTime: number): string {
  if (loadTime < 1000) return 'excellent';
  if (loadTime < 2000) return 'good';
  if (loadTime < 3000) return 'fair';
  if (loadTime < 5000) return 'poor';
  return 'very_poor';
}

// 보험설계사 특화 이벤트 헬퍼들
export const InsuranceAgentEnhancedEvents = {
  // 고객 상세페이지 세션 분석
  clientDetailSessionAnalysis: (clientId: string, sessionData: any) => {
    trackEvent({
      action: 'client_detail_session_analysis',
      category: 'client_management_deep',
      label: clientId,
      custom_parameters: {
        client_id: clientId,
        session_duration: sessionData.duration,
        tabs_viewed: sessionData.tabsViewed,
        actions_performed: sessionData.actionsPerformed,
        session_completion_rate: sessionData.completionRate,
        session_effectiveness_score: sessionData.effectivenessScore,
      },
    });
  },

  // 영업 파이프라인 시각화 인터랙션
  pipelineVisualizationInteraction: (
    interactionType: string,
    stageData: any
  ) => {
    trackEvent({
      action: 'pipeline_visualization_interaction',
      category: 'sales_pipeline_deep',
      label: interactionType,
      custom_parameters: {
        interaction_type: interactionType,
        stage_name: stageData.stageName,
        client_count: stageData.clientCount,
        stage_value: stageData.stageValue,
        interaction_sequence: stageData.sequence,
        visualization_efficiency: stageData.efficiency,
      },
    });
  },

  // 계약 문서 처리 워크플로우
  contractDocumentWorkflow: (workflowStep: string, documentData: any) => {
    trackEvent({
      action: 'contract_document_workflow',
      category: 'document_management_deep',
      label: workflowStep,
      custom_parameters: {
        workflow_step: workflowStep,
        document_type: documentData.type,
        document_size: documentData.size,
        processing_time: documentData.processingTime,
        workflow_completion_rate: documentData.completionRate,
        user_efficiency: documentData.userEfficiency,
      },
    });
  },

  // 대시보드 KPI 드릴다운 분석
  dashboardKpiDrilldown: (kpiType: string, drilldownData: any) => {
    trackEvent({
      action: 'dashboard_kpi_drilldown',
      category: 'dashboard_deep',
      label: kpiType,
      custom_parameters: {
        kpi_type: kpiType,
        drilldown_level: drilldownData.level,
        filter_applied: drilldownData.filterApplied,
        data_range: drilldownData.dateRange,
        insight_discovery: drilldownData.insightDiscovery,
        analysis_depth: drilldownData.analysisDepth,
      },
    });
  },
};
