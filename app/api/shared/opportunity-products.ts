// 🆕 영업 기회 상품 정보 관리 API
import { eq, and, inArray, gte, lte } from 'drizzle-orm';
import { db } from '~/lib/core/db.server';
import { opportunityProducts } from '~/lib/schema/core';
import type {
  NewOpportunityProduct,
  OpportunityProduct,
} from '~/lib/schema/core';

/**
 * 영업 기회 상품 정보 생성
 */
export async function createOpportunityProduct(
  clientId: string,
  agentId: string,
  productData: {
    productName: string;
    insuranceCompany: string;
    insuranceType: string;
    monthlyPremium?: number;
    expectedCommission?: number;
    notes?: string;
  }
) {
  try {
    console.log('🛍️ 영업 기회 상품 정보 생성:', {
      clientId,
      agentId,
      productData,
    });

    const newProduct: NewOpportunityProduct = {
      clientId,
      agentId,
      productName: productData.productName,
      insuranceCompany: productData.insuranceCompany,
      insuranceType: productData.insuranceType as any,
      monthlyPremium: productData.monthlyPremium?.toString(),
      expectedCommission: productData.expectedCommission?.toString(),
      notes: productData.notes,
      status: 'active',
    };

    const [createdProduct] = await db
      .insert(opportunityProducts)
      .values(newProduct)
      .returning();

    console.log('✅ 영업 기회 상품 정보 생성 완료:', createdProduct.id);
    return {
      success: true,
      data: createdProduct,
      message: '상품 정보가 성공적으로 생성되었습니다.',
    };
  } catch (error) {
    console.error('❌ 영업 기회 상품 정보 생성 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '상품 정보 생성에 실패했습니다.',
    };
  }
}

/**
 * 고객별 영업 기회 상품 정보 조회
 */
export async function getOpportunityProductsByClient(
  clientId: string,
  agentId: string
) {
  try {
    console.log('📋 고객별 영업 기회 상품 정보 조회:', { clientId, agentId });

    const products = await db
      .select()
      .from(opportunityProducts)
      .where(
        and(
          eq(opportunityProducts.clientId, clientId),
          eq(opportunityProducts.agentId, agentId),
          eq(opportunityProducts.status, 'active')
        )
      )
      .orderBy(opportunityProducts.createdAt);

    console.log('✅ 영업 기회 상품 정보 조회 완료:', products.length + '개');
    return {
      success: true,
      data: products,
      count: products.length,
    };
  } catch (error) {
    console.error('❌ 영업 기회 상품 정보 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '상품 정보 조회에 실패했습니다.',
      data: [],
    };
  }
}

/**
 * 영업 기회 상품 정보 수정
 */
export async function updateOpportunityProduct(
  productId: string,
  agentId: string,
  updateData: {
    productName?: string;
    insuranceCompany?: string;
    monthlyPremium?: number;
    expectedCommission?: number;
    notes?: string;
    status?: string;
  }
) {
  try {
    console.log('🔄 영업 기회 상품 정보 수정:', {
      productId,
      agentId,
      updateData,
    });

    const updatedFields: any = {
      updatedAt: new Date(),
    };

    // 변경된 필드만 업데이트
    if (updateData.productName !== undefined) {
      updatedFields.productName = updateData.productName;
    }
    if (updateData.insuranceCompany !== undefined) {
      updatedFields.insuranceCompany = updateData.insuranceCompany;
    }
    if (updateData.monthlyPremium !== undefined) {
      updatedFields.monthlyPremium = updateData.monthlyPremium.toString();
    }
    if (updateData.expectedCommission !== undefined) {
      updatedFields.expectedCommission =
        updateData.expectedCommission.toString();
    }
    if (updateData.notes !== undefined) {
      updatedFields.notes = updateData.notes;
    }
    if (updateData.status !== undefined) {
      updatedFields.status = updateData.status;
    }

    const [updatedProduct] = await db
      .update(opportunityProducts)
      .set(updatedFields)
      .where(
        and(
          eq(opportunityProducts.id, productId),
          eq(opportunityProducts.agentId, agentId)
        )
      )
      .returning();

    if (!updatedProduct) {
      return {
        success: false,
        message: '상품 정보를 찾을 수 없거나 권한이 없습니다.',
      };
    }

    console.log('✅ 영업 기회 상품 정보 수정 완료');
    return {
      success: true,
      data: updatedProduct,
      message: '상품 정보가 성공적으로 수정되었습니다.',
    };
  } catch (error) {
    console.error('❌ 영업 기회 상품 정보 수정 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '상품 정보 수정에 실패했습니다.',
    };
  }
}

/**
 * 영업 기회 상품 정보 삭제 (soft delete)
 */
export async function deleteOpportunityProduct(
  productId: string,
  agentId: string
) {
  try {
    console.log('🗑️ 영업 기회 상품 정보 삭제:', { productId, agentId });

    const [deletedProduct] = await db
      .update(opportunityProducts)
      .set({
        status: 'inactive',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(opportunityProducts.id, productId),
          eq(opportunityProducts.agentId, agentId)
        )
      )
      .returning();

    if (!deletedProduct) {
      return {
        success: false,
        message: '상품 정보를 찾을 수 없거나 권한이 없습니다.',
      };
    }

    console.log('✅ 영업 기회 상품 정보 삭제 완료');
    return {
      success: true,
      data: deletedProduct,
      message: '상품 정보가 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('❌ 영업 기회 상품 정보 삭제 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '상품 정보 삭제에 실패했습니다.',
    };
  }
}

/**
 * 에이전트별 전체 영업 기회 상품 통계
 */
export async function getOpportunityProductStats(agentId: string) {
  try {
    console.log('📊 에이전트별 영업 기회 상품 통계 조회:', { agentId });

    const products = await db
      .select()
      .from(opportunityProducts)
      .where(
        and(
          eq(opportunityProducts.agentId, agentId),
          eq(opportunityProducts.status, 'active')
        )
      );

    // 통계 계산
    const totalProducts = products.length;
    const totalPremium = products.reduce(
      (sum: number, product: OpportunityProduct) => {
        return sum + parseFloat(product.monthlyPremium || '0');
      },
      0
    );
    const totalCommission = products.reduce(
      (sum: number, product: OpportunityProduct) => {
        return sum + parseFloat(product.expectedCommission || '0');
      },
      0
    );

    // 보험 타입별 통계
    const typeStats = products.reduce(
      (
        stats: Record<
          string,
          { count: number; premium: number; commission: number }
        >,
        product: OpportunityProduct
      ) => {
        const type = product.insuranceType;
        if (!stats[type]) {
          stats[type] = { count: 0, premium: 0, commission: 0 };
        }
        stats[type].count++;
        stats[type].premium += parseFloat(product.monthlyPremium || '0');
        stats[type].commission += parseFloat(product.expectedCommission || '0');
        return stats;
      },
      {} as Record<
        string,
        { count: number; premium: number; commission: number }
      >
    );

    const result = {
      totalProducts,
      totalPremium,
      totalCommission,
      averagePremium: totalProducts > 0 ? totalPremium / totalProducts : 0,
      averageCommission:
        totalProducts > 0 ? totalCommission / totalProducts : 0,
      typeStats,
    };

    console.log('✅ 영업 기회 상품 통계 조회 완료');
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ 영업 기회 상품 통계 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '상품 통계 조회에 실패했습니다.',
    };
  }
}

/**
 * 🎯 계약 완료 단계의 실제 매출 계산 (대시보드/보고서용) - 간소화 버전
 */
export async function getActualRevenue(
  agentId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    console.log('💰 실제 매출 계산:', { agentId, startDate, endDate });

    // 현재는 모든 활성 상품을 기준으로 계산 (추후 계약 완료 단계 로직 추가 예정)
    const conditions = [
      eq(opportunityProducts.agentId, agentId),
      eq(opportunityProducts.status, 'active'),
    ];

    if (startDate) {
      conditions.push(gte(opportunityProducts.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(opportunityProducts.createdAt, endDate));
    }

    const contractedProducts = await db
      .select()
      .from(opportunityProducts)
      .where(and(...conditions));

    // 실제 매출 계산
    const totalMonthlyPremium = contractedProducts.reduce(
      (sum: number, product: any) => {
        return sum + parseFloat(product.monthlyPremium || '0');
      },
      0
    );

    const totalExpectedCommission = contractedProducts.reduce(
      (sum: number, product: any) => {
        return sum + parseFloat(product.expectedCommission || '0');
      },
      0
    );

    // 계약 수수료를 실제 매출로 계산 (1건 계약 = 1회성 수수료)
    const totalRevenue = totalExpectedCommission;

    console.log('✅ 실제 매출 계산 완료:', {
      contractedProductsCount: contractedProducts.length,
      totalMonthlyPremium,
      totalExpectedCommission,
      totalRevenue,
    });

    return {
      success: true,
      data: {
        totalRevenue,
        totalMonthlyPremium,
        totalExpectedCommission,
        contractedProducts,
        contractedCount: contractedProducts.length,
      },
    };
  } catch (error) {
    console.error('❌ 실제 매출 계산 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: '실제 매출 계산에 실패했습니다.',
    };
  }
}
