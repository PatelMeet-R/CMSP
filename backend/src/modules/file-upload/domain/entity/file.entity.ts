import { AuditableEntity } from 'src/core/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('file')
export class File extends AuditableEntity {
  @Column()
  originalName: string;
  @Column()
  mimeType: string;
  @Column()
  size: number;
  @Column()
  url: string;
  @Column()
  publicId: string;
}
