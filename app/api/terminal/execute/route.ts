import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { command, cwd } = await request.json();
    
    if (!command) {
      return NextResponse.json({ error: 'Command required' }, { status: 400 });
    }

    const timeout = 30000;
    const { stdout, stderr } = await execAsync(command, { 
      cwd: cwd || process.cwd(),
      timeout,
      maxBuffer: 1024 * 1024 * 10
    });

    return NextResponse.json({
      success: true,
      output: stdout,
      error: stderr,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      output: error.stdout || '',
      error: error.message,
      code: error.code,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    allowedCommands: ['ls', 'cat', 'grep', 'git', 'pnpm', 'npm', 'node', 'echo', 'pwd', 'whoami']
  });
}
