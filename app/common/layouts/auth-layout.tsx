import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Card } from '~/common/components/ui/card';
import { BorderBeam } from '~/common/components/magicui/border-beam';
import { DotPattern } from '~/common/components/magicui/dot-pattern';
import { FlickeringGrid } from '~/common/components/magicui/flickering-grid';
import { AnimatedGridPattern } from '~/common/components/magicui/animated-grid-pattern';
import { cn } from '~/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  showLogo?: boolean;
}

export function AuthLayout({
  children,
  title = 'SureCRM',
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-background to-background/90 p-3 sm:p-4 lg:p-6">
      {/* 배경 애니메이션 - 도트 패턴 */}
      <DotPattern
        className="absolute inset-0 w-full h-full opacity-15 text-primary/30 pointer-events-none"
        width={30}
        height={30}
        radius={1}
      />

      {/* 배경 애니메이션 - 깜빡이는 그리드 */}
      <FlickeringGrid
        className="absolute inset-0 z-0 pointer-events-none [mask-image:radial-gradient(70%_70%_at_center,white,transparent)]"
        squareSize={2}
        gridGap={20}
        color="var(--primary)"
        maxOpacity={0.08}
        flickerChance={0.03}
      />

      {/* 배경 애니메이션 - 애니메이티드 그리드 패턴 */}
      <AnimatedGridPattern
        className="absolute inset-0 z-0 opacity-20 text-accent/30 pointer-events-none [mask-image:radial-gradient(80%_80%_at_center,white,transparent)]"
        width={45}
        height={45}
        numSquares={30}
        maxOpacity={0.3}
        duration={6}
      />

      {showLogo && (
        <div className="text-center mb-3 sm:mb-4 lg:mb-6 relative z-20">
          <Link
            to="/"
            className="inline-block cursor-pointer relative z-20 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </Link>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-muted-foreground px-2 sm:px-4 lg:px-0">
            보험 영업의 소개 네트워크와 영업 파이프라인 관리
          </p>
        </div>
      )}

      <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md relative z-10">
        <Card className="relative overflow-hidden backdrop-blur-sm bg-card/80 dark:bg-card/40 p-4 sm:p-6 lg:p-8 border border-border shadow-lg">
          <BorderBeam
            size={100}
            colorFrom="var(--primary)"
            colorTo="var(--accent)"
            duration={12}
          />

          {children}

          <div className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
            &copy; {new Date().getFullYear()} SureCRM. All rights reserved.
          </div>
        </Card>

        <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 -z-10 w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-30" />
      </div>
    </div>
  );
}
