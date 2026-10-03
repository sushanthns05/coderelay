import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { language, source } = await request.json()

    if (!language || !source) {
      return NextResponse.json({ error: 'Language and source code are required' }, { status: 400 })
    }

    // Map our editor languages to Piston API language names and versions
    const languageMap: Record<string, { language: string, version: string }> = {
      'javascript': { language: 'javascript', version: '18.15.0' },
      'python': { language: 'python', version: '3.10.0' },
      'cpp': { language: 'cpp', version: '10.2.0' },
      'java': { language: 'java', version: '15.0.2' },
    }

    const targetLang = languageMap[language]
    if (!targetLang) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    // Call the free Piston Code Execution API
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: targetLang.language,
        version: targetLang.version,
        files: [
          {
            content: source
          }
        ],
      })
    })

    const data = await response.json()

    if (data.compile && data.compile.code !== 0) {
      // Compilation error
      return NextResponse.json({ 
        output: data.compile.output,
        status: 'error'
      })
    }

    return NextResponse.json({
      output: data.run.output,
      status: data.run.code === 0 ? 'success' : 'error'
    })

  } catch (error) {
    console.error('Execution error:', error)
    return NextResponse.json({ error: 'Failed to execute code' }, { status: 500 })
  }
}
