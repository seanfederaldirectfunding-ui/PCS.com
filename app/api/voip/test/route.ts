import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.VOIPSTUDIO_API_KEY
  
  // Test the VoIPStudio API with a simple request
  try {
    const response = await fetch("https://l7api.com/v1.1/voipstudio/account", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await response.text()

    return NextResponse.json({
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) || 'MISSING',
      statusCode: response.status,
      statusText: response.statusText,
      response: data,
      endpoint: "https://l7api.com/v1.1/voipstudio/account"
    })
  } catch (error: any) {
    return NextResponse.json({
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      error: error.message,
      endpoint: "https://l7api.com/v1.1/voipstudio/account"
    })
  }
}
