const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtaWI5ZGlqbjAwMDBpYzA0Zzl5czc5cmgiLCJuYW1lIjoiQWhtYWQiLCJlbWFpbCI6InN1bW1pdF9rd0Bob3RtYWlsLmNvbSIsInJvbGUiOiJtYXJzaGFsIiwiaWF0IjoxNzM0NDQyMDUxfQ.h-Tr5b8Ls5pRl6OFmF3Trs3bj8RfkO4g5xQAFQ_4ZMU"

// Decode without verification
const [header, payload, signature] = token.split('.')
const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())

console.log("🔍 JWT Token Decoded:")
console.log(JSON.stringify(decoded, null, 2))
console.log("\n📅 Issued At:", new Date(decoded.iat * 1000).toISOString())
console.log("🔑 User ID:", decoded.id)
console.log("👤 Role:", decoded.role)
