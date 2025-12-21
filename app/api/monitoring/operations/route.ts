import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface OperationLog {
  id: string;
  operation: string;
  userId: string | null;
  targetId: string | null;
  status: string;
  duration: number | null;
  errorMessage: string | null;
  metadata: any;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    let userRole: string | null = null;

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
      userRole = session.user.role;
    } else {
      // Try JWT from mobile app
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-key';
          const decoded = jwt.verify(token, jwtSecret) as { id: string; role: string };
          userId = decoded.id;
          userRole = decoded.role;
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
        }
      }
    }

    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // success, error, pending
    const operation = searchParams.get('operation'); // specific operation type

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (operation) {
      where.operation = operation;
    }

    const operations = await prisma.operationLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // جلب بيانات المستخدمين بشكل منفصل
    const userIds = operations.map((op: OperationLog) => op.userId).filter(Boolean);
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true
      }
    }) : [];

    const usersMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      operations: operations.map((op: OperationLog) => ({
        id: op.id,
        operation: op.operation,
        status: op.status,
        duration: op.duration,
        errorMessage: op.errorMessage,
        user: op.userId ? usersMap[op.userId] : null,
        targetId: op.targetId,
        metadata: op.metadata,
        createdAt: op.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching operations:', error);
    return NextResponse.json({ error: 'خطأ في جلب العمليات' }, { status: 500 });
  }
}