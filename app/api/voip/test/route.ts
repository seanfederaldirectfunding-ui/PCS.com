import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.VOIPSTUDIO_API_KEY
  const username = process.env.NEXT_PUBLIC_VOIP_USERNAME
  const accountId = process.env.VOIPSTUDIO_ACCOUNT_ID
  const password = process.env.VOIP_PASSWORD
  
  // Test multiple authentication methods
  const tests = []
  
  // Test 1: HTTP Basic Auth with username:password
  try {
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')
    const response1 = await fetch("https://l7api.com/v1.1/voipstudio/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data1 = await response1.text()
    tests.push({
      name: "POST /calls with Basic Auth (username:password)",
      status: response1.status,
      response: data1
    })
  } catch (e: any) {
    tests.push({ name: "POST /calls with Basic Auth", error: e.message })
  }

  // Test 2: HTTP Basic Auth with apiKey:empty
  try {
    const basicAuth = Buffer.from(`${apiKey}:`).toString('base64')
    const response2 = await fetch("https://l7api.com/v1.1/voipstudio/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data2 = await response2.text()
    tests.push({
      name: "POST /calls with Basic Auth (apiKey:empty)",
      status: response2.status,
      response: data2
    })
  } catch (e: any) {
    tests.push({ name: "POST /calls with Basic Auth (apiKey)", error: e.message })
  }

  // Test 3: API-Key header (common format)
  try {
    const response3 = await fetch("https://l7api.com/v1.1/voipstudio/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apiKey || "",
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data3 = await response3.text()
    tests.push({
      name: "POST /calls with API-Key header",
      status: response3.status,
      response: data3
    })
  } catch (e: any) {
    tests.push({ name: "POST /calls with API-Key", error: e.message })
  }

  // Test 4: Token query parameter
  try {
    const response4 = await fetch(`https://l7api.com/v1.1/voipstudio/calls?token=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "+18768155897",
        from: username,
      }),
    })
    const data4 = await response4.text()
    tests.push({
      name: "POST /calls with token query param",
      status: response4.status,
      response: data4
    })
  } catch (e: any) {
    tests.push({ name: "POST /calls with token query", error: e.message })
  }

  return NextResponse.json({
    hasApiKey: !!apiKey,
    hasPassword: !!password,
    username: username,
    accountId: accountId,
    tests,
    note: "Testing HTTP Basic Auth and alternative authentication methods"
  })
}
