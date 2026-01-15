'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Plus } from 'lucide-react';
import * as adminApi from '@/lib/admin-api';

export default function AdminLocationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    slug_en: '',
    slug_ar: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await adminApi.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      slug_en: formData.slug_en || formData.name_en.toLowerCase().replace(/\s+/g, '-'),
      slug_ar: formData.slug_ar || formData.name_ar.replace(/\s+/g, '-'),
    };

    try {
      if (editingId) {
        await adminApi.updateLocation(editingId, data);
      } else {
        await adminApi.createLocation(data);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name_en: '', name_ar: '', slug_en: '', slug_ar: '' });
      fetchLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location');
    }
  };

  const handleEdit = (location: any) => {
    setFormData({
      name_en: location.name_en,
      name_ar: location.name_ar,
      slug_en: location.slug_en,
      slug_ar: location.slug_ar,
    });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;

    try {
      await adminApi.deleteLocation(id);
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('Failed to delete location');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Locations</h1>
          <p className="text-muted-foreground">Manage cities and areas ({locations.length} total)</p>
        </div>
        <Button onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ name_en: '', name_ar: '', slug_en: '', slug_ar: '' });
        }}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Location</>}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Location' : 'New Location'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name (English) *</label>
                  <Input
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g., Ramallah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name (Arabic) *</label>
                  <Input
                    required
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="مثال: رام الله"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug (English)</label>
                  <Input
                    value={formData.slug_en}
                    onChange={(e) => setFormData({ ...formData, slug_en: e.target.value })}
                    placeholder="ramallah (auto-generated if empty)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used in URLs</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug (Arabic)</label>
                  <Input
                    value={formData.slug_ar}
                    onChange={(e) => setFormData({ ...formData, slug_ar: e.target.value })}
                    placeholder="رام-الله (auto-generated if empty)"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used in URLs</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Update' : 'Create'} Location</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name_en: '', name_ar: '', slug_en: '', slug_ar: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">Loading...</CardContent>
        </Card>
      ) : locations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No locations yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {locations.map((location: any) => (
                <div key={location.id} className="p-6 hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{location.name_en}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{location.name_ar}</p>
                    <div className="text-xs text-muted-foreground">
                      Slugs: <code className="bg-muted px-2 py-1 rounded">{location.slug_en}</code> / <code className="bg-muted px-2 py-1 rounded">{location.slug_ar}</code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(location)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(location.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
