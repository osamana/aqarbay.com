'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const propertyId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const { getProperty } = await import('@/lib/admin-api');
      const prop = await getProperty(propertyId);
      if (prop) {
        setInitialData({
          title_en: prop.title_en,
          title_ar: prop.title_ar,
          slug_en: prop.slug_en,
          slug_ar: prop.slug_ar,
          description_en: prop.description_en || '',
          description_ar: prop.description_ar || '',
          purpose: prop.purpose,
          type: prop.type,
          status: prop.status,
          price_amount: prop.price_amount.toString(),
          price_currency: prop.price_currency,
          area_m2: prop.area_m2?.toString() || '',
          bedrooms: prop.bedrooms?.toString() || '',
          bathrooms: prop.bathrooms?.toString() || '',
          floor: prop.floor?.toString() || '',
          year_built: prop.year_built?.toString() || '',
          furnished: prop.furnished,
          parking: prop.parking,
          featured: prop.featured,
          published: prop.published,
          location_id: prop.location_id,
          agent_id: prop.agent_id || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    const { updateProperty } = await import('@/lib/admin-api');
    await updateProperty(propertyId, data);
    router.push(`/${locale}/admin/properties`);
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/properties`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!initialData) {
    return <div className="text-center py-12">Property not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Edit Property</h1>
        <p className="text-muted-foreground">Update property information and details</p>
      </div>

      <PropertyForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  );
}
