import type { IntakeType } from '../api/intake';

export type IntakeNamespace = 'ips' | 'challenges';

export function getNamespaceByType(type: IntakeType): IntakeNamespace {
  return type === 'challenge' ? 'challenges' : 'ips';
}

export function getTypeByNamespace(namespace: IntakeNamespace): IntakeType {
  return namespace === 'challenges' ? 'challenge' : 'ip';
}

export function buildListPathByType(type: IntakeType): string {
  return `/${getNamespaceByType(type)}`;
}

export function buildCreatePathByType(type: IntakeType): string {
  return `/${getNamespaceByType(type)}/create`;
}

export function buildDetailPathByType(type: IntakeType, id: string): string {
  return `/${getNamespaceByType(type)}/${id}`;
}

export function buildEditPathByType(type: IntakeType, id: string): string {
  return `/${getNamespaceByType(type)}/${id}/edit`;
}
