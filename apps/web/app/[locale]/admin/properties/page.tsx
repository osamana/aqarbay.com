'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import * as adminApi from '@/lib/admin-api';

export default function AdminPropertiesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await adminApi.getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    try {
      if (published) {
        await adminApi.unpublishProperty(id);
      } else {
        await adminApi.publishProperty(id);
      }
      fetchProperties();
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await adminApi.deleteProperty(id);
      fetchProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Link href={`/${locale}/admin/properties/new`}>
          <Button>+ New Property</Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">Loading...</CardContent>
        </Card>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No properties yet</p>
            <Link href={`/${locale}/admin/properties/new`}>
              <Button>Create Your First Property</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {properties.map((property: any) => (
                <div key={property.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{property.title_en}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.published ? 'Published' : 'Draft'}
                        </span>
                        {property.featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {property.title_ar}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-primary">
                          {formatPrice(Number(property.price_amount), property.price_currency)}
                        </span>
                        <span className="capitalize">{property.type}</span>
                        <span className="capitalize">{property.purpose}</span>
                        <span className="capitalize">{property.status}</span>
                        {property.bedrooms && <span>{property.bedrooms} beds</span>}
                        {property.area_m2 && <span>{property.area_m2}m²</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublish(property.id, property.published)}
                        title={property.published ? 'Unpublish' : 'Publish'}
                      >
                        {property.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>

                      <Link href={`/${locale}/admin/properties/${property.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
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
