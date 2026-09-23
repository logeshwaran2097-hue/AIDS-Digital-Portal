import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'faculty' && session.role !== 'hod')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, contentType } = await request.json()
    if (!fileName) {
      return NextResponse.json({ success: false, message: 'File name required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRole) {
      console.error('Missing Supabase credentials for storage')
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 })
    }

    // Initialize Supabase client with Service Role Key to bypass RLS for generating the signed URL
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
      auth: { persistSession: false }
    })

    const timestamp = Date.now()
    // Sanitize filename to prevent path traversal
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `resources/${timestamp}_${safeFileName}`

    // Create signed upload URL valid for 10 minutes
    const { data, error } = await supabaseAdmin.storage
      .from('portal-assets')
      .createSignedUploadUrl(filePath)

    if (error) {
      console.error('Error generating signed upload URL:', error)
      return NextResponse.json({ success: false, message: 'Failed to generate upload URL' }, { status: 500 })
    }

    // Also get the public URL where the file will be accessible after upload
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('portal-assets')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    })

  } catch (error) {
    console.error('Error in signed-url generation:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
