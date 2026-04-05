import { NextRequest, NextResponse } from 'next/server';

// Demo worktree data
const worktrees = [
  {
    id: 'main',
    branch: 'main',
    path: '/workspace/main',
    isCurrent: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'feature-1',
    branch: 'feature/ui-redesign',
    path: '/workspace/feature-1',
    isCurrent: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export async function GET(request: NextRequest) {
  return NextResponse.json(worktrees);
}

export async function POST(request: NextRequest) {
  try {
    const { branchName, taskId } = await request.json();

    const newWorktree = {
      id: `worktree-${Date.now()}`,
      branch: branchName,
      path: `/workspace/${branchName.replace(/\//g, '-')}`,
      isCurrent: false,
      taskId,
      createdAt: new Date(),
    };

    // In production: execute git worktree add command
    // For now, return success
    return NextResponse.json(
      {
        success: true,
        worktree: newWorktree,
        message: `Worktree created for branch: ${branchName}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create worktree' },
      { status: 500 }
    );
  }
}
