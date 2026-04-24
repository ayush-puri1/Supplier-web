import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog extends Document {
  @Prop({ type: String, required: true, index: true })
  logId;

  @Prop({ type: String, required: true, index: true })
  actorId;

  @Prop({ type: String, required: true, index: true })
  actorEmail;

  @Prop({ type: String, required: true, index: true })
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

// Add text index for searching email and action
AuditLogSchema.index({ actorEmail: 'text', action: 'text', logId: 'text', details: 'text' });
