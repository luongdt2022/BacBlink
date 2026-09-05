/**
 * Map sidebar menu item id to React Router path.
 * Used by Sidebar and navigation helpers.
 */
export const MENU_ID_TO_PATH: Record<string, string> = {
  ips: '/ips',
  challenges: '/challenges',
  'collaboration-requests': '/my/collaboration-requests',
  stories: '/stories',
  marketplace: '/marketplace',
  // Hidden until these sections are ready for use:
  // infrastructure: '/infrastructure',
  // 'my-requests': '/infrastructure/requests',
  // 'my-assets': '/infrastructure/assets',
  // 'create-asset': '/infrastructure/assets/create',
  // 'manage-rental-requests': '/infrastructure/rentals',
  // 'service-valuation': '/valuation',
  // 'service-ip-consulting': '/services/ip-consulting',
  // 'service-innovation-assessment': '/services/innovation-assessment',
  // 'service-tech-expert': '/services/tech-expert',
  // 'service-operation-expert': '/services/operation-expert',
  // 'service-training': '/services/training',
  contact: '/contact',
  // 'service-pricing': '/services/pricing',
  // 'service-payment': '/services/payment',
  // 'service-success': '/services/success',
  settings: '/settings',
};

/**
 * Resolve current pathname to sidebar active item id (for highlighting).
 */
export function pathToActiveItem(pathname: string): string {
  if (pathname.startsWith('/marketplace')) return 'marketplace';
  // Hidden until these sections are ready for use:
  // if (pathname.startsWith('/infrastructure')) return 'infrastructure';
  // if (pathname.startsWith('/valuation')) return 'service-valuation';
  // if (pathname.startsWith('/services/ip-consulting')) return 'service-ip-consulting';
  // if (pathname.startsWith('/services/innovation-assessment')) return 'service-innovation-assessment';
  // if (pathname.startsWith('/services/tech-expert')) return 'service-tech-expert';
  // if (pathname.startsWith('/services/operation-expert')) return 'service-operation-expert';
  // if (pathname.startsWith('/services/training')) return 'service-training';
  // if (pathname.startsWith('/services/pricing')) return 'service-pricing';
  // if (pathname.startsWith('/services/payment')) return 'service-payment';
  // if (pathname.startsWith('/services/success')) return 'service-success';
  if (pathname.startsWith('/stories')) return 'stories';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/ips')) return 'ips';
  if (pathname.startsWith('/challenges')) return 'challenges';
  if (pathname.startsWith('/my/collaboration-requests')) return 'collaboration-requests';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'ips';
}
