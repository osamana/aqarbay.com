'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  shareText: string;
  locale: string;
}

export default function ShareButtons({ title, shareText, locale }: ShareButtonsProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: title,
        text: shareText,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        alert(locale === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );
}

