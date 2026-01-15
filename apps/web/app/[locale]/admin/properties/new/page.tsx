'use client';

import { useRouter, useParams } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleSubmit = async (data: any) => {
    const { createProperty } = await import('@/lib/admin-api');
    await createProperty(data);
    router.push(`/${locale}/admin/properties`);
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/properties`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Create New Property</h1>
        <p className="text-muted-foreground">Add a new property listing to your catalog</p>
      </div>

      <PropertyForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
