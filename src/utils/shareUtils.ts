import { toast } from 'sonner';

/**
 * Universal Data Share Utility
 */

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Share text/URL using Web Share API or copy to clipboard
 */
export const shareData = async (options: ShareOptions = {}) => {
  const { 
    title = 'KK Enterprises Workshop System', 
    text = 'Sharing dashboard report data.', 
    url = window.location.href,
    files
  } = options;

  try {
    // Check for native share support
    if (navigator.share) {
      if (files && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title,
          text,
          url,
          files,
        });
        toast.success('Shared successfully!');
        return true;
      } else {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success('Shared successfully!');
        return true;
      }
    } else {
      // Fallback: Copy to clipboard
      const shareText = `${title}\n${text}\n${url}`;
      await navigator.clipboard.writeText(shareText);
      toast.info('Sharing not supported on this device. Link copied to clipboard.');
      return false;
    }
  } catch (error) {
    if ((error as any).name === 'AbortError') {
      // User cancelled – no toast needed
      return false;
    }
    console.error('Share error:', error);
    toast.error('Failed to share data');
    return false;
  }
};
