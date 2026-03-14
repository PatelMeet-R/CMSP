import { BaseEntity } from 'src/core/base.entity';
import { Branch } from 'src/modules/branch/domain/entities/branch.entity';
import { EnumValue } from 'src/modules/enums/domain/entities/enumValue.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('subjects')
@Index(['code', 'branch'], { unique: true })
export class Subject extends BaseEntity {
  @Column()
  name: string;

  @Column() //3160713
  code: string;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ManyToOne(() => EnumValue, { eager: true })
  @JoinColumn({ name: 'semesterId' })
  semester: EnumValue;
}
