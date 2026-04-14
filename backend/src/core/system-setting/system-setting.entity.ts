import { BaseEntity } from 'src/core/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  key: string; // e.g., 'CURRENT_ACADEMIC_YEAR_ID'

  @Column({ type: 'varchar', length: 255 })
  value: string; // Stored as a string, parsed when needed

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;
}
