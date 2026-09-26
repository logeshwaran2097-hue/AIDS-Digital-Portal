import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'donut'
    const isInline = searchParams.get('view') === 'true'

    let chartConfig: any

    if (type === 'bar') {
      chartConfig = {
        type: 'bar',
        data: {
          labels: ['Sec A (7)', 'Sec B (63)', 'Sec C (60)', 'Sec D (63)', 'Dept Avg'],
          datasets: [
            {
              label: 'Attendance %',
              data: [100.0, 96.8, 96.7, 96.8, 96.9],
              backgroundColor: [
                'rgba(59, 130, 246, 0.85)',
                'rgba(16, 185, 129, 0.85)',
                'rgba(139, 92, 246, 0.85)',
                'rgba(245, 158, 11, 0.85)',
                'rgba(6, 182, 212, 0.95)',
              ],
              borderColor: ['#2563eb', '#059669', '#7c3aed', '#d97706', '#0891b2'],
              borderWidth: 1.5,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'V.S.B. AI & DS - Year II Attendance By Section',
            fontColor: '#0f172a',
            fontSize: 16,
          },
          legend: { display: false },
          scales: {
            yAxes: [
              {
                ticks: {
                  min: 80,
                  max: 100,
                  fontColor: '#475569',
                  callback: (val: any) => val + '%',
                },
              },
            ],
            xAxes: [{ ticks: { fontColor: '#1e293b', fontStyle: 'bold' } }],
          },
        },
      }
    } else {
      // Donut Analytical Diagram (Statutory Eligibility & Cohort Composition)
      chartConfig = {
        type: 'doughnut',
        data: {
          labels: [
            'Eligible (≥75% Attendance)',
            'Condonation Buffer (65%–74.9%)',
            'Critical Shortage (<65%)',
          ],
          datasets: [
            {
              data: [187, 4, 2],
              backgroundColor: [
                'rgba(16, 185, 129, 0.9)',
                'rgba(245, 158, 11, 0.9)',
                'rgba(239, 68, 68, 0.9)',
              ],
              borderColor: ['#059669', '#d97706', '#dc2626'],
              borderWidth: 2,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: 'V.S.B. AI & DS — Statutory Eligibility Donut Diagram',
            fontColor: '#071a3d',
            fontSize: 16,
            fontStyle: 'bold',
          },
          legend: {
            position: 'bottom',
            labels: {
              fontColor: '#1e293b',
              fontSize: 12,
              padding: 16,
            },
          },
        },
      }
    }

    const quickChartUrl = `https://quickchart.io/chart?bkg=white&w=720&h=480&devicePixelRatio=2&c=${encodeURIComponent(
      JSON.stringify(chartConfig)
    )}`

    // Fetch image from QuickChart and stream to client as download
    const imgRes = await fetch(quickChartUrl)
    if (!imgRes.ok) {
      return NextResponse.redirect(quickChartUrl)
    }

    const imageBuffer = await imgRes.arrayBuffer()
    const fileName = `VSB_AIDS_${type === 'bar' ? 'Attendance_Bar_Graph' : 'Analytical_Donut_Diagram'}_${new Date().toISOString().split('T')[0]}.png`

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': isInline ? 'inline' : `attachment; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[Analytical Diagram API] Error:', error)
    return NextResponse.json({ error: 'Failed to generate analytical diagram' }, { status: 500 })
  }
}
