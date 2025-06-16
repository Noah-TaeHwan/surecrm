import type {
  AccessibilityValidationResult,
  AccessibilityError,
  AccessibilityWarning,
  AccessibilitySuggestion,
  AccessibilityRuleCode,
  AriaAttributes,
  ComponentDebugInfo,
} from './types';
import { AccessibilityRules } from './types';

// =============================================================================
// ACCESSIBILITY VALIDATION UTILITIES
// =============================================================================

/**
 * WCAG 2.1 접근성 검증 유틸리티
 * 컴포넌트의 접근성 준수 여부를 검사하고 개선 사항을 제안합니다.
 */
export class AccessibilityValidator {
  private static instance: AccessibilityValidator;

  public static getInstance(): AccessibilityValidator {
    if (!AccessibilityValidator.instance) {
      AccessibilityValidator.instance = new AccessibilityValidator();
    }
    return AccessibilityValidator.instance;
  }

  /**
   * 컴포넌트의 전체 접근성을 검증합니다.
   */
  public validateComponent(
    element: HTMLElement,
    props: Record<string, any>
  ): AccessibilityValidationResult {
    const errors: AccessibilityError[] = [];
    const warnings: AccessibilityWarning[] = [];
    const suggestions: AccessibilitySuggestion[] = [];

    // WCAG 1.1.1 - Non-text Content
    this.validateAltText(element, errors, warnings);

    // WCAG 1.3.1 - Info and Relationships
    this.validateSemanticStructure(element, props, errors, warnings);

    // WCAG 1.4.3 - Contrast (Minimum)
    this.validateColorContrast(element, warnings, suggestions);

    // WCAG 2.1.1 - Keyboard
    this.validateKeyboardAccessibility(element, props, errors, warnings);

    // WCAG 2.4.6 - Headings and Labels
    this.validateLabels(element, props, errors, warnings);

    // WCAG 4.1.2 - Name, Role, Value
    this.validateAriaAttributes(element, props, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * WCAG 1.1.1 - 대체 텍스트 검증
   */
  private validateAltText(
    element: HTMLElement,
    errors: AccessibilityError[],
    warnings: AccessibilityWarning[]
  ): void {
    const images = element.querySelectorAll('img');

    images.forEach((img, index) => {
      if (
        !img.alt &&
        !img.getAttribute('aria-label') &&
        !img.getAttribute('aria-labelledby')
      ) {
        errors.push({
          code: AccessibilityRules.ALT_TEXT_REQUIRED,
          message: `이미지 ${index + 1}에 대체 텍스트가 없습니다.`,
          severity: 'error',
          element: `img[${index}]`,
          wcagGuideline: 'WCAG 1.1.1',
        });
      }
    });
  }

  /**
   * WCAG 1.3.1 - 의미 구조 검증
   */
  private validateSemanticStructure(
    element: HTMLElement,
    props: Record<string, any>,
    errors: AccessibilityError[],
    warnings: AccessibilityWarning[]
  ): void {
    // 적절한 시맨틱 태그 사용 검증
    if (element.tagName === 'DIV' && !element.getAttribute('role')) {
      const hasInteractiveContent = element.querySelector(
        'button, input, select, textarea, a[href]'
      );

      if (hasInteractiveContent) {
        warnings.push({
          code: AccessibilityRules.SEMANTIC_STRUCTURE,
          message: '상호작용 요소를 포함한 div에 적절한 role이 없습니다.',
          recommendation:
            'role="region", role="group" 또는 적절한 시맨틱 태그를 사용하세요.',
          wcagGuideline: 'WCAG 1.3.1',
        });
      }
    }

    // 헤딩 계층 구조 검증
    this.validateHeadingHierarchy(element, warnings);
  }

  /**
   * 헤딩 계층 구조 검증
   */
  private validateHeadingHierarchy(
    element: HTMLElement,
    warnings: AccessibilityWarning[]
  ): void {
    const headings = Array.from(
      element.querySelectorAll('h1, h2, h3, h4, h5, h6')
    );

    for (let i = 1; i < headings.length; i++) {
      const currentLevel = parseInt(headings[i].tagName.charAt(1));
      const previousLevel = parseInt(headings[i - 1].tagName.charAt(1));

      if (currentLevel > previousLevel + 1) {
        warnings.push({
          code: AccessibilityRules.HEADING_HIERARCHY,
          message: `헤딩 레벨이 건너뛰어졌습니다: h${previousLevel} 다음에 h${currentLevel}`,
          recommendation: `h${previousLevel + 1}을 사용하거나 헤딩 구조를 재검토하세요.`,
          wcagGuideline: 'WCAG 1.3.1',
        });
      }
    }
  }

  /**
   * WCAG 1.4.3 - 색상 대비 검증 (기본적인 검사)
   */
  private validateColorContrast(
    element: HTMLElement,
    warnings: AccessibilityWarning[],
    suggestions: AccessibilitySuggestion[]
  ): void {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;

    // 기본적인 색상 대비 체크 (실제 구현에서는 더 정교한 계산 필요)
    if (
      backgroundColor === 'rgba(0, 0, 0, 0)' ||
      backgroundColor === 'transparent'
    ) {
      suggestions.push({
        code: AccessibilityRules.COLOR_CONTRAST,
        message: '배경색이 투명합니다.',
        improvement:
          '충분한 색상 대비를 위해 명시적인 배경색을 설정하는 것을 고려하세요.',
        wcagGuideline: 'WCAG 1.4.3',
      });
    }
  }

  /**
   * WCAG 2.1.1 - 키보드 접근성 검증
   */
  private validateKeyboardAccessibility(
    element: HTMLElement,
    props: Record<string, any>,
    errors: AccessibilityError[],
    warnings: AccessibilityWarning[]
  ): void {
    const interactiveElements = element.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex], [role="button"], [role="link"]'
    );

    interactiveElements.forEach((el, index) => {
      const tabIndex = el.getAttribute('tabindex');

      // tabindex="-1"이 아닌 상호작용 요소는 키보드로 접근 가능해야 함
      if (tabIndex !== '-1') {
        const isKeyboardAccessible =
          el.tagName.toLowerCase() === 'button' ||
          el.tagName.toLowerCase() === 'input' ||
          el.tagName.toLowerCase() === 'select' ||
          el.tagName.toLowerCase() === 'textarea' ||
          (el.tagName.toLowerCase() === 'a' && el.getAttribute('href')) ||
          tabIndex === '0';

        if (!isKeyboardAccessible) {
          warnings.push({
            code: AccessibilityRules.KEYBOARD_ACCESSIBLE,
            message: `요소 ${index + 1}이 키보드로 접근하기 어려울 수 있습니다.`,
            recommendation:
              'tabindex="0"을 추가하거나 적절한 시맨틱 태그를 사용하세요.',
            wcagGuideline: 'WCAG 2.1.1',
          });
        }
      }
    });
  }

  /**
   * WCAG 2.4.6 - 레이블 검증
   */
  private validateLabels(
    element: HTMLElement,
    props: Record<string, any>,
    errors: AccessibilityError[],
    warnings: AccessibilityWarning[]
  ): void {
    const formControls = element.querySelectorAll('input, select, textarea');

    formControls.forEach((control, index) => {
      const hasLabel =
        control.getAttribute('aria-label') ||
        control.getAttribute('aria-labelledby') ||
        element.querySelector(`label[for="${control.id}"]`) ||
        control.closest('label');

      if (!hasLabel) {
        errors.push({
          code: AccessibilityRules.DESCRIPTIVE_LABELS,
          message: `폼 컨트롤 ${index + 1}에 레이블이 없습니다.`,
          severity: 'error',
          element: `${control.tagName.toLowerCase()}[${index}]`,
          wcagGuideline: 'WCAG 2.4.6',
        });
      }
    });
  }

  /**
   * WCAG 4.1.2 - ARIA 속성 검증
   */
  private validateAriaAttributes(
    element: HTMLElement,
    props: Record<string, any>,
    errors: AccessibilityError[],
    warnings: AccessibilityWarning[]
  ): void {
    const ariaElements = element.querySelectorAll(
      '[role], [aria-label], [aria-labelledby], [aria-describedby]'
    );

    ariaElements.forEach((el, index) => {
      const role = el.getAttribute('role');

      // 유효하지 않은 role 값 검사
      if (role && !this.isValidRole(role)) {
        errors.push({
          code: AccessibilityRules.ROLE_DEFINITION,
          message: `유효하지 않은 role 값: "${role}"`,
          severity: 'error',
          element: `[role="${role}"][${index}]`,
          wcagGuideline: 'WCAG 4.1.2',
        });
      }

      // aria-labelledby 참조 검증
      const labelledBy = el.getAttribute('aria-labelledby');
      if (labelledBy) {
        const referencedElement = document.getElementById(labelledBy);
        if (!referencedElement) {
          errors.push({
            code: AccessibilityRules.ARIA_LABELS,
            message: `aria-labelledby가 존재하지 않는 요소를 참조합니다: "${labelledBy}"`,
            severity: 'error',
            element: `[aria-labelledby="${labelledBy}"][${index}]`,
            wcagGuideline: 'WCAG 4.1.2',
          });
        }
      }
    });
  }

  /**
   * 유효한 ARIA role인지 확인
   */
  private isValidRole(role: string): boolean {
    const validRoles = [
      'alert',
      'alertdialog',
      'application',
      'article',
      'banner',
      'button',
      'cell',
      'checkbox',
      'columnheader',
      'combobox',
      'complementary',
      'contentinfo',
      'definition',
      'dialog',
      'directory',
      'document',
      'feed',
      'figure',
      'form',
      'grid',
      'gridcell',
      'group',
      'heading',
      'img',
      'link',
      'list',
      'listbox',
      'listitem',
      'log',
      'main',
      'marquee',
      'math',
      'menu',
      'menubar',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'navigation',
      'none',
      'note',
      'option',
      'presentation',
      'progressbar',
      'radio',
      'radiogroup',
      'region',
      'row',
      'rowgroup',
      'rowheader',
      'scrollbar',
      'search',
      'searchbox',
      'separator',
      'slider',
      'spinbutton',
      'status',
      'switch',
      'tab',
      'table',
      'tablist',
      'tabpanel',
      'term',
      'textbox',
      'timer',
      'toolbar',
      'tooltip',
      'tree',
      'treegrid',
      'treeitem',
    ];

    return validRoles.includes(role);
  }

  /**
   * 접근성 점수 계산 (0-100)
   */
  public calculateAccessibilityScore(
    result: AccessibilityValidationResult
  ): number {
    const totalIssues = result.errors.length + result.warnings.length;
    const errorWeight = 10;
    const warningWeight = 5;

    const penalty =
      result.errors.length * errorWeight +
      result.warnings.length * warningWeight;
    const score = Math.max(0, 100 - penalty);

    return score;
  }

  /**
   * WCAG 준수 레벨 결정
   */
  public getWCAGComplianceLevel(
    result: AccessibilityValidationResult
  ): 'A' | 'AA' | 'AAA' | 'Non-compliant' {
    if (result.errors.length > 0) {
      return 'Non-compliant';
    }

    if (result.warnings.length === 0) {
      return 'AAA';
    } else if (result.warnings.length <= 2) {
      return 'AA';
    } else {
      return 'A';
    }
  }
}

// =============================================================================
// ACCESSIBILITY HELPER FUNCTIONS
// =============================================================================

/**
 * 컴포넌트의 접근성을 검증하는 헬퍼 함수
 */
export function validateAccessibility(
  element: HTMLElement,
  props: Record<string, any> = {}
): AccessibilityValidationResult {
  const validator = AccessibilityValidator.getInstance();
  return validator.validateComponent(element, props);
}

/**
 * ARIA 속성을 안전하게 생성하는 헬퍼 함수
 */
export function createAriaAttributes(
  attributes: Partial<AriaAttributes>
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * 접근 가능한 ID 생성
 */
export function generateAccessibleId(prefix: string = 'accessible'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 키보드 이벤트 핸들러 생성
 */
export function createKeyboardHandler(
  onClick: () => void,
  options: { enterKey?: boolean; spaceKey?: boolean } = {}
) {
  const { enterKey = true, spaceKey = true } = options;

  return (event: React.KeyboardEvent) => {
    if (
      (enterKey && event.key === 'Enter') ||
      (spaceKey && event.key === ' ')
    ) {
      event.preventDefault();
      onClick();
    }
  };
}

/**
 * 포커스 관리 유틸리티
 */
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]:not([disabled])',
  ].join(', ');

  /**
   * 포커스 가능한 요소들을 찾습니다
   */
  public static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * 첫 번째 포커스 가능한 요소에 포커스를 설정합니다
   */
  public static focusFirst(container: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }

  /**
   * 마지막 포커스 가능한 요소에 포커스를 설정합니다
   */
  public static focusLast(container: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }

  /**
   * 포커스 트랩을 생성합니다 (모달 등에서 사용)
   */
  public static createFocusTrap(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 정리 함수 반환
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

// =============================================================================
// DEVELOPMENT DEBUGGING UTILITIES
// =============================================================================

/**
 * 개발 환경에서 컴포넌트 디버그 정보를 생성합니다
 */
export function createDebugInfo(
  componentName: string,
  element: HTMLElement,
  props: Record<string, any>
): ComponentDebugInfo {
  const validator = AccessibilityValidator.getInstance();
  const validationResult = validator.validateComponent(element, props);
  const accessibilityScore =
    validator.calculateAccessibilityScore(validationResult);
  const wcagLevel = validator.getWCAGComplianceLevel(validationResult);

  return {
    componentName,
    props,
    computedClasses: Array.from(element.classList),
    breakpointValues: {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
      '2xl': '2xl',
    }, // 실제 구현에서는 현재 브레이크포인트 값들을 추출
    accessibilityScore,
    wcagCompliance: {
      level: wcagLevel === 'Non-compliant' ? 'A' : wcagLevel,
      passedRules: [], // 실제 구현에서는 통과한 규칙들을 추출
      failedRules: validationResult.errors.map(
        error => error.code as AccessibilityRuleCode
      ),
    },
  };
}

/**
 * 접근성 검증 결과를 콘솔에 출력합니다
 */
export function logAccessibilityResults(
  componentName: string,
  result: AccessibilityValidationResult
): void {
  if (process.env.NODE_ENV !== 'development') return;

  const validator = AccessibilityValidator.getInstance();
  const score = validator.calculateAccessibilityScore(result);
  const level = validator.getWCAGComplianceLevel(result);

  console.group(`🔍 ${componentName} 접근성 검증 결과`);
  console.log(`📊 점수: ${score}/100`);
  console.log(`🏆 WCAG 준수 레벨: ${level}`);

  if (result.errors.length > 0) {
    console.group('❌ 오류');
    result.errors.forEach(error => {
      console.error(`${error.code}: ${error.message}`);
    });
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('⚠️ 경고');
    result.warnings.forEach(warning => {
      console.warn(`${warning.code}: ${warning.message}`);
      console.log(`💡 권장사항: ${warning.recommendation}`);
    });
    console.groupEnd();
  }

  if (result.suggestions.length > 0) {
    console.group('💡 개선 제안');
    result.suggestions.forEach(suggestion => {
      console.info(`${suggestion.code}: ${suggestion.message}`);
      console.log(`🚀 개선 방법: ${suggestion.improvement}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
}

// 기본 내보내기
export default AccessibilityValidator;
