import { Property } from './api';

/**
 * Share property via social media or copy link
 */
export function shareProperty(property: Property, locale: string): void {
  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const url = `${window.location.origin}/${locale}/listings/${slug}`;
  const text = `${title} - ${url}`;
  
  if (navigator.share) {
    navigator.share({
      title,
      text: property.description_en || property.description_ar || title,
      url,
    }).catch(() => {
      // Fallback to copy
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

/**
 * Share on Facebook
 */
export function shareOnFacebook(property: Property, locale: string): void {
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const url = encodeURIComponent(`${window.location.origin}/${locale}/listings/${slug}`);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

/**
 * Share on Twitter
 */
export function shareOnTwitter(property: Property, locale: string): void {
  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const url = encodeURIComponent(`${window.location.origin}/${locale}/listings/${slug}`);
  const text = encodeURIComponent(title);
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

/**
 * Share on WhatsApp
 */
export function shareOnWhatsApp(property: Property, locale: string): void {
  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const url = `${window.location.origin}/${locale}/listings/${slug}`;
  const text = encodeURIComponent(`${title}\n${url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

/**
 * Share via Email
 */
export function shareViaEmail(property: Property, locale: string): void {
  const title = locale === 'ar' ? property.title_ar : property.title_en;
  const slug = locale === 'ar' ? property.slug_ar : property.slug_en;
  const url = `${window.location.origin}/${locale}/listings/${slug}`;
  const subject = encodeURIComponent(`Check out this property: ${title}`);
  const body = encodeURIComponent(`I found this property you might be interested in:\n\n${title}\n${url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Copy URL to clipboard
 */
export function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification (you can integrate with your toast system)
      console.log('Copied to clipboard');
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

