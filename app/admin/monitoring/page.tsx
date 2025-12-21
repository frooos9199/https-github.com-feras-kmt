"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"
import { getOperationTranslation } from "@/lib/monitoring"
import { useOperationTranslation } from "@/lib/useOperationTranslation"

interface SystemStats {
  period: string;
  systemHealth: {
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    recentEvents: number;
    totalAttendances: number;
    pendingRequests: number;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageResponseTime: number;
    emailsSent: number;
    notificationsSent: number;
    serverUptime: number;
  };
  errors: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  operations: Record<string, { total: number; success: number; error: number }>;
  lastUpdated: string;
}

interface Operation {
  id: string;
  operation: string;
  status: string;
  duration: number | null;
  errorMessage: string | null;
  user: {
    name: string;
    email: string;
    employeeId: string;
  } | null;
  targetId: string | null;
  metadata: any;
  createdAt: string;
}

export default function MonitoringDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { language, t, setLanguage } = useLanguage()
  const translateOperation = useOperationTranslation()

  // Debug logging
  console.log('Current language:', language)
  console.log('t("overview"):', t('overview'))
  console.log('t("operations"):', t('operations'))
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'errors'>('overview')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    } else if (status === "authenticated") {
      fetchStats()
      fetchOperations()
    }
  }, [status, session, router, selectedPeriod])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/monitoring/stats?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOperations = async () => {
    try {
      const response = await fetch('/api/monitoring/operations?limit=20')
      if (response.ok) {
        const data = await response.json()
        setOperations(data.operations)
      }
    } catch (error) {
      console.error('Error fetching operations:', error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-900/20 border-green-600/30'
      case 'error': return 'text-red-400 bg-red-900/20 border-red-600/30'
      case 'pending': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-600/30'
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-600/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30'
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-600/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600/30'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← {t('backToAdminDashboard')}
              </Link>
              <div className="h-6 w-px bg-zinc-700" />
              <h1 className="text-xl font-bold text-white">
                📊 {t('operationTracking')}
              </h1>
            </div>
            {/* Period Selector */}
            <div className="flex gap-2">
              {[
                { value: '24h', label: t('24_hours') },
                { value: '7d', label: t('7_days') },
                { value: '30d', label: t('30_days') }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-zinc-800">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: t('overview') },
                { id: 'operations', label: t('operations') },
                { id: 'errors', label: t('errors') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* System Health Cards */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                🟢 {t('systemStatus')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-white font-medium">{t('systemStatus')}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{stats.systemHealth.serverUptime}%</p>
                  <p className="text-gray-400 text-sm">Uptime</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-white font-medium">{t('users')}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.systemHealth.totalUsers}</p>
                  <p className="text-gray-400 text-sm">{stats.systemHealth.activeUsers} {t('active')}</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-white font-medium">{t('events')}</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{stats.systemHealth.totalEvents}</p>
                  <p className="text-gray-400 text-sm">{stats.systemHealth.recentEvents} {t('recent')}</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-white font-medium">{t('averageResponse')}</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{stats.systemHealth.averageResponseTime}ms</p>
                  <p className="text-gray-400 text-sm">{t('forOperations')}</p>
                </div>
              </div>
            </div>

            {/* Operations Stats */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                📈 {t('operationStatistics')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-600/30 rounded-2xl p-6">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-white">{stats.systemHealth.successfulOperations}</div>
                  <div className="text-gray-400 text-sm">{t('successfulOperations')}</div>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-600/30 rounded-2xl p-6">
                  <div className="text-3xl mb-2">❌</div>
                  <div className="text-2xl font-bold text-white">{stats.systemHealth.failedOperations}</div>
                  <div className="text-gray-400 text-sm">{t('failedOperations')}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-600/30 rounded-2xl p-6">
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="text-2xl font-bold text-white">{stats.systemHealth.totalOperations}</div>
                  <div className="text-gray-400 text-sm">{t('totalOperations')}</div>
                </div>
              </div>
            </div>

            {/* Communications */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                📧 {t('communication')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📧</span>
                    <span className="text-white font-medium">{t('emailsSent')}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.systemHealth.emailsSent}</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔔</span>
                    <span className="text-white font-medium">{t('notificationsSent')}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{stats.systemHealth.notificationsSent}</p>
                </div>
              </div>
            </div>

            {/* Error Stats */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                ⚠️ {t('errorStatistics')}
              </h2>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{stats.errors.critical}</p>
                    <p className="text-gray-400 text-sm">{t('critical')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{stats.errors.high}</p>
                    <p className="text-gray-400 text-sm">{t('high')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{stats.errors.medium}</p>
                    <p className="text-gray-400 text-sm">{t('medium')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{stats.errors.low}</p>
                    <p className="text-gray-400 text-sm">{t('low')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-400">{stats.errors.total}</p>
                    <p className="text-gray-400 text-sm">{t('total')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-800">
              <h3 className="text-lg font-medium text-white">{t('recentOperations')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('operation')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('duration')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('user')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900/20 divide-y divide-zinc-800">
                  {operations.map((operation) => (
                    <tr key={operation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {translateOperation(operation.operation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(operation.status)}`}>
                          {operation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {operation.duration ? `${operation.duration}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {operation.user?.name || t('system')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(operation.createdAt).toLocaleString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Errors Tab */}
        {activeTab === 'errors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-medium text-white mb-4">{t('errorManagement')}</h3>
            <p className="text-gray-400">{t('comingSoon')}</p>
          </motion.div>
        )}

        {/* Last Updated */}
        {stats && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {t('lastUpdate')}: {new Date(stats.lastUpdated).toLocaleString('ar-SA')}
          </div>
        )}
      </main>
    </div>
  )
}