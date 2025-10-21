import { inject, injectable } from 'inversify'
import { TYPES } from '#shared/container/types'
import type EventBusService from '#shared/services/event_bus_service'
import type AuditLogService from '#audit/services/audit_log_service'
import { AuditAction } from '#audit/types/audit'

@injectable()
export default class AuditLogListeners {
  constructor(
    @inject(TYPES.EventBus) private eventBus: EventBusService,
    @inject(TYPES.AuditLogService) private auditLogService: AuditLogService
  ) {
    this.registerListeners()
  }

  private registerListeners() {
    // User events
    this.eventBus.on('user:created', this.handleUserCreated.bind(this))
    this.eventBus.on('user:updated', this.handleUserUpdated.bind(this))
    this.eventBus.on('user:deleted', this.handleUserDeleted.bind(this))
    this.eventBus.on('user:restored', this.handleUserRestored.bind(this))

    // Auth events
    this.eventBus.on('auth:login:success', this.handleLoginSuccess.bind(this))
    this.eventBus.on('auth:login:failed', this.handleLoginFailed.bind(this))
    this.eventBus.on('auth:logout', this.handleLogout.bind(this))
    this.eventBus.on('auth:password:reset:requested', this.handlePasswordResetRequested.bind(this))
    this.eventBus.on('auth:password:reset:completed', this.handlePasswordResetCompleted.bind(this))
    this.eventBus.on('auth:password:changed', this.handlePasswordChanged.bind(this))

    // Organization events
    this.eventBus.on('organization:created', this.handleOrganizationCreated.bind(this))
    this.eventBus.on('organization:updated', this.handleOrganizationUpdated.bind(this))
    this.eventBus.on('organization:deleted', this.handleOrganizationDeleted.bind(this))
    this.eventBus.on('organization:member:added', this.handleOrganizationMemberAdded.bind(this))
    this.eventBus.on(
      'organization:member:removed',
      this.handleOrganizationMemberRemoved.bind(this)
    )

    // Invitation events
    this.eventBus.on('invitation:sent', this.handleInvitationSent.bind(this))
    this.eventBus.on('invitation:accepted', this.handleInvitationAccepted.bind(this))
    this.eventBus.on('invitation:rejected', this.handleInvitationRejected.bind(this))

    // Subscription events
    this.eventBus.on('subscription:created', this.handleSubscriptionCreated.bind(this))
    this.eventBus.on('subscription:updated', this.handleSubscriptionUpdated.bind(this))
    this.eventBus.on('subscription:cancelled', this.handleSubscriptionCancelled.bind(this))
    this.eventBus.on('subscription:paused', this.handleSubscriptionPaused.bind(this))
    this.eventBus.on('subscription:resumed', this.handleSubscriptionResumed.bind(this))

    // GDPR events
    this.eventBus.on('gdpr:data:export:requested', this.handleDataExportRequested.bind(this))
    this.eventBus.on(
      'gdpr:account:deletion:requested',
      this.handleAccountDeletionRequested.bind(this)
    )
    this.eventBus.on(
      'gdpr:account:deletion:cancelled',
      this.handleAccountDeletionCancelled.bind(this)
    )

    // Upload events
    this.eventBus.on('upload:created', this.handleFileUploaded.bind(this))
    this.eventBus.on('upload:deleted', this.handleFileDeleted.bind(this))
  }

  // User handlers
  private async handleUserCreated(data: any) {
    await this.auditLogService.log({
      userId: data.createdBy || null,
      action: AuditAction.USER_CREATED,
      resourceType: 'User',
      resourceId: data.user.id,
      metadata: {
        email: data.user.email,
        fullName: data.user.fullName,
      },
    })
  }

  private async handleUserUpdated(data: any) {
    await this.auditLogService.log({
      userId: data.updatedBy || data.user.id,
      action: AuditAction.USER_UPDATED,
      resourceType: 'User',
      resourceId: data.user.id,
      metadata: {
        changes: data.changes,
      },
    })
  }

  private async handleUserDeleted(data: any) {
    await this.auditLogService.log({
      userId: data.deletedBy || null,
      action: AuditAction.USER_DELETED,
      resourceType: 'User',
      resourceId: data.userId,
      metadata: {
        soft: data.soft,
        reason: data.reason,
      },
    })
  }

  private async handleUserRestored(data: any) {
    await this.auditLogService.log({
      userId: data.restoredBy || null,
      action: AuditAction.USER_RESTORED,
      resourceType: 'User',
      resourceId: data.userId,
    })
  }

  // Auth handlers
  private async handleLoginSuccess(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.LOGIN_SUCCESS,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: {
        method: data.method || 'credentials',
      },
    })
  }

  private async handleLoginFailed(data: any) {
    await this.auditLogService.log({
      userId: null,
      action: AuditAction.LOGIN_FAILED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: {
        email: data.email,
        reason: data.reason,
      },
    })
  }

  private async handleLogout(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.LOGOUT,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  private async handlePasswordResetRequested(data: any) {
    await this.auditLogService.log({
      userId: data.userId || null,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: {
        email: data.email,
      },
    })
  }

  private async handlePasswordResetCompleted(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  private async handlePasswordChanged(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.PASSWORD_CHANGED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  // Organization handlers
  private async handleOrganizationCreated(data: any) {
    await this.auditLogService.log({
      userId: data.createdBy,
      organizationId: data.organization.id,
      action: AuditAction.ORGANIZATION_CREATED,
      resourceType: 'Organization',
      resourceId: data.organization.id,
      metadata: {
        name: data.organization.name,
      },
    })
  }

  private async handleOrganizationUpdated(data: any) {
    await this.auditLogService.log({
      userId: data.updatedBy,
      organizationId: data.organization.id,
      action: AuditAction.ORGANIZATION_UPDATED,
      resourceType: 'Organization',
      resourceId: data.organization.id,
      metadata: {
        changes: data.changes,
      },
    })
  }

  private async handleOrganizationDeleted(data: any) {
    await this.auditLogService.log({
      userId: data.deletedBy,
      organizationId: data.organizationId,
      action: AuditAction.ORGANIZATION_DELETED,
      resourceType: 'Organization',
      resourceId: data.organizationId,
    })
  }

  private async handleOrganizationMemberAdded(data: any) {
    await this.auditLogService.log({
      userId: data.addedBy,
      organizationId: data.organizationId,
      action: AuditAction.ORGANIZATION_MEMBER_ADDED,
      resourceType: 'OrganizationMember',
      resourceId: data.memberId,
      metadata: {
        role: data.role,
      },
    })
  }

  private async handleOrganizationMemberRemoved(data: any) {
    await this.auditLogService.log({
      userId: data.removedBy,
      organizationId: data.organizationId,
      action: AuditAction.ORGANIZATION_MEMBER_REMOVED,
      resourceType: 'OrganizationMember',
      resourceId: data.memberId,
    })
  }

  // Invitation handlers
  private async handleInvitationSent(data: any) {
    await this.auditLogService.log({
      userId: data.sentBy,
      organizationId: data.organizationId,
      action: AuditAction.INVITATION_SENT,
      resourceType: 'Invitation',
      resourceId: data.invitationId,
      metadata: {
        email: data.email,
        role: data.role,
      },
    })
  }

  private async handleInvitationAccepted(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.INVITATION_ACCEPTED,
      resourceType: 'Invitation',
      resourceId: data.invitationId,
    })
  }

  private async handleInvitationRejected(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.INVITATION_REJECTED,
      resourceType: 'Invitation',
      resourceId: data.invitationId,
    })
  }

  // Subscription handlers
  private async handleSubscriptionCreated(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.SUBSCRIPTION_CREATED,
      resourceType: 'Subscription',
      resourceId: data.subscriptionId,
      metadata: {
        planId: data.planId,
        amount: data.amount,
      },
    })
  }

  private async handleSubscriptionUpdated(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.SUBSCRIPTION_UPDATED,
      resourceType: 'Subscription',
      resourceId: data.subscriptionId,
      metadata: {
        changes: data.changes,
      },
    })
  }

  private async handleSubscriptionCancelled(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.SUBSCRIPTION_CANCELLED,
      resourceType: 'Subscription',
      resourceId: data.subscriptionId,
      metadata: {
        reason: data.reason,
      },
    })
  }

  private async handleSubscriptionPaused(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.SUBSCRIPTION_PAUSED,
      resourceType: 'Subscription',
      resourceId: data.subscriptionId,
    })
  }

  private async handleSubscriptionResumed(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.SUBSCRIPTION_RESUMED,
      resourceType: 'Subscription',
      resourceId: data.subscriptionId,
    })
  }

  // GDPR handlers
  private async handleDataExportRequested(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.DATA_EXPORT_REQUESTED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  private async handleAccountDeletionRequested(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.ACCOUNT_DELETION_REQUESTED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: {
        reason: data.reason,
        scheduledFor: data.scheduledFor,
      },
    })
  }

  private async handleAccountDeletionCancelled(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      action: AuditAction.ACCOUNT_DELETION_CANCELLED,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  // Upload handlers
  private async handleFileUploaded(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.FILE_UPLOADED,
      resourceType: 'Upload',
      resourceId: data.uploadId,
      metadata: {
        filename: data.filename,
        size: data.size,
        mimeType: data.mimeType,
      },
    })
  }

  private async handleFileDeleted(data: any) {
    await this.auditLogService.log({
      userId: data.userId,
      organizationId: data.organizationId,
      action: AuditAction.FILE_DELETED,
      resourceType: 'Upload',
      resourceId: data.uploadId,
      metadata: {
        filename: data.filename,
      },
    })
  }
}
