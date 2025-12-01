"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, Users, Phone, CheckCircle, XCircle, 
  MessageSquare, Target, BarChart3, Download,
  ChevronLeft, ChevronRight, Loader2, Eye
} from "lucide-react"
import { campaignAPI } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"

interface Campaign {
  campaign_id: string
  name: string
  type: string
  status: string
  created_at: string
  updated_at: string
  total_contacts: number
  contacts_called: number
  connected_calls: number
  failed_calls: number
  voicemails: number
  qualified_leads: number
  converted_leads: number
  total_calls: number
  successful_calls: number
}

export function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadCampaignHistory()
  }, [pagination.currentPage])

  const loadCampaignHistory = async () => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      const response = await campaignAPI.getHistory(currentUser.userId, {
        page: pagination.currentPage,
        limit: 10
      })

      if (response.data.success) {
        setCampaigns(response.data.campaigns)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to load campaign history:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignReport = async (campaignId: string) => {
    try {
      const response = await campaignAPI.getReport(campaignId)
      if (response.data.success) {
        setReportData(response.data)
        setSelectedCampaign(campaigns.find(c => c.campaign_id === campaignId) || null)
        setShowReport(true)
      }
    } catch (error) {
      console.error('Failed to load campaign report:', error)
    }
  }

  const exportCampaignReport = (campaign: Campaign) => {
    const csvContent = [
      ['Campaign Report', campaign.name],
      [],
      ['Metric', 'Value'],
      ['Total Contacts', campaign.total_contacts],
      ['Contacts Called', campaign.contacts_called],
      ['Connected Calls', campaign.connected_calls],
      ['Failed Calls', campaign.failed_calls],
      ['Voicemails', campaign.voicemails],
      ['Qualified Leads', campaign.qualified_leads],
      ['Converted Leads', campaign.converted_leads],
      ['Success Rate', `${campaign.total_calls > 0 ? Math.round((campaign.successful_calls / campaign.total_calls) * 100) : 0}%`],
      ['Created', new Date(campaign.created_at).toLocaleDateString()],
    ]

    const csv = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-report-${campaign.name}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-400/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-400/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'stopped': return 'bg-red-500/20 text-red-400 border-red-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  const calculateSuccessRate = (campaign: Campaign) => {
    return campaign.total_calls > 0 ? Math.round((campaign.successful_calls / campaign.total_calls) * 100) : 0
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Campaign History</h3>
          <p className="text-sm text-white/60">
            {loading ? "Loading..." : `${pagination.totalCount} total campaigns`}
          </p>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white/60">Loading campaign history...</p>
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No campaigns found</p>
            <p className="text-white/40 text-sm mt-2">Start your first campaign to see history here</p>
          </div>
        )}

        {campaigns.map((campaign) => (
          <Card key={campaign.campaign_id} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-white">{campaign.name}</h4>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <span className="text-sm text-white/60">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span className="text-white/60">Contacts:</span>
                    <span className="text-white font-semibold">{campaign.contacts_called}/{campaign.total_contacts}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span className="text-white/60">Connected:</span>
                    <span className="text-green-400 font-semibold">{campaign.connected_calls}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    <span className="text-white/60">Voicemails:</span>
                    <span className="text-purple-400 font-semibold">{campaign.voicemails}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-yellow-400" />
                    <span className="text-white/60">Qualified:</span>
                    <span className="text-yellow-400 font-semibold">{campaign.qualified_leads}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white/60">Converted:</span>
                    <span className="text-green-400 font-semibold">{campaign.converted_leads}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-white/60">Success:</span>
                    <span className="text-blue-400 font-semibold">{calculateSuccessRate(campaign)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => loadCampaignReport(campaign.campaign_id)}
                  variant="outline"
                  size="sm"
                  className="bg-cyan-500/20 border-cyan-400/30 text-cyan-400"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button
                  onClick={() => exportCampaignReport(campaign)}
                  variant="outline"
                  size="sm"
                  className="bg-green-500/20 border-green-400/30 text-green-400"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPrev || loading}
              className="bg-white/5 border-white/10 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNext || loading}
              className="bg-white/5 border-white/10 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Campaign Report Modal */}
      {showReport && reportData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-white/10 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Campaign Report</h3>
                <Button
                  onClick={() => setShowReport(false)}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white"
                >
                  Close
                </Button>
              </div>

              {selectedCampaign && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 border-white/10 p-4">
                    <p className="text-sm text-white/60">Total Contacts</p>
                    <p className="text-2xl font-bold text-cyan-400">{selectedCampaign.total_contacts}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 p-4">
                    <p className="text-sm text-white/60">Contacts Called</p>
                    <p className="text-2xl font-bold text-blue-400">{selectedCampaign.contacts_called}</p>
                  </Card>
                  <Card className="bg-white/5 border-white/10 p-4">
                    <p className="text-sm text-white/60">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">{calculateSuccessRate(selectedCampaign)}%</p>
                  </Card>
                </div>
              )}

              {/* Call Statistics */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Call Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportData.call_stats?.map((stat: any) => (
                    <Card key={stat.status} className="bg-white/5 border-white/10 p-3">
                      <p className="text-sm text-white/60 capitalize">{stat.status}</p>
                      <p className="text-xl font-bold text-white">{stat.count}</p>
                      {stat.avg_duration && (
                        <p className="text-xs text-white/60">Avg: {Math.round(stat.avg_duration)}s</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Contact Outcomes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {reportData.outcomes?.map((outcome: any) => (
                    <Card key={outcome.call_result} className="bg-white/5 border-white/10 p-3">
                      <p className="text-sm text-white/60 capitalize">{outcome.call_result || 'Unknown'}</p>
                      <p className="text-xl font-bold text-white">{outcome.count}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}