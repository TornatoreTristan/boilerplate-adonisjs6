import type User from '#users/models/user'
import type Organization from '#organizations/models/organization'
import type OrganizationInvitation from '#organizations/models/organization_invitation'
import type Subscription from '#billing/models/subscription'

/**
 * Type definitions for domain events
 */

export interface UserCreatedEvent {
  record: User
}

export interface OrganizationCreatedEvent {
  record: Organization
}

export interface OrganizationInvitationCreatedEvent {
  record: OrganizationInvitation
}

export interface SubscriptionCreatedEvent {
  record: Subscription
}

export interface OrganizationMemberJoinedEvent {
  userId: string
  organizationId: string
  role: string
}

export interface OrganizationMemberLeftEvent {
  userId: string
  organizationId: string
}

/**
 * Event names constants
 */
export const EVENT_NAMES = {
  USER_CREATED: 'user.created',
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_INVITATION_CREATED: 'organizationinvitation.created',
  SUBSCRIPTION_CREATED: 'subscription.created',
  ORGANIZATION_MEMBER_JOINED: 'organization.member_joined',
  ORGANIZATION_MEMBER_LEFT: 'organization.member_left',
} as const
