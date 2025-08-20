import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { company } = await request.json()

    if (!company) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock research data - in real app, this would call an AI service
    const mockResearchData = {
      questions: [
        `What are ${company.split(" - ")[0]}'s key competitive advantages in their market?`,
        `How sustainable is ${company.split(" - ")[0]}'s current growth trajectory?`,
        `What are the main regulatory risks facing ${company.split(" - ")[0]}?`,
        `How does ${company.split(" - ")[0]}'s valuation compare to industry peers?`,
        `What impact could economic downturns have on ${company.split(" - ")[0]}'s business model?`,
        `What are ${company.split(" - ")[0]}'s key ESG considerations and risks?`,
      ],
      businessModel: `${company.split(" - ")[0]} operates a diversified business model with multiple revenue streams. The company generates revenue through direct sales, subscription services, and strategic partnerships. Their competitive moat is built on strong brand recognition, technological innovation, and operational efficiency. The business demonstrates strong unit economics with improving margins over time, supported by economies of scale and operational leverage.`,
      risks: [
        "Increased competition from emerging market players",
        "Regulatory changes in key operating jurisdictions",
        "Supply chain disruptions and cost inflation",
        "Cybersecurity threats and data privacy concerns",
        "Economic recession impacting consumer spending",
        "Currency fluctuation risks in international markets",
      ],
      growthDrivers: [
        "Expansion into emerging markets and new geographies",
        "Product innovation and R&D investments",
        "Strategic acquisitions and partnerships",
        "Digital transformation and automation initiatives",
        "Growing market demand in core segments",
        "Operational efficiency improvements and cost optimization",
      ],
    }

    return NextResponse.json(mockResearchData)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
