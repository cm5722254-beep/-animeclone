import { User } from '../types';

export interface SubscriptionInfo {
  tier: 'admin' | 'premium' | 'free' | 'guest';
  title: string;
  badge: string;
  isPremium: boolean;
  isLifetime: boolean;
  expiryText: string;
  formattedDate: string | null;
  daysLeft: number | null;
  color: 'emerald' | 'amber' | 'slate' | 'rose';
}

export function getSubscriptionInfo(user: User | null): SubscriptionInfo {
  if (!user) {
    return {
      tier: 'guest',
      title: 'ភ្ញៀវ (Guest)',
      badge: 'Guest',
      isPremium: false,
      isLifetime: false,
      expiryText: 'សូមចូលប្រើប្រាស់គណនី',
      formattedDate: null,
      daysLeft: null,
      color: 'slate',
    };
  }

  // Master Admin
  if (user.role === 'admin') {
    return {
      tier: 'admin',
      title: '👑 Admin Master Edition',
      badge: 'VIP Lifetime',
      isPremium: true,
      isLifetime: true,
      expiryText: '🌟 ពេញមួយជីវិត (Lifetime / គ្មានថ្ងៃផុតកំណត់)',
      formattedDate: 'គ្មានថ្ងៃផុតកំណត់ (Lifetime VIP)',
      daysLeft: null,
      color: 'emerald',
    };
  }

  // Premium User
  if (user.tier === 'premium') {
    if (!user.premium_expires_at) {
      return {
        tier: 'premium',
        title: '⭐ Premium Lifetime Edition',
        badge: 'Lifetime',
        isPremium: true,
        isLifetime: true,
        expiryText: '🌟 ពេញមួយជីវិត (Lifetime / គ្មានថ្ងៃផុតកំណត់)',
        formattedDate: 'គ្មានថ្ងៃផុតកំណត់ (Lifetime)',
        daysLeft: null,
        color: 'amber',
      };
    }

    try {
      const expDate = new Date(user.premium_expires_at);
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const day = String(expDate.getDate()).padStart(2, '0');
      const month = String(expDate.getMonth() + 1).padStart(2, '0');
      const year = expDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      if (diffDays <= 0) {
        return {
          tier: 'free',
          title: '🌱 Free Edition (ផុតកំណត់)',
          badge: 'Expired',
          isPremium: false,
          isLifetime: false,
          expiryText: `⚠️ បានផុតកំណត់កាលពី ${formattedDate}`,
          formattedDate,
          daysLeft: 0,
          color: 'rose',
        };
      }

      return {
        tier: 'premium',
        title: '⭐ Premium Edition',
        badge: `នៅសល់ ${diffDays} ថ្ងៃ`,
        isPremium: true,
        isLifetime: false,
        expiryText: `📅 ផុតកំណត់៖ ${formattedDate} (នៅសល់ ${diffDays} ថ្ងៃ)`,
        formattedDate,
        daysLeft: diffDays,
        color: 'amber',
      };
    } catch {
      return {
        tier: 'premium',
        title: '⭐ Premium Edition',
        badge: 'Premium',
        isPremium: true,
        isLifetime: true,
        expiryText: '🌟 មិនមានកំណត់',
        formattedDate: 'គ្មានថ្ងៃផុតកំណត់',
        daysLeft: null,
        color: 'amber',
      };
    }
  }

  // Free User
  return {
    tier: 'free',
    title: '🌱 Free Edition (កញ្ចប់ឥតគិតថ្លៃ)',
    badge: 'FREE',
    isPremium: false,
    isLifetime: false,
    expiryText: 'កម្រិតសាមញ្ញ (Free Version)',
    formattedDate: 'មិនមាន (កញ្ចប់ឥតគិតថ្លៃ)',
    daysLeft: null,
    color: 'slate',
  };
}
