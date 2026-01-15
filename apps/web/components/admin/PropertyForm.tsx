'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function PropertyForm({ initialData, onSubmit, onCancel, isEdit = false }: PropertyFormProps) {
  const [locations, setLocations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    title_en: '',
    title_ar: '',
    slug_en: '',
    slug_ar: '',
    description_en: '',
    description_ar: '',
    purpose: 'sell',
    type: 'apartment',
    status: 'available',
    price_amount: '',
    price_currency: 'USD',
    area_m2: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    year_built: '',
    furnished: false,
    parking: false,
    featured: false,
    published: false,
    location_id: '',
    agent_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { getLocations, getAgents } = await import('@/lib/admin-api');
      const [locs, agts] = await Promise.all([
        getLocations(),
        getAgents(),
      ]);
      setLocations(locs);
      setAgents(agts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-generate slugs if empty
      const data = {
        ...formData,
        slug_en: formData.slug_en || formData.title_en.toLowerCase().replace(/\s+/g, '-'),
        slug_ar: formData.slug_ar || formData.title_ar.replace(/\s+/g, '-'),
        price_amount: parseFloat(formData.price_amount),
        area_m2: formData.area_m2 ? parseFloat(formData.area_m2) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        agent_id: formData.agent_id || null,
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title (English) *</label>
              <Input
                required
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="e.g., Luxury Villa in Ramallah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title (Arabic) *</label>
              <Input
                required
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="مثال: فيلا فاخرة في رام الله"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Slug (English)</label>
              <Input
                value={formData.slug_en}
                onChange={(e) => setFormData({ ...formData, slug_en: e.target.value })}
                placeholder="luxury-villa-ramallah (auto-generated if empty)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug (Arabic)</label>
              <Input
                value={formData.slug_ar}
                onChange={(e) => setFormData({ ...formData, slug_ar: e.target.value })}
                placeholder="فيلا-فاخرة-رام-الله (auto-generated if empty)"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description (English)</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-32"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Detailed property description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (Arabic)</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-32"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                placeholder="وصف مفصل للعقار..."
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Purpose *</label>
              <select
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="sell">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
                <option value="store">Store</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Location *</label>
              <select
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
              >
                <option value="">Select location</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name_en} / {loc.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Agent (Optional)</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              >
                <option value="">No agent assigned</option>
                {agents.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Specs */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Price *</label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.price_amount}
                onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })}
                placeholder="250000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.price_currency}
                onChange={(e) => setFormData({ ...formData, price_currency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="ILS">ILS (₪)</option>
                <option value="JOD">JOD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Area (m²)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.area_m2}
                onChange={(e) => setFormData({ ...formData, area_m2: e.target.value })}
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bathrooms</label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Floor</label>
              <Input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Year Built</label>
              <Input
                type="number"
                value={formData.year_built}
                onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                placeholder="2020"
              />
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.furnished}
                onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Furnished</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.parking}
                onChange={(e) => setFormData({ ...formData, parking: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Parking Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-primary">⭐ Featured Property</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">✓ Publish Immediately</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? 'Saving...' : (isEdit ? 'Update Property' : 'Create Property')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}

