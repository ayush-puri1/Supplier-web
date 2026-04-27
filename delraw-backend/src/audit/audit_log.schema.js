import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Mongoose schema for platform-wide audit logs.
 * Stored in MongoDB collection: audit_logs
 *
 * actorEmail and actorRole are NOT required so that edge-case log calls
 * (e.g., logout where email may not be available) do not throw silently.
 */
@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: String, required: true, index: true })
  logId;

  @Prop({ type: String, required: true, index: true })
  actorId;

  @Prop({ type: String, index: true })
  actorEmail;

  @Prop({ type: String, index: true })
  actorRole;

  @Prop({ type: String, required: true, index: true })
  action;

  @Prop({ type: String, index: true })
  entityType;

  @Prop({ type: String, index: true })
  entityId;

  @Prop({ type: String })
  details;

  @Prop({ type: Object })
  metadata;

  @Prop({ type: String })
  ipAddress;

  @Prop({ type: String })
  userAgent;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Compound text index for full-text search across key fields
AuditLogSchema.index({
  actorEmail: 'text',
  action: 'text',
  logId: 'text',
  details: 'text',
});
