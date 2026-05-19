import { User } from 'src/modules/auth/domain/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // WHO did the action (The Admin/HOD)
  @Index()
  @Column({ type: 'uuid' })
  actorId: string;

  // WHAT did they do (e.g., 'GRANT_PERMISSION', 'SUSPEND_USER')
  @Index()
  @Column({ type: 'varchar', length: 100 })
  action: string;

  // WHO was affected (The Target User/Profile ID)
  @Index()
  @Column({ type: 'uuid', nullable: true })
  targetId: string | null;

  // EXTRA DETAILS (Stored as fast-queryable JSONB in Postgres)
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actorId' })
  actor: User;
}
