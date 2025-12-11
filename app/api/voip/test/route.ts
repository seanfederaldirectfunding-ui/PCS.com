import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.VOIPSTUDIO_API_KEY
  const username = process.env.NEXT_PUBLIC_VOIP_USERNAME
  
  // Test multiple endpoint formats to find the correct one
  const tests = []
  
  // Test 1: POST to /calls with minimal data
  try {
    const response1 = await fetch("https://l7api.com/v1.1/voipstudio/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data1 = await response1.text()
    tests.push({
      name: "POST /calls with Bearer",
      status: response1.status,
      response: data1
    })
  } catch (e: any) {
    tests.push({ name: "POST /calls with Bearer", error: e.message })
  }

  // Test 2: Try with X-API-KEY header instead
  try {
    const response2 = await fetch("https://l7api.com/v1.1/voipstudio/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey || "",
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data2 = await response2.text()
    tests.push({
      name: "POST /calls with X-API-KEY",
      status: response2.status,
      response: data2
    })
  } catch (e: any) {
    tests.push({ name: "POST /calls with X-API-KEY", error: e.message })
  }

  // Test 3: Try different base URL (GoTrunk specific)
  try {
    const response3 = await fetch("https://api.gotrunk.com/v1/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data3 = await response3.text()
    tests.push({
      name: "GoTrunk API /calls",
      status: response3.status,
      response: data3
    })
  } catch (e: any) {
    tests.push({ name: "GoTrunk API /calls", error: e.message })
  }

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || 'MISSING',
    username: username,
    tests
  })
}
