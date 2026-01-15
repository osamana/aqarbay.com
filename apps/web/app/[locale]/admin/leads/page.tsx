'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Calendar } from 'lucide-react';
import * as adminApi from '@/lib/admin-api';

export default function AdminLeadsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await adminApi.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, status: string) => {
    try {
      await adminApi.updateLead(leadId, { status });
      fetchLeads();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Leads & Inquiries</h1>
        <p className="text-muted-foreground">
          {leads.length} total inquiries
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">Loading...</CardContent>
        </Card>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No leads yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Leads will appear here when customers submit the contact form
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {leads.map((lead: any) => (
                <div key={lead.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${lead.phone}`} className="hover:text-primary">
                            {lead.phone}
                          </a>
                        </div>
                        
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${lead.email}`} className="hover:text-primary">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        
                        {lead.message && (
                          <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <p>{lead.message}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                          <Calendar className="w-4 h-4" />
                          {new Date(lead.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Status</label>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
