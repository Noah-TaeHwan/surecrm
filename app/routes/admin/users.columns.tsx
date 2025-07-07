'use client';

import type { ColumnDef, CellContext } from '@tanstack/react-table';
import { Badge } from '~/common/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '~/common/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/common/components/ui/dropdown-menu';

// 사용자 데이터 타입 정의
export interface User {
  id: string;
  fullName: string | null;
  email: string | null;
  role: 'agent' | 'team_admin' | 'system_admin' | null;
  createdAt: string;
}

const roleVariantMap: {
  [key: string]: 'default' | 'secondary' | 'outline';
} = {
  system_admin: 'default',
  team_admin: 'secondary',
  agent: 'outline',
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'fullName',
    header: '이름',
  },
  {
    accessorKey: 'email',
    header: '이메일',
  },
  {
    accessorKey: 'role',
    header: '역할',
    cell: ({ row }: CellContext<User, unknown>) => {
      const role = row.getValue('role') as string;
      const variant = roleVariantMap[role] || 'outline';
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: '가입일',
    cell: ({ row }: CellContext<User, unknown>) => {
      const date = new Date(row.getValue('createdAt'));
      return <div className="font-medium">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }: CellContext<User, unknown>) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              사용자 ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>사용자 정보 보기</DropdownMenuItem>
            <DropdownMenuItem>사용자 비활성화</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
