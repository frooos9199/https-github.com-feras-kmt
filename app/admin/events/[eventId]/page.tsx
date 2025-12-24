"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"

interface Event {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  date: string
  endDate: string | null
  time: string
  endTime: string | null
  location: string
  marshalTypes: string
  maxMarshals: number
  status: string
  isArchived: boolean
  createdAt: string
  _count: {
    attendances: number
  }
  attendances: Array<{
    id: string
    userId: string
    status: string
    registeredAt: string
    cancelledAt: string | null
    cancellationReason: string | null
    createdAt: string
    user: {
      id: string
      employeeId: string
      name: string
      email: string
      phone: string
      image: string | null
    }
  }>
  eventMarshals?: Array<{
    id: string
    status: string
    invitedAt: string
    respondedAt: string | null
    marshal: {
      id: string
      employeeId: string
      name: string
      email: string
      phone: string
      image: string | null
      marshalTypes: string
    }
  }>
}

export default function EventDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { language } = useLanguage()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRemoveMarshalModal, setShowRemoveMarshalModal] = useState(false)
  const [selectedMarshalId, setSelectedMarshalId] = useState<string | null>(null)
  const [removalReason, setRemovalReason] = useState<string>("")
  const [removingMarshal, setRemovingMarshal] = useState(false)
  const [addingMarshal, setAddingMarshal] = useState(false)
  const [invitingMarshal, setInvitingMarshal] = useState(false)
  const [approvingAttendance, setApprovingAttendance] = useState<string | null>(null)
  const [rejectingAttendance, setRejectingAttendance] = useState<string | null>(null)
  const [acceptingInvitation, setAcceptingInvitation] = useState<string | null>(null)
  const [rejectingInvitation, setRejectingInvitation] = useState<string | null>(null)
  const [showAddMarshalModal, setShowAddMarshalModal] = useState(false)
  const [showInviteMarshalModal, setShowInviteMarshalModal] = useState(false)
  const [availableMarshals, setAvailableMarshals] = useState<any[]>([])
  const [selectedMarshalToAdd, setSelectedMarshalToAdd] = useState<string | null>(null)
  const [selectedMarshalToInvite, setSelectedMarshalToInvite] = useState<string | null>(null)
  const [marshalSearchQuery, setMarshalSearchQuery] = useState<string>("")
  const [eventId, setEventId] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [updatingStats, setUpdatingStats] = useState(false)
  const [editForm, setEditForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    location: "",
    marshalTypes: [] as string[],
    maxMarshals: 10,
    status: "active"
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])


  useEffect(() => {
    console.log('params:', params);
    if (params.eventId) {
      setEventId(params.eventId as string)
      console.log('eventId set:', params.eventId)
    } else {
      console.warn('No eventId in params!', params)
    }
  }, [params])

  useEffect(() => {
    console.log('eventId:', eventId)
    if (eventId) {
      fetchEvent(true) // Force refresh on initial load
    }
  }, [eventId])

  // Refresh data when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && eventId) {
        console.log('Page became visible, refreshing data')
        fetchEvent(true)
      }
    }

    const handleFocus = () => {
      if (eventId) {
        console.log('Window focused, refreshing data')
        fetchEvent(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [eventId])

  useEffect(() => {
    if (showAddMarshalModal && event) {
      fetchAvailableMarshals()
    }
  }, [showAddMarshalModal, event])

  useEffect(() => {
    if (showInviteMarshalModal && event) {
      fetchAvailableMarshals()
    }
  }, [showInviteMarshalModal, event])

  useEffect(() => {
    if (showEditModal && event) {
      console.log('Initializing edit form with event data:', event)
      setEditForm({
        titleEn: event.titleEn,
        titleAr: event.titleAr,
        descriptionEn: event.descriptionEn,
        descriptionAr: event.descriptionAr,
        date: event.date.split('T')[0],
        endDate: event.endDate ? event.endDate.split('T')[0] : "",
        time: event.time,
        endTime: event.endTime || "",
        location: event.location,
        marshalTypes: event.marshalTypes ? event.marshalTypes.split(',').filter((t: string) => t.trim()) : [],
        maxMarshals: event.maxMarshals,
        status: event.status
      })
      console.log('Edit form marshalTypes initialized:', event.marshalTypes ? event.marshalTypes.split(',').filter((t: string) => t.trim()) : [])
    }
  }, [showEditModal, event])

  const fetchEvent = useCallback(async (force = false) => {
    console.log('🔄 fetchEvent called', { force, eventId })
    if (!eventId) {
      console.log('❌ No eventId, skipping fetchEvent')
      return
    }

    const now = Date.now()
    // Prevent fetching more than once every 0.5 seconds unless forced
    if (!force && now - lastFetchTime < 500) {
      console.log('⏳ Skipping fetchEvent - too soon since last fetch')
      return
    }

    setLastFetchTime(now)
    setLoading(true)
    setUpdatingStats(true)

    try {
      console.log('🚀 Fetching event data...')
      const startTime = performance.now()

      const res = await fetch(`/api/admin/events/${eventId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache' // Force fresh data
        }
      })

      const fetchTime = performance.now() - startTime
      console.log(`📡 API Response received in ${fetchTime.toFixed(2)}ms:`, res.status)

      if (res.ok) {
        const data = await res.json()
        const parseTime = performance.now() - startTime - fetchTime
        console.log(`📊 Data parsed in ${parseTime.toFixed(2)}ms`)

        console.log('📊 Event Marshals count:', data.eventMarshals?.length || 0);
        console.log('📊 Event Marshals details:', data.eventMarshals?.map((m: any) => ({
          id: m.id,
          status: m.status,
          marshalName: m.marshal.name,
          marshalId: m.marshal.id
        })));

        console.log('🔄 Setting event data in state')
        setEvent(data)
        setError(null) // Clear any previous errors

        setEditForm({
          titleEn: data.titleEn,
          titleAr: data.titleAr,
          descriptionEn: data.descriptionEn,
          descriptionAr: data.descriptionAr,
          date: data.date.split('T')[0],
          endDate: data.endDate ? data.endDate.split('T')[0] : "",
          time: data.time,
          endTime: data.endTime || "",
          location: data.location,
          marshalTypes: data.marshalTypes ? data.marshalTypes.split(',').filter((t: string) => t.trim()) : [],
          maxMarshals: data.maxMarshals,
          status: data.status
        })

        const totalTime = performance.now() - startTime
        console.log(`✅ Event data updated successfully in ${totalTime.toFixed(2)}ms`)
      } else {
        const text = await res.text();
        console.error('❌ API ERROR:', res.status, text);
        setError(`حدث خطأ في جلب بيانات الحدث: ${res.status}`);
      }
    } catch (error) {
      console.error('💥 FETCH ERROR:', error);
      setError('حدث خطأ في الاتصال بالخادم أو جلب بيانات الحدث.');
    } finally {
      setLoading(false)
      setUpdatingStats(false)
    }
  }, [eventId, lastFetchTime])

  const handleEdit = async () => {
    if (!event) return
    try {
      // Use the session from useSession hook
      const token = (session as any)?.token
      console.log('Using token from session hook:', !!token)
      
      const requestData = {
        ...editForm,
        marshalTypes: editForm.marshalTypes.join(',')
      }
      console.log('Sending update data:', requestData)
      
      const headers: any = { "Content-Type": "application/json" }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log('Using JWT token for authentication')
      } else {
        console.log('No token available, using credentials')
      }
      
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers,
        credentials: 'include', // Always include credentials as fallback
        body: JSON.stringify(requestData)
      })
      
      console.log('Response status:', res.status)
      
      if (res.ok) {
        const responseData = await res.json()
        console.log('Update successful:', responseData)
        setShowEditModal(false)
        fetchEvent()
      } else {
        const errorText = await res.text()
        console.error("Error updating event:", res.status, errorText)
        try {
          const errorData = JSON.parse(errorText)
          alert(`خطأ في تحديث الحدث: ${errorData.error || 'خطأ غير معروف'}`)
        } catch {
          alert(`خطأ في تحديث الحدث: ${res.status}`)
        }
      }
    } catch (error) {
      console.error("Error in handleEdit:", error)
      alert("حدث خطأ أثناء تحديث الحدث")
    }
  }

  const handleDelete = async () => {
    if (!event) return
    try {
      setError(null)
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        router.push("/admin/events")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleArchiveEvent = async () => {
    if (!event) return
    try {
      setError(null)
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !event.isArchived })
      })
      if (res.ok) {
        fetchEvent() // Refresh event data
      } else {
        const errData = await res.json()
        setError(errData.error || "حدث خطأ أثناء تحديث حالة الأرشفة.")
      }
    } catch (error) {
      console.error("Error archiving event:", error)
      setError("حدث خطأ أثناء الاتصال بالخادم.")
    }
  }

  const handleRemoveMarshal = async () => {
    if (!event || !selectedMarshalId) {
      console.log('❌ Cannot remove marshal: event or selectedMarshalId missing', { event: !!event, selectedMarshalId })
      return
    }

    console.log('🚨 Starting marshal removal process')
    console.log('📋 Event ID:', event.id)
    console.log('👤 Marshal ID to remove:', selectedMarshalId)
    console.log('📝 Removal reason:', removalReason || 'No reason provided')
    console.log('📊 Current eventMarshals count:', event.eventMarshals?.length || 0)
    console.log('📊 Marshal exists in current data:', event.eventMarshals?.some(m => m.marshal.id === selectedMarshalId))

    // Close modal immediately for better UX and prevent double clicks
    setShowRemoveMarshalModal(false)
    const marshalToRemove = selectedMarshalId
    const reasonToUse = removalReason
    setSelectedMarshalId(null)
    setRemovalReason("")
    setRemovingMarshal(true)
    setUpdatingStats(true)

    // Optimistic update: Remove marshal from UI immediately
    const marshalToRemoveDetails = event.eventMarshals?.find((m: any) => m.marshal.id === marshalToRemove)
    if (marshalToRemoveDetails) {
      console.log('⚡ Optimistic update: Removing marshal from UI immediately')
      const updatedEvent = {
        ...event,
        eventMarshals: event.eventMarshals?.filter((m: any) => m.marshal.id !== marshalToRemove) || []
      }
      setEvent(updatedEvent)
    } else {
      console.log('⚠️ Marshal not found in local data, refreshing from server')
      // Marshal not found in local data, refresh from server
      await fetchEvent(true)
      alert(language === "ar" ? "المارشال غير موجود أو تم حذفه بالفعل" : "Marshal not found or already removed")
      return
    }

    try {
      console.log('🔄 Making DELETE request to API...')
      const res = await fetch(`/api/admin/events/${event.id}-admin/marshals/${marshalToRemove}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonToUse })
      })

      console.log('📡 API Response status:', res.status)

      if (res.ok) {
        console.log('✅ Marshal removal successful')
        console.log('🔄 Updating UI state - calling fetchEvent()')
        // Fetch updated data in background with force refresh (will override optimistic update if needed)
        await fetchEvent(true)
        console.log('✅ fetchEvent completed after marshal removal')
        // Notify events list page to refresh
        localStorage.setItem('eventUpdated', 'true')
        console.log('✅ Marshal removal process completed successfully')
      } else {
        const errData = await res.json()
        console.error('❌ Marshal removal failed:', errData)
        setError(errData.error || "حدث خطأ أثناء جلب بيانات الحدث.")
        // Revert optimistic update on failure
        fetchEvent(true)
      }
    } catch (error) {
      console.error('💥 Error during marshal removal:', error)
      setError("حدث خطأ أثناء الاتصال بالخادم.")
      // Revert optimistic update on failure
      fetchEvent(true)
    } finally {
      setRemovingMarshal(false)
      setUpdatingStats(false)
    }
  }

  const fetchAvailableMarshals = async () => {
    if (!event) return
    try {
      const res = await fetch(`/api/admin/events/${event.id}/invitations`)
      if (res.ok) {
        const data = await res.json()
        setAvailableMarshals(data.availableMarshals || [])
      }
    } catch (error) {
      console.error("Error fetching available marshals:", error)
    }
  }

  const handleAddMarshal = async () => {
    if (!event || !selectedMarshalToAdd) return
    console.log('➕ Starting marshal addition process')
    console.log('📋 Event ID:', event.id)
    console.log('👤 Marshal ID to add:', selectedMarshalToAdd)

    // Close modal immediately for better UX and prevent double clicks
    setShowAddMarshalModal(false)
    const marshalToAdd = selectedMarshalToAdd
    setSelectedMarshalToAdd(null)
    setMarshalSearchQuery("")
    setAddingMarshal(true)
    setUpdatingStats(true)

    // Optimistic update - add marshal to UI immediately
    const marshalData = availableMarshals.find(m => m.id === marshalToAdd)
    if (marshalData && event) {
      const newEventMarshal = {
        id: `temp-${Date.now()}`, // Temporary ID
        status: 'accepted' as const,
        invitedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
        marshal: marshalData
      }
      const updatedEvent = {
        ...event,
        eventMarshals: [...(event.eventMarshals || []), newEventMarshal]
      }
      setEvent(updatedEvent)
      console.log('⚡ Optimistic update: Marshal added to UI immediately')
    }

    try {
      console.log('🔄 Making POST request to API...')
      const res = await fetch(`/api/admin/events/${event.id}/add-marshal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marshalId: marshalToAdd }),
        credentials: 'include'
      })
      console.log('📡 API Response status:', res.status)

      if (res.ok) {
        console.log('✅ Marshal addition successful')
        console.log('🔄 Updating UI state - calling fetchEvent()')
        // Fetch updated data in background with force refresh
        fetchEvent(true)
        // Notify events list page to refresh
        localStorage.setItem('eventUpdated', 'true')
        console.log('✅ Marshal addition process completed successfully')
      } else {
        // Revert optimistic update on failure
        console.error('❌ Marshal addition failed on server')
        fetchEvent(true) // Refresh to get correct data
        console.error('❌ Marshal addition failed with status:', res.status)
        console.error('❌ Response headers:', Object.fromEntries(res.headers.entries()))

        try {
          const responseText = await res.text()
          console.error('❌ Raw response text:', responseText)
          console.error('❌ Response text length:', responseText.length)

          if (!responseText || !responseText.trim()) {
            console.error('❌ Response text is empty')
            alert(`حدث خطأ أثناء إضافة المارشال (رمز الحالة: ${res.status}) - الاستجابة فارغة`)
            return
          }

          const errData = JSON.parse(responseText)
          console.error('❌ Parsed error data:', errData)
          alert(errData.error || `حدث خطأ أثناء إضافة المارشال (رمز الحالة: ${res.status})`)
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError)
          alert(`حدث خطأ في معالجة الاستجابة (رمز الحالة: ${res.status})`)
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('💥 Error during marshal addition:', error)
      fetchEvent(true) // Refresh to get correct data
      alert("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setAddingMarshal(false)
      setUpdatingStats(false)
    }
  }

  const handleInviteMarshal = async () => {
    if (!event || !selectedMarshalToInvite) return

    console.log('📨 Marshal ID to invite:', selectedMarshalToInvite)

    setShowInviteMarshalModal(false)
    const marshalToInvite = selectedMarshalToInvite
    setSelectedMarshalToInvite(null)

    setInvitingMarshal(true)
    setUpdatingStats(true)

    try {
      // Optimistic update - add marshal to invited list immediately
      const marshalToAdd = availableMarshals.find(m => m.id === marshalToInvite)
      if (marshalToAdd) {
        setEvent(prev => prev ? {
          ...prev,
          eventMarshals: [...(prev.eventMarshals || []), {
            id: `temp-${Date.now()}`,
            status: 'invited',
            invitedAt: new Date().toISOString(),
            respondedAt: null,
            marshal: marshalToAdd
          }]
        } : null)
      }

      const res = await fetch(`/api/admin/events/${event.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marshalId: marshalToInvite })
      })

      if (res.ok) {
        console.log('✅ Marshal invited successfully')
        fetchEvent()
      } else {
        const errData = await res.json()
        console.error('❌ Error inviting marshal:', errData)
        alert(errData.error || "حدث خطأ أثناء دعوة المارشال")
        // Revert optimistic update on error
        fetchEvent()
      }
    } catch (error) {
      console.error('❌ Error inviting marshal:', error)
      alert("حدث خطأ أثناء دعوة المارشال")
      fetchEvent()
    } finally {
      setInvitingMarshal(false)
      setUpdatingStats(false)
    }
  }

  const handleApproveAttendance = async (attendanceId: string) => {
    if (!event) return
    setApprovingAttendance(attendanceId)
    try {
      const res = await fetch(`/api/admin/events/${event.id}/attendance/${attendanceId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      if (res.ok) {
        fetchEvent()
        // Notify events list page to refresh
        localStorage.setItem('eventUpdated', 'true')
      } else {
        const errData = await res.json()
        alert(errData.error || "حدث خطأ أثناء قبول الطلب")
      }
    } catch (error) {
      console.error("Error approving attendance:", error)
      alert("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setApprovingAttendance(null)
    }
  }

  const handleRejectAttendance = async (attendanceId: string) => {
    if (!event) return
    setRejectingAttendance(attendanceId)
    try {
      const res = await fetch(`/api/admin/events/${event.id}/attendance/${attendanceId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      if (res.ok) {
        fetchEvent()
        // Notify events list page to refresh
        localStorage.setItem('eventUpdated', 'true')
      } else {
        const errData = await res.json()
        alert(errData.error || "حدث خطأ أثناء رفض الطلب")
      }
    } catch (error) {
      console.error("Error rejecting attendance:", error)
      alert("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setRejectingAttendance(null)
    }
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!event) return
    setAcceptingInvitation(invitationId)
    try {
      const res = await fetch(`/api/admin/events/${event.id}/invitations/${invitationId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      })
      if (res.ok) {
        fetchEvent()
        // Notify events list page to refresh
        localStorage.setItem('eventUpdated', 'true')
      } else {
        const errData = await res.json()
        alert(errData.error || "حدث خطأ أثناء قبول الدعوة")
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      alert("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setAcceptingInvitation(null)
    }
  }

  const handleRejectInvitation = async (invitationId: string) => {
    console.log('🚫 UI - Rejecting invitation:', invitationId)
    if (!event) return
    setRejectingInvitation(invitationId)
    try {
      console.log('📡 UI - Calling reject API:', `/api/admin/events/${event.id}/invitations/${invitationId}/reject`)
      const res = await fetch(`/api/admin/events/${event.id}/invitations/${invitationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      })
      console.log('📡 UI - Reject API response status:', res.status)
      if (res.ok) {
        console.log('✅ UI - Reject successful, fetching updated event data')
        fetchEvent()
        // Notify events list page to refresh
        localStorage.setItem('eventUpdated', 'true')
      } else {
        const errData = await res.json()
        console.log('❌ UI - Reject failed:', errData)
        alert(errData.error || "حدث خطأ أثناء رفض الدعوة")
      }
    } catch (error) {
      console.error("Error rejecting invitation:", error)
      alert("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setRejectingInvitation(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-600">
        <p className="mb-4 text-lg">{error}</p>
        <Link href="/admin/events" className="btn btn-primary">رجوع لقائمة الأحداث</Link>
      </div>
    )
  }

  if (!session || session.user.role !== "admin") {
    console.log('Auth check failed:', { session: !!session, role: session?.user?.role })
    return null
  }

  if (!event) {
    console.log('No event data, showing loading or error')
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )
    } else {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-600">
          <p className="mb-4 text-lg">لم يتم العثور على بيانات الحدث</p>
          <Link href="/admin/events" className="px-4 py-2 bg-red-600 text-white rounded-lg">رجوع لقائمة الأحداث</Link>
        </div>
      )
    }
  }

  const statusColor = event.status === "active" ? "green" : event.status === "cancelled" ? "red" : "blue"

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
              <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
            </Link>
            <Link
              href="/admin/events"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← {language === "ar" ? "العودة" : "Back"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {language === "ar" ? event.titleAr : event.titleEn}
              </h1>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-${statusColor}-600/20 text-${statusColor}-500 border border-${statusColor}-600/50`}>
                {event.status === "active" ? "✅" : event.status === "cancelled" ? "❌" : "✔️"}
                {event.status === "active" 
                  ? (language === "ar" ? "نشط" : "Active")
                  : event.status === "cancelled"
                  ? (language === "ar" ? "ملغي" : "Cancelled")
                  : (language === "ar" ? "مكتمل" : "Completed")
                }
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddMarshalModal(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
              >
                ➕ {language === "ar" ? "إضافة مارشال" : "Add Marshal"}
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
              >
                ✏️ {language === "ar" ? "تعديل" : "Edit"}
              </button>
              <button
                onClick={handleArchiveEvent}
                className={`px-6 py-3 ${event.isArchived ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-xl font-bold transition-all`}
              >
                📁 {event.isArchived ? (language === "ar" ? "إلغاء الأرشفة" : "Unarchive") : (language === "ar" ? "أرشفة" : "Archive")}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
              >
                🗑️ {language === "ar" ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Basic Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📋 {language === "ar" ? "معلومات الحدث" : "Event Information"}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "الوصف" : "Description"}</p>
                  <p className="text-white">{language === "ar" ? event.descriptionAr : event.descriptionEn}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* تاريخ ووقت البداية */}
                  <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-green-500">📅</span>
                      <div>
                        <div className="text-green-500 font-bold text-sm">
                          {language === "ar" ? "البداية" : "Start"}
                        </div>
                      </div>
                    </div>
                    <div className="text-white font-semibold text-lg mb-1">
                      {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-green-500 text-lg font-bold">
                      {event.time}
                    </div>
                  </div>

                  {/* تاريخ ووقت النهاية */}
                  {event.endDate && (
                    <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-red-500">🏁</span>
                        <div>
                          <div className="text-red-500 font-bold text-sm">
                            {language === "ar" ? "النهاية" : "End"}
                          </div>
                        </div>
                      </div>
                      <div className="text-white font-semibold text-lg mb-1">
                        {new Date(event.endDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-red-500 text-lg font-bold">
                        {event.endTime || event.time}
                      </div>
                    </div>
                  )}

                  {/* الموقع */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-blue-500">📍</span>
                      <div>
                        <div className="text-blue-500 font-bold text-sm">
                          {language === "ar" ? "الموقع" : "Location"}
                        </div>
                      </div>
                    </div>
                    <div className="text-white font-semibold text-lg">
                      {event.location}
                    </div>
                  </div>

                  {/* الحالة */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-yellow-500">📊</span>
                      <div>
                        <div className="text-yellow-500 font-bold text-sm">
                          {language === "ar" ? "الحالة" : "Status"}
                        </div>
                      </div>
                    </div>
                    <div className="text-white font-semibold text-lg">
                      {event.status === "active" 
                        ? (language === "ar" ? "نشط" : "Active") 
                        : (language === "ar" ? "غير نشط" : "Inactive")}
                    </div>
                  </div>

                  {/* أنواع المارشال المطلوبة */}
                  <div className="md:col-span-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-purple-500">👥</span>
                      <div>
                        <div className="text-purple-500 font-bold text-sm">
                          {language === "ar" ? "أنواع المارشال المطلوبة" : "Required Marshal Types"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.marshalTypes && event.marshalTypes.split(',').filter(t => t.trim()).map((type) => {
                        const typeLabels: Record<string, {en: string, ar: string, icon: string, color: string}> = {
                          'karting': {en: 'Karting', ar: 'كارتنج', icon: '🏎️', color: 'bg-yellow-600'},
                          'motocross': {en: 'Motocross', ar: 'موتوكروس', icon: '🏍️', color: 'bg-orange-600'},
                          'rescue': {en: 'Rescue', ar: 'إنقاذ', icon: '🚑', color: 'bg-red-600'},
                          'circuit': {en: 'Circuit', ar: 'سيركت', icon: '🏁', color: 'bg-blue-600'},
                          'drift': {en: 'Drift', ar: 'دريفت', icon: '💨', color: 'bg-purple-600'},
                          'drag-race': {en: 'Drag Race', ar: 'دراق ريس', icon: '🚦', color: 'bg-pink-600'},
                          'pit': {en: 'Pit', ar: 'بت', icon: '🔧', color: 'bg-teal-600'}
                        }
                        const label = typeLabels[type]
                        if (!label) return null
                        return (
                          <span 
                            key={type}
                            className={`${label.color} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}
                          >
                            <span>{label.icon}</span>
                            <span>{language === "ar" ? label.ar : label.en}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accepted Marshals */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                ✅ {language === "ar" ? "المارشالات المضافين" : "Accepted Marshals"} ({event.eventMarshals?.filter(m => m.status === 'accepted' || m.status === 'approved').length || 0}/{event.maxMarshals})
              </h2>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setShowAddMarshalModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  ➕ {language === "ar" ? "إضافة مارشال" : "Add Marshal"}
                </button>
                <button
                  onClick={() => fetchEvent(true)}
                  disabled={updatingStats}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  {updatingStats ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '🔄'
                  )}
                  {language === "ar" ? "تحديث" : "Refresh"}
                </button>
              </div>
              {!event.eventMarshals || event.eventMarshals.filter(m => m.status === 'accepted' || m.status === 'approved').length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا يوجد مارشالات مضافين" : "No accepted marshals yet"}
                </p>
              ) : (
                <div className="space-y-3">
                  {event.eventMarshals.filter(m => m.status === 'accepted' || m.status === 'approved').map((invitation) => {
                    console.log('📊 Rendering accepted marshal:', invitation.marshal.name, '- ID:', invitation.marshal.id, '- Status:', invitation.status);
                    return (
                    <div
                      key={`accepted-${invitation.id}`}
                      className="flex items-center justify-between bg-zinc-800/50 border border-green-600/50 bg-green-900/20 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        {invitation.marshal.image ? (
                          <img
                            src={invitation.marshal.image}
                            alt={invitation.marshal.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold">
                            {invitation.marshal.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {invitation.marshal.employeeId && (
                              <span className="text-green-400 font-bold mr-2">
                                {invitation.marshal.employeeId}
                              </span>
                            )}
                            {invitation.marshal.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {invitation.marshal.email}
                            {invitation.marshal.phone && (
                              <span className="ml-2 text-gray-500">• {invitation.marshal.phone}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === "ar" ? "مضاف في:" : "Added:"} {new Date(invitation.invitedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                          </p>
                          {/* عرض تخصصات المارشال */}
                          {invitation.marshal.marshalTypes && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {invitation.marshal.marshalTypes.split(',').filter(t => t.trim()).map((type) => {
                                const typeLabels: Record<string, {en: string, ar: string, icon: string, color: string}> = {
                                  'karting': {en: 'Karting', ar: 'كارتنج', icon: '🏎️', color: 'bg-yellow-600'},
                                  'motocross': {en: 'Motocross', ar: 'موتوكروس', icon: '🏍️', color: 'bg-orange-600'},
                                  'rescue': {en: 'Rescue', ar: 'إنقاذ', icon: '🚑', color: 'bg-red-600'},
                                  'circuit': {en: 'Circuit', ar: 'سيركت', icon: '🏁', color: 'bg-blue-600'},
                                  'drift': {en: 'Drift', ar: 'دريفت', icon: '💨', color: 'bg-purple-600'},
                                  'drag-race': {en: 'Drag Race', ar: 'دراق ريس', icon: '🚦', color: 'bg-pink-600'},
                                  'pit': {en: 'Pit', ar: 'بت', icon: '🔧', color: 'bg-teal-600'}
                                }
                                const label = typeLabels[type]
                                if (!label) return null
                                return (
                                  <span 
                                    key={type}
                                    className={`${label.color} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                                  >
                                    <span>{label.icon}</span>
                                    <span>{language === "ar" ? label.ar : label.en}</span>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMarshalId(invitation.marshal.id)
                            setShowRemoveMarshalModal(true)
                          }}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-all text-sm font-bold"
                        >
                          {language === "ar" ? "إزالة" : "Remove"}
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>

            {/* Invited Marshals */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                📨 {language === "ar" ? "المارشالات المدعوين" : "Invited Marshals"} ({event.eventMarshals?.filter(m => m.status !== 'accepted' && m.status !== 'approved').length || 0})
              </h2>
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowInviteMarshalModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  ➕ {language === "ar" ? "دعوة مارشال" : "Invite Marshal"}
                </button>
              </div>
              {!event.eventMarshals || event.eventMarshals.filter(m => m.status !== 'accepted' && m.status !== 'approved').length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا يوجد مارشالات مدعوين" : "No invited marshals yet"}
                </p>
              ) : (
                <div className="space-y-3">
                  {event.eventMarshals.filter(m => m.status !== 'accepted' && m.status !== 'approved').map((invitation) => {
                    console.log('📊 Rendering marshal:', invitation.marshal.name, '- ID:', invitation.marshal.id, '- Status:', invitation.status);
                    return (
                    <div
                      key={invitation.id}
                      className={`flex items-center justify-between bg-zinc-800/50 border rounded-xl p-4 ${
                        invitation.status === 'accepted' 
                          ? 'border-green-600/50 bg-green-900/20' 
                          : invitation.status === 'declined'
                          ? 'border-red-600/50 bg-red-900/20'
                          : 'border-yellow-600/50 bg-yellow-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {invitation.marshal.image ? (
                          <img
                            src={invitation.marshal.image}
                            alt={invitation.marshal.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                            {invitation.marshal.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {invitation.marshal.employeeId && (
                              <span className="text-blue-400 font-bold mr-2">
                                {invitation.marshal.employeeId}
                              </span>
                            )}
                            {invitation.marshal.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {invitation.marshal.email}
                            {invitation.marshal.phone && (
                              <span className="ml-2 text-gray-500">• {invitation.marshal.phone}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === "ar" ? "مدعو في:" : "Invited:"} {new Date(invitation.invitedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                            {invitation.respondedAt && (
                              <span className="ml-2">
                                {language === "ar" ? "رد في:" : "Responded:"} {new Date(invitation.respondedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                              </span>
                            )}
                          </p>
                          {/* عرض تخصصات المارشال */}
                          {invitation.marshal.marshalTypes && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {invitation.marshal.marshalTypes.split(',').filter(t => t.trim()).map((type) => {
                                const typeLabels: Record<string, {en: string, ar: string, icon: string, color: string}> = {
                                  'karting': {en: 'Karting', ar: 'كارتنج', icon: '🏎️', color: 'bg-yellow-600'},
                                  'motocross': {en: 'Motocross', ar: 'موتوكروس', icon: '🏍️', color: 'bg-orange-600'},
                                  'rescue': {en: 'Rescue', ar: 'إنقاذ', icon: '🚑', color: 'bg-red-600'},
                                  'circuit': {en: 'Circuit', ar: 'سيركت', icon: '🏁', color: 'bg-blue-600'},
                                  'drift': {en: 'Drift', ar: 'دريفت', icon: '💨', color: 'bg-purple-600'},
                                  'drag-race': {en: 'Drag Race', ar: 'دراق ريس', icon: '🚦', color: 'bg-pink-600'},
                                  'pit': {en: 'Pit', ar: 'بت', icon: '🔧', color: 'bg-teal-600'}
                                }
                                const label = typeLabels[type]
                                if (!label) return null
                                return (
                                  <span 
                                    key={type}
                                    className={`${label.color} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                                  >
                                    <span>{label.icon}</span>
                                    <span>{language === "ar" ? label.ar : label.en}</span>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          invitation.status === 'accepted' 
                            ? 'bg-green-600/20 text-green-500' 
                            : invitation.status === 'declined'
                            ? 'bg-red-600/20 text-red-500'
                            : 'bg-yellow-600/20 text-yellow-500'
                        }`}>
                          {invitation.status === 'accepted' 
                            ? (language === "ar" ? "مقبول" : "Accepted")
                            : invitation.status === 'declined'
                            ? (language === "ar" ? "مرفوض" : "Declined")
                            : (language === "ar" ? "معلق" : "Pending")
                          }
                        </span>
                        {invitation.status === 'invited' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptInvitation(invitation.id)}
                              disabled={acceptingInvitation === invitation.id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                            >
                              {acceptingInvitation === invitation.id ? (language === "ar" ? "جاري..." : "Accepting...") : (language === "ar" ? "قبول" : "Accept")}
                            </button>
                            <button
                              onClick={() => handleRejectInvitation(invitation.id)}
                              disabled={rejectingInvitation === invitation.id}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                            >
                              {rejectingInvitation === invitation.id ? (language === "ar" ? "جاري..." : "Rejecting...") : (language === "ar" ? "رفض" : "Reject")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>

            {/* Pending Attendance Requests */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                ⏳ {language === "ar" ? "طلبات الحضور المعلقة" : "Pending Attendance Requests"} ({event.attendances.filter(a => a.status === 'pending').length})
              </h2>
              {!event.attendances.filter(a => a.status === 'pending').length ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا توجد طلبات حضور معلقة" : "No pending attendance requests"}
                </p>
              ) : (
                <div className="space-y-3">
                  {event.attendances.filter(a => a.status === 'pending').map((attendance) => (
                    <div
                      key={attendance.id}
                      className="flex items-center justify-between bg-zinc-800/50 border border-yellow-600/50 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        {attendance.user.image ? (
                          <img
                            src={attendance.user.image}
                            alt={attendance.user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center text-white font-bold">
                            {attendance.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {attendance.user.employeeId && (
                              <span className="text-blue-400 font-bold mr-2">
                                {attendance.user.employeeId}
                              </span>
                            )}
                            {attendance.user.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {attendance.user.email}
                            {attendance.user.phone && (
                              <span className="ml-2 text-gray-500">• {attendance.user.phone}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === "ar" ? "تاريخ الطلب:" : "Requested:"} {new Date(attendance.registeredAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-600/20 text-yellow-500">
                          {language === "ar" ? "معلق" : "Pending"}
                        </span>
                        <button
                          onClick={() => handleApproveAttendance(attendance.id)}
                          disabled={approvingAttendance === attendance.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-bold"
                        >
                          {approvingAttendance === attendance.id ? (language === "ar" ? "جاري..." : "Approving...") : (language === "ar" ? "قبول" : "Approve")}
                        </button>
                        <button
                          onClick={() => handleRejectAttendance(attendance.id)}
                          disabled={rejectingAttendance === attendance.id}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-600/10 disabled:cursor-not-allowed text-red-500 rounded-lg transition-all text-sm font-bold"
                        >
                          {rejectingAttendance === attendance.id ? (language === "ar" ? "جاري..." : "Rejecting...") : (language === "ar" ? "رفض" : "Reject")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  📊 {language === "ar" ? "الإحصائيات" : "Statistics"}
                </h2>
                {updatingStats && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">{language === "ar" ? "جاري التحديث..." : "Updating..."}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "المقبولين" : "Accepted"}</p>
                  <p className="text-green-500 font-bold text-3xl">{event.eventMarshals?.filter(em => em.status === 'accepted' || em.status === 'approved').length || 0}</p>
                </div>
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "المدعوين" : "Invited"}</p>
                  <p className="text-blue-500 font-bold text-3xl">{event.eventMarshals?.filter(em => em.status === 'invited').length || 0}</p>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "المتبقي" : "Available"}</p>
                  <p className="text-yellow-500 font-bold text-3xl">{event.maxMarshals - (event.eventMarshals?.filter(em => em.status === 'accepted' || em.status === 'approved').length || 0)}</p>
                </div>
                <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">{language === "ar" ? "تاريخ الإنشاء" : "Created"}</p>
                  <p className="text-purple-500 font-bold text-lg">
                    {new Date(event.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-blue-600/50 rounded-2xl p-8 max-w-2xl w-full my-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              ✏️ {language === "ar" ? "تعديل الحدث" : "Edit Event"}
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </label>
                  <input
                    type="text"
                    value={editForm.titleEn}
                    onChange={(e) => setEditForm({...editForm, titleEn: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={editForm.titleAr}
                    onChange={(e) => setEditForm({...editForm, titleAr: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <textarea
                  value={editForm.descriptionEn}
                  onChange={(e) => setEditForm({...editForm, descriptionEn: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </label>
                <textarea
                  value={editForm.descriptionAr}
                  onChange={(e) => setEditForm({...editForm, descriptionAr: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "تاريخ البداية" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "تاريخ النهاية" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "الموقع" : "Location"}
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "وقت البداية" : "Start Time"}
                  </label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "وقت النهاية" : "End Time"}
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {language === "ar" ? "أنواع المارشال المطلوبة" : "Required Marshal Types"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    {value: 'karting', labelEn: 'Karting Marshal', labelAr: 'كارتينق مارشال', icon: '�️'},
                    {value: 'motocross', labelEn: 'Motocross Marshal', labelAr: 'موتوكروس مارشال', icon: '🏍️'},
                    {value: 'rescue', labelEn: 'Rescue Marshal', labelAr: 'إنقاذ مارشال', icon: '🚑'},
                    {value: 'circuit', labelEn: 'Circuit Marshal', labelAr: 'سيركت مارشال', icon: '�'},
                    {value: 'drift', labelEn: 'Drift Marshal', labelAr: 'دريفت مارشال', icon: '💨'},
                    {value: 'drag-race', labelEn: 'Drag Race Marshal', labelAr: 'دراق ريس مارشال', icon: '🚦'},
                    {value: 'pit', labelEn: 'Pit Marshal', labelAr: 'بت مارشال', icon: '🔧'}
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={editForm.marshalTypes.includes(type.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({...editForm, marshalTypes: [...editForm.marshalTypes, type.value]})
                          } else {
                            setEditForm({...editForm, marshalTypes: editForm.marshalTypes.filter(t => t !== type.value)})
                          }
                        }}
                        className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                      />
                      <span className="text-base">{type.icon}</span>
                      <span className="text-white text-sm">
                        {language === "ar" ? type.labelAr : type.labelEn}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "الحد الأقصى" : "Max Marshals"}
                  </label>
                  <input
                    type="number"
                    value={editForm.maxMarshals}
                    onChange={(e) => setEditForm({...editForm, maxMarshals: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    {language === "ar" ? "الحالة" : "Status"}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEdit}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "حفظ" : "Save"}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-red-600/50 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              ⚠️ {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </h3>
            <p className="text-gray-300 mb-6">
              {language === "ar" 
                ? `هل أنت متأكد من حذف الحدث "${event.titleAr}"؟ سيتم حذف جميع التسجيلات المرتبطة به.`
                : `Are you sure you want to delete "${event.titleEn}"? All registrations will be deleted.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "نعم، احذف" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Marshal Modal */}
      {showAddMarshalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-green-600/50 rounded-2xl p-8 max-w-2xl w-full my-8 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              ➕ {language === "ar" ? "إضافة مارشال للفعالية" : "Add Marshal to Event"}
            </h3>
            
            {/* Search Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🔍 {language === "ar" ? "البحث عن مارشال" : "Search Marshal"}
              </label>
              <input
                type="text"
                value={marshalSearchQuery}
                onChange={(e) => setMarshalSearchQuery(e.target.value)}
                placeholder={language === "ar" ? "ابحث بالاسم أو رقم الموظف أو الإيميل..." : "Search by name, employee ID, or email..."}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                {language === "ar" 
                  ? "اختر مارشال من القائمة أدناه لإضافته إلى الفعالية:"
                  : "Select a marshal from the list below to add to the event:"
                }
              </p>
              
              {availableMarshals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا يوجد مارشالات متاحين" : "No available marshals found"}
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableMarshals
                    .filter((marshal) => {
                      if (!marshalSearchQuery.trim()) return true
                      const query = marshalSearchQuery.toLowerCase()
                      return (
                        marshal.name.toLowerCase().includes(query) ||
                        marshal.email.toLowerCase().includes(query) ||
                        (marshal.employeeId && marshal.employeeId.toLowerCase().includes(query))
                      )
                    })
                    .map((marshal) => (
                    <div
                      key={marshal.id}
                      className={`flex items-center justify-between bg-zinc-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedMarshalToAdd === marshal.id 
                          ? 'border-green-600 bg-green-900/20' 
                          : 'border-zinc-700 hover:bg-zinc-800'
                      }`}
                      onClick={() => setSelectedMarshalToAdd(marshal.id)}
                    >
                      <div className="flex items-center gap-3">
                        {marshal.image ? (
                          <img
                            src={marshal.image}
                            alt={marshal.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold">
                            {marshal.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{marshal.name}</p>
                          <p className="text-sm text-gray-400">{marshal.employeeId}</p>
                          <p className="text-sm text-gray-400">{marshal.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {marshal.marshalTypes && (
                          <div className="flex flex-wrap gap-1">
                            {marshal.marshalTypes.split(',').filter((t: string) => t.trim()).slice(0, 2).map((type: string) => {
                              const typeIcons: Record<string, string> = {
                                'karting': '🏎️',
                                'motocross': '🏍️',
                                'rescue': '🚑',
                                'circuit': '🏁',
                                'drift': '💨',
                                'drag-race': '🚦',
                                'pit': '🔧'
                              }
                              return (
                                <span key={type} className="text-sm" title={type}>
                                  {typeIcons[type] || '�'}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        <input
                          type="radio"
                          checked={selectedMarshalToAdd === marshal.id}
                          onChange={() => setSelectedMarshalToAdd(marshal.id)}
                          className="w-4 h-4 text-green-600 focus:ring-green-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddMarshal}
                disabled={!selectedMarshalToAdd || addingMarshal}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed"
              >
                {addingMarshal ? (language === "ar" ? "جاري الإضافة..." : "Adding...") : (language === "ar" ? "إضافة المارشال" : "Add Marshal")}
              </button>
              <button
                onClick={() => {
                  setShowAddMarshalModal(false)
                  setSelectedMarshalToAdd(null)
                  setAvailableMarshals([])
                  setMarshalSearchQuery("")
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Marshal Modal */}
      {showInviteMarshalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-blue-600/50 rounded-2xl p-8 max-w-2xl w-full my-8 max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              📨 {language === "ar" ? "دعوة مارشال للفعالية" : "Invite Marshal to Event"}
            </h3>
            
            {/* Search Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                🔍 {language === "ar" ? "البحث عن مارشال" : "Search Marshal"}
              </label>
              <input
                type="text"
                value={marshalSearchQuery}
                onChange={(e) => setMarshalSearchQuery(e.target.value)}
                placeholder={language === "ar" ? "ابحث بالاسم أو رقم الموظف أو الإيميل..." : "Search by name, employee ID, or email..."}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                {language === "ar" 
                  ? "اختر مارشال من القائمة أدناه لدعوته إلى الفعالية:"
                  : "Select a marshal from the list below to invite to the event:"
                }
              </p>
              
              {availableMarshals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {language === "ar" ? "لا يوجد مارشالات متاحين" : "No available marshals found"}
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableMarshals
                    .filter((marshal) => {
                      if (!marshalSearchQuery.trim()) return true
                      const query = marshalSearchQuery.toLowerCase()
                      return (
                        marshal.name.toLowerCase().includes(query) ||
                        marshal.email.toLowerCase().includes(query) ||
                        (marshal.employeeId && marshal.employeeId.toLowerCase().includes(query))
                      )
                    })
                    .map((marshal) => (
                    <div
                      key={marshal.id}
                      className={`flex items-center justify-between bg-zinc-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedMarshalToInvite === marshal.id 
                          ? 'border-blue-600 bg-blue-900/20' 
                          : 'border-zinc-700 hover:bg-zinc-800'
                      }`}
                      onClick={() => setSelectedMarshalToInvite(marshal.id)}
                    >
                      <div className="flex items-center gap-3">
                        {marshal.image ? (
                          <img
                            src={marshal.image}
                            alt={marshal.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
                          />
                        ) : (
                          <div className="w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                            {marshal.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{marshal.name}</p>
                          <p className="text-sm text-gray-400">{marshal.employeeId}</p>
                          <p className="text-sm text-gray-400">{marshal.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {marshal.marshalTypes && (
                          <div className="flex flex-wrap gap-1">
                            {marshal.marshalTypes.split(',').filter((t: string) => t.trim()).slice(0, 2).map((type: string) => {
                              const typeIcons: Record<string, string> = {
                                'karting': '🏎️',
                                'motocross': '🏍️',
                                'rescue': '🚑',
                                'circuit': '🏁',
                                'drift': '💨',
                                'drag-race': '🚦',
                                'pit': '🔧'
                              }
                              return (
                                <span key={type} className="text-sm" title={type}>
                                  {typeIcons[type] || '�'}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        <input
                          type="radio"
                          checked={selectedMarshalToInvite === marshal.id}
                          onChange={() => setSelectedMarshalToInvite(marshal.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleInviteMarshal}
                disabled={!selectedMarshalToInvite || invitingMarshal}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-bold transition-all disabled:cursor-not-allowed"
              >
                {invitingMarshal ? (language === "ar" ? "جاري الدعوة..." : "Inviting...") : (language === "ar" ? "دعوة المارشال" : "Invite Marshal")}
              </button>
              <button
                onClick={() => {
                  setShowInviteMarshalModal(false)
                  setSelectedMarshalToInvite(null)
                  setAvailableMarshals([])
                  setMarshalSearchQuery("")
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Marshal Modal */}
      {showRemoveMarshalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-yellow-600/50 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              ⚠️ {language === "ar" ? "تأكيد الإزالة" : "Confirm Removal"}
            </h3>
            <p className="text-gray-300 mb-4">
              {language === "ar" 
                ? "هل أنت متأكد من إلغاء تسجيل هذا المارشال من الحدث؟"
                : "Are you sure you want to remove this marshal from the event?"
              }
            </p>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                {language === "ar" ? "سبب الإزالة (اختياري)" : "Removal Reason (Optional)"}
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder={language === "ar" ? "أدخل سبب الإزالة..." : "Enter removal reason..."}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-yellow-600 focus:outline-none resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRemoveMarshal}
                disabled={removingMarshal}
                className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all"
              >
                {removingMarshal ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {language === "ar" ? "جاري الإزالة..." : "Removing..."}
                  </div>
                ) : (
                  language === "ar" ? "نعم، أزل" : "Yes, Remove"
                )}
              </button>
              <button
                onClick={() => {
                  setShowRemoveMarshalModal(false)
                  setSelectedMarshalId(null)
                  setRemovalReason("")
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
