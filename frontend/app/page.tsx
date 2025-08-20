"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Download, Save, FileText } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"

interface ResearchData {
  questions: string[]
  businessModel: string
  risks: string[]
  growthDrivers: string[]
}

interface CompanySuggestion {
  symbol: string
  name: string
}

export default function EquityResearchApp() {
  const [companyInput, setCompanyInput] = useState("")
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Mock company suggestions - in real app, this would be an API call
  const mockSuggestions: CompanySuggestion[] = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "V", name: "Visa Inc." },
  ]


  // Handle company input with autosuggest
  const handleCompanyInputChange = (value: string) => {
    setCompanyInput(value)
    if (value.length > 0) {
      const filtered = mockSuggestions.filter(
        (company) =>
          company.symbol.toLowerCase().includes(value.toLowerCase()) ||
          company.name.toLowerCase().includes(value.toLowerCase()),
      )
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Select suggestion
  const selectSuggestion = (suggestion: CompanySuggestion) => {
    setCompanyInput(`${suggestion.symbol} - ${suggestion.name}`)
    setShowSuggestions(false)
  }

  // Generate research
  const generateResearch = async () => {
    if (!companyInput.trim()) {
      setError("Please enter a company name or ticker")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8000/api/ai/generate", {
        // 👆 call your FastAPI backend directly
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: companyInput }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate research")
      }

      const data = await response.json()

      // Normalize backend response schema → frontend schema
      const normalized: ResearchData = {
        questions: data.questions || [],
        businessModel: data.framework?.business_model || "",
        risks: Array.isArray(data.framework?.risks)
          ? data.framework.risks
          : typeof data.framework?.risks === "string"
            ? data.framework.risks.split("\n").filter(Boolean)
            : [],
        growthDrivers: Array.isArray(data.framework?.growth_drivers)
          ? data.framework.growth_drivers
          : typeof data.framework?.growth_drivers === "string"
            ? data.framework.growth_drivers.split("\n").filter(Boolean)
            : [],
      }

      setResearchData(normalized)
    } catch (err) {
      setError("Failed to generate research. Please try again.")
      console.error("Research generation error:", err)
    } finally {
      setIsLoading(false)
    }
  }


  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!researchData || !notes.trim()) return

    setIsSaving(true)
    try {
      // Mock auto-save - in real app, this would save to backend
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLastSaved(new Date())
    } catch (err) {
      console.error("Auto-save failed:", err)
    } finally {
      setIsSaving(false)
    }
  }, [researchData, notes])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
  }, [autoSave])

  // Export functions
  const exportMarkdown = () => {
    if (!researchData) return

    const markdown = `# Equity Research: ${companyInput}

## Research Questions
${researchData.questions.map((q) => `- ${q}`).join("\n")}

## Business Model
${researchData.businessModel}

## Key Risks
${researchData.risks.map((r) => `- ${r}`).join("\n")}

## Growth Drivers
${researchData.growthDrivers.map((g) => `- ${g}`).join("\n")}

## Analyst Notes
${notes}

---
Generated on ${new Date().toLocaleDateString()}
`

    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${companyInput.split(" - ")[0]}_research.md`
    a.click()
    URL.revokeObjectURL(url)
  }



  const exportPDF = async () => {
    if (!researchData) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = 595; // A4 width in pts
    const pageHeight = 842; // A4 height in pts
    const margin = 40;
    const lineHeight = 18;
    let y = margin;

    // Function to check if we need a new page
    const checkAddPage = (extraHeight: number = 0) => {
      if (y + extraHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    checkAddPage(30);
    doc.text(`Equity Research: ${companyInput}`, margin, y);
    y += 30;

    // Section Header
    const addSectionHeader = (title: string) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      checkAddPage(lineHeight);
      doc.text(title, margin, y);
      y += lineHeight;
    };

    // Normal Text
    const addText = (text: string) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);

      splitText.forEach((line: string) => {
        checkAddPage(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    // Bullet Points
    const addBulletPoints = (items: string[]) => {
      items.forEach((item) => {
        const bulletText = `• ${item}`;
        addText(bulletText);
      });
      y += lineHeight / 2;
    };

    // Populate PDF
    addSectionHeader("Research Questions");
    addBulletPoints(researchData.questions);

    addSectionHeader("Business Model");
    addText(researchData.businessModel);

    addSectionHeader("Key Risks");
    addBulletPoints(researchData.risks);

    addSectionHeader("Growth Drivers");
    addBulletPoints(researchData.growthDrivers);

    if (notes) {
      addSectionHeader("Analyst Notes");
      addText(notes);
    }

    // Footer
    checkAddPage(lineHeight);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y);

    // Save PDF
    doc.save(`${companyInput.split(" - ")[0]}_research.pdf`);
  };




  const exportDOCX = async () => {
    if (!researchData) return

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: `Equity Research: ${companyInput}`, heading: "Heading1" }),
            new Paragraph({ text: "Research Questions", heading: "Heading2" }),
            ...researchData.questions.map(q => new Paragraph({ text: "- " + q })),
            new Paragraph({ text: "Business Model", heading: "Heading2" }),
            new Paragraph({ text: researchData.businessModel }),
            new Paragraph({ text: "Key Risks", heading: "Heading2" }),
            ...researchData.risks.map(r => new Paragraph({ text: "- " + r })),
            new Paragraph({ text: "Growth Drivers", heading: "Heading2" }),
            ...researchData.growthDrivers.map(g => new Paragraph({ text: "- " + g })),
            new Paragraph({ text: "Analyst Notes", heading: "Heading2" }),
            new Paragraph({ text: notes }),
            new Paragraph({ text: `Generated on ${new Date().toLocaleDateString()}` }),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${companyInput.split(" - ")[0]}_research.docx`)
  }

  const saveResearch = async () => {
    if (!researchData) {
      setError("No research data to save")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const payload = {
        company: companyInput || "Unknown Company",
        ticker: "", // or extract from input
        title: companyInput ? `${companyInput} Research` : "Untitled Research",
        markdown_content: notes,
        sections: {
          questions: researchData.questions,
          business_model: researchData.businessModel,
          risks: researchData.risks,
          growth_drivers: researchData.growthDrivers,
        },
        created_by: "demoUser",
      }


      const response = await fetch("http://localhost:8000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Save failed")
      }

      const savedNote = await response.json()
      console.log("Saved:", savedNote)
      setLastSaved(new Date())
    } catch (err) {
      console.error(err)
      setError("Failed to save research")
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Equity Research Platform</h1>
          <p className="text-gray-600">Generate comprehensive research analysis for equity investments</p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Company Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 relative">
              <div className="flex-1 relative">
                <Input
                  placeholder="Enter company name or ticker symbol (e.g., AAPL, Apple)"
                  value={companyInput}
                  onChange={(e) => handleCompanyInputChange(e.target.value)}
                  onFocus={() => companyInput && setShowSuggestions(true)}
                  className="text-base"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        <div className="font-medium">{suggestion.symbol}</div>
                        <div className="text-sm text-gray-600">{suggestion.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={generateResearch} disabled={isLoading || !companyInput.trim()} className="px-6">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Research"
                )}
              </Button>
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {researchData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Research Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Research Questions */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Research Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {researchData.questions.map((question, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5 text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-gray-700">{question}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Business Model */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Model Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{researchData.businessModel}</p>
                </CardContent>
              </Card>

              {/* Risks and Growth Drivers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">Key Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {researchData.risks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Growth Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {researchData.growthDrivers.map((driver, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Notes and Actions */}
            <div className="space-y-6">
              {/* Notes Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Analyst Notes
                    {isSaving && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Saving...
                      </div>
                    )}
                  </CardTitle>
                  {lastSaved && <p className="text-xs text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</p>}
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add your analysis, thoughts, and commentary here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[300px] text-sm leading-relaxed"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* <Button onClick={saveResearch} disabled={isSaving} className="w-full" variant="default">
                    <Save className="h-4 w-4 mr-2" />
                    Save Research
                  </Button> */}
                  <div className="mt-4 flex items-center space-x-2">
                    <Button onClick={saveResearch} disabled={isSaving || !researchData}>
                      {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                      Save Research
                    </Button>
                    {lastSaved && <span className="text-sm text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
                  </div>


                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Export Options</p>
                    <Button onClick={exportMarkdown} variant="outline" className="w-full bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Export as Markdown
                    </Button>
                    <Button onClick={exportPDF} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button onClick={exportDOCX} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export as DOCX
                    </Button>

                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!researchData && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Research</h3>
              <p className="text-gray-600">
                Enter a company name or ticker symbol above to generate comprehensive equity research analysis.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
