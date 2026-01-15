'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MapPin, Users, MessageSquare, TrendingUp, Plus, Eye, Building2, Castle, Trees, Store, Briefcase, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import * as adminApi from '@/lib/admin-api';

// Property type configuration
const propertyTypes = [
  { type: 'apartment', icon: Building2, label: 'Apartments' },
  { type: 'house', icon: Home, label: 'Houses' },
  { type: 'villa', icon: Castle, label: 'Villas' },
  { type: 'land', icon: Trees, label: 'Land' },
  { type: 'commercial', icon: Store, label: 'Commercial' },
  { type: 'office', icon: Briefcase, label: 'Offices' },
  { type: 'store', icon: ShoppingBag, label: 'Stores' },
];

export default function AdminDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const [stats, setStats] = useState({
    properties: 0,
    leads: 0,
    locations: 0,
    agents: 0,
    published: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProperties, setRecentProperties] = useState([]);
  const [propertyTypeBreakdown, setPropertyTypeBreakdown] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [properties, leads, locations, agents] = await Promise.all([
        adminApi.getProperties(),
        adminApi.getLeads(),
        adminApi.getLocations(),
        adminApi.getAgents(),
      ]);

      setStats({
        properties: properties.length,
        leads: leads.length,
        locations: locations.length,
        agents: agents.length,
        published: properties.filter((p: any) => p.published).length,
      });

      // Calculate property type breakdown
      const breakdown: { [key: string]: number } = {};
      propertyTypes.forEach(({ type }) => {
        breakdown[type] = properties.filter((p: any) => p.type === type).length;
      });
      setPropertyTypeBreakdown(breakdown);

      setRecentProperties(properties.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome to Palestine Real Estate admin panel</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm" className="md:size-default">
            <Link href={`/${locale}/admin/leads`}>
              <Eye className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">View Leads</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="md:size-default">
            <Link href={`/${locale}/admin/properties/new`}>
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Add Property</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Home className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.properties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.published} published
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.locations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cities & areas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.agents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Real estate agents
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Inquiries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Type Breakdown */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle>Property Types Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {propertyTypes.map(({ type, icon: Icon, label }) => (
                <div
                  key={type}
                  className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="p-3 bg-primary/10 rounded-full mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{propertyTypeBreakdown[type] || 0}</div>
                  <div className="text-xs text-muted-foreground text-center mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Properties */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Properties</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/admin/properties`}>
              View All →
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : recentProperties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No properties yet</p>
              <Link href={`/${locale}/admin/properties/new`} className="text-primary hover:underline text-sm mt-2 inline-block">
                Create your first property →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/${locale}/admin/properties/${property.id}/edit`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{property.title_en}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.type} • {property.purpose} • {property.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.published 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {property.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
