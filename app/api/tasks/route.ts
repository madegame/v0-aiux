import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (replace with database in production)
let tasks: any[] = [
  {
    id: '1',
    title: 'Setup project structure',
    status: 'completed',
    priority: 'high',
    tags: ['setup', 'project'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Implement 3-panel layout',
    status: 'completed',
    priority: 'high',
    tags: ['ui', 'layout'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Create dual chatboxes',
    status: 'in-progress',
    priority: 'high',
    tags: ['chat', 'ai'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Setup integrations dashboard',
    status: 'todo',
    priority: 'medium',
    tags: ['integrations', 'dashboard'],
    createdAt: new Date(),
  },
  {
    id: '5',
    title: 'Implement file explorer',
    status: 'todo',
    priority: 'medium',
    tags: ['files', 'ui'],
    createdAt: new Date(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter');

  let filtered = tasks;
  if (filter && filter !== 'all') {
    filtered = tasks.filter((t) => t.status === filter);
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newTask = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
    };
    tasks.push(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }
  tasks = tasks.filter((t) => t.id !== id);
  return NextResponse.json({ success: true });
}
