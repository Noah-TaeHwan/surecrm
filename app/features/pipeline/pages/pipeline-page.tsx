import type { Route } from './+types/pipeline-page';
import { MainLayout } from '~/common/layouts/main-layout';
import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { PipelineBoard } from '~/features/pipeline/components/pipeline-board';
import { PipelineFilters } from '~/features/pipeline/components/pipeline-filters';
import { MobilePipelineLayout } from '~/features/pipeline/components/mobile-pipeline-layout';
import { AddClientModal } from '~/features/clients/components/add-client-modal';
import { ExistingClientOpportunityModal } from '../components/existing-client-opportunity-modal';
import { RemoveClientModal } from '../components/remove-client-modal';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  TrendingUp,
  Target,
  UserPlus,
} from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import type { Client } from '~/features/pipeline/types/types';
import { Separator } from '~/common/components/ui/separator';
import { Badge } from '~/common/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';
import { useViewport } from '~/common/hooks/useViewport';
import {
  getPipelineStages,
  getClientsByStage,
  createDefaultPipelineStages,
} from '~/features/pipeline/lib/supabase-pipeline-data';
import { requireAuth } from '~/lib/auth/middleware';
import { redirect } from 'react-router';

export function meta({ data, params }: Route.MetaArgs) {
  return [
    { title: '영업 파이프라인 - SureCRM' },
    { name: 'description', content: '영업 단계별 고객 관리 파이프라인' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 🎯 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    // 🎯 파이프라인 단계 조회
    let stages: any[] = [];
    try {
      stages = await getPipelineStages(agentId);

      // 🎯 파이프라인 단계가 없으면 기본 단계 생성
      if (stages.length === 0) {
        stages = await createDefaultPipelineStages(agentId);
      }
    } catch (stageError) {
      // 빈 배열로 fallback
      stages = [];
    }

    // 🎯 모든 고객 조회
    let allClients: any[] = [];
    let totalAllClients = 0;
    try {
      allClients = await getClientsByStage(agentId);

      // 🎯 각 고객의 상품 정보 추가로 가져오기
      const { getOpportunityProductsByClient } = await import(
        '~/api/shared/opportunity-products'
      );

      const clientsWithProducts = await Promise.all(
        allClients.map(async client => {
          try {
            const productsResult = await getOpportunityProductsByClient(
              client.id,
              agentId
            );
            const products = productsResult.success ? productsResult.data : [];

            // 총 월 보험료와 수수료 계산
            const totalMonthlyPremium = products.reduce(
              (sum: number, product: any) => {
                return sum + parseFloat(product.monthlyPremium || '0');
              },
              0
            );

            const totalExpectedCommission = products.reduce(
              (sum: number, product: any) => {
                return sum + parseFloat(product.expectedCommission || '0');
              },
              0
            );

            return {
              ...client,
              products,
              totalMonthlyPremium,
              totalExpectedCommission,
            };
          } catch (error) {
            console.error(`❌ 고객 ${client.id} 상품 정보 조회 실패:`, error);
            return {
              ...client,
              products: [],
              totalMonthlyPremium: 0,
              totalExpectedCommission: 0,
            };
          }
        })
      );

      allClients = clientsWithProducts;

      // 🎯 전체 고객 수 조회 (파이프라인에 없는 고객 포함)
      const { getClients } = await import('~/api/shared/clients');
      const allClientsResult = await getClients({
        agentId,
        limit: 1000, // 충분히 큰 숫자
      });
      totalAllClients = allClientsResult.total;
    } catch (clientError) {
      // 빈 배열로 fallback
      allClients = [];
      totalAllClients = 0;
    }

    return {
      stages,
      clients: allClients,
      totalAllClients, // 🎯 전체 고객 수 추가
      currentUserId: agentId,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.email.split('@')[0], // 이메일 앞부분을 이름으로 사용
      },
    };
  } catch (error) {
    // 🎯 더 상세한 에러 정보와 함께 안전한 fallback 반환
    return {
      stages: [],
      clients: [],
      totalAllClients: 0,
      currentUserId: null,
      currentUser: null,
      error:
        error instanceof Error
          ? error.message
          : '데이터를 불러오는데 실패했습니다.',
    };
  }
}

// 🎯 새로운 action 함수 - 서버사이드에서 고객 추가 처리
export async function action({ request }: Route.ActionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'addClient') {
      // 폼 데이터 파싱
      const clientData = {
        fullName: formData.get('fullName') as string,
        phone: formData.get('phone') as string,
        email: (formData.get('email') as string) || undefined,
        telecomProvider:
          (formData.get('telecomProvider') as string) || undefined,
        address: (formData.get('address') as string) || undefined,
        occupation: (formData.get('occupation') as string) || undefined,
        importance:
          (formData.get('importance') as 'high' | 'medium' | 'low') || 'medium',
        referredById: (formData.get('referredById') as string) || undefined,
        tags: formData.get('tags')
          ? (formData.get('tags') as string)
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
          : [],
        notes: (formData.get('notes') as string) || undefined,
      };

      // 첫 상담 단계 찾기
      const stages = await getPipelineStages(user.id);
      const firstStage = stages.find(s => s.name === '첫 상담') || stages[0];

      if (!firstStage) {
        return {
          success: false,
          error:
            '첫 상담 단계를 찾을 수 없습니다. 파이프라인 설정을 확인해주세요.',
        };
      }

      // 🎯 실제 Supabase API 호출
      const { createClient } = await import('~/api/shared/clients');

      const newClientData = {
        fullName: clientData.fullName,
        phone: clientData.phone,
        email: clientData.email,
        telecomProvider: clientData.telecomProvider,
        address: clientData.address,
        occupation: clientData.occupation,
        importance: clientData.importance,
        referredById: clientData.referredById,
        tags: clientData.tags,
        notes: clientData.notes,
        currentStageId: firstStage.id, // 🎯 첫 상담 단계로 설정
      };

      const result = await createClient(newClientData, user.id);

      if (result.success && result.data) {
        // 🎯 성공 응답 반환 (redirect 대신)
        return {
          success: true,
          message: '고객이 성공적으로 추가되었습니다.',
          client: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || '고객 추가에 실패했습니다.',
        };
      }
    }

    if (intent === 'moveClient') {
      // 고객 단계 이동 데이터 파싱
      const clientId = formData.get('clientId') as string;
      const targetStageId = formData.get('targetStageId') as string;

      if (!clientId || !targetStageId) {
        return {
          success: false,
          error: '고객 ID 또는 대상 단계 ID가 누락되었습니다.',
        };
      }

      // 🎯 실제 Supabase API 호출
      const { updateClientStage } = await import('~/api/shared/clients');

      const result = await updateClientStage(clientId, targetStageId, user.id);

      if (result.success && result.data) {
        return {
          success: true,
          message: result.message,
          client: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || '고객 단계 이동에 실패했습니다.',
        };
      }
    }

    if (intent === 'existingClientOpportunity') {
      // 기존 고객 새 영업 기회 생성
      const clientId = formData.get('clientId') as string;
      const clientName = formData.get('clientName') as string;
      const insuranceType = formData.get('insuranceType') as string;
      const notes = formData.get('notes') as string;

      // 🆕 새로운 상품 정보 필드들
      const productName = formData.get('productName') as string;
      const insuranceCompany = formData.get('insuranceCompany') as string;
      const monthlyPremium = formData.get('monthlyPremium') as string;
      const expectedCommission = formData.get('expectedCommission') as string;

      if (!clientId || !insuranceType) {
        return {
          success: false,
          error: '고객 ID 또는 보험 상품 타입이 누락되었습니다.',
        };
      }

      // 첫 상담 단계 찾기
      const stages = await getPipelineStages(user.id);
      const firstStage = stages.find(s => s.name === '첫 상담') || stages[0];

      if (!firstStage) {
        return {
          success: false,
          error: '첫 상담 단계를 찾을 수 없습니다.',
        };
      }

      // 고객 정보 업데이트 및 단계 이동
      const { updateClient, updateClientStage } = await import(
        '~/api/shared/clients'
      );

      // 영업 기회 메모 추가
      const getInsuranceTypeName = (type: string) => {
        const typeMap: Record<string, string> = {
          auto: '자동차보험',
          life: '생명보험',
          health: '건강보험',
          home: '주택보험',
          business: '사업자보험',
        };
        return typeMap[type] || type;
      };

      // 상품 정보를 포함한 영업 메모 생성
      let opportunityNotes = `[${getInsuranceTypeName(insuranceType)} 영업]`;

      if (productName || insuranceCompany) {
        opportunityNotes += '\n📦 상품 정보:';
        if (productName) opportunityNotes += `\n- 상품명: ${productName}`;
        if (insuranceCompany)
          opportunityNotes += `\n- 보험회사: ${insuranceCompany}`;
        if (monthlyPremium)
          opportunityNotes += `\n- 월 납입료: ${parseFloat(
            monthlyPremium
          ).toLocaleString()}원`;
        if (expectedCommission)
          opportunityNotes += `\n- 예상 수수료: ${parseFloat(
            expectedCommission
          ).toLocaleString()}원`;
      }

      if (notes) {
        opportunityNotes += `\n\n📝 영업 메모:\n${notes}`;
      }

      // 현재 고객 정보 조회해서 기존 메모에 추가
      const { getClientById } = await import('~/api/shared/clients');
      const existingClient = await getClientById(clientId, user.id);

      const updateData = {
        notes: existingClient?.notes
          ? `${existingClient.notes}\n\n--- 새 영업 기회 ---\n${opportunityNotes}`
          : opportunityNotes,
      };

      await updateClient(clientId, updateData, user.id);

      // 🆕 상품 정보가 있으면 opportunity_products 테이블에 저장
      if (productName && insuranceCompany) {
        try {
          const { createOpportunityProduct } = await import(
            '~/api/shared/opportunity-products'
          );

          const productData = {
            productName,
            insuranceCompany,
            insuranceType,
            monthlyPremium: monthlyPremium
              ? parseFloat(monthlyPremium)
              : undefined,
            expectedCommission: expectedCommission
              ? parseFloat(expectedCommission)
              : undefined,
            notes: notes || undefined,
          };

          const productResult = await createOpportunityProduct(
            clientId,
            user.id,
            productData
          );

          if (!productResult.success) {
            console.warn(
              '🔧 상품 정보 저장 실패 (영업 기회는 계속 진행):',
              productResult.error
            );
          } else {
            console.log('✅ 상품 정보 저장 완료:', productResult.data?.id);
          }
        } catch (error) {
          console.warn(
            '🔧 상품 정보 저장 중 오류 (영업 기회는 계속 진행):',
            error
          );
        }
      }

      // 고객을 첫 상담 단계로 이동
      const result = await updateClientStage(clientId, firstStage.id, user.id);

      if (result.success) {
        return {
          success: true,
          message: `${clientName} 고객의 새 영업 기회가 생성되었습니다.`,
          client: result.data,
        };
      } else {
        return {
          success: false,
          error: result.message || '영업 기회 생성에 실패했습니다.',
        };
      }
    }

    if (intent === 'removeFromPipeline') {
      // 영업 파이프라인에서 고객 제외
      const clientId = formData.get('clientId') as string;

      if (!clientId) {
        return {
          success: false,
          error: '고객 ID가 누락되었습니다.',
        };
      }

      // 🎯 "제외됨" 단계 찾기 또는 생성
      const stages = await getPipelineStages(user.id);
      let excludedStage = stages.find(s => s.name === '제외됨');

      if (!excludedStage) {
        // "제외됨" 단계가 없으면 생성
        const { createPipelineStage } = await import(
          '~/features/pipeline/lib/supabase-pipeline-data'
        );
        excludedStage = await createPipelineStage({
          agentId: user.id,
          name: '제외됨',
          order: 999, // 맨 마지막 순서
          color: '#6b7280', // 회색
          isDefault: false,
        });
      }

      // 🎯 고객을 "제외됨" 단계로 이동
      const { updateClientStage } = await import('~/api/shared/clients');

      const result = await updateClientStage(
        clientId,
        excludedStage.id,
        user.id
      );

      if (result.success) {
        return {
          success: true,
          message: '고객이 영업 파이프라인에서 제외되었습니다.',
        };
      } else {
        return {
          success: false,
          error: result.message || '영업에서 제외하는데 실패했습니다.',
        };
      }
    }

    return { success: false, error: '알 수 없는 요청입니다.' };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

export default function PipelinePage({ loaderData }: Route.ComponentProps) {
  const { stages, clients, totalAllClients, currentUser } = loaderData;

  // 🎯 각 액션별로 별도의 fetcher 사용
  const moveFetcher = useFetcher(); // 드래그 앤 드롭용
  const addClientFetcher = useFetcher(); // 신규 고객 추가용
  const opportunityFetcher = useFetcher(); // 기존 고객 영업 기회용
  const removeFetcher = useFetcher(); // 고객 제거용
  const navigate = useNavigate(); // 🏢 계약 전환용

  // 🎯 반응형 처리를 위한 뷰포트 훅
  const { width } = useViewport();
  const isMobile = width < 768; // md 브레이크포인트

  // === 🎯 사용자 경험 향상을 위한 파이프라인 페이지 고급 분석 시스템 ===
  useEffect(() => {
    const pageLoadTime = performance.now();

    // 파이프라인 구조 분석
    const pipelineAnalysis = {
      pipeline_structure: {
        total_stages: stages.length,
        stage_names: stages.map((s: any) => s.name),
        stage_distribution: stages.map((stage: any) => ({
          stage_name: stage.name,
          client_count: clients.filter((c: any) => c.stageId === stage.id)
            .length,
          stage_order: stage.order || 0,
        })),
      },
      clients_analysis: {
        total_in_pipeline: clients.length,
        total_all_clients: totalAllClients,
        pipeline_penetration:
          totalAllClients > 0 ? (clients.length / totalAllClients) * 100 : 0,
        importance_breakdown: {
          high: clients.filter((c: any) => c.importance === 'high').length,
          medium: clients.filter((c: any) => c.importance === 'medium').length,
          low: clients.filter((c: any) => c.importance === 'low').length,
        },
      },
      revenue_analysis: {
        total_monthly_premium: clients.reduce(
          (sum: number, c: any) => sum + (c.totalMonthlyPremium || 0),
          0
        ),
        total_expected_commission: clients.reduce(
          (sum: number, c: any) => sum + (c.totalExpectedCommission || 0),
          0
        ),
        avg_client_value:
          clients.length > 0
            ? clients.reduce(
                (sum: number, c: any) => sum + (c.totalExpectedCommission || 0),
                0
              ) / clients.length
            : 0,
        high_value_deals: clients.filter(
          (c: any) => (c.totalExpectedCommission || 0) > 100000
        ).length,
      },
      conversion_metrics: {
        bottleneck_stage:
          stages.length > 0
            ? stages.reduce((max: any, stage: any) => {
                const stageClients = clients.filter(
                  (c: any) => c.stageId === stage.id
                ).length;
                const maxClients = clients.filter(
                  (c: any) => c.stageId === max.id
                ).length;
                return stageClients > maxClients ? stage : max;
              }, stages[0])?.name || 'unknown'
            : 'no_stages',
        pipeline_velocity: calculatePipelineVelocity(clients, stages),
        stage_conversion_rates: calculateStageConversionRates(clients, stages),
      },
      workflow_efficiency: {
        product_diversification: calculateProductDiversification(clients),
        referral_in_pipeline: clients.filter((c: any) => c.referredBy).length,
        active_opportunities: clients.filter(
          (c: any) => c.products && c.products.length > 0
        ).length,
      },
    };

    // GA4 파이프라인 포괄 분석
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pipeline_access_comprehensive', {
        event_category: 'sales_pipeline_intelligence',
        pipeline_health_score: calculatePipelineHealthScore(pipelineAnalysis),
        total_pipeline_value:
          pipelineAnalysis.revenue_analysis.total_expected_commission,
        pipeline_size: clients.length,
        stage_count: stages.length,
        penetration_rate:
          pipelineAnalysis.clients_analysis.pipeline_penetration,
        bottleneck_identified:
          pipelineAnalysis.conversion_metrics.bottleneck_stage,
        avg_deal_size: pipelineAnalysis.revenue_analysis.avg_client_value,
        high_value_deals_count:
          pipelineAnalysis.revenue_analysis.high_value_deals,
        conversion_optimization_opportunity:
          identifyOptimizationOpportunities(pipelineAnalysis),
        session_context: {
          user_expertise:
            stages.length > 5
              ? 'advanced'
              : stages.length > 2
                ? 'intermediate'
                : 'beginner',
          pipeline_maturity:
            clients.length > 50
              ? 'mature'
              : clients.length > 20
                ? 'growing'
                : 'early',
        },
      });
    }

    // GTM DataLayer 정밀 파이프라인 분석
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'pipeline_deep_intelligence',
        pipeline_analytics: {
          structural_analysis: pipelineAnalysis.pipeline_structure,
          client_composition: pipelineAnalysis.clients_analysis,
          revenue_intelligence: pipelineAnalysis.revenue_analysis,
          performance_metrics: pipelineAnalysis.conversion_metrics,
          operational_insights: pipelineAnalysis.workflow_efficiency,
        },
        business_strategy: {
          growth_indicators: {
            pipeline_capacity: (clients.length / totalAllClients) * 100,
            revenue_concentration:
              pipelineAnalysis.revenue_analysis.high_value_deals /
              clients.length,
            stage_utilization:
              stages.length > 0
                ? stages.filter((s: any) =>
                    clients.some((c: any) => c.stageId === s.id)
                  ).length / stages.length
                : 0,
          },
          optimization_signals: {
            bottleneck_severity: calculateBottleneckSeverity(pipelineAnalysis),
            conversion_gaps: identifyConversionGaps(pipelineAnalysis),
            revenue_leakage_risk: calculateRevenueLeakageRisk(pipelineAnalysis),
          },
          competitive_positioning: {
            pipeline_sophistication_score:
              stages.length * 20 + clients.length * 2,
            process_maturity:
              stages.length >= 5
                ? 'advanced'
                : stages.length >= 3
                  ? 'standard'
                  : 'basic',
            scale_readiness:
              clients.length > 100
                ? 'enterprise'
                : clients.length > 30
                  ? 'growth'
                  : 'startup',
          },
        },
        user_intelligence: {
          interaction_intent: 'pipeline_management',
          expected_workflows: [
            'client_progression',
            'deal_closing',
            'pipeline_optimization',
          ],
          session_complexity: calculateSessionComplexity(
            clients.length,
            stages.length
          ),
          feature_utilization_prediction: predictFeatureUsage(pipelineAnalysis),
        },
        timestamp: Date.now(),
        session_id: `pipeline_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      });
    }

    // 실시간 파이프라인 상호작용 추적 설정
    const setupPipelineInteractionTracking = () => {
      // 클라이언트 이동 추적
      const trackClientMove = (
        clientId: string,
        fromStage: string,
        toStage: string
      ) => {
        const client = clients.find((c: any) => c.id === clientId);
        if (client && window.gtag) {
          window.gtag('event', 'pipeline_client_movement', {
            event_category: 'pipeline_workflow',
            client_importance: client.importance,
            from_stage: fromStage,
            to_stage: toStage,
            client_value: client.totalExpectedCommission || 0,
            move_direction: getPipelineDirection(fromStage, toStage, stages),
            stage_progression_score: calculateStageProgressionScore(
              fromStage,
              toStage,
              stages
            ),
          });
        }
      };

      // 단계별 필터링 추적
      const trackStageFilter = (stageId: string, stageName: string) => {
        if (window.gtag) {
          window.gtag('event', 'pipeline_stage_focus', {
            event_category: 'pipeline_navigation',
            focused_stage: stageName,
            stage_client_count: clients.filter(
              (c: any) => c.stageId === stageId
            ).length,
            stage_value: clients
              .filter((c: any) => c.stageId === stageId)
              .reduce(
                (sum: number, c: any) => sum + (c.totalExpectedCommission || 0),
                0
              ),
          });
        }
      };

      // 전역 함수 등록
      (window as any).trackClientMove = trackClientMove;
      (window as any).trackStageFilter = trackStageFilter;
    };

    setupPipelineInteractionTracking();

    // 페이지 이탈 시 파이프라인 세션 분석
    const handlePageUnload = () => {
      const sessionDuration = Date.now() - pageLoadTime;
      if (window.gtag) {
        window.gtag('event', 'pipeline_session_analysis', {
          event_category: 'session_intelligence',
          session_duration: sessionDuration,
          clients_interacted: (window as any).pipelineClientsInteracted || 0,
          stages_reviewed: (window as any).pipelineStagesReviewed || 0,
          moves_performed: (window as any).pipelineMovesPerformed || 0,
          final_pipeline_state: {
            total_value:
              pipelineAnalysis.revenue_analysis.total_expected_commission,
            client_distribution:
              pipelineAnalysis.pipeline_structure.stage_distribution,
          },
        });
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    return () => window.removeEventListener('beforeunload', handlePageUnload);

    // === 🎯 파이프라인 분석 유틸리티 함수들 ===
    function calculatePipelineVelocity(clients: any[], stages: any[]) {
      // 파이프라인 속도 계산 (평균 단계 진행 시간)
      if (clients.length === 0) return 0;
      return (
        clients.reduce((sum: number, client: any) => {
          const daysInStage = client.updatedAt
            ? Math.floor(
                (Date.now() - new Date(client.updatedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;
          return sum + daysInStage;
        }, 0) / clients.length
      );
    }

    function calculateStageConversionRates(clients: any[], stages: any[]) {
      return stages.map((stage: any, index: number) => {
        const currentStageClients = clients.filter(
          (c: any) => c.stageId === stage.id
        ).length;
        const nextStage = stages[index + 1];
        const nextStageClients = nextStage
          ? clients.filter((c: any) => c.stageId === nextStage.id).length
          : 0;

        return {
          stage: stage.name,
          conversion_rate:
            currentStageClients > 0
              ? (nextStageClients / currentStageClients) * 100
              : 0,
        };
      });
    }

    function calculateProductDiversification(clients: any[]) {
      const allProducts = clients.flatMap((c: any) => c.products || []);
      const uniqueProducts = new Set(
        allProducts.map((p: any) => p.productName || p.insuranceType)
      );
      return uniqueProducts.size;
    }

    function calculatePipelineHealthScore(analysis: any) {
      const valueScore =
        Math.min(
          analysis.revenue_analysis.total_expected_commission / 1000000,
          1
        ) * 30;
      const distributionScore =
        analysis.pipeline_structure.total_stages > 0
          ? (1 -
              Math.abs(
                analysis.clients_analysis.total_in_pipeline /
                  analysis.pipeline_structure.total_stages -
                  5
              ) /
                10) *
            25
          : 0;
      const penetrationScore =
        analysis.clients_analysis.pipeline_penetration * 0.25;
      const diversificationScore =
        Math.min(analysis.workflow_efficiency.product_diversification / 10, 1) *
        20;

      return Math.round(
        valueScore + distributionScore + penetrationScore + diversificationScore
      );
    }

    function identifyOptimizationOpportunities(analysis: any) {
      const opportunities = [];

      if (analysis.conversion_metrics.bottleneck_stage !== 'no_stages') {
        opportunities.push('bottleneck_resolution');
      }
      if (analysis.clients_analysis.pipeline_penetration < 50) {
        opportunities.push('pipeline_expansion');
      }
      if (
        analysis.revenue_analysis.high_value_deals /
          analysis.clients_analysis.total_in_pipeline <
        0.2
      ) {
        opportunities.push('deal_value_optimization');
      }
      if (
        analysis.workflow_efficiency.referral_in_pipeline /
          analysis.clients_analysis.total_in_pipeline <
        0.3
      ) {
        opportunities.push('referral_program_enhancement');
      }

      return opportunities;
    }

    function calculateBottleneckSeverity(analysis: any) {
      const stageDistribution = analysis.pipeline_structure.stage_distribution;
      if (stageDistribution.length === 0) return 0;

      const maxClients = Math.max(
        ...stageDistribution.map((s: any) => s.client_count)
      );
      const avgClients =
        stageDistribution.reduce(
          (sum: number, s: any) => sum + s.client_count,
          0
        ) / stageDistribution.length;

      return maxClients > 0
        ? ((maxClients - avgClients) / maxClients) * 100
        : 0;
    }

    function identifyConversionGaps(analysis: any) {
      return analysis.conversion_metrics.stage_conversion_rates
        .filter((rate: any) => rate.conversion_rate < 50)
        .map((rate: any) => rate.stage);
    }

    function calculateRevenueLeakageRisk(analysis: any) {
      const lowValueDeals =
        analysis.clients_analysis.total_in_pipeline -
        analysis.revenue_analysis.high_value_deals;
      return analysis.clients_analysis.total_in_pipeline > 0
        ? (lowValueDeals / analysis.clients_analysis.total_in_pipeline) * 100
        : 0;
    }

    function calculateSessionComplexity(
      clientCount: number,
      stageCount: number
    ) {
      if (clientCount > 100 || stageCount > 6) return 'high';
      if (clientCount > 30 || stageCount > 4) return 'medium';
      return 'low';
    }

    function predictFeatureUsage(analysis: any) {
      const predictions = [];

      if (analysis.clients_analysis.total_in_pipeline > 20) {
        predictions.push('advanced_filtering');
      }
      if (analysis.revenue_analysis.high_value_deals > 5) {
        predictions.push('deal_management');
      }
      if (analysis.workflow_efficiency.referral_in_pipeline > 10) {
        predictions.push('referral_tracking');
      }

      return predictions;
    }

    function getPipelineDirection(
      fromStage: string,
      toStage: string,
      stages: any[]
    ) {
      const fromIndex = stages.findIndex((s: any) => s.name === fromStage);
      const toIndex = stages.findIndex((s: any) => s.name === toStage);

      if (fromIndex === -1 || toIndex === -1) return 'unknown';
      if (toIndex > fromIndex) return 'forward';
      if (toIndex < fromIndex) return 'backward';
      return 'same';
    }

    function calculateStageProgressionScore(
      fromStage: string,
      toStage: string,
      stages: any[]
    ) {
      const direction = getPipelineDirection(fromStage, toStage, stages);
      const fromIndex = stages.findIndex((s: any) => s.name === fromStage);
      const toIndex = stages.findIndex((s: any) => s.name === toStage);

      if (direction === 'forward') {
        return Math.min((toIndex - fromIndex) * 20, 100);
      } else if (direction === 'backward') {
        return Math.max((fromIndex - toIndex) * -10, -50);
      }
      return 0;
    }
  }, [stages, clients, totalAllClients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferrerId, setSelectedReferrerId] = useState<string | null>(
    null
  );
  const [selectedImportance, setSelectedImportance] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [existingClientModalOpen, setExistingClientModalOpen] = useState(false);
  // 🎯 영업 기회 모달에서 자동 선택할 고객 정보
  const [selectedOpportunityClient, setSelectedOpportunityClient] = useState<{
    clientId: string;
    clientName: string;
  } | null>(null);

  // 🗑️ 영업에서 제외 관련 상태
  const [removeClientModalOpen, setRemoveClientModalOpen] = useState(false);
  const [clientToRemove, setClientToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 🎯 fetcher 상태 기반으로 상태 관리
  const isSubmitting = addClientFetcher.state === 'submitting';
  const submitError = addClientFetcher.data?.error || null;

  // 필터링된 고객 목록
  const filteredClients = clients.filter(client => {
    // "제외됨" 단계의 고객들은 칸반보드에 표시하지 않음
    const stage = stages.find(s => s.id === client.stageId);
    if (stage && stage.name === '제외됨') {
      return false;
    }

    // 검색어 필터링
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery));

    // 소개자 필터링
    const matchesReferrer =
      selectedReferrerId === null ||
      client.referredBy?.id === selectedReferrerId;

    // 중요도 필터링
    const matchesImportance =
      selectedImportance === 'all' || client.importance === selectedImportance;

    return matchesSearch && matchesReferrer && matchesImportance;
  });

  // 소개자 후보 목록 생성 (모든 기존 고객이 소개자가 될 수 있음)
  const potentialReferrers = clients
    .map(client => ({
      id: client.id,
      name: client.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬

  // 🎯 MVP용 전체 통계 계산 (확장)
  const getTotalStats = () => {
    // 1. 전체 고객 (고객 관리 페이지의 모든 고객)
    const totalAllClientsCount = totalAllClients; // 파이프라인에 없는 고객 포함

    // 2. 영업 파이프라인 관리 중인 고객 (제외됨 단계 제외)
    const pipelineClients = clients.filter(client => {
      const stage = stages.find(s => s.id === client.stageId);
      return stage && stage.name !== '제외됨';
    }).length;

    // 3. 계약 완료 고객 (실제 성과) - 제외됨 단계 제외
    const contractedClients = clients.filter(client => {
      const stage = stages.find(s => s.id === client.stageId);
      return stage && stage.name === '계약 완료';
    }).length;

    // 4. 고가치 고객 (키맨 고객) - 제외됨 단계 제외
    const highValueClients = clients.filter(client => {
      const stage = stages.find(s => s.id === client.stageId);
      return client.importance === 'high' && stage && stage.name !== '제외됨';
    }).length;

    // 5. 전환율 계산 (보고서와 동일한 로직: 실제 계약이 있는 고객 / 영업 기회가 있는 고객)
    const clientsWithOpportunities = clients.filter(client => {
      const stage = stages.find(s => s.id === client.stageId);
      return (
        stage &&
        stage.name !== '제외됨' &&
        client.products &&
        client.products.length > 0
      );
    }).length;

    const clientsWithContracts = clients.filter(client => {
      const stage = stages.find(s => s.id === client.stageId);
      return stage && stage.name === '계약 완료';
    }).length;

    const conversionRate =
      clientsWithOpportunities > 0
        ? Math.round((clientsWithContracts / clientsWithOpportunities) * 100)
        : 0;

    // 6. 활성 단계 수
    const activeStages = stages.length;

    return {
      totalAllClients: totalAllClientsCount,
      pipelineClients,
      contractedClients,
      highValueClients,
      conversionRate,
      activeStages,
    };
  };

  // 각 단계별 고객 수와 중요 고객 수 계산
  const getStageStats = (stageId: string) => {
    const stageClients = filteredClients.filter(
      client => client.stageId === stageId
    );
    const clientCount = stageClients.length;
    const highImportanceCount = stageClients.filter(
      client => client.importance === 'high'
    ).length;

    return { clientCount, highImportanceCount };
  };

  // 고객 이동 처리 함수
  const handleClientMove = (
    clientId: string,
    sourceStageId: string,
    destinationStageId: string
  ) => {
    // 🎯 FormData 생성하여 서버로 전송
    const formData = new FormData();
    formData.append('intent', 'moveClient');
    formData.append('clientId', clientId);
    formData.append('targetStageId', destinationStageId);

    // 🎯 action 함수 호출
    moveFetcher.submit(formData, { method: 'post' });
  };

  // 새 고객 추가 처리 함수 (useFetcher 사용)
  const handleAddClient = async (clientData: {
    fullName: string;
    phone?: string; // 전화번호를 선택사항으로 변경
    email?: string;
    telecomProvider?: string;
    address?: string;
    occupation?: string;
    importance: 'high' | 'medium' | 'low';
    referredById?: string;
    tags?: string;
    notes?: string;
  }) => {
    // 🎯 FormData 생성
    const formData = new FormData();
    formData.append('intent', 'addClient');
    formData.append('fullName', clientData.fullName);
    if (clientData.phone) formData.append('phone', clientData.phone); // phone이 optional이므로 조건부 추가
    if (clientData.email) formData.append('email', clientData.email);
    if (clientData.telecomProvider)
      formData.append('telecomProvider', clientData.telecomProvider);
    if (clientData.address) formData.append('address', clientData.address);
    if (clientData.occupation)
      formData.append('occupation', clientData.occupation);
    formData.append('importance', clientData.importance);
    if (clientData.referredById)
      formData.append('referredById', clientData.referredById);
    if (clientData.tags) formData.append('tags', clientData.tags);
    if (clientData.notes) formData.append('notes', clientData.notes);

    // 🎯 action 함수 호출
    addClientFetcher.submit(formData, { method: 'post' });
  };

  // 기존 고객 새 영업 기회 처리 함수
  const handleExistingClientOpportunity = async (data: {
    clientId: string;
    clientName: string;
    insuranceType: string;
    notes: string;
    productName?: string;
    insuranceCompany?: string;
    monthlyPremium?: number;
    expectedCommission?: number;
  }) => {
    // 🎯 FormData 생성
    const formData = new FormData();
    formData.append('intent', 'existingClientOpportunity');
    formData.append('clientId', data.clientId);
    formData.append('clientName', data.clientName);
    formData.append('insuranceType', data.insuranceType);
    formData.append('notes', data.notes);

    // 🆕 새로운 상품 정보 필드들 추가
    if (data.productName) {
      formData.append('productName', data.productName);
    }
    if (data.insuranceCompany) {
      formData.append('insuranceCompany', data.insuranceCompany);
    }
    if (data.monthlyPremium !== undefined) {
      formData.append('monthlyPremium', data.monthlyPremium.toString());
    }
    if (data.expectedCommission !== undefined) {
      formData.append('expectedCommission', data.expectedCommission.toString());
    }

    // 🎯 action 함수 호출
    opportunityFetcher.submit(formData, { method: 'post' });
  };

  // 특정 단계에 고객 추가 함수
  const handleAddClientToStage = (stageId: string) => {
    setAddClientOpen(true);
  };

  // 🗑️ 영업에서 제외 핸들러
  const handleRemoveFromPipeline = (clientId: string, clientName: string) => {
    setClientToRemove({ id: clientId, name: clientName });
    setRemoveClientModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!clientToRemove) return;

    // 🎯 FormData 생성하여 서버로 전송
    const formData = new FormData();
    formData.append('intent', 'removeFromPipeline');
    formData.append('clientId', clientToRemove.id);

    // 🎯 action 함수 호출
    removeFetcher.submit(formData, { method: 'post' });

    // 모달 상태 초기화
    setRemoveClientModalOpen(false);
    setClientToRemove(null);
  };

  const handleCancelRemove = () => {
    setRemoveClientModalOpen(false);
    setClientToRemove(null);
  };

  // 🏢 계약 전환 핸들러
  const handleCreateContract = (
    clientId: string,
    clientName: string,
    products: any[]
  ) => {
    // 🏢 파이프라인에서 계약 완료 처리
    // 1. 파이프라인 상태를 "계약완료" 단계로 이동
    // 2. 고객 상세 페이지의 보험 계약 탭으로 이동하여 계약 등록
    navigate(
      `/clients/${clientId}?tab=insurance&createContract=true&fromPipeline=true&products=${JSON.stringify(
        products
      )}`
    );
  };

  // 🏢 영업 기회 편집 핸들러 (기존 고객 영업 기회 모달 재사용)
  const handleEditOpportunity = (clientId: string, clientName: string) => {
    setSelectedOpportunityClient({ clientId, clientName }); // 🎯 선택된 고객 정보 저장
    setExistingClientModalOpen(true);
  };

  // 필터가 적용되었는지 확인
  const isFilterActive =
    selectedReferrerId !== null ||
    selectedImportance !== 'all' ||
    searchQuery !== '';

  // 필터 초기화 함수
  const handleFilterReset = () => {
    setSearchQuery('');
    setSelectedReferrerId(null);
    setSelectedImportance('all');
  };

  const totalStats = getTotalStats();

  // 🎯 색상 타입 정의
  type StatsCardColor = 'blue' | 'orange' | 'green' | 'red' | 'emerald';

  // 🎯 통계 카드 데이터 배열
  const statsCards = [
    {
      id: 'total-clients',
      title: '전체 고객',
      value: totalStats.totalAllClients,
      description: '고객 관리의 모든 고객',
      icon: Users,
      color: 'blue' as StatsCardColor,
    },
    {
      id: 'pipeline-clients',
      title: '영업 관리 중',
      value: totalStats.pipelineClients,
      description: '현재 파이프라인 진행 중',
      icon: TrendingUp,
      color: 'orange' as StatsCardColor,
    },
    {
      id: 'contracted-clients',
      title: '계약 완료',
      value: totalStats.contractedClients,
      description: '실제 성과 달성 고객',
      icon: Target,
      color: 'green' as StatsCardColor,
    },
    {
      id: 'high-value-clients',
      title: '키맨 고객',
      value: totalStats.highValueClients,
      description: '고가치 중요 고객',
      icon: Users,
      color: 'red' as StatsCardColor,
    },
    {
      id: 'conversion-rate',
      title: '전환율',
      value: `${totalStats.conversionRate}%`,
      description: '계약 완료 성공률',
      icon: TrendingUp,
      color: 'emerald' as StatsCardColor,
    },
  ];

  // 🎯 통계 카드 렌더링 함수
  const renderStatsCard = (card: (typeof statsCards)[0]) => {
    const IconComponent = card.icon;
    const colorClasses: Record<StatsCardColor, string> = {
      blue: 'bg-blue-500/10 text-blue-600',
      orange: 'bg-orange-500/10 text-orange-600',
      green: 'bg-green-500/10 text-green-600',
      red: 'bg-red-500/10 text-red-600',
      emerald: 'bg-emerald-500/10 text-emerald-600',
    };

    return (
      <div
        key={card.id}
        className="flex items-center space-x-3 p-4 bg-card rounded-lg border"
      >
        <div className={`p-2 rounded-lg ${colorClasses[card.color]}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {card.title}
          </p>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </div>
      </div>
    );
  };

  return (
    <MainLayout title="영업 파이프라인">
      <style>
        {`
          /* 🎯 데스크톱 기존 스타일 복원 */
          @media (min-width: 768px) {
            main {
              overflow: hidden !important;
            }
          }
          
          /* 🎯 모바일 스크롤 문제 해결 */
          @media (max-width: 767.98px) {
            main {
              overflow: auto !important;
              height: auto !important;
              max-height: none !important;
            }
            
            .pipeline-mobile-container {
              min-height: 100vh;
              height: auto;
              overflow: visible;
              position: relative;
            }
            

          }
        `}
      </style>
      {/* 🎯 데스크톱과 모바일 조건부 렌더링 */}
      {isMobile ? (
        /* 🎯 새로운 모바일 레이아웃 */
        <MobilePipelineLayout
          statsCards={statsCards}
          stages={stages.map(stage => ({
            ...stage,
            stats: getStageStats(stage.id),
          }))}
          clients={filteredClients as unknown as Client[]}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedReferrerId={selectedReferrerId}
          onReferrerChange={setSelectedReferrerId}
          selectedImportance={selectedImportance}
          onImportanceChange={setSelectedImportance}
          potentialReferrers={potentialReferrers}
          isFilterActive={isFilterActive}
          onClientMove={handleClientMove}
          onAddClientToStage={handleAddClientToStage}
          onRemoveFromPipeline={handleRemoveFromPipeline}
          onCreateContract={handleCreateContract}
          onEditOpportunity={handleEditOpportunity}
          onAddNewClient={() => setAddClientOpen(true)}
          onExistingClientOpportunity={() => setExistingClientModalOpen(true)}
          onFilterReset={handleFilterReset}
          filteredClientsCount={filteredClients.length}
        />
      ) : (
        /* 🎯 데스크톱 레이아웃 - 기존 방식 복원 */
        <div
          className="h-full flex flex-col gap-4"
          style={{
            height: 'calc(100vh - 4rem - 1.5rem)',
            maxHeight: 'calc(100vh - 4rem - 1.5rem)',
            overflow: 'hidden',
          }}
        >
          {/* 🎯 상단 컨트롤 섹션 - 데스크톱 기존 방식 */}
          <div className="flex-shrink-0 space-y-4">
            {/* 🎯 MVP 통계 카드 - 데스크톱 그리드 */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {statsCards.map(renderStatsCard)}
              </div>
            </div>

            {/* 🎯 버튼과 검색을 같은 높이로 배치 - 데스크톱 */}
            <div className="flex items-center justify-between gap-4 flex-shrink-0">
              {/* 왼쪽: 검색 및 필터 */}
              <div className="flex items-center gap-6">
                <div className="flex w-full max-w-md items-center space-x-2">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="고객명, 전화번호 검색..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* 활성 필터 표시 */}
                  {isFilterActive && (
                    <div className="flex items-center gap-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="text-xs">
                          검색: {searchQuery}
                        </Badge>
                      )}
                      {selectedImportance !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          중요도:{' '}
                          {selectedImportance === 'high'
                            ? '높음'
                            : selectedImportance === 'medium'
                              ? '보통'
                              : '낮음'}
                        </Badge>
                      )}
                      {selectedReferrerId && (
                        <Badge variant="secondary" className="text-xs">
                          소개자:{' '}
                          {
                            potentialReferrers.find(
                              r => r.id === selectedReferrerId
                            )?.name
                          }
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* 필터 드롭다운 메뉴 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isFilterActive ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>필터</span>
                        {isFilterActive && (
                          <Badge
                            variant="destructive"
                            className="ml-1 px-1 text-xs"
                          >
                            ●
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[320px] p-4 bg-background"
                      align="end"
                      sideOffset={4}
                    >
                      <PipelineFilters
                        referrers={potentialReferrers}
                        selectedReferrerId={selectedReferrerId}
                        onReferrerChange={setSelectedReferrerId}
                        selectedImportance={selectedImportance}
                        onImportanceChange={setSelectedImportance}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 오른쪽: 액션 버튼들 */}
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  onClick={() => setExistingClientModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>기존 고객 영업 기회 추가</span>
                </Button>

                <Button
                  onClick={() => setAddClientOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>신규 고객 추가</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 🎯 칸반보드 메인 콘텐츠 - 데스크톱 기존 스크롤 영역 */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <PipelineBoard
              stages={stages.map(stage => ({
                ...stage,
                stats: getStageStats(stage.id),
              }))}
              clients={filteredClients as unknown as Client[]}
              onClientMove={handleClientMove}
              onAddClientToStage={handleAddClientToStage}
              onRemoveFromPipeline={handleRemoveFromPipeline}
              onCreateContract={handleCreateContract}
              onEditOpportunity={handleEditOpportunity}
            />
          </div>

          {/* 필터 결과 안내 */}
          {isFilterActive && (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed flex-shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  필터 적용됨: {filteredClients.length}명의 고객이 표시되고
                  있습니다
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedReferrerId(null);
                  setSelectedImportance('all');
                }}
              >
                필터 초기화
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 신규 고객 추가 모달 */}
      <AddClientModal
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onSubmit={handleAddClient}
        isSubmitting={isSubmitting}
        error={submitError}
        referrers={potentialReferrers}
      />

      {/* 🚀 기존 고객 새 영업 기회 모달 */}
      <ExistingClientOpportunityModal
        isOpen={existingClientModalOpen}
        onClose={() => {
          setExistingClientModalOpen(false);
          setSelectedOpportunityClient(null); // 🎯 모달 닫힐 때 선택된 고객 정보 초기화
        }}
        onConfirm={handleExistingClientOpportunity}
        clients={clients.map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone,
          currentStage: stages.find(s => s.id === client.stageId)?.name,
        }))}
        isLoading={opportunityFetcher.state === 'submitting'}
        preSelectedClientId={selectedOpportunityClient?.clientId} // 🎯 특정 고객 자동 선택
      />

      {/* 🗑️ 영업에서 제외 모달 */}
      <RemoveClientModal
        isOpen={removeClientModalOpen}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        clientName={clientToRemove?.name || ''}
        isLoading={removeFetcher.state === 'submitting'}
      />
    </MainLayout>
  );
}
