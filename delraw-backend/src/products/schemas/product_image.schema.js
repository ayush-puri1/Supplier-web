import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Mongoose schema for product images stored via MongoDB GridFS.
 *
 * The `url` field holds the backend file-serving path:
 *   /files/products/<gridfs-object-id>
 *
 * The `key` field holds the GridFS ObjectId string used for deletion.
 *
 * The `productId` links back to the Postgres Product record by its UUID string.
 */
@Schema({ timestamps: true, collection: 'product_images' })
export class ProductImage {
  @Prop({ type: String, required: true, index: true })
  productId;

  @Prop({ type: String, required: true })
  url;

  @Prop({ type: String, required: true })
  key;

  @Prop({ type: Number, default: 0 })
  order;

  @Prop({ type: String })
  alt;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

// Compound index for fast lookup of images by product
ProductImageSchema.index({ productId: 1, order: 1 });
